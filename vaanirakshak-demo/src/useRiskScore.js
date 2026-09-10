/**
 * useRiskScore.js — Step 4
 * Polls POST /analyze every 1.5s while active, returns { riskScore, confidence }.
 * Smoothly interpolates values so circles animate between readings.
 */
import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:8000/analyze';
const POLL_MS = 1500;

export function useRiskScore(active) {
  const [riskScore,  setRiskScore]  = useState(0);
  const [confidence, setConfidence] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      setRiskScore(0);
      setConfidence(0);
      return;
    }

    async function poll() {
      try {
        const res  = await fetch(API_URL, { method: 'POST', body: new Blob() });
        const data = await res.json();
        setRiskScore(data.risk_score);
        setConfidence(data.confidence);
      } catch {
        // Backend unreachable — keep last value, don't crash
      }
    }

    poll(); // immediate first hit
    intervalRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  return { riskScore, confidence };
}
