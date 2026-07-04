"""
config.py
---------
Central place where required API keys are loaded.
"""

import os

from dotenv import load_dotenv

load_dotenv()

# Gemini API key - used by Overview Agent, Aggregator Agent, and Safety Gate.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

# YouTube Data API v3 key - used by Video Agent.
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "YOUR_YOUTUBE_API_KEY_HERE")

# Model name used for Gemini calls.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def validate_keys():
    """Warn if required keys are still placeholders."""
    missing = []
    if "YOUR_GEMINI_API_KEY_HERE" in GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY")
    if "YOUR_YOUTUBE_API_KEY_HERE" in YOUTUBE_API_KEY:
        missing.append("YOUTUBE_API_KEY")
    return missing
