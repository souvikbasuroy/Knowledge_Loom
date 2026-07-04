# Knowledge Loom 🎓 - AI Agents Capstone Project

**Subtitle**: A multi-agent educational assistant that transforms any topic into a comprehensive, multi-modal study guide.

**Track**: Agents for Good (Education)

---

## 🎥 Project Links
- **Video Demonstration**: [Insert your YouTube Link Here]
- **Live Demo**: [Knowledge Loom Vercel App](https://knowledge-loom-phi.vercel.app/)
- **Backend API**: [Hugging Face Space](https://huggingface.co/spaces/Souvikbasur/knowledge-loom-backend)
- **GitHub Repository**: [Knowledge Loom](https://github.com/souvikbasuroy/Knowledge_Loom)

---

## 🚀 Overview & Value Proposition

### The Problem
In the age of information overload, students, researchers, and self-directed learners spend more time searching for high-quality resources than actually studying. When learning a new complex topic, users have to manually piece together foundational summaries, search YouTube for reliable tutorials, and scour academic databases for research papers. This fragmented process is highly inefficient.

### The Solution
**Knowledge Loom** acts as a personal, automated research assistant. By simply inputting a topic, Knowledge Loom automatically synthesizes a structured overview, curates highly relevant educational videos, and recommends academic papers. It drastically reduces research time, ensuring learners have a curated, multi-modal study guide generated in seconds.

---

## 🤖 Why AI Agents?
A traditional software application would simply return a list of links via standard search queries, often resulting in irrelevant or low-quality results. **Knowledge Loom uses an intelligent multi-agent system**:
- **Reasoning**: The agents reason about the user's topic to construct specialized queries (e.g., filtering for *educational* videos rather than entertainment).
- **Parallel Execution**: Specialized agents work in parallel to gather data from different domains (Web, YouTube, Academic databases) simultaneously.
- **Synthesis**: An aggregator agent intelligently weaves this disparate data into a cohesive, readable Markdown report, ensuring the final output is a true "study guide" and not just a dump of raw data.

---

## 🛠️ Tools, APIs & Technologies Mentioned

### Frontend Stack
- **React.js & Vite**: For a lightning-fast Single Page Application (SPA).
- **Vanilla CSS**: Clean, modern, and responsive user interface.
- **Vercel**: For seamless, edge-network frontend deployment.

### Backend & AI Stack
- **FastAPI (Python)**: High-performance backend framework for orchestrating the agents.
- **Google Gemini API**: Powers the core reasoning, summarization, and aggregation tasks.
- **Google Search Grounding**: Used by the Overview Agent to ensure up-to-date and factually accurate summaries.
- **YouTube Data API v3**: Used by the Video Agent to dynamically search and fetch educational video resources.
- **OpenAlex API**: Used by the Paper Agent to query the world's largest open catalog of academic papers and researchers.
- **Docker**: Containerizes the complex backend environment.
- **Hugging Face Spaces**: Hosts the Docker container to ensure the long-running AI agents bypass standard serverless timeouts.

---

## 🧠 The Agent Swarm Architecture (Project Flow)

When a user submits a topic on the frontend, the FastAPI backend orchestrator triggers the following workflow:

1. **Safety Gate Agent (LLM)**: Before any heavy processing, this agent inspects the prompt for harmful, inappropriate, or non-educational content. If the prompt fails, the process is safely aborted.
2. **Parallel Swarm Execution**:
   - **Overview Agent**: Uses Gemini grounded with Google Search to gather foundational knowledge and synthesize a structured, text-based summary.
   - **Video Agent**: Uses the YouTube Data API to fetch high-quality, relevant video tutorials.
   - **Paper Agent**: Queries the OpenAlex API to retrieve highly cited, relevant academic research papers for deep-dive learning.
3. **Aggregator Agent**: Takes the disparate JSON outputs of all the parallel agents and acts as an editor. It compiles and formats everything into a unified, beautiful Markdown study guide.
4. **Delivery**: The finalized Markdown is sent back to the React frontend for the user to consume.

---

## 🏆 Kaggle Capstone Evaluation Checklist

- [x] **Agent / Multi-agent system**: Implemented a swarm of specialized agents (Overview, Video, Paper) orchestrated by a central backend to work in parallel.
- [x] **Security features**: Implemented a dedicated "Safety Gate" LLM agent to validate prompts. API keys are strictly managed via environment variables (Vercel/HF Secrets) and never exposed to the client or hardcoded in the codebase.
- [x] **Deployability**: Fully deployed and accessible. The frontend is hosted on Vercel, and the AI backend is containerized via Docker and deployed on Hugging Face Spaces to bypass serverless timeouts.
- [x] **Agent skills**: Agents are equipped with specific skills/APIs (YouTube Data API, OpenAlex API, Web Search) to fetch domain-specific data accurately.

---

## 💻 Setup & Local Development

### 1. Backend Setup
```bash
git clone https://github.com/souvikbasuroy/Knowledge_Loom.git
cd Knowledge_Loom

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Environment Variables setup
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and YOUTUBE_API_KEY

# Start FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --reload --port 8000
```
*(Alternatively, run via Docker: `docker build -t loom-backend .` and `docker run -p 7860:7860 --env-file .env loom-backend`)*

### 2. Frontend Setup
Open a new terminal window:
```bash
cd Knowledge_Loom/frontend
npm install

# Create a .env file in the frontend folder for local backend targeting
echo "VITE_API_URL=http://127.0.0.1:8000" > .env

# Run development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---
I Agents: Intensive Vibe Coding Course Capstone.*
