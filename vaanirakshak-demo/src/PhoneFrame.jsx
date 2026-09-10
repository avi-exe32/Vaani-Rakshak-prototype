/**
 * PhoneFrame.jsx — Step 2
 * Renders different screens per call state + ringing animation + in-call timer.
 */
import { CALL_STATE } from './App';

/** Format seconds → mm:ss */
function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

export default function PhoneFrame({ callState, elapsed, onAccept, onDecline }) {
  return (
    <div className="phone-frame">
      <div className="phone-notch" />
      <div className="phone-screen">
        {callState === CALL_STATE.IDLE  && <IdleScreen />}
        {callState === CALL_STATE.RINGING && <RingingScreen onAccept={onAccept} onDecline={onDecline} />}
        {callState === CALL_STATE.IN_CALL && <InCallScreen elapsed={elapsed} onEndCall={onDecline} />}
        {callState === CALL_STATE.ENDED  && <EndedScreen />}
      </div>
      <div className="phone-home-bar" />
    </div>
  );
}

/* ── Idle ──────────────────────────────────────────────── */
function IdleScreen() {
  return (
    <div className="idle-screen">
      <div className="idle-icon">📵</div>
      <p>Press <strong>Start Call</strong><br />to begin monitoring</p>
    </div>
  );
}

/* ── Ringing ───────────────────────────────────────────── */
function RingingScreen({ onAccept, onDecline }) {
  return (
    <div className="incoming-screen">
      <p className="call-status-text">Incoming Call</p>

      <div className="caller-info">
        {/* Pulsing avatar ring */}
        <div className="avatar-pulse-wrapper">
          <div className="avatar-pulse-ring" />
          <div className="caller-avatar">👤</div>
        </div>
        <span className="caller-name">Unknown Caller</span>
        <span className="caller-subtitle">+91 ••••••0000</span>
      </div>

      <div className="call-actions">
        <div className="call-btn-wrap">
          <button className="call-btn decline" title="Decline" onClick={onDecline}>📵</button>
          <span className="call-btn-label">Decline</span>
        </div>
        <div className="call-btn-wrap">
          <button className="call-btn accept" title="Accept" onClick={onAccept}>📞</button>
          <span className="call-btn-label">Accept</span>
        </div>
      </div>
    </div>
  );
}

/* ── In-Call ───────────────────────────────────────────── */
function InCallScreen({ elapsed, onEndCall }) {
  return (
    <div className="incall-screen">
      <p className="call-status-text in-call-label">● On Call</p>

      <div className="caller-info">
        <div className="caller-avatar incall-avatar">👤</div>
        <span className="caller-name">Unknown Caller</span>
        <span className="caller-subtitle">+91 ••••••0000</span>
      </div>

      <div className="call-timer">{formatTime(elapsed)}</div>

      <div className="mic-icon-row">
        <span className="mic-icon">🎙️</span>
        <span className="mic-label">Listening…</span>
      </div>

      {/* End call button */}
      <div className="call-btn-wrap">
        <button className="call-btn decline" title="End Call" onClick={onEndCall}>📵</button>
        <span className="call-btn-label">End Call</span>
      </div>
    </div>
  );
}

/* ── Ended ─────────────────────────────────────────────── */
function EndedScreen() {
  return (
    <div className="idle-screen">
      <div className="idle-icon">📴</div>
      <p>Call ended</p>
    </div>
  );
}
