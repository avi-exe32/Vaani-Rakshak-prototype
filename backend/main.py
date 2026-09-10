"""
main.py — VaaniRakshak Step 4
Mock FastAPI backend with POST /analyze
Returns slowly-drifting random-walk risk_score + confidence.
Response shape is FIXED — Step 7 will swap the logic, not the API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random, math

app = FastAPI(title="VaaniRakshak API")

# Allow the Vite dev server (and any localhost port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mock state: random-walk starting near 15 ──────────────
_mock_state = {"risk": 15.0, "conf": 60.0}

class AnalyzeResponse(BaseModel):
    risk_score: int
    confidence: int

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(_: bytes = b""):
    """
    Accepts any POST body (audio chunk placeholder).
    Returns a slowly-drifting random-walk score.
    """
    s = _mock_state

    # Random walk: step ±4, clamp to [5, 95]
    s["risk"] += random.uniform(-4, 4)
    s["risk"]  = max(5.0, min(95.0, s["risk"]))

    # Confidence drifts around 70 ±10
    s["conf"] += random.uniform(-3, 3)
    s["conf"]  = max(50.0, min(95.0, s["conf"]))

    return AnalyzeResponse(
        risk_score=round(s["risk"]),
        confidence=round(s["conf"]),
    )

@app.get("/health")
async def health():
    return {"status": "ok"}
