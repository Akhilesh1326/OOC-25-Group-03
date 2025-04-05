from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from backend.analyze import analyze_rfp
from backend.agents.compliance import check_compliance

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/rfps"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_location, "wb") as f:
        f.write(await file.read())

    file_path = os.path.abspath(file_location)

    # analyze_rfp returns a list of chunks or results
    analysis_result = await analyze_rfp(file_path)

    # Assume we're only checking compliance on the first chunk for now
    first_chunk = analysis_result[0]
    compliance_result = await check_compliance(first_chunk["full_text"])

    return {
        "analysis": analysis_result,
        "compliance": compliance_result
    }
