import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import json
import re

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Elasticsearch client setup
es = Elasticsearch(
    "http://localhost:9200",
    basic_auth=("elastic", os.getenv("ELASTIC_PASSWORD"))
)

index_name = "rfp_documentsv2"

# Load embedding model once
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Create index with mapping if it doesn't exist
if not es.indices.exists(index=index_name):
    es.indices.create(
        index=index_name,
        body={
            "mappings": {
                "properties": {
                    "text": {"type": "text"},
                    "filename": {"type": "keyword"},
                    "embedding": {
                        "type": "dense_vector",
                        "dims": 384,
                        "index": True
                    }
                }
            }
        }
    )
    print(f"✅ Created index: {index_name}")
else:
    print(f"ℹ️ Index '{index_name}' already exists")

# Index a document
def index_document(index_name: str, text: str, filename: str):
    try:
        embedding = embedding_model.encode(text).tolist()
        document = {
            "text": text,
            "filename": filename,
            "embedding": embedding
        }
        response = es.index(index=index_name, document=document)
        print(f"✅ Indexed: {filename}")
        return response
    except Exception as e:
        print(f"❌ Error indexing {filename}: {e}")
        return None

# List all indexed documents (debug)
def list_indexed_documents():
    try:
        results = es.search(index=index_name, body={"query": {"match_all": {}}}, size=10)
        for i, hit in enumerate(results["hits"]["hits"], 1):
            print(f"{i}. {hit['_source']['filename']} — {hit['_source']['text'][:100]}...")
    except Exception as e:
        print(f"❌ Error listing documents: {e}")

# Search top-k similar documents
def search_similar_documents(query, top_k=3, min_score=0.9):
    query_vector = embedding_model.encode(query).tolist()

    script_query = {
        "script_score": {
            "query": {"match_all": {}},
            "script": {
                "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                "params": {"query_vector": query_vector}
            }
        }
    }

    try:
        results = es.search(
            index=index_name,
            body={
                "size": top_k,
                "query": script_query
            }
        )

        hits = results["hits"]["hits"]
        filtered = [
            hit["_source"]["text"]
            for hit in hits
            if hit.get("_score", 0) >= min_score
        ]

        print(f"🔍 Found {len(filtered)} relevant documents (min_score={min_score})")
        return filtered

    except Exception as e:
        print(f"❌ Error during search: {e}")
        return []

# Generate RAG response using Gemini 1.5 Flash
def generate_rag_response(query):
    top_docs = search_similar_documents(query)

    if not top_docs:
        return "Sorry, I couldn't find relevant documents."

    context = "\n\n".join(top_docs)
    prompt = f"""Use the context below to answer the question:\n\nContext:\n{context}\n\nQuestion: {query}\nAnswer:"""

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"❌ Error calling Gemini: {e}")
        return "An error occurred while generating the response."
    




    # Analyze RFP and return structured eligibility criteria


def query_eligibility_criteria():
    query = "Extract eligibility criteria for bidders from this RFP."
    top_docs = search_similar_documents(query)

    if not top_docs:
        return {"error": "No relevant documents found for eligibility analysis."}

    context = "\n\n".join(top_docs)

    prompt = """Extract the eligibility criteria for bidders from the following RFP content. For each criterion, return a structured object with:

- "criterion": A short title (e.g., "State Registration")
- "required": The requirement stated in the document
- "status": "met" or "not_met" based on the following company profile
- "details": Justification for the status

Company Profile:
- Registered in California
- Completed 5 healthcare IT projects in the last 5 years
- Holds CMMC Level 3 certification
- Annual revenue of $8.5M for the last 3 years
- 4 PMP-certified project managers
- Qualifies as a small business under NAICS 541512

Return JSON array of objects.

RFP Content:
""" + context

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)

        raw_text = response.text.strip()

        # 🧹 Clean markdown wrapper like ```json ... ```
        cleaned_text = re.sub(r"^```(?:json)?\s*|```$", "", raw_text, flags=re.MULTILINE).strip()

        # ✅ Convert cleaned string to JSON
        parsed_json = json.loads(cleaned_text)
        # print(parsed_json)

        return parsed_json

    except json.JSONDecodeError as json_err:
        print(f"❌ JSON parsing error: {json_err}")
        return {"error": "Gemini response could not be parsed as JSON."}
    except Exception as e:
        print(f"❌ Error generating eligibility criteria: {e}")
        return {"error": "Failed to generate eligibility criteria."}
    


