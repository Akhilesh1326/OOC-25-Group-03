import sys
import os

# Ensure the parent directory (Backend/) is in the path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from llm_client import async_llm_call

# Async function to check compliance in RFP content
async def check_compliance(rfp_text: str) -> dict:
    prompt = f"""
    You are a government contract compliance analyst. Analyze the following RFP content and identify any compliance risks. 
    Focus on legal requirements, mandatory certifications, submission deadlines, and eligibility clauses.

    RFP Content:
    {rfp_text}

    Provide your analysis in the following format:
    {{
        "compliance_passed": true/false,
        "issues": [
            "Issue 1",
            "Issue 2",
            ...
        ],
        "summary": "Brief summary of compliance check"
    }}
    """
    
    response = await async_llm_call(prompt)
    
    try:
        result = eval(response) if isinstance(response, str) else response
        if isinstance(result, dict):
            return result
        else:
            return {
                "compliance_passed": False,
                "issues": ["LLM returned non-dict response"],
                "summary": "Failed to parse compliance result"
            }
    except Exception as e:
        return {
            "compliance_passed": False,
            "issues": [str(e)],
            "summary": "Error during compliance analysis"
        }
