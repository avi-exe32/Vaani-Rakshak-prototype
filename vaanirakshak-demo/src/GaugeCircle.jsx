/**
 * GaugeCircle.jsx — circular gauge display for Risk Score / Confidence
 * Step 1: static, always shows value=0 with green fill.
 */

const CIRCUMFERENCE = 295; // ~2π × 47 (radius of the SVG arc)

/** Maps a 0-100 value to a stroke-dashoffset (295 = empty, 0 = full) */
function valueToOffset(value) {
  return CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
}

/** Returns accent colour based on score (Step 1: always green) */
function scoreColor(value) {
  if (value > 70) return '#ef4444';
  if (value > 40) return '#eab308';
  return '#22c55e';
}

export default function GaugeCircle({ label, sublabel, value = 0 }) {
  const offset = valueToOffset(value);
  const color = scoreColor(value);

  return (
    <div className="gauge-card">
      <div className="gauge-circle-wrap">
        <svg viewBox="0 0 110 110">
          <circle
            className="gauge-bg"
            cx="55" cy="55" r="47"
          />
          <circle
            className="gauge-fill"
            cx="55" cy="55" r="47"
            style={{
              stroke: color,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="gauge-value">
          <span className="gauge-number">{value}</span>
          <span className="gauge-unit">/ 100</span>
        </div>
      </div>
      <span className="gauge-label">{label}</span>
      {sublabel && <span className="gauge-sublabel">{sublabel}</span>}
    </div>
  );
}
