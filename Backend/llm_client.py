import os
import openai

# Load API key from environment variable or set it here directly
openai.api_key = os.getenv("OPENAI_API_KEY")  # Or replace with your key directly

# Async function to call LLM with a given prompt
async def async_llm_call(prompt: str) -> str:
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",  # or gpt-4 if you have access
            messages=[
                {"role": "system", "content": "You are an expert government compliance analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        # Fallback in case of error or for development/testing
        return str({
            "compliance_passed": False,
            "issues": [str(e)],
            "summary": "Mocked response due to LLM failure or testing mode"
        })
