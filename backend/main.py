"""
main.py — VaaniRakshak Step 7
Real wav2vec2 inference pipeline behind USE_MOCK env flag.

USE_MOCK=true  (default) → random-walk mock scores (Step 4 behaviour, instant)
USE_MOCK=false            → wav2vec2-base feature extractor + 2-class classifier head
                            (placeholder random weights until you supply trained ones)

To switch:
  Windows CMD:  set USE_MOCK=false && uvicorn main:app --reload
  PowerShell:   $env:USE_MOCK="false"; uvicorn main:app --reload
"""

import os, io, random, logging
import numpy as np
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("vaanirakshak")

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"
log.info(f"USE_MOCK = {USE_MOCK}")

app = FastAPI(title="VaaniRakshak API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model (only when USE_MOCK=false) ─────────────────
_model_bundle = None

def get_model():
    global _model_bundle
    if _model_bundle is not None:
        return _model_bundle

    log.info("Loading wav2vec2-base feature extractor…")
    import torch
    import torch.nn as nn
    from transformers import Wav2Vec2Model, Wav2Vec2FeatureExtractor

    MODEL_ID = "facebook/wav2vec2-base"
    extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_ID)
    wav2vec2  = Wav2Vec2Model.from_pretrained(MODEL_ID)
    wav2vec2.eval()

    # ── Classifier head ────────────────────────────────────
    # Input: mean-pooled hidden states → 768-dim
    # Output: [human_logit, synthetic_logit]
    # Replace this with your trained state_dict via load_weights()
    class CloneClassifier(nn.Module):
        def __init__(self):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(768, 256),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(256, 2),
            )
        def forward(self, x):
            return self.net(x)

    classifier = CloneClassifier()

    # Load trained weights if a file is present
    weights_path = os.getenv("CLASSIFIER_WEIGHTS", "classifier_weights.pt")
    if os.path.exists(weights_path):
        classifier.load_state_dict(torch.load(weights_path, map_location="cpu"))
        log.info(f"Loaded classifier weights from {weights_path}")
    else:
        log.warning("No classifier_weights.pt found — using random (untrained) weights.")
        log.warning("Scores will be meaningless until you supply trained weights.")

    classifier.eval()

    _model_bundle = {
        "extractor":  extractor,
        "wav2vec2":   wav2vec2,
        "classifier": classifier,
        "torch":      torch,
    }
    log.info("Model loaded ✓")
    return _model_bundle


# ── Mock state ────────────────────────────────────────────
_mock_state = {"risk": 15.0, "conf": 60.0}


class AnalyzeResponse(BaseModel):
    risk_score: int
    confidence: int
    mode: str   # "mock" or "model" — useful for debugging


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: Request):
    if USE_MOCK:
        return _mock_analyze()

    # Real inference path
    raw_bytes = await request.body()
    return _model_analyze(raw_bytes)


def _mock_analyze() -> AnalyzeResponse:
    s = _mock_state
    s["risk"] += random.uniform(-4, 4)
    s["risk"]  = max(5.0, min(95.0, s["risk"]))
    s["conf"] += random.uniform(-3, 3)
    s["conf"]  = max(50.0, min(95.0, s["conf"]))
    return AnalyzeResponse(risk_score=round(s["risk"]), confidence=round(s["conf"]), mode="mock")


def _model_analyze(audio_bytes: bytes) -> AnalyzeResponse:
    """
    Accepts raw PCM float32 bytes (16 kHz, mono) from the frontend.
    Returns risk_score (0-100) and confidence (0-100).
    """
    bundle = get_model()
    torch      = bundle["torch"]
    extractor  = bundle["extractor"]
    wav2vec2   = bundle["wav2vec2"]
    classifier = bundle["classifier"]

    # ── Decode audio bytes → float32 waveform ─────────────
    if len(audio_bytes) < 64:
        # No meaningful audio yet — return low-risk default
        return AnalyzeResponse(risk_score=10, confidence=55, mode="model")

    try:
        audio_np = np.frombuffer(audio_bytes, dtype=np.float32)
    except Exception:
        return AnalyzeResponse(risk_score=10, confidence=55, mode="model")

    # ── wav2vec2 feature extraction ───────────────────────
    with torch.no_grad():
        inputs = extractor(
            audio_np,
            sampling_rate=16000,
            return_tensors="pt",
            padding=True,
        )
        hidden = wav2vec2(**inputs).last_hidden_state  # (1, T, 768)
        pooled = hidden.mean(dim=1)                    # (1, 768)
        logits = classifier(pooled)                    # (1, 2)
        probs  = torch.softmax(logits, dim=-1)         # (1, 2)

    synthetic_prob = probs[0, 1].item()   # probability of being synthetic
    human_prob     = probs[0, 0].item()

    risk_score  = round(synthetic_prob * 100)
    confidence  = round(max(synthetic_prob, human_prob) * 100)

    return AnalyzeResponse(risk_score=risk_score, confidence=confidence, mode="model")


@app.get("/health")
async def health():
    return {"status": "ok", "mode": "mock" if USE_MOCK else "model"}
