"""
main.py
-------
FastAPI backend exposing a single endpoint:

    POST /research
    body: {"topic": "reinforcement learning"}
    returns: {status, reason, report, agent_log}

Run with:
    uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.orchestrator import run_research_pipeline
from backend import config

app = FastAPI(title="Education Research Agent API")

# Allow the Streamlit frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str


@app.get("/health")
def health_check():
    missing = config.validate_keys()
    return {
        "status": "ok",
        "missing_required_keys": missing,
    }


@app.post("/research")
def research(request: ResearchRequest):
    topic = request.topic.strip()
    if not topic:
        return {"status": "error", "reason": "Empty topic.", "report": None, "agent_log": []}
    return run_research_pipeline(topic)
