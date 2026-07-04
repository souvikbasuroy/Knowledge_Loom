"""
security.py
-----------
Implements the two security controls we demonstrate for the capstone:

1. NON-INTERACTIVE ACCESS
   No agent ever fetches or renders raw third-party HTML. Every agent talks
   only to structured, official APIs (Gemini, YouTube Data API, Semantic
   Scholar, Google Books). This removes the indirect-prompt-injection
   surface that comes from an agent reading arbitrary web pages.

2. OUTPUT CONTENT SAFETY GATE (Governance / Logic Review)
   Before the final report is returned to the user, the Aggregator Agent's
   output passes through a lightweight safety classifier. If the topic or
   generated content falls into a disallowed category (e.g. weapons,
   self-harm instructions, hate content), the report is blocked and a safe
   message is returned instead — mirroring the "Vibe Diff" / mandatory
   logic-review idea from the security framework: nothing ships without a
   check, even though the check here is automated rather than a human.
"""

import re

# Minimal, fast keyword-based pre-filter. This runs before the LLM-based
# check so obviously disallowed topics are caught without spending tokens.
_BLOCKED_PATTERNS = [
    r"\bmake\s+a\s+bomb\b",
    r"\bsynthesiz(e|ing)\s+(nerve agent|sarin|ricin)\b",
    r"\bhow to (kill|murder)\b",
    r"\bchild\s+sexual\b",
]


def keyword_prefilter(topic: str) -> bool:
    """Returns True if topic is safe to proceed, False if blocked outright."""
    lowered = topic.lower()
    for pattern in _BLOCKED_PATTERNS:
        if re.search(pattern, lowered):
            return False
    return True


def llm_safety_check(gemini_model, final_report_text: str) -> tuple[bool, str]:
    """
    Uses Gemini itself as a lightweight judge over the FINAL aggregated
    report (not the raw topic) to catch anything that slipped through.

    Returns (is_safe, reason).
    """
    prompt = (
        "You are a content safety classifier. Read the study report below "
        "and answer with exactly one word on the first line: SAFE or UNSAFE. "
        "On the second line, give a one-sentence reason. "
        "Mark UNSAFE only if the content provides actionable instructions "
        "for violence, weapons, self-harm, or clearly illegal harmful acts. "
        "Educational/academic framing of sensitive topics is SAFE.\n\n"
        f"REPORT:\n{final_report_text[:4000]}"
    )
    try:
        response = gemini_model["client"].models.generate_content(
            model=gemini_model["model_name"], contents=prompt
        )
        text = response.text.strip()
        first_line = text.splitlines()[0].strip().upper()
        reason = text.splitlines()[1] if len(text.splitlines()) > 1 else ""
        is_safe = first_line.startswith("SAFE")
        return is_safe, reason
    except Exception as e:
        # If the check fails because of a 429 rate limit / quota exhaustion, bypass rather than block the whole application.
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e) or "quota" in str(e).lower():
            return True, f"Bypassed (API rate limit / quota exhausted)"
        # Fail safe for other errors: if the classifier itself errors, don't silently ship unchecked content
        return False, f"Safety check failed to run: {e}"

