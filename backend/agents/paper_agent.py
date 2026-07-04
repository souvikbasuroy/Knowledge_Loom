"""
Agent 3: PAPER AGENT
---------------------
Job: Given a topic, find the most important / most-cited research papers.

Tool used: OpenAlex API. It is free, structured, and does not require an
API key. Results are sorted by citation count.
"""

import re
import time

import requests

OPENALEX_WORKS_URL = "https://api.openalex.org/works"
OPENALEX_MAILTO = "noreply@edu-research-agent.local"


def _abstract_from_inverted_index(inverted_index: dict | None) -> str:
    if not inverted_index:
        return ""

    positions = []
    for word, indexes in inverted_index.items():
        for index in indexes:
            positions.append((index, word))

    return " ".join(word for _, word in sorted(positions))


def _get_openalex(params: dict, headers: dict) -> dict:
    params = {**params, "mailto": OPENALEX_MAILTO}
    last_error = None

    for wait_seconds in (0, 2, 5):
        if wait_seconds:
            time.sleep(wait_seconds)

        try:
            resp = requests.get(
                OPENALEX_WORKS_URL, params=params, headers=headers, timeout=10
            )
            resp.raise_for_status()
            return resp.json()
        except requests.HTTPError as e:
            last_error = e
            if e.response is None or e.response.status_code != 429:
                raise
        except requests.RequestException as e:
            last_error = e
            raise

    raise last_error


def run_paper_agent(api_key: str, topic: str, max_results: int = 10) -> dict:
    query = re.sub(r"\bner\b", "named entity recognition", topic, flags=re.IGNORECASE)
    params = {
        "filter": f"title_and_abstract.search:{query}",
        "per-page": max_results,
        "sort": "cited_by_count:desc",
        "select": (
            "display_name,authorships,publication_year,cited_by_count,"
            "abstract_inverted_index,doi,id,primary_location"
        ),
    }
    headers = {"User-Agent": "edu-research-agent/1.0"}

    try:
        data = _get_openalex(params, headers)
    except requests.RequestException as e:
        return {"agent": "paper_agent", "papers": [], "error": str(e)}

    if not data.get("results"):
        params.pop("filter", None)
        params["search"] = query
        try:
            data = _get_openalex(params, headers)
        except requests.RequestException as e:
            return {"agent": "paper_agent", "papers": [], "error": str(e)}

    cleaned = []
    for paper in data.get("results", [])[:max_results]:
        authors = ", ".join(
            item.get("author", {}).get("display_name", "")
            for item in (paper.get("authorships") or [])[:3]
        )
        location = paper.get("primary_location") or {}
        source = location.get("source") or {}
        url = location.get("landing_page_url") or paper.get("doi") or paper.get("id")
        abstract = _abstract_from_inverted_index(paper.get("abstract_inverted_index"))

        cleaned.append({
            "title": paper.get("display_name"),
            "authors": authors or "Unknown",
            "year": paper.get("publication_year"),
            "citations": paper.get("cited_by_count"),
            "venue": source.get("display_name"),
            "url": url,
            "abstract": abstract[:300],
        })

    return {"agent": "paper_agent", "papers": cleaned, "error": None}
