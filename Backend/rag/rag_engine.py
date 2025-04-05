import asyncio
from .chunker import chunk_text
from agents.compliance_agent import check_compliance
from agents.eligibility_agent import extract_eligibility
# from agents.risk_agent import analyze_risk
# from agents.checklist_agent import generate_checklist

async def process_chunk(chunk: str):
    return {
        "chunk": chunk,
        "compliance": await check_compliance(chunk),
        "eligibility": await extract_eligibility(chunk),
        # "risk": await analyze_risk(chunk),
        # "checklist": await generate_checklist(chunk)
    }

async def analyze_rfp(content: bytes):
    text = content.decode("utf-8", errors="ignore")
    chunks = chunk_text(text)

    tasks = [process_chunk(chunk) for chunk in chunks]
    results = await asyncio.gather(*tasks)

    return results  # Return all agent responses per chunk
