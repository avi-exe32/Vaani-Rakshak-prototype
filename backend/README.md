# VaaniRakshak Backend

## Run (mock mode — default, no model needed)
```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Run (real model mode)
```powershell
$env:USE_MOCK="false"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Switching to real classifier weights
1. Train your classifier (see training script)
2. Save: `torch.save(model.state_dict(), "classifier_weights.pt")`
3. Drop `classifier_weights.pt` in this `backend/` folder
4. Set `USE_MOCK=false` and restart

The frontend API contract (`{ risk_score, confidence }`) never changes —
the frontend needs zero changes when you flip between modes.

## Audio format expected by model (USE_MOCK=false)
- Raw PCM float32 bytes
- 16 kHz, mono
- 1.5s chunks (sent every poll interval from frontend)
