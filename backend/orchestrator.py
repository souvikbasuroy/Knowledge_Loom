"""
orchestrator.py
----------------
This is the "multi-agent system" coordination layer.

Flow:
  1. Keyword pre-filter on the raw topic (fast, cheap safety gate)
  2. Run Overview, Video, and Paper agents CONCURRENTLY (they don't
     depend on each other's output)
  3. Pass all 3 results into the Aggregator Agent to merge into one report
  4. Run an LLM-based safety check on the FINAL report before returning it
  5. Return structured status per agent + the final report
"""

from concurrent.futures import ThreadPoolExecutor, as_completed

from backend import config
from backend.security import keyword_prefilter, llm_safety_check
from backend.agents.overview_agent import build_overview_agent, run_overview_agent
from backend.agents.video_agent import run_video_agent
from backend.agents.paper_agent import run_paper_agent
from backend.agents.aggregator_agent import run_aggregator_agent


def run_research_pipeline(topic: str) -> dict:
    # --- Step 1: fast pre-filter -------------------------------------------------
    if not keyword_prefilter(topic):
        return {
            "status": "blocked",
            "reason": "Topic blocked by pre-filter safety rule.",
            "report": None,
            "agent_log": [],
        }

    agent_log = []

    # Shared Gemini model instance for Overview + Aggregator + Safety check.
    # (Video/Paper agents use their own separate, scoped API keys.)
    gemini_model = build_overview_agent(config.GEMINI_API_KEY, config.GEMINI_MODEL)

    # --- Step 2: run the 3 specialist agents concurrently ------------------------
    results = {}
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(run_overview_agent, gemini_model, topic): "overview",
            executor.submit(run_video_agent, config.YOUTUBE_API_KEY, topic): "videos",
            executor.submit(run_paper_agent, "", topic, 10): "papers",
        }
        for future in as_completed(futures):
            key = futures[future]
            try:
                results[key] = future.result()
                agent_log.append(f"✅ {key}_agent completed successfully")
            except Exception as e:
                results[key] = {"error": str(e)}
                agent_log.append(f"❌ {key}_agent failed: {e}")

    # Guard against a completely failed overview (nothing to aggregate)
    if "content" not in results.get("overview", {}):
        return {
            "status": "error",
            "reason": "Overview agent failed — cannot build report.",
            "report": None,
            "agent_log": agent_log,
        }
    
    if "error" in results.get("overview", {}):
        agent_log.append("⚠️ overview_agent rate-limited; loaded degraded fallback overview")

    # --- Step 3: aggregate everything into one report ---------------------------
    final_report = run_aggregator_agent(
        gemini_model,
        topic,
        overview=results.get("overview", {}),
        videos=results.get("videos", {}),
        papers=results.get("papers", {}),
    )
    agent_log.append("✅ aggregator_agent merged all results")

    # --- Step 4: safety gate on the FINAL report ---------------------------------
    is_safe, reason = llm_safety_check(gemini_model, final_report)
    if not is_safe:
        agent_log.append(f"⛔ safety_gate blocked final report: {reason}")
        return {
            "status": "blocked",
            "reason": reason,
            "report": None,
            "agent_log": agent_log,
        }
    
    if reason and "Bypassed" in reason:
        agent_log.append(f"⚠️ safety_gate bypassed: {reason}")
    else:
        agent_log.append("✅ safety_gate passed")

    return {
        "status": "success",
        "reason": None,
        "report": final_report,
        "agent_log": agent_log,
    }

