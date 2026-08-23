# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import numpy as np

from sentence_transformers import SentenceTransformer

APP_NAME = "Clay AI Python Brain"

# ---------- Load data ----------
# Put all your Q/A into qa.json (explained below)
with open("qa.json", "r", encoding="utf-8") as f:
    QA = json.load(f)

questions = [x["q"] for x in QA]
answers = [x["a"] for x in QA]

# ---------- Load embedding model ----------
# Good balance of quality + size
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Precompute embeddings at startup (fast at runtime)
Q_EMB = model.encode(questions, normalize_embeddings=True)

# ---------- FastAPI ----------
app = FastAPI(title=APP_NAME)

# Allow requests from your GitHub Pages domain (change to your real domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://backlesshub-max.github.io",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskBody(BaseModel):
    question: str

@app.get("/")
def root():
    return {"status": "ok", "name": APP_NAME, "qa_count": len(QA)}

@app.post("/ask")
def ask(body: AskBody):
    user_q = (body.question or "").strip()
    if not user_q:
        return {"answer": "Please type a question.", "match": None, "score": 0, "suggestions": []}

    u = model.encode([user_q], normalize_embeddings=True)[0]
    scores = np.dot(Q_EMB, u)  # cosine similarity because normalized
    best_idx = int(np.argmax(scores))
    best_score = float(scores[best_idx])

    # Suggestions: top 3 questions
    top_idx = np.argsort(scores)[::-1][:3]
    suggestions = [questions[int(i)] for i in top_idx]

    # Threshold: if too low, show suggestions
    if best_score < 0.45:
        return {
            "answer": "I don't have an exact match for that. Try one of these:\n- " + "\n- ".join(suggestions),
            "match": None,
            "score": best_score,
            "suggestions": suggestions,
        }

    return {
        "answer": answers[best_idx],
        "match": questions[best_idx],
        "score": best_score,
        "suggestions": suggestions,
    }
