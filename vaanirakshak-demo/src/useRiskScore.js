/**
 * useRiskScore.js — Step 4 & 10
 * Polls POST /analyze every 1.5s while active.
 * Measures LIVE round-trip network & inference latency on each chunk.
 * Computes rolling average latency for defensible technical demonstration.
 */
import { useState, useEffect, useRef } from 'react';
import { POLL_INTERVAL_MS } from './constants';

const API_URL = 'http://localhost:8000/analyze';

export function useRiskScore(active) {
  const [riskScore,      setRiskScore]      = useState(0);
  const [confidence,     setConfidence]     = useState(0);
  const [latency,        setLatency]        = useState(null); // live last RTT in ms
  const [rollingLatency, setRollingLatency] = useState(null); // rolling average of last 5
  const [packetCount,    setPacketCount]    = useState(0);
  const [pulseActive,    setPulseActive]    = useState(false);

  const intervalRef = useRef(null);
  const historyRef  = useRef([]);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      setRiskScore(0);
      setConfidence(0);
      setPulseActive(false);
      return;
    }

    async function poll() {
      const t0 = performance.now();
      setPulseActive(true);

      try {
        const res  = await fetch(API_URL, { method: 'POST', body: new Blob() });
        const data = await res.json();
        const rtt  = performance.now() - t0;

        // Update rolling latency window (last 5)
        historyRef.current.push(rtt);
        if (historyRef.current.length > 5) historyRef.current.shift();
        const avg = historyRef.current.reduce((a, b) => a + b, 0) / historyRef.current.length;

        setRiskScore(data.risk_score);
        setConfidence(data.confidence);
        setLatency(Math.round(rtt));
        setRollingLatency(Math.round(avg));
        setPacketCount(c => c + 1);
      } catch {
        // Backend unreachable — keep last value, don't crash
      } finally {
        setTimeout(() => setPulseActive(false), 600);
      }
    }

    poll(); // immediate first hit
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  return { riskScore, confidence, latency, rollingLatency, packetCount, pulseActive };
}
