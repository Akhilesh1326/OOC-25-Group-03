import fitz  # PyMuPDF
from typing import List, Dict

def chunk_pdf(file_path: str) -> List[Dict]:
    """Chunks PDF page-wise"""
    doc = fitz.open(file_path)
    chunks = []
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            chunks.append({
                "page_number": i + 1,
                "full_text": text
            })
    doc.close()
    return chunks
