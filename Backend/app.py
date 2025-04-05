from fastapi import FastAPI, UploadFile, File
from rag.rag_engine import analyze_rfp
from agents.compliance_agent import check_compliance

app = FastAPI()

@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    result = analyze_rfp(content)
    compliance = check_compliance(result)
    return {"analysis": result, "compliance": compliance}

@app.get("/")
def read_root():
    return {"message": "Hello Akhilesh!"}


# @app.post("/upload-document")
# def read_root():
#     return {"status": "online"}