"""
Agent 1: OVERVIEW AGENT
------------------------
Job: Given a topic, produce a clear, structured explanation:
     - what it is
     - why it matters
     - 4-6 key sub-concepts a learner should know

Tool used: Gemini with Google Search grounding (falls back to plain
generation if grounding isn't available in the SDK version installed).

Only holds the GEMINI_API_KEY — no other credential is passed in.
"""

from google import genai
from google.genai import types


def build_overview_agent(api_key: str, model_name: str):
    """Returns a dict bundling the client + model name (the 'agent')."""
    client = genai.Client(api_key=api_key)
    return {"client": client, "model_name": model_name}


def run_overview_agent(agent, topic: str) -> dict:
    client = agent["client"]
    model_name = agent["model_name"]

    prompt = (
        f"You are an educational research assistant. The user wants to learn "
        f"about: \"{topic}\".\n\n"
        "Produce a well-structured overview with these exact sections:\n"
        "1. **What it is** (2-3 sentences, plain language)\n"
        "2. **Why it matters** (2-3 sentences)\n"
        "3. **Key concepts to understand** (4-6 bullet points, each one line)\n"
        "4. **Common misconceptions** (1-2 bullet points, if any exist)\n\n"
        "Be accurate and concise. Do not invent facts. If you are uncertain "
        "about something, say so rather than guessing."
    )

    import time
    
    # Simple retry helper to tolerate rate limits (429)
    response = None
    grounded = False
    last_error = None
    
    for attempt in range(3):
        try:
            # Attempt Google Search grounding so the overview is based on
            # current web results, not just the model's training data.
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                ),
            )
            grounded = True
            break
        except Exception as e:
            last_error = e
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                time.sleep(2 * (attempt + 1))  # Exponential backoff
                continue
            
            # If not a 429, try a fallback: plain generation without grounding
            try:
                response = client.models.generate_content(
                    model=model_name, contents=prompt
                )
                grounded = False
                break
            except Exception as inner_e:
                last_error = inner_e
                if "429" in str(inner_e) or "RESOURCE_EXHAUSTED" in str(inner_e):
                    time.sleep(2 * (attempt + 1))
                    continue
                break

    if response is not None:
        return {
            "agent": "overview_agent",
            "grounded_with_search": grounded,
            "content": response.text.strip(),
        }
    else:
        # Graceful degradation if Gemini key is fully exhausted/blocked
        return {
            "agent": "overview_agent",
            "grounded_with_search": False,
            "content": (
                f"_AI-generated overview is temporarily unavailable (Gemini API quota exhausted/rate limit hit). "
                f"Please verify your API key limits. Topic requested: \"{topic}\"_"
            ),
            "error": str(last_error)
        }

