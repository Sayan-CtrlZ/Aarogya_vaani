import os
import json
import base64
import asyncio
from typing import Dict, Any, List, Optional
from anthropic import AsyncAnthropic, APIError, APIConnectionError, RateLimitError
from fastapi import HTTPException, status
from app.core.config import settings
from app.utils.logging import logger


class ClaudeService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.model = settings.CLAUDE_MODEL or "claude-haiku-4-5-20251001"
        self._prompt_cache = None

    def _load_system_prompt(self) -> str:
        if self._prompt_cache:
            return self._prompt_cache
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "document_analysis.txt")
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                self._prompt_cache = f.read()
                return self._prompt_cache
        except Exception as e:
            logger.error("Failed to read system prompt file: %s", str(e))
            return "You are a medical document extraction system. Extract structured JSON matching schema."

    def get_mock_analysis_response(self, filename: str) -> Dict[str, Any]:
        """Returns deterministic sample medical data when ENABLE_MOCK_AI is true."""
        is_prescription = "presc" in filename.lower()
        if is_prescription:
            return {
                "document_type": "prescription",
                "document_type_confidence": 0.96,
                "document_date": "2026-10-08",
                "language": "English",
                "patient": {
                    "name": "Jane Doe",
                    "age": 34,
                    "sex": "Female",
                    "patient_id": "P-98421"
                },
                "provider": {
                    "doctor_name": "Dr. A. K. Sharma",
                    "hospital": "Tripura State Hospital",
                    "department": "Internal Medicine"
                },
                "diagnoses": [
                    {
                        "name": "Acute Upper Respiratory Infection",
                        "status": "active",
                        "notes": "Diagnosed during OPD visit"
                    }
                ],
                "medications": [
                    {
                        "name": "Amoxicillin",
                        "strength": "500 mg",
                        "dose": "1 capsule",
                        "frequency": "three times daily",
                        "route": "oral",
                        "duration": "5 days",
                        "instructions": "after food",
                        "confidence": 0.95,
                        "uncertain": False
                    },
                    {
                        "name": "Paracetamol",
                        "strength": "650 mg",
                        "dose": "1 tablet",
                        "frequency": "as needed",
                        "route": "oral",
                        "duration": "3 days",
                        "instructions": "for fever above 100 F",
                        "confidence": 0.90,
                        "uncertain": False
                    }
                ],
                "investigations": [],
                "procedures": [],
                "medical_history": [],
                "allergies": [],
                "warnings": [],
                "extraction_confidence": 0.94
            }
        else:
            return {
                "document_type": "lab_report",
                "document_type_confidence": 0.98,
                "document_date": "2026-10-08",
                "language": "English",
                "patient": {
                    "name": "John Doe",
                    "age": 45,
                    "sex": "Male",
                    "patient_id": "P-12345"
                },
                "provider": {
                    "doctor_name": "Dr. S. Roy",
                    "hospital": "Apex Diagnostic Center",
                    "department": "Pathology"
                },
                "diagnoses": [],
                "medications": [],
                "investigations": [
                    {
                        "name": "Hemoglobin",
                        "value": 10.2,
                        "unit": "g/dL",
                        "reference_range": "13.0 - 17.0",
                        "status": "low",
                        "confidence": 0.99
                    },
                    {
                        "name": "Total Leukocyte Count (WBC)",
                        "value": 7800,
                        "unit": "/uL",
                        "reference_range": "4000 - 11000",
                        "status": "normal",
                        "confidence": 0.98
                    },
                    {
                        "name": "Fasting Blood Sugar",
                        "value": 145,
                        "unit": "mg/dL",
                        "reference_range": "70 - 100",
                        "status": "high",
                        "confidence": 0.97
                    }
                ],
                "procedures": [],
                "medical_history": [],
                "allergies": [],
                "warnings": [],
                "extraction_confidence": 0.96
            }

    async def analyze_document(
        self,
        filename: str,
        image_bytes_list: List[bytes] = None,
        mime_types: List[str] = None,
        extracted_text: Optional[str] = None,
        user_doc_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends document images or text to Claude API and parses structured JSON response.
        """
        if settings.ENABLE_MOCK_AI or not self.api_key:
            logger.info("Using Mock AI mode for document analysis.")
            return self.get_mock_analysis_response(filename)

        system_prompt = self._load_system_prompt()
        user_content = []

        if user_doc_type:
            user_content.append({
                "type": "text",
                "text": f"User specified hint document type: {user_doc_type}"
            })

        if extracted_text and extracted_text.strip():
            user_content.append({
                "type": "text",
                "text": f"Document Text Extracted from PDF:\n\n{extracted_text[:12000]}"
            })

        if image_bytes_list:
            for i, img_bytes in enumerate(image_bytes_list):
                m_type = mime_types[i] if mime_types and i < len(mime_types) else "image/jpeg"
                base64_data = base64.b64encode(img_bytes).decode("utf-8")
                user_content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": m_type,
                        "data": base64_data
                    }
                })

        if not user_content:
            user_content.append({
                "type": "text",
                "text": "Please analyze the document."
            })

        client = AsyncAnthropic(api_key=self.api_key)

        try:
            response = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_content}
                ]
            )

            raw_text = ""
            for block in response.content:
                if block.type == "text":
                    raw_text += block.text

            return self._parse_json_response(raw_text)

        except RateLimitError as e:
            logger.error("Claude API Rate Limit Error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"code": "CLAUDE_TIMEOUT", "message": "Claude API rate limit reached. Please try again shortly."}
            )
        except APIConnectionError as e:
            logger.error("Claude API Connection Error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "CLAUDE_API_ERROR", "message": "Failed to connect to Claude AI service."}
            )
        except APIError as e:
            logger.error("Claude API Error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "CLAUDE_API_ERROR", "message": f"Claude API error: {e.message}"}
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Unexpected error in Claude analysis: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "INTERNAL_SERVER_ERROR", "message": "An internal error occurred during AI processing."}
            )

    def _parse_json_response(self, raw_text: str) -> Dict[str, Any]:
        """Safely parses JSON output from Claude, stripping markdown code blocks if present."""
        clean_text = raw_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()

        try:
            data = json.loads(clean_text)
            if isinstance(data, dict):
                return data
            return {"error_parse": "Root JSON is not a dictionary"}
        except Exception as e:
            logger.error("Failed to parse JSON response from Claude: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "INVALID_AI_RESPONSE", "message": "AI service returned invalid or non-JSON output."}
            )


claude_service = ClaudeService()
