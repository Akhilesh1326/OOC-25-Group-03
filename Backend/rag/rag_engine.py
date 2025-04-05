from .chunker import chunk_text
from elastic.elastic_helper import search_chunks

def analyze_rfp(content: bytes):
    text = content.decode("utf-8", errors="ignore")
    chunks = chunk_text(text)
    results = search_chunks(chunks)
    return {"chunks": chunks, "search_results": results}
