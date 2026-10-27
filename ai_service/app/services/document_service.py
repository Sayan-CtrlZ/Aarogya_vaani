import time
import uuid
from typing import Optional, Dict, List
from fastapi import UploadFile, HTTPException, status
from app.core.security import sanitize_filename
from app.utils.file_validation import validate_file_metadata, ALLOWED_IMAGE_EXTENSIONS
from app.utils.logging import logger
from app.services.image_service import validate_and_preprocess_image
from app.services.pdf_service import process_pdf_document
from app.services.claude_service import claude_service
from app.services.huggingface_service import huggingface_service
from app.services.extraction_service import (
    parse_raw_ai_extraction,
    aggregate_multi_document_extractions
)
from app.schemas.responses import (
    DocumentAnalysisResponse,
    ProcessingBatchMeta,
    PerDocumentResult,
    ErrorDetail
)

# In-memory document storage registry for MVP
DOCUMENT_REGISTRY: Dict[str, DocumentAnalysisResponse] = {}


class DocumentService:
    async def process_and_analyze_documents(
        self,
        files: List[UploadFile],
        user_doc_type: Optional[str] = "auto",
        language: Optional[str] = "English",
        patient_id: Optional[str] = None,
        generate_summary: bool = True
    ) -> DocumentAnalysisResponse:
        """
        Processes one or MULTIPLE uploaded medical documents/images in a single request.
        Routes Prescriptions & Lab Reports to Claude API, and Chest X-Rays / Radiology to Hulu-Med (HF Token).
        Processes each document independently, supports partial failures, and aggregates
        extracted entities into a unified clinical summary.
        """
        if not files or len(files) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "NO_FILES_PROVIDED", "message": "Please select at least one medical document file to upload."}
            )

        start_time = time.time()
        request_id = f"req_{uuid.uuid4()}"

        document_results: List[PerDocumentResult] = []
        processed_count = 0
        failed_count = 0

        for idx, file in enumerate(files):
            doc_id = f"doc_{uuid.uuid4()}"
            raw_filename = file.filename or f"document_{idx+1}"
            clean_name = sanitize_filename(raw_filename)

            try:
                content_bytes = await file.read()
                file_size = len(content_bytes)

                # Validate file metadata (mime, extension, size)
                clean_name, ext = validate_file_metadata(
                    filename=clean_name,
                    content_type=file.content_type,
                    file_size=file_size
                )

                logger.info(
                    "Processing batch document [%d/%d] request_id=%s doc_id=%s filename=%s size_bytes=%d",
                    idx + 1, len(files), request_id, doc_id, clean_name, file_size
                )

                # Detect whether this is a radiology X-Ray/imaging scan
                is_radiology = (
                    user_doc_type in ["imaging_report", "xray", "radiology"]
                    or any(k in clean_name.lower() for k in ["xray", "x-ray", "radiology", "chest", "ct", "mri", "scan"])
                )

                if is_radiology and ext in ALLOWED_IMAGE_EXTENSIONS:
                    logger.info("Routing document to Hulu-Med Radiology VLM (HF Token) filename=%s", clean_name)
                    raw_ai_dict = await huggingface_service.analyze_radiology_xray(
                        image_bytes=content_bytes,
                        filename=clean_name
                    )
                else:
                    image_bytes_list: List[bytes] = []
                    mime_types_list: List[str] = []
                    extracted_text: Optional[str] = None

                    if ext in ALLOWED_IMAGE_EXTENSIONS:
                        processed_bytes, mime_type, _, _ = validate_and_preprocess_image(
                            image_bytes=content_bytes,
                            original_filename=clean_name
                        )
                        image_bytes_list.append(processed_bytes)
                        mime_types_list.append(mime_type)

                    elif ext == ".pdf":
                        pdf_result = process_pdf_document(
                            pdf_bytes=content_bytes,
                            filename=clean_name
                        )
                        text_blocks = []
                        if pdf_result.get("has_extractable_text"):
                            for p in pdf_result["pages"]:
                                text_blocks.append(f"--- PAGE {p['page_number']} ---\n{p['text']}")
                        extracted_text = "\n\n".join(text_blocks) if text_blocks else None

                        for p in pdf_result["pages"]:
                            if p.get("image_bytes"):
                                image_bytes_list.append(p["image_bytes"])
                                mime_types_list.append("image/png")

                    # Perform Claude API extraction for text & prescriptions
                    logger.info("Routing document to Claude Vision/OCR API filename=%s", clean_name)
                    raw_ai_dict = await claude_service.analyze_document(
                        filename=clean_name,
                        image_bytes_list=image_bytes_list if image_bytes_list else None,
                        mime_types=mime_types_list if mime_types_list else None,
                        extracted_text=extracted_text,
                        user_doc_type=user_doc_type
                    )

                parsed_data = parse_raw_ai_extraction(
                    raw_ai_dict=raw_ai_dict,
                    user_doc_type=user_doc_type
                )

                if patient_id and parsed_data.get("patient"):
                    parsed_data["patient"].patient_id = patient_id

                doc_type = parsed_data.get("document_type") or "auto"
                confidence = float(parsed_data.get("confidence", 1.0))

                document_results.append(PerDocumentResult(
                    document_id=doc_id,
                    filename=clean_name,
                    document_type=doc_type,
                    confidence=confidence,
                    status="completed",
                    extracted_data=parsed_data
                ))
                processed_count += 1

            except Exception as e:
                logger.error(
                    "Failed to process document item [%d/%d] doc_id=%s filename=%s error=%s",
                    idx + 1, len(files), doc_id, clean_name, str(e)
                )
                failed_count += 1
                document_results.append(PerDocumentResult(
                    document_id=doc_id,
                    filename=clean_name,
                    document_type="unknown",
                    confidence=0.0,
                    status="failed",
                    error=ErrorDetail(
                        code="INVALID_DOCUMENT",
                        message=str(e)
                    )
                ))

        end_time = time.time()
        processing_time_ms = int((end_time - start_time) * 1000)

        # Determine processing batch status
        if failed_count == 0:
            batch_status = "completed"
        elif processed_count > 0:
            batch_status = "partial"
        else:
            batch_status = "failed"

        processing_meta = ProcessingBatchMeta(
            status=batch_status,
            documents_received=len(files),
            documents_processed=processed_count,
            documents_failed=failed_count,
            processing_time_ms=processing_time_ms
        )

        # Aggregate multi-document extractions into a unified clinical summary
        combined_record, clinical_summary, warnings = aggregate_multi_document_extractions(
            doc_results=document_results,
            generate_summary=generate_summary,
            language=language
        )

        response = DocumentAnalysisResponse(
            success=(batch_status != "failed"),
            request_id=request_id,
            processing=processing_meta,
            documents=document_results,
            combined=combined_record,
            clinical_summary=clinical_summary,
            warnings=warnings
        )

        DOCUMENT_REGISTRY[request_id] = response
        for doc_res in document_results:
            DOCUMENT_REGISTRY[doc_res.document_id] = response

        logger.info(
            "Batch analysis completed request_id=%s received=%d processed=%d failed=%d status=%s time_ms=%d",
            request_id, len(files), processed_count, failed_count, batch_status, processing_time_ms
        )
        return response

    def get_document(self, identifier: str) -> DocumentAnalysisResponse:
        if identifier not in DOCUMENT_REGISTRY:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "DOCUMENT_NOT_FOUND", "message": f"Document or Request ID '{identifier}' not found."}
            )
        return DOCUMENT_REGISTRY[identifier]


document_service = DocumentService()
