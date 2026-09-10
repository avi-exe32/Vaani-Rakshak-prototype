/**
 * App.jsx — VaaniRakshak Step 2
 * Call state machine: IDLE → RINGING → IN_CALL → ENDED
 */
import { useState, useEffect, useRef } from 'react';
import './App.css';
import PhoneFrame from './PhoneFrame';
import GaugeCircle from './GaugeCircle';

// ── Call states ───────────────────────────────────────────
export const CALL_STATE = {
  IDLE: 'IDLE',
  RINGING: 'RINGING',
  IN_CALL: 'IN_CALL',
  ENDED: 'ENDED',
};

export default function App() {
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [elapsed, setElapsed] = useState(0); // seconds
  const timerRef = useRef(null);

  // Start/stop call timer based on state
  useEffect(() => {
    if (callState === CALL_STATE.IN_CALL) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (callState === CALL_STATE.IDLE || callState === CALL_STATE.ENDED) {
        setElapsed(0);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const startCall  = () => setCallState(CALL_STATE.RINGING);
  const acceptCall = () => setCallState(CALL_STATE.IN_CALL);
  const reset      = () => setCallState(CALL_STATE.IDLE);

  const playCloned = () => {
    if (callState !== CALL_STATE.IN_CALL) return;
    console.log('[VaaniRakshak] playing cloned sample (stub)');
  };

  // Status label below phone
  const statusLabel = {
    [CALL_STATE.IDLE]:    'Idle — no active call',
    [CALL_STATE.RINGING]: 'Ringing…',
    [CALL_STATE.IN_CALL]: 'In call',
    [CALL_STATE.ENDED]:   'Call ended',
  }[callState];

  return (
    <div className="app-wrapper">
      {/* ── Brand bar ───────────────────────────────── */}
      <header className="brand-bar">
        <div className="brand-logo">
          <div className="logo-icon">🛡️</div>
          <h1>Vaani<span>Rakshak</span></h1>
          <span className="brand-badge">AI DEMO</span>
        </div>
        <span className="brand-meta">SIH 2026 · Problem SIH26104</span>
      </header>

      {/* ── Section 1 ───────────────────────────────── */}
      <section className="section">
        <div className="section-header">
          <h2>Live Call Monitor</h2>
          <div className="section-divider" />
        </div>

        <div className="s1-grid">
          {/* Left */}
          <LeftPanel
            callState={callState}
            onStart={startCall}
            onClone={playCloned}
            onReset={reset}
          />

          {/* Center */}
          <div className="center-col">
            <PhoneFrame
              callState={callState}
              elapsed={elapsed}
              onAccept={acceptCall}
              onDecline={reset}
            />
            <div className="call-status-indicator">
              <div className={`status-dot${callState === CALL_STATE.IN_CALL ? ' active' : ''}`} />
              <span>{statusLabel}</span>
            </div>
          </div>

          {/* Right */}
          <RightPanel />
        </div>
      </section>
    </div>
  );
}

/* ── Left panel ──────────────────────────────────────────── */
function LeftPanel({ callState, onStart, onClone, onReset }) {
  const isIdle    = callState === CALL_STATE.IDLE;
  const isInCall  = callState === CALL_STATE.IN_CALL;
  const isEnded   = callState === CALL_STATE.ENDED;

  return (
    <div className="left-panel">
      <span className="panel-label">Controls</span>

      <button
        className="ctrl-btn start"
        onClick={onStart}
        disabled={!isIdle}
      >
        📞 Start Call
      </button>

      <button
        className="ctrl-btn clone"
        onClick={onClone}
        disabled={!isInCall}
      >
        🎭 Play Cloned Sample
      </button>

      <button
        className="ctrl-btn reset"
        onClick={onReset}
        disabled={isIdle}
      >
        ↺ Reset
      </button>

      <div className="analysis-panel">
        <div className="panel-title">Live Analysis</div>
        <p className="analysis-text">
          {isIdle
            ? 'Waiting for call to start…'
            : isInCall
            ? 'Monitoring live audio stream…'
            : isEnded
            ? 'Call ended. Analysis complete.'
            : 'Connecting…'}
        </p>
      </div>
    </div>
  );
}

/* ── Right panel ─────────────────────────────────────────── */
function RightPanel() {
  return (
    <div className="right-panel">
      <span className="panel-label">Risk Gauges</span>
      <GaugeCircle label="Risk Score"  sublabel="Voice impersonation likelihood" value={0} />
      <GaugeCircle label="Confidence"  sublabel="Model certainty"                value={0} />
    </div>
  );
}
