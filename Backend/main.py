from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from PyPDF2 import PdfReader
import tempfile, hashlib, os, requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/analyze/")
async def analyze_rfp(file: UploadFile = File(...)):
    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as temp:
        content = await file.read()
        temp.write(content)
        temp_path = temp.name

    # Create SHA256 hash to detect duplicates
    file_hash = hashlib.sha256(content).hexdigest()

    # Check Supabase for existing hash
    check = requests.get(
        f"{SUPABASE_URL}/rest/v1/rfps?filehash=eq.{file_hash}",
        headers=SUPABASE_HEADERS,
    )
    if check.status_code == 200 and len(check.json()) > 0:
        os.remove(temp_path)
        return {"message": "This RFP has already been uploaded."}

    # Extract text from PDF
    pdf = PdfReader(temp_path)
    text = "".join([page.extract_text() or "" for page in pdf.pages])
    os.remove(temp_path)

    # Split and vectorize the document
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_text(text)

    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    db = FAISS.from_texts(chunks, embeddings)
    retriever = db.as_retriever()
    llm = OpenAI(temperature=0.2, openai_api_key=OPENAI_API_KEY)
    qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

    # Ask eligibility question
    eligibility_response = qa.run("Is this RFP eligible for submission? Answer yes or no only.")
    status = "accepted" if "yes" in eligibility_response.lower() else "rejected"

    # Save result in Supabase
    save = requests.post(
        f"{SUPABASE_URL}/rest/v1/rfps",
        headers={**SUPABASE_HEADERS, "Content-Type": "application/json"},
        json={
            "filename": file.filename,
            "filehash": file_hash,
            "content": text[:1000],
            "status": status,
        },
    )

    # Summary of important points
    summary = qa.run("Summarize eligibility, submission checklist, and legal risks in this RFP.")

    return {
        "status": status,
        "summary": summary
    }
