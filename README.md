# Knowledge Loom 🎓

A multi-agent research assistant that turns any topic into a study guide with:
- AI-generated structured overview
- Recommended YouTube videos
- Expanded research paper suggestions from OpenAlex

## Architecture

Knowledge Loom is built with a separated frontend and backend architecture:

1. **Frontend**: React + Vite SPA, styled with vanilla CSS.
2. **Backend**: FastAPI (Python), orchestrating multiple specialized agents.

### The Agents
- **Overview Agent**: Gemini + Google Search grounding for topic summarization.
- **Video Agent**: YouTube Data API for relevant educational videos.
- **Paper Agent**: OpenAlex API for highly cited research papers.
- **Aggregator Agent**: Gemini for merging data into a clean Markdown report.
- **Safety Gate**: LLM-based check to prevent generation of harmful content.

## Deployment 🚀 (100% Free, No Credit Card Required)

Vercel is used for the frontend, but Vercel cannot run the backend because Vercel Serverless Functions have a strict 10-second timeout on the free tier (the AI agents take longer than this). 

Instead, we use a **Docker** container to host the backend on a platform that does not require a credit card.

### 1. Backend (Hugging Face Spaces - Recommended)
Hugging Face Spaces provides free hosting for Docker containers and is perfect for AI agents. They will **never** ask for a credit card.

1. Create a free account on [Hugging Face](https://huggingface.co).
2. Go to **Spaces** and click **Create new Space**.
3. Name your space (e.g. `knowledge-loom-backend`).
4. Select **Docker** as the Space SDK, and choose **Blank** template.
5. Under "Space Hardware", keep the free "CPU basic".
6. Click **Create Space**.
7. Connect your space to this GitHub repository, or just upload the project files (including the `Dockerfile`).
8. Go to your Space **Settings** -> **Variables and secrets**. Add your API keys as Secrets:
   - `GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
9. Once the container builds, click the **three dots** in the top right -> **Embed this Space** -> Look for the Direct URL (it looks like `https://username-knowledge-loom-backend.hf.space`). Copy this URL.

*(Alternative: Koyeb is another great free Docker host that doesn't require a credit card).*

### 2. Frontend (Vercel)
The `frontend` directory contains a `vercel.json` file to make deployment seamless.

1. Create a free account on [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import this GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. The Framework Preset will automatically be detected as **Vite**.
6. Open the **Environment Variables** section and add:
   - Key: `VITE_API_URL`
   - Value: `https://username-knowledge-loom-backend.hf.space` (Your URL from step 1)
7. Click **Deploy**.

## Local Development

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/souvikbasuroy/Knowledge_Loom.git
cd Knowledge_Loom

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Edit .env and add your real API keys

# Start the FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --reload --port 8000
```
*(Alternatively, you can run the backend via Docker: `docker build -t loom-backend .` and `docker run -p 7860:7860 --env-file .env loom-backend`)*

### Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
