from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from s3_utils import get_file_hash, file_exists_in_s3, upload_to_s3, delete_from_s3
from rag.chunker import chunk_pdf
import os

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/rfps"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "RFP Upload API is running!"}

@app.post("/analyze/")
async def upload_rfp(file: UploadFile = File(...)):
    content = await file.read()
    file_hash = get_file_hash(content)

    if file_exists_in_s3(file_hash, file.filename):
        raise HTTPException(status_code=400, detail="File already exists in S3")

    # Save locally for chunking
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Upload to S3
    upload_to_s3(content, file.filename, file_hash)

    # Chunking logic
    chunks = chunk_pdf(file_path)

    return {
        "message": "File uploaded and chunked successfully.",
        "total_chunks": len(chunks),
        "chunks": chunks[:3]  # Return sample
    }

@app.delete("/delete/")
async def delete_rfp(file: UploadFile = File(...)):
    content = await file.read()
    file_hash = get_file_hash(content)

    if not file_exists_in_s3(file_hash, file.filename):
        raise HTTPException(status_code=404, detail="File not found in S3")

    success = delete_from_s3(file_hash, file.filename)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete file from S3")

    return {"message": "File deleted successfully"}
