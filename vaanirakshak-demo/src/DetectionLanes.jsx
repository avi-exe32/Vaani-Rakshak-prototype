/**
 * DetectionLanes.jsx
 * Descriptive info card showing the 3 analysis lanes:
 * - Spectral Analysis (Vocoder artifacts, phase distortion)
 * - Prosody Analysis (Pitch contour, rhythm naturalness)
 * - SSL Embedding (wav2vec2) (Deep acoustic pattern matching)
 *
 * Idle: static descriptive card explaining what signals are analyzed.
 * In Call: shows live activity indicator dots synchronized with call state & risk dynamics.
 */
import React from 'react';

const LANES = [
  {
    id: 'spectral',
    icon: '📊',
    name: 'Spectral Analysis',
    desc: 'Vocoder artifacts, phase distortion',
    weight: 'Weight: 30%',
  },
  {
    id: 'prosody',
    icon: '〰️',
    name: 'Prosody Analysis',
    desc: 'Pitch contour, rhythm naturalness',
    weight: 'Weight: 25%',
  },
  {
    id: 'ssl',
    icon: '🧠',
    name: 'SSL Embedding (wav2vec2)',
    desc: 'Deep acoustic pattern matching',
    weight: 'Weight: 45%',
  },
];

export default function DetectionLanes({ isInCall = false, riskScore = 0 }) {
  return (
    <div className="detection-lanes-card">
      <div className="lanes-header">
        <span className="panel-label" style={{ marginBottom: 0 }}>Detection Lanes</span>
        <span className="lanes-badge">{isInCall ? 'LIVE CHANNELS' : 'SPECIFICATION'}</span>
      </div>

      <p className="lanes-caption">
        Multi-signal extraction analyzing incoming voice stream across three parallel pipelines:
      </p>

      <div className="lanes-list">
        {LANES.map((lane, idx) => {
          const isElevated = isInCall && riskScore > 60;
          return (
            <div key={lane.id} className={`lane-row${isInCall ? ' active' : ''}`}>
              <div className="lane-icon-col">
                <span className="lane-icon">{lane.icon}</span>
                <span
                  className={`lane-dot ${
                    isInCall
                      ? isElevated
                        ? 'dot-elevated'
                        : 'dot-active'
                      : 'dot-idle'
                  }`}
                  style={{ animationDelay: `${idx * 0.25}s` }}
                />
              </div>
              <div className="lane-info">
                <div className="lane-name-row">
                  <span className="lane-name">{lane.name}</span>
                  <span className="lane-weight">{lane.weight}</span>
                </div>
                <div className="lane-desc">{lane.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
