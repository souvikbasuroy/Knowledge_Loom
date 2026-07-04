"""
Agent 2: VIDEO AGENT
---------------------
Job: Given a topic, find the most relevant YouTube videos.

Tool used: YouTube Data API v3 (search.list endpoint) — a structured,
official API call. No scraping, no visiting youtube.com directly.

Only holds the YOUTUBE_API_KEY.
"""

import requests

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


def run_video_agent(api_key: str, topic: str, max_results: int = 5) -> dict:
    if not api_key or "YOUR_YOUTUBE_API_KEY_HERE" in api_key:
        return {
            "agent": "video_agent",
            "videos": [],
            "error": "YouTube API key not configured.",
        }

    params = {
        "part": "snippet",
        "q": f"{topic} explained",
        "type": "video",
        "maxResults": max_results,
        "order": "relevance",
        "safeSearch": "strict",
        "key": api_key,
    }

    try:
        resp = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        return {"agent": "video_agent", "videos": [], "error": str(e)}

    videos = []
    for item in data.get("items", []):
        video_id = item.get("id", {}).get("videoId")
        snippet = item.get("snippet", {})
        if not video_id:
            continue
        videos.append({
            "title": snippet.get("title"),
            "channel": snippet.get("channelTitle"),
            "published": snippet.get("publishedAt"),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
        })

    return {"agent": "video_agent", "videos": videos, "error": None}
