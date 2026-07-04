FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Hugging Face Spaces and Koyeb use port 7860 or 8000. 
# We'll use 7860 as it's the HF default.
ENV PORT=7860
EXPOSE 7860

# Run the FastAPI server
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
