/**
 * App.jsx — VaaniRakshak Step 6
 * "Play Cloned Sample" plays audio + steps through precomputed score sequence.
 * Score override takes priority over live /analyze polling while clip plays.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import PhoneFrame from './PhoneFrame';
import GaugeCircle from './GaugeCircle';
import { useAudio } from './useAudio';
import { useRiskScore } from './useRiskScore';
import { useClonedSample } from './useClonedSample';
import IndiaMap from './IndiaMap';
import RiskOverTimeChart from './RiskOverTimeChart';
import WaveformComparison from './WaveformComparison';
import ArchitecturePipeline from './ArchitecturePipeline';
import DetectionLanes from './DetectionLanes';
import SystemStatus from './SystemStatus';
import SessionFooter from './SessionFooter';
import { ALERT_THRESHOLD } from './constants';

export const CALL_STATE = {
  IDLE:    'IDLE',
  RINGING: 'RINGING',
  IN_CALL: 'IN_CALL',
  ENDED:   'ENDED',
};

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
  const { riskScore: liveRisk, confidence: liveConf, latency, rollingLatency, pulseActive } = useRiskScore(isInCall);

  // Score override from cloned sample — null = use live
  const [scoreOverride, setScoreOverride] = useState(null);

  // Score history for Step 9 chart
  const [scoreHistory, setScoreHistory] = useState([]);
  const [clonePlayed,  setClonePlayed]  = useState(false);

  const handleScoreOverride = useCallback((v) => setScoreOverride(v), []);
  const handleScoreClear    = useCallback(() => setScoreOverride(null), []);

  const { play: triggerCloned, isPlaying: cloneIsPlaying, cloneAnalyser } = useClonedSample({
    isInCall,
    onScoreOverride: handleScoreOverride,
    onScoreClear:    handleScoreClear,
  });

  const playCloned = () => {
    setClonePlayed(true);
    triggerCloned();
  };

  // Active scores: override wins when clip is playing
  const riskScore  = scoreOverride ? scoreOverride.riskScore  : liveRisk;
  const confidence = scoreOverride ? scoreOverride.confidence : liveConf;

  // Session call tracking for status footer bar
  const [completedCalls, setCompletedCalls] = useState(0);
  const [lastCallTimestamp, setLastCallTimestamp] = useState(null);
  const wasInCallRef = useRef(false);

  useEffect(() => {
    if (callState === CALL_STATE.IN_CALL) {
      wasInCallRef.current = true;
    } else if (wasInCallRef.current && (callState === CALL_STATE.ENDED || callState === CALL_STATE.IDLE)) {
      setCompletedCalls(c => c + 1);
      const now = new Date();
      setLastCallTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      wasInCallRef.current = false;
    }
  }, [callState]);

  // Track risk score over time while in call
  useEffect(() => {
    if (isInCall && riskScore > 0) {
      setScoreHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].t === elapsed) {
          const next = [...prev];
          next[next.length - 1] = { t: elapsed, score: riskScore };
          return next;
        }
        return [...prev, { t: elapsed, score: riskScore }];
      });
    }
  }, [isInCall, elapsed, riskScore]);

  // Band / text fade logic
  const [displayBand, setDisplayBand] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    if (!isInCall) { setDisplayBand(0); setTextVisible(true); return; }
    const newBand = scoreBand(riskScore);
    setDisplayBand(prev => {
      if (newBand === prev) return prev;
      setTextVisible(false);
      setTimeout(() => { setDisplayBand(newBand); setTextVisible(true); }, 300);
      return prev;
    });
  }, [riskScore, isInCall]);

  // Call timer
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
  const reset      = () => {
    setScoreOverride(null);
    setScoreHistory([]);
    setClonePlayed(false);
    setCallState(CALL_STATE.IDLE);
  };

  const statusLabel = {
    [CALL_STATE.IDLE]:    'Idle — no active call',
    [CALL_STATE.RINGING]: 'Ringing…',
    [CALL_STATE.IN_CALL]: cloneIsPlaying ? '🎭 Playing cloned sample…' : 'In call',
    [CALL_STATE.ENDED]:   'Call ended',
  }[callState];

  const showAlert = isInCall && riskScore > ALERT_THRESHOLD;

  return (
    <div className="app-wrapper">
      <header className="brand-bar">
        <div className="brand-logo">
          <div className="logo-icon">🛡️</div>
          <h1>Vaani<span>Rakshak</span></h1>
          <span className="brand-badge">AI DEMO</span>
        </div>
        <nav className="brand-nav">
          <a href="#live-monitor" className="nav-link">Live Call</a>
          <a href="#fraud-map" className="nav-link">Threat Map</a>
          <a href="#architecture" className="nav-link">Architecture</a>
        </nav>
        <span className="brand-meta">SIH 2026 · Problem SIH26104</span>
      </header>

      <section id="live-monitor" className="section">
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
            cloneIsPlaying={cloneIsPlaying}
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
            <p className="phone-demo-caption">
              Simulates an incoming VoIP/telecom call and detects AI-cloned voice impersonation in real time.
            </p>
          </div>

          <RightPanel riskScore={riskScore} confidence={confidence} />
        </div>
      </section>

      {/* ── Section 2 ───────────────────────────────── */}
      <section id="fraud-map" className="section section-2">
        <div className="section-header">
          <h2>Fraud Risk Intelligence</h2>
          <div className="section-divider" />
        </div>

        <div className="s2-grid">
          {/* Left: India map */}
          <div className="s2-map-col">
            <IndiaMap />
          </div>

          {/* Right: Step 9 charts */}
          <div className="s2-charts-col">
            <RiskOverTimeChart history={scoreHistory} isLive={isInCall} />
            <WaveformComparison
              analyser={analyser}
              cloneAnalyser={cloneAnalyser}
              cloneIsPlaying={cloneIsPlaying}
              clonePlayed={clonePlayed}
            />
          </div>
        </div>
      </section>

      {/* ── Section 3: Animated Architecture Pipeline ── */}
      <ArchitecturePipeline
        isInCall={isInCall}
        riskScore={riskScore}
        latency={latency}
        rollingLatency={rollingLatency}
        pulseActive={pulseActive}
        cloneIsPlaying={cloneIsPlaying}
      />

      {/* ── Session Status Footer Bar ───────────────── */}
      <SessionFooter
        callCount={completedCalls}
        lastCallTime={lastCallTimestamp}
      />
    </div>
  );
}

