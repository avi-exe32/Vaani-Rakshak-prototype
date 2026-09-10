/**
 * App.jsx — VaaniRakshak Step 5
 * Analysis text panel reacts to risk bands. Alert banner at score > 70.
 */
import { useState, useEffect, useRef } from 'react';
import './App.css';
import PhoneFrame from './PhoneFrame';
import GaugeCircle from './GaugeCircle';
import { useAudio } from './useAudio';
import { useRiskScore } from './useRiskScore';

export const CALL_STATE = {
  IDLE:    'IDLE',
  RINGING: 'RINGING',
  IN_CALL: 'IN_CALL',
  ENDED:   'ENDED',
};

// ── Score → band helpers ───────────────────────────────────
function scoreBand(s) {
  if (s > 85) return 3;
  if (s > 60) return 2;
  if (s > 30) return 1;
  return 0;
}

const BAND_TEXT = [
  'Voice patterns consistent with natural human speech.',
  'Minor irregularities detected in speech pattern. Continuing analysis…',
  'Spectral smoothing and unnatural prosody detected. Risk elevated.',
  'High-confidence synthetic voice signature detected.',
];

export default function App() {
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [elapsed,   setElapsed]   = useState(0);
  const timerRef = useRef(null);

  const isInCall = callState === CALL_STATE.IN_CALL;
  const { analyser, micError }    = useAudio(isInCall);
  const { riskScore, confidence } = useRiskScore(isInCall);

  // Track which band we're in so text only changes on band crossing
  const [displayBand, setDisplayBand] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    if (!isInCall) { setDisplayBand(0); setTextVisible(true); return; }
    const newBand = scoreBand(riskScore);
    if (newBand !== displayBand) {
      // Fade out → update → fade in
      setTextVisible(false);
      const t = setTimeout(() => {
        setDisplayBand(newBand);
        setTextVisible(true);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [riskScore, isInCall]);

  useEffect(() => {
    if (callState === CALL_STATE.IN_CALL) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (callState === CALL_STATE.IDLE || callState === CALL_STATE.ENDED) setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const startCall  = () => setCallState(CALL_STATE.RINGING);
  const acceptCall = () => setCallState(CALL_STATE.IN_CALL);
  const reset      = () => setCallState(CALL_STATE.IDLE);
  const playCloned = () => { if (!isInCall) return; console.log('[VaaniRakshak] playing cloned sample (stub)'); };

  const statusLabel = {
    [CALL_STATE.IDLE]:    'Idle — no active call',
    [CALL_STATE.RINGING]: 'Ringing…',
    [CALL_STATE.IN_CALL]: 'In call',
    [CALL_STATE.ENDED]:   'Call ended',
  }[callState];

  const showAlert = isInCall && riskScore > 70;

  return (
    <div className="app-wrapper">
      <header className="brand-bar">
        <div className="brand-logo">
          <div className="logo-icon">🛡️</div>
          <h1>Vaani<span>Rakshak</span></h1>
          <span className="brand-badge">AI DEMO</span>
        </div>
        <span className="brand-meta">SIH 2026 · Problem SIH26104</span>
      </header>

      <section className="section">
        <div className="section-header">
          <h2>Live Call Monitor</h2>
          <div className="section-divider" />
        </div>

        <div className="s1-grid">
          <LeftPanel
            callState={callState}
            micError={micError}
            riskScore={riskScore}
            displayBand={displayBand}
            textVisible={textVisible}
            onStart={startCall}
            onClone={playCloned}
            onReset={reset}
          />

          <div className="center-col">
            <PhoneFrame
              callState={callState}
              elapsed={elapsed}
              analyser={analyser}
              showAlert={showAlert}
              onAccept={acceptCall}
              onDecline={reset}
            />
            <div className="call-status-indicator">
              <div className={`status-dot${isInCall ? ' active' : ''}`} />
              <span>{statusLabel}</span>
            </div>
          </div>

          <RightPanel riskScore={riskScore} confidence={confidence} />
        </div>
      </section>
    </div>
  );
}

/* ── Left panel ──────────────────────────────────────────── */
function LeftPanel({ callState, micError, riskScore, displayBand, textVisible, onStart, onClone, onReset }) {
  const isIdle   = callState === CALL_STATE.IDLE;
  const isInCall = callState === CALL_STATE.IN_CALL;
  const isEnded  = callState === CALL_STATE.ENDED;

  let analysisText;
  if (micError)        analysisText = micError;
  else if (isIdle)     analysisText = 'Waiting for call to start…';
  else if (isEnded)    analysisText = 'Call ended. Analysis complete.';
  else if (!isInCall)  analysisText = 'Connecting…';
  else                 analysisText = BAND_TEXT[displayBand];

  return (
    <div className="left-panel">
      <span className="panel-label">Controls</span>

      <button className="ctrl-btn start" onClick={onStart} disabled={!isIdle}>📞 Start Call</button>
      <button className="ctrl-btn clone" onClick={onClone} disabled={!isInCall}>🎭 Play Cloned Sample</button>
      <button className="ctrl-btn reset" onClick={onReset} disabled={isIdle}>↺ Reset</button>

      <div className="analysis-panel">
        <div className="panel-title">Live Analysis</div>
        {/* Band indicator dots */}
        {isInCall && (
          <div className="band-dots">
            {BAND_TEXT.map((_, i) => (
              <div key={i} className={`band-dot band-dot-${i}${displayBand >= i ? ' active' : ''}`} />
            ))}
          </div>
        )}
        <p className={`analysis-text${micError ? ' mic-error' : ''}${isInCall ? (textVisible ? ' text-visible' : ' text-hidden') : ''}`}>
          {analysisText}
        </p>
        {isInCall && riskScore > 0 && (
          <div className={`score-badge score-badge-${scoreBand(riskScore)}`}>
            Score: {riskScore}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Right panel ─────────────────────────────────────────── */
function RightPanel({ riskScore, confidence }) {
  return (
    <div className="right-panel">
      <span className="panel-label">Risk Gauges</span>
      <GaugeCircle label="Risk Score"  sublabel="Voice impersonation likelihood" value={riskScore} />
      <GaugeCircle label="Confidence"  sublabel="Model certainty"                value={confidence} />
    </div>
  );
}
