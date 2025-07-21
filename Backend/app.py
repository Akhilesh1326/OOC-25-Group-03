from fastapi import UploadFile, File, FastAPI,HTTPException
from elastic.elastic_helper import generate_rag_response, index_document, query_eligibility_criteria, query_project_requirements, analyze_contract_risks, generate_submission_checklist, query_rfp_metadata
from pathlib import Path
import shutil
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



COMPANY_DATA_DIR = "company_data"
os.makedirs(COMPANY_DATA_DIR, exist_ok=True)


@app.post("/api/upload-company-data")
async def upload_company_data(file: UploadFile = File(...)):
    if file.content_type not in [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    original_path = os.path.join(COMPANY_DATA_DIR, f"company_{file.filename}")
    
    # Save original uploaded file
    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text (only if it's a PDF, for now)
    extracted_text = ""
    if file.content_type == "application/pdf":
        try:
            reader = PdfReader(original_path)
            for page in reader.pages:
                extracted_text += page.extract_text() or ""
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")
    else:
        extracted_text = "Text extraction for Word documents is not yet implemented."

    # Save extracted text to a .txt file
    txt_filename = f"{os.path.splitext(file.filename)[0]}.txt"
    txt_path = os.path.join(COMPANY_DATA_DIR, txt_filename)

    with open(txt_path, "w", encoding="utf-8") as txt_file:
        txt_file.write(extracted_text)

    return {
        "filename": file.filename,
        "message": "Company data uploaded and text extracted successfully",
        "text_file": txt_filename
    }

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





from fastapi.responses import JSONResponse

aggregated_data = {}

@app.get("/api/eligibility")
def get_eligibility():
    response = query_eligibility_criteria()
    aggregated_data["eligibility"] = response
    return {"criteria": response}

@app.get("/api/requirements")
def get_requirements():
    response = query_project_requirements()
    aggregated_data["requirements"] = response
    return {"requirements": response}

@app.get("/api/contract-risks")
def get_contract_risks():
    response = analyze_contract_risks()
    aggregated_data["contract_risks"] = response
    return {"risks": response}

@app.get("/api/submission-checklist")
def get_submission_checklist():
    checklist = generate_submission_checklist()
    aggregated_data["submission_checklist"] = checklist
    # return JSONResponse(content=aggregated_data)

    return JSONResponse(content={"checklist": checklist})


@app.get("/api/rfp-info")
def read_rfp_info():
    return query_rfp_metadata()