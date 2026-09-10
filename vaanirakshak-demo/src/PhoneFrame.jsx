/**
 * PhoneFrame.jsx — Step 3
 * In-call screen now includes live waveform driven by real mic analyser.
 */
import { CALL_STATE } from './App';
import Waveform from './Waveform';

function formatTime(s) {
  const m   = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

export default function PhoneFrame({ callState, elapsed, analyser, showAlert, onAccept, onDecline }) {
  return (
    <div className="phone-frame">
      <div className="phone-notch" />
      <div className="phone-screen">
        {callState === CALL_STATE.IDLE    && <IdleScreen />}
        {callState === CALL_STATE.RINGING && <RingingScreen onAccept={onAccept} onDecline={onDecline} />}
        {callState === CALL_STATE.IN_CALL && <InCallScreen elapsed={elapsed} analyser={analyser} showAlert={showAlert} onEndCall={onDecline} />}
        {callState === CALL_STATE.ENDED   && <EndedScreen />}
      </div>
      <div className="phone-home-bar" />
    </div>
  );
}

function IdleScreen() {
  return (
    <div className="idle-screen">
      <div className="idle-icon">📵</div>
      <p>Press <strong>Start Call</strong><br />to begin monitoring</p>
    </div>
  );
}

function RingingScreen({ onAccept, onDecline }) {
  return (
    <div className="incoming-screen">
      <p className="call-status-text">Incoming Call</p>
      <div className="caller-info">
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

function InCallScreen({ elapsed, analyser, showAlert, onEndCall }) {
  return (
    <div className="incall-screen">
      {/* Alert banner */}
      {showAlert && (
        <div className="alert-banner">
          <span>⚠️ Suspicious voice detected — Verify identity?</span>
          <button className="verify-btn" onClick={() => console.log('[VaaniRakshak] send OTP stub')}>
            Send verification code
          </button>
        </div>
      )}

      <p className="call-status-text in-call-label">● On Call</p>

      <div className="caller-info">
        <div className="caller-avatar incall-avatar">👤</div>
        <span className="caller-name">Unknown Caller</span>
        <span className="caller-subtitle">+91 ••••••0000</span>
      </div>

      <div className="call-timer">{formatTime(elapsed)}</div>

      <div className="waveform-container">
        <Waveform analyser={analyser} />
      </div>

      <div className="mic-icon-row">
        <span className="mic-icon">🎙️</span>
        <span className="mic-label">Listening…</span>
      </div>

      <div className="call-btn-wrap">
        <button className="call-btn decline" title="End Call" onClick={onEndCall}>📵</button>
        <span className="call-btn-label">End Call</span>
      </div>
    </div>
  );
}

function EndedScreen() {
  return (
    <div className="idle-screen">
      <div className="idle-icon">📴</div>
      <p>Call ended</p>
    </div>
  );
}
