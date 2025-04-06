import os
from pinecone import Pinecone, ServerlessSpec

index_name = "rfp-lite-embed-index"
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)

def upsert_chunks_to_pinecone(chunks, doc_id):
    vectors = []
    from rag.embedding import get_embedding

    for i, chunk in enumerate(chunks):
        text = chunk["full_text"]
        page = chunk["page"]

        vector = get_embedding(text)
        pinecone_id = f"{doc_id}_chunk_{i}"
        metadata = {
            "text": text,
            "page": page,
            "doc_id": doc_id
        }

        vectors.append((pinecone_id, vector, metadata))

    index.upsert(vectors=vectors)
    return len(vectors)
