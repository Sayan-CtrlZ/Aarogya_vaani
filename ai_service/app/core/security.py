import re
import uuid


def generate_document_id() -> str:
    """Generate server-side UUID for document processing."""
    return str(uuid.uuid4())


def sanitize_filename(filename: str) -> str:
    """Sanitize user-provided filenames to prevent path traversal or unsafe characters."""
    if not filename:
        return "unnamed_document"
    # Remove path components
    clean_name = os_path_basename(filename)
    # Remove non-alphanumeric except dots, dashes, underscores
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', clean_name)
    return clean_name or "unnamed_document"


def os_path_basename(path: str) -> str:
    import os
    return os.path.basename(path)
