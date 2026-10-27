from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.documents import router as documents_router
from app.api.routes.radiology import router as radiology_router
from app.schemas.responses import ErrorResponse, ErrorDetail

app = FastAPI(
    title="ArogyaVani Module B - Medical Document Intelligence & Radiology API",
    description="AI-assisted medical document digitization, OCR, clinical entity extraction, deterministic lab validation, and Hulu-Med Radiology VLM API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom Exception Handler for Consistent Error Responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)

    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", code)
        message = exc.detail.get("message", message)

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            error=ErrorDetail(code=code, message=message)
        ).model_dump()
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            error=ErrorDetail(code="INTERNAL_SERVER_ERROR", message="An unexpected server error occurred.")
        ).model_dump()
    )


# Basic Health & Information Routes
@app.get("/", tags=["Info"])
def read_root():
    return {
        "service": "MediKiosk Module B - Medical Document Digitization & Intelligence API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "medikiosk-document-intelligence"
    }


# Include Routers
app.include_router(
    documents_router,
    prefix="/api/v1/documents",
    tags=["Medical Documents"]
)

app.include_router(
    radiology_router,
    prefix="/api/v1/radiology",
    tags=["Radiology & X-Ray VLM"]
)

