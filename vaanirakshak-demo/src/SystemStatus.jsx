/**
 * SystemStatus.jsx
 * Compact "System Status" diagnostic panel:
 * - Backend connection: Pings /health endpoint on load & periodically
 * - Model status: Displays "Live model active" (USE_MOCK=false) or "Mock scoring active" (USE_MOCK=true)
 * - Mic permission: Queries navigator.permissions for "microphone" ("Granted" / "Denied" / "Not requested")
 */
import { useState, useEffect } from 'react';

const HEALTH_URL = 'http://localhost:8000/health';

export default function SystemStatus() {
  const [backendState, setBackendState] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [modelMode, setModelMode] = useState(null); // 'mock' | 'model' | null
  const [micPerm, setMicPerm] = useState('checking'); // 'Granted' | 'Denied' | 'Not requested'

  // Backend connection check
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendState('connected');
            setModelMode(data.mode || 'mock');
          }
        } else {
          if (isMounted) setBackendState('disconnected');
        }
      } catch {
        if (isMounted) setBackendState('disconnected');
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Mic permission check
  useEffect(() => {
    let isMounted = true;

    async function checkMicPermission() {
      if (!navigator.permissions || !navigator.permissions.query) {
        if (isMounted) setMicPerm('Not requested');
        return;
      }

      try {
        const status = await navigator.permissions.query({ name: 'microphone' });
        if (!isMounted) return;

        const updateState = (state) => {
          if (state === 'granted') setMicPerm('Granted');
          else if (state === 'denied') setMicPerm('Denied');
          else setMicPerm('Not requested'); // 'prompt'
        };

        updateState(status.state);
        status.onchange = () => {
          if (isMounted) updateState(status.state);
        };
      } catch {
        if (isMounted) setMicPerm('Not requested');
      }
    }

    checkMicPermission();
  }, []);

  return (
    <div className="system-status-card">
      <div className="status-panel-header">
        <span className="panel-label" style={{ marginBottom: 0 }}>System Diagnostics</span>
        <span className={`status-health-pill ${backendState}`}>
          {backendState === 'connected' ? 'ONLINE' : backendState === 'checking' ? 'CHECKING' : 'OFFLINE'}
        </span>
      </div>

      <div className="status-rows">
        {/* Backend Connection */}
        <div className="status-row">
          <div className="status-row-left">
            <span
              className={`status-indicator-dot ${
                backendState === 'connected' ? 'dot-connected' : 'dot-disconnected'
              }`}
            />
            <span className="status-label-text">Backend Link</span>
          </div>
          <span className="status-value-text">
            {backendState === 'connected'
              ? 'Connected (:8000)'
              : backendState === 'checking'
              ? 'Pinging…'
              : 'Disconnected'}
          </span>
        </div>

        {/* Model Status */}
        <div className="status-row">
          <div className="status-row-left">
            <span
              className={`status-indicator-dot ${
                modelMode === 'model'
                  ? 'dot-connected'
                  : backendState === 'connected'
                  ? 'dot-mock'
                  : 'dot-idle'
              }`}
            />
            <span className="status-label-text">Model Engine</span>
          </div>
          <span className="status-value-text">
            {backendState !== 'connected'
              ? 'Unavailable'
              : modelMode === 'model'
              ? 'Live model active'
              : 'Mock scoring active'}
          </span>
        </div>

        {/* Mic Permission */}
        <div className="status-row">
          <div className="status-row-left">
            <span
              className={`status-indicator-dot ${
                micPerm === 'Granted'
                  ? 'dot-connected'
                  : micPerm === 'Denied'
                  ? 'dot-disconnected'
                  : 'dot-prompt'
              }`}
            />
            <span className="status-label-text">Mic Access</span>
          </div>
          <span className="status-value-text">{micPerm}</span>
        </div>
      </div>
    </div>
  );
}
