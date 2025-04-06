from sentence_transformers import SentenceTransformer
from typing import List

model = SentenceTransformer("BAAI/bge-small-en-v1.5")  # 384 dims

def get_embedding(text: str) -> List[float]:
    return model.encode(text).tolist()
