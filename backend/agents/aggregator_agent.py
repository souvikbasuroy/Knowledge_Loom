"""
AGGREGATOR AGENT
----------------
Job: Take the raw outputs of the specialist agents and merge them into
one clean, well-formatted Markdown study report.

Tool used: Gemini for text formatting and synthesis only.
"""


def run_aggregator_agent(model, topic: str, overview: dict, videos: dict,
                         papers: dict) -> str:
    video_lines = "\n".join(
        f"- [{v['title']}]({v['url']}) - {v['channel']}"
        for v in videos.get("videos", [])
    ) or "_No videos found._"

    paper_lines = "\n".join(
        f"- **{p['title']}** ({p['year']}) - {p['authors']} - "
        f"{p['citations']} citations. [Link]({p['url']})"
        for p in papers.get("papers", [])
    ) or "_No papers found._"

    prompt = f"""
You are the final editor assembling a research study guide on the topic: "{topic}".

Combine the material below into a single clean Markdown report with this
exact structure. Do not add facts that are not present in the material.
Lightly polish wording only; do not rewrite the overview's substance.

# {topic}

## Overview
{overview.get('content', '')}

## Recommended Videos
{video_lines}

## Research Paper Suggestions
{paper_lines}

---
Return the final Markdown report only, nothing else.
"""

    try:
        response = model["client"].models.generate_content(
            model=model["model_name"], contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        # Programmatic backup formatting if the Gemini service fails (e.g., due to a 429 rate limit)
        fallback_report = f"""# {topic}

## Overview
{overview.get('content', '')}

## Recommended Videos
{video_lines}

## Research Paper Suggestions
{paper_lines}

---
*Note: This report was assembled using the system's rule-based programmatic backup aggregator because the Gemini LLM synthesis service is currently rate-limited ({e}).*
"""
        return fallback_report.strip()

