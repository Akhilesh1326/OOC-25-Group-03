# agents/eligibility_agent.py

import sys
import os

# Ensure parent directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from llm_client import async_llm_call

# Async function to extract eligibility from RFP content
async def extract_eligibility(rfp_text: str) -> dict:
    prompt = f"""
    You are an expert in analyzing government RFPs. Carefully examine the text below and extract all eligibility criteria 
    such as bidder qualifications, required certifications, financial thresholds, and experience clauses.

    RFP Content:
    {rfp_text}

    Respond in the following JSON format:
    {{
        "eligibility_passed": true/false,
        "criteria": [
            "Criterion 1",
            "Criterion 2",
            ...
        ],
        "summary": "Brief summary of eligibility findings"
    }}
    """

    response = await async_llm_call(prompt)

    try:
        result = eval(response) if isinstance(response, str) else response
        if isinstance(result, dict):
            return result
        else:
            return {
                "eligibility_passed": False,
                "criteria": ["LLM returned non-dict response"],
                "summary": "Failed to parse eligibility result"
            }
    except Exception as e:
        return {
            "eligibility_passed": False,
            "criteria": [str(e)],
            "summary": "Error during eligibility analysis"
        }