def query_project_requirements():
    query = "Extract system and project requirements, classify them, and match them against company capabilities."
    top_docs = search_similar_documents(query)

    if not top_docs:
        return {"error": "No relevant documents found for requirement analysis."}

    context = "\n\n".join(top_docs)

    prompt = f"""
Using the following RFP content, extract structured requirements as JSON objects with the following keys:
- id (unique number)
- category (e.g., Technical, Compliance, Staffing, etc.)
- requirement (clear requirement text)
- section (section or page number)
- priority ("high", "medium", or "low")
- status ("fulfilled" or "gap")
- recommendation (if status is "gap", suggest improvement)

Company Capabilities:
- Registered in California
- Completed 5 healthcare IT projects in the last 5 years
- CMMC Level 3 certified
- $8.5M annual revenue
- 4 PMP-certified managers
- Small business (NAICS 541512)

RFP Content:
{context}

Return JSON array only.
"""

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)
        raw_text = response.text.strip()

        # 🧹 Clean markdown wrapper like ```json ... ```
        cleaned_text = re.sub(r"^```(?:json)?\s*|```$", "", raw_text, flags=re.MULTILINE).strip()

        # ✅ Convert cleaned string to JSON
        parsed_json = json.loads(cleaned_text)
        return parsed_json

    except json.JSONDecodeError as json_err:
        print(f"❌ JSON parsing error: {json_err}")
        return {"error": "Gemini response could not be parsed as JSON."}
    except Exception as e:
        print(f"❌ Error generating project requirements: {e}")
        return {"error": "Failed to generate project requirements."}

    

def analyze_contract_risks():
    query = "Identify contractual risks in the RFP and suggest mitigation strategies."
    top_docs = search_similar_documents(query)

    if not top_docs:
        return {"error": "No relevant RFP content found."}

    context = "\n\n".join(top_docs)

    prompt = f"""
From the following RFP content, extract contract risk clauses in structured JSON format. For each risk, return:

- "id": Unique identifier
- "clause": Clause name or section reference
- "risk": Description of the risk
- "severity": "high", "medium", or "low"
- "recommendation": Recommended mitigation or negotiation strategy

RFP Content:
{context}

Return only a JSON array of these objects.
"""

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)

        raw_text = response.text.strip()
        cleaned = re.sub(r"^```(?:json)?|```$", "", raw_text, flags=re.MULTILINE).strip()
        parsed = json.loads(cleaned)

        return parsed

    except json.JSONDecodeError as e:
        print("❌ JSON error:", e)
        return {"error": "Failed to parse Gemini output as JSON."}
    except Exception as e:
        print("❌ Gemini error:", e)
        return {"error": "Gemini generation failed."}



def generate_submission_checklist():
    query = "Extract the proposal submission checklist from the RFP."
    top_docs = search_similar_documents(query)

    if not top_docs:
        return []

    context = "\n\n".join(top_docs)

    prompt = f"""
From the following RFP content, extract a structured checklist of proposal submission requirements.

For each **category**, return:
- id: Unique numeric ID
- category: Name of the section (e.g., "Proposal Sections", "Submission Requirements")
- items: A list of checklist items, where each item has:
  - id: unique string (e.g., "3-2")
  - description: what the item is
  - completed: default false

Return the result strictly as a JSON array. No extra commentary or markdown.

RFP Content:
{context}
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        cleaned = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()
        checklist = json.loads(cleaned)
        return checklist

    except json.JSONDecodeError as e:
        print("❌ JSON parsing failed:", e)
        return []
    except Exception as e:
        print("❌ Gemini generation failed:", e)
        return []
