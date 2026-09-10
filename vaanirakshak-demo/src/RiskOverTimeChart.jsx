/**
 * RiskOverTimeChart.jsx — Step 9
 * SVG / Canvas line chart showing risk_score progression over time.
 * Persists data after call ends until Reset is pressed.
 */
import { useMemo } from 'react';
import { ALERT_THRESHOLD } from './constants';

export default function RiskOverTimeChart({ history = [], isLive = false }) {
  const W = 400;
  const H = 160;
  const pad = { top: 20, right: 20, bottom: 25, left: 35 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  // Compute points
  const points = useMemo(() => {
    if (!history || history.length === 0) return [];
    const maxTime = Math.max(history[history.length - 1].t, 10);
    return history.map(d => {
      const x = pad.left + (d.t / maxTime) * innerW;
      const y = pad.top + innerH - (d.score / 100) * innerH;
      return { x, y, score: d.score, t: d.t };
    });
  }, [history, innerW, innerH, pad.left, pad.top]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = pad.top + innerH;
    return `${pathD} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`;
  }, [pathD, points, innerH, pad.top]);

  const thresholdY = pad.top + innerH - (ALERT_THRESHOLD / 100) * innerH;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <span className="chart-title">Risk Score Over Time</span>
          {isLive && <span className="live-pill">LIVE</span>}
        </div>
        <span className="chart-meta">Threshold: {ALERT_THRESHOLD} (Suspicious)</span>
      </div>

      <div className="chart-svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart-svg">
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = pad.top + innerH - (val / 100) * innerH;
            return (
              <g key={val}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* 70 Alert Threshold line */}
          <line
            x1={pad.left}
            y1={thresholdY}
            x2={W - pad.right}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.7"
          />
          <text x={W - pad.right} y={thresholdY - 4} fill="#ef4444" fontSize="8" textAnchor="end" opacity="0.8">Alert ({ALERT_THRESHOLD})</text>

          {/* Fill Area */}
          {areaD && <path d={areaD} fill="url(#riskGradient)" />}

          {/* Line Path */}
          {pathD ? (
            <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <text x={W / 2} y={H / 2 + 5} fill="var(--text-muted)" fontSize="11" textAnchor="middle">
              Waiting for call data…
            </text>
          )}

          {/* Current point */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill={points[points.length - 1].score > ALERT_THRESHOLD ? '#ef4444' : '#22c55e'}
              stroke="#fff"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