function LeftPanel({ callState, micError, riskScore, displayBand, textVisible, cloneIsPlaying, onStart, onClone, onReset }) {
  const isIdle   = callState === CALL_STATE.IDLE;
  const isInCall = callState === CALL_STATE.IN_CALL;
  const isEnded  = callState === CALL_STATE.ENDED;

  let analysisText;
  if (micError)       analysisText = micError;
  else if (isIdle)    analysisText = 'Waiting for call to start…';
  else if (isEnded)   analysisText = 'Call ended. Analysis complete.';
  else if (!isInCall) analysisText = 'Connecting…';
  else                analysisText = BAND_TEXT[displayBand];

  return (
    <div className="left-panel">
      <span className="panel-label">Controls</span>

      <button className="ctrl-btn start" onClick={onStart} disabled={!isIdle}>📞 Start Call</button>
      <button className={`ctrl-btn clone${cloneIsPlaying ? ' clone-active' : ''}`} onClick={onClone} disabled={!isInCall || cloneIsPlaying}>
        {cloneIsPlaying ? '⏵ Playing…' : '🎭 Play Cloned Sample'}
      </button>
      <button className="ctrl-btn reset" onClick={onReset} disabled={isIdle}>↺ Reset</button>

      <div className="analysis-panel">
        <div className="panel-title">Live Analysis</div>
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

      <DetectionLanes isInCall={isInCall} riskScore={riskScore} />
    </div>
  );
}

function RightPanel({ riskScore, confidence }) {
  return (
    <div className="right-panel">
      <span className="panel-label">Risk Gauges</span>
      <GaugeCircle label="Risk Score"  sublabel="Voice impersonation likelihood" value={riskScore} />
      <GaugeCircle label="Confidence"  sublabel="Model certainty"                value={confidence} />
      <SystemStatus />
    </div>
  );
}
