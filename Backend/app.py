from fastapi import UploadFile, File, FastAPI
from elastic.elastic_helper import generate_rag_response, index_document, query_eligibility_criteria, query_project_requirements, analyze_contract_risks, generate_submission_checklist, query_rfp_metadata
from pathlib import Path
import os
from elasticsearch import Elasticsearch
from PyPDF2 import PdfReader
from fastapi.responses import JSONResponse

es = Elasticsearch(
    "http://localhost:9200",
    basic_auth=("elastic", os.getenv("ELASTIC_PASSWORD"))
)

app = FastAPI()

UPLOAD_DIR = "uploads"
TEXT_DIR = "texts"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEXT_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    print("uploading new version of file")
    filename = file.filename
    file_location = os.path.join(UPLOAD_DIR, filename)

    # Save uploaded file
    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)

    # Extract text from PDF
    reader = PdfReader(file_location)
    full_text = "\n".join([page.extract_text() or "" for page in reader.pages])

    # Save text
    text_path = os.path.join(TEXT_DIR, filename.replace(".pdf", ".txt"))
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    # Index into Elasticsearch
    index_document(index_name="rfp_documentsv2", text=full_text, filename=filename)

    return {"message": f"✅ Uploaded and indexed: {filename}"}




@app.get("/rag")
def rag_query(q: str):
    answer = generate_rag_response(q)
    return {"answer": answer}

@app.delete("/api/clear-index")
def clear_index():
    print("delete older version here")
    es.indices.delete(index="rfp_documentsv2", ignore_unavailable=True)
    es.indices.create(index="rfp_documentsv2", body={
        "mappings": {
            "properties": {
                "content": {"type": "text"},
                "filename": {"type": "keyword"},
                "timestamp": {"type": "date"}
            }
        }
    })
    return {"message": "Index cleared"}


@app.get("/api/eligibility")
def get_eligibility():
    response = query_eligibility_criteria()
    # print(response)
    return {"criteria": response}


@app.get("/api/requirements")
def get_requirements():
    response = query_project_requirements()
    # print(response)
    return {"requirements": response}


@app.get("/api/contract-risks")
def get_contract_risks():
    response = analyze_contract_risks()
    print(response)
    return {"risks": response}

@app.get("/api/submission-checklist")
def get_submission_checklist():
    checklist = generate_submission_checklist()
    print(checklist)
    print() 
    return JSONResponse(content={"checklist": checklist})


@app.get("/api/rfp-info")
def read_rfp_info():
    return query_rfp_metadata()