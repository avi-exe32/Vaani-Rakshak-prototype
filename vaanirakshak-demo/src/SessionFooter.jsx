/**
 * SessionFooter.jsx
 * Bottom status footer bar spanning full width:
 * - "No calls run yet this session" before any call has run
 * - "Calls analyzed this session: N" once calls have run, with last updated timestamp
 * - Real and honest tracking based on actual state transitions
 */
export default function SessionFooter({ callCount = 0, lastCallTime = null }) {
  return (
    <footer className="session-footer-bar">
      <div className="session-footer-content">
        <div className="session-footer-left">
          <span className="session-pip" />
          <span className="session-status-text">
            {callCount === 0 ? (
              'No calls run yet this session'
            ) : (
              <>
                Calls analyzed this session: <strong>{callCount}</strong>
              </>
            )}
          </span>
        </div>

        <div className="session-footer-right">
          {lastCallTime ? (
            <span className="session-time-text">
              Last analyzed: <span>{lastCallTime}</span>
            </span>
          ) : (
            <span className="session-time-text idle">System ready — awaiting first call stream</span>
          )}
          <span className="session-divider-dot">•</span>
          <span className="session-mode-badge">TELECOM SEC v2.4</span>
        </div>
      </div>
    </footer>
  );
}
