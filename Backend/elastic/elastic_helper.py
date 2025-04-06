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

Company Profile (FirstStaff Workforce Solutions, LLC):
- Legal entity: Limited Liability Company incorporated in Delaware
- Operating history: 9 years in business, 7 years in temporary staffing
- Services: Administrative, IT, Legal & Credentialing Staffing
- NAICS codes: 561320 (Temporary Help Services), 541611 (Admin Management)
- DUNS: 07-842-1490, CAGE Code: 8J4T7
- SAM.gov registration: Active since 03/01/2022
- State registration: SRN-DE-0923847
- Texas Employment Agency License #TXEA-34892
- Insurance: Travelers Insurance (Policy #TX-884529-A) covering Workers' Comp, Liability, and Auto
- Key personnel:
  * Ramesh Iyer (Project Manager)
  * Sarah Collins (Technical Lead)
  * James Wu (Security Auditor)
- Not MBE certified or HUB/DBE status
- Form W 9 Certificate present
- Certificate of insurance is present

    
Rules:
Automating Standard Compliance Checks
You are a government RFP compliance expert.

You are an assistant that analyzes Request for Proposal (RFP) documents.
Your goal is to extract any information that may relate to vendor eligibility or qualification — even if not explicitly labeled as a requirement.
These include:
- Technical, financial, experience, and legal qualifications
- All licenses, permits  mentioned
- Any numbers like years of experience, number of staff, dollar amounts, dates, contract durations
- Conditions under which vendors are eligible or ineligible
- Compliance expectations (e.g. background checks, legal verification)
- DO not consider e-varify

Verify whether ConsultAdd is legally eligible to bid (e.g., state registration, certifications, past performance requirements).
Identify any deal-breakers early in the process.

IMPORTANT: Only return eligibility conditions if you are 100 percent sure that it is required and there is no indirect alternative.
IMPORTANT: Do not change the structure of the output.
IMPORTANT: Group findings under relevant categories and quote source text wherever possible.

Return JSON array of objects only.

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
Using the following RFP content, extract structured **mandatory eligibility requirements** that FirstStaff Workforce Solutions, LLC must meet in order to be eligible to submit a compliant proposal.

🎯 Focus on MUST-HAVE qualifications, certifications, licenses, registrations, and experience explicitly required in the RFP for eligibility. 

🚫 Do NOT include general narrative sections, evaluation criteria, or optional qualifications.

For each eligibility requirement found, return an object with the following structure:

- id: Unique numeric ID
- category: Broad classification (e.g., "Licensing", "Certifications", "Experience", "Insurance", "Business Registration")
- requirement: Clear description of the required eligibility item
- section: Section name or page number where this requirement is stated
- priority: One of:
    - "high" – Required to be eligible to bid
    - "medium" – Strongly preferred, could impact evaluation
    - "low" – Optional or minor preference
- status: 
    - "fulfilled" if FirstStaff meets the requirement based on the profile below
    - "gap" if FirstStaff does not meet or has no evidence of meeting it
- recommendation: If status is "gap", provide a clear and actionable recommendation to close the gap or determine if FirstStaff should proceed with the proposal

📘 Company Profile (FirstStaff Workforce Solutions, LLC):
- Legal entity: Limited Liability Company incorporated in Delaware
- Principal office: 3105 Maple Avenue, Suite 1200, Dallas, TX 75201
- Operating history: 9 years in business, 7 years in temporary staffing
- Services: Administrative, IT, Legal & Credentialing Staffing
- NAICS codes: 561320 (Temporary Help Services), 541611 (Admin Management)
- DUNS: 07-842-1490, CAGE Code: 8J4T7
- SAM.gov registration: Active since 03/01/2022
- TIN: 47-6392011
- Texas Employment Agency License #TXEA-34892
- Insurance: Travelers Insurance (Policy #TX-884529-A) covering Workers' Comp, Liability, and Auto
- Key personnel:
  * Ramesh Iyer (Project Manager)
  * Sarah Collins (Technical Lead)
  * James Wu (Security Auditor)
- Not MBE certified or HUB/DBE status

📄 RFP Content:
{context}

Return your output strictly as a **JSON array** with no additional commentary or explanation.
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
- "impact": How this might specifically affect FirstStaff Workforce Solutions based on their profile

Company Profile (FirstStaff Workforce Solutions, LLC):
- Legal entity: Limited Liability Company incorporated in Delaware
- Operating history: 9 years in business, 7 years in temporary staffing
- Services: Administrative, IT, Legal & Credentialing Staffing
- Annual revenue: Not specified
- Key personnel:
  * Ramesh Iyer (Project Manager)
  * Sarah Collins (Technical Lead)
  * James Wu (Security Auditor)
- Licensed in Texas (Employment Agency License #TXEA-34892)
- Insurance: Travelers Insurance (Policy #TX-884529-A) covering Workers' Comp, Liability, and Auto
- No bank letter of creditworthiness available
- No specified line of credit or financial reserves mentioned

Rules for Analyzing Contract Risks:
- Identify biased clauses that could put ConsultAdd at a disadvantage (e.g., unilateral termination rights).
- Suggest modifications to balance contract terms (e.g., adding a notice period for termination).

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
From the following RFP content, extract a structured checklist of **verifiable proposal submission requirements** that FirstStaff Workforce Solutions, LLC must submit as part of the proposal.

Only include submission elements that can be physically or digitally provided as **proof**, such as:
- Required forms, certifications, licenses, or affidavits
- Mandatory attachments (e.g., proof of insurance, signed forms, registration certificates)
- Signatures or authorizations required
- Document formatting rules (e.g., page limits, font types/sizes, margins, TOC requirements)
- Submission instructions (e.g., electronic/physical submission, labeling, deadlines)

🚫 Do **not** include company narrative sections such as past performance, experience, or descriptive qualifications unless they require an **attached proof document or form**.

📄 If any required form or document is located on a specific page of the RFP (e.g., “Form A on Page 12”), include that page number in the item's description.

📌 If multiple required forms are found together on the same page, you may group them together or assign the same page number.

✅ For the `completed` field:
- Set it to `true` if the item can be fulfilled using information or documents already provided in FirstStaff's profile.
- Otherwise, set it to `false`.

Return the result as a **JSON array**, where each object represents a **category** of requirements. For each category, return:

- id: Unique numeric ID
- category: Name of the section (e.g., "Required Forms", "Formatting Instructions", "Submission Method")
- items: A list of checklist items, where each item has:
  - id: unique string (e.g., "3-2")
  - description: Description of what is required, including form name and page number if mentioned
  - completed: true/false depending on whether FirstStaff can already fulfill this
  - relevance: One of the following based on FirstStaff’s profile:
      - "standard" (typical requirement)
      - "needs_attention" (may require customization or extra effort)
      - "critical" (potential blocker or key differentiator)
  - notes: Optional guidance for FirstStaff on how to approach or satisfy the requirement, especially if action is needed

RFP Content:
{context}

Return the result **strictly as a JSON array** with no extra commentary, markdown, or explanations.
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


def generate_rag_response(query):
    top_docs = search_similar_documents(query)

    if not top_docs:
        return "Sorry, I couldn't find relevant documents."

    context = "\n\n".join(top_docs)
    prompt = f"""Use the context below to answer the question regarding FirstStaff Workforce Solutions, LLC's eligibility and capabilities for this RFP:

Company Profile (FirstStaff Workforce Solutions, LLC):
- Legal entity: Limited Liability Company incorporated in Delaware
- Principal office: 3105 Maple Avenue, Suite 1200, Dallas, TX 75201
- Operating history: 9 years in business, 7 years in temporary staffing
- Services: Administrative, IT, Legal & Credentialing Staffing
- NAICS codes: 561320 (Temporary Help Services), 541611 (Admin Management)
- DUNS: 07-842-1490, CAGE Code: 8J4T7
- SAM.gov registration: Active since 03/01/2022 
- State registration: SRN-DE-0923847
- Texas Employment Agency License #TXEA-34892
- Insurance: Travelers Insurance (Policy #TX-884529-A) covering Workers' Comp, Liability, and Auto
- Key personnel:
  * Ramesh Iyer (Project Manager)
  * Sarah Collins (Technical Lead)
  * James Wu (Security Auditor)
- Authorized representative: Meredith Chan, Director of Contracts
- Not MBE certified or HUB/DBE status 

Context:
{context}

Question: {query}
Answer:"""

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"❌ Error calling Gemini: {e}")
        return "An error occurred while generating the response."
    


def query_rfp_metadata():
    query = "Extract title, agency, issue date, due date, contract value, duration, and status from this RFP."
    top_docs = search_similar_documents(query)

    if not top_docs:
        return {"error": "No relevant documents found for metadata extraction."}

    context = "\n\n".join(top_docs)

    prompt = """
Extract the following metadata from the given RFP content and return only a clean JSON object with these fields:

{
  "title": "",
  "agency": "",
  "issueDate": "",
  "dueDate": "",
  "contractValue": "",
  "duration": "",
  "status": ""
}

Only include these fields. Do not add markdown (e.g., ```json) or any explanation. Ensure the JSON is directly parsable.

RFP Content:
""" + context

    try:
        genai_model = genai.GenerativeModel("gemini-1.5-flash")
        response = genai_model.generate_content(prompt)
        raw_text = response.text.strip()

        # 🧹 Clean potential code blocks or markdown
        cleaned_text = re.sub(r"^```(?:json)?\s*|```$", "", raw_text, flags=re.MULTILINE).strip()

        # ✅ Parse JSON safely
        parsed_json = json.loads(cleaned_text)

        return parsed_json

    except json.JSONDecodeError as json_err:
        print(f"❌ JSON parsing error: {json_err}")
        return {"error": "Gemini response could not be parsed as JSON."}
    except Exception as e:
        print(f"❌ Error generating RFP metadata: {e}")
        return {"error": "Failed to extract RFP metadata."}






