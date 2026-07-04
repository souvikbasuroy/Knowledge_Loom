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

## Deployment 🚀

The project is structured to easily deploy the **Frontend on Vercel** and the **Backend on Render**.

### 1. Backend (Render.com)
The root directory contains a `render.yaml` Blueprint for easy deployment on Render.

1. Create a free account on [Render](https://render.com).
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Connect this GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. In the Render Dashboard, go to your new Web Service's **Environment** tab and add your real API keys:
   - `GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
6. Once deployed, copy your Render Web Service URL (e.g., `https://knowledge-loom-backend.onrender.com`).

### 2. Frontend (Vercel)
The `frontend` directory contains a `vercel.json` file.

1. Create a free account on [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import this GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. The Framework Preset will automatically be detected as **Vite**.
6. Open the **Environment Variables** section and add:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com` (from step 1)
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

### Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Limitations

- The system follows a fixed pipeline instead of autonomous planning.
- Output quality depends on the Gemini API, YouTube API, and OpenAlex API.
- The report should be reviewed by a human before using it for academic or professional decisions.
- Free tier API limits on Gemini and YouTube might result in temporary timeouts.
