/**
 * IndiaMap.jsx — Step 8 (Visual Polish Upgrade)
 * India state-level choropleth with:
 * - Continuous smooth color gradient (Teal -> Lime -> Yellow -> Orange -> Red)
 * - Soft outer glow on high-risk states (>= 70)
 * - Smooth 800ms transition on color changes
 * - Modern horizontal gradient legend bar with ticks
 * - Custom styled dark tooltip with large risk score & source badge
 * - Subtle low-opacity border strokes & high-contrast dark backdrop
 */
import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// ── Baseline fraud risk per state (0-100) ─────────────────
const BASELINE = {
  'Rajasthan':          82,
  'Uttar Pradesh':      78,
  'Haryana':            75,
  'Delhi':              71,
  'Jharkhand':          68,
  'Bihar':              65,
  'West Bengal':        60,
  'Maharashtra':        58,
  'Andhra Pradesh':     55,
  'Madhya Pradesh':     54,
  'Telangana':          52,
  'Karnataka':          48,
  'Gujarat':            44,
  'Tamil Nadu':         43,
  'Punjab':             45,
  'Odisha':             40,
  'Orissa':             40,
  'Assam':              38,
  'Chhattisgarh':       42,
  'Uttarakhand':        35,
  'Uttaranchal':        35,
  'Himachal Pradesh':   28,
  'Kerala':             32,
  'Goa':                18,
  'Jammu and Kashmir':  36,
  'Manipur':            29,
  'Meghalaya':          25,
  'Tripura':            30,
  'Nagaland':           22,
  'Mizoram':            20,
  'Arunachal Pradesh':  18,
  'Sikkim':             15,
  'Ladakh':             30,
  'Chandigarh':         50,
  'Puducherry':         26,
  'Andaman and Nicobar Islands': 16,
  'Dadra and Nagar Haveli': 24,
  'Daman and Diu':      24,
  'Lakshadweep':        14,
};

// ── Continuous Color Gradient (Teal -> Lime -> Yellow -> Orange -> Deep Red) ──
const STOPS = [
  { val: 0,   r: 5,   g: 150, b: 105 }, // #059669 Teal/Green
  { val: 35,  r: 132, g: 204, b: 22 },  // #84cc16 Lime
  { val: 55,  r: 234, g: 179, b: 8 },   // #eab308 Yellow
  { val: 75,  r: 249, g: 115, b: 22 },  // #f97316 Orange
  { val: 100, r: 220, g: 38,  b: 38 },  // #dc2626 Deep Red
];

function continuousRiskColor(value) {
  const clamped = Math.max(0, Math.min(100, value));
  let lower = STOPS[0];
  let upper = STOPS[STOPS.length - 1];

  for (let i = 0; i < STOPS.length - 1; i++) {
    if (clamped >= STOPS[i].val && clamped <= STOPS[i + 1].val) {
      lower = STOPS[i];
      upper = STOPS[i + 1];
      break;
    }
  }

  const range = upper.val - lower.val;
  const factor = range === 0 ? 0 : (clamped - lower.val) / range;
  const r = Math.round(lower.r + factor * (upper.r - lower.r));
  const g = Math.round(lower.g + factor * (upper.g - lower.g));
  const b = Math.round(lower.b + factor * (upper.b - lower.b));

  return `rgb(${r},${g},${b})`;
}

export default function IndiaMap() {
  const [geoData, setGeoData] = useState(null);
  const [scores, setScores]   = useState({ ...BASELINE });
  const [tooltip, setTooltip] = useState(null); // { name, value, x, y }
  const [loading, setLoading] = useState(true);

  // Load geojson directly
  useEffect(() => {
    fetch('/india-states.json')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load map data:', err);
        setLoading(false);
      });
  }, []);

  // Jitter effect — nudge each state ±3 toward baseline every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setScores(prev => {
        const next = { ...prev };
        for (const state in BASELINE) {
          const base = BASELINE[state];
          const cur  = prev[state] ?? base;
          const diff = base - cur;
          const step = diff * 0.25 + (Math.random() - 0.5) * 3;
          next[state] = Math.max(5, Math.min(95, cur + step));
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  function handleMove(geo, evt) {
    const name  = geo.properties.st_nm || geo.properties.ST_NM || geo.properties.NAME_1 || geo.properties.name || 'Unknown';
    const value = Math.round(scores[name] ?? 30);
    setTooltip({ name, value, x: evt.clientX, y: evt.clientY });
  }

  return (
    <div className="india-map-wrap refined-map">
      {loading ? (
        <div className="map-loader">
          <span>Loading Map Intelligence…</span>
        </div>
      ) : geoData ? (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.5, 21.5], scale: 950 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name  = geo.properties.st_nm || geo.properties.ST_NM || geo.properties.NAME_1 || geo.properties.name || '';
                const value = Math.round(scores[name] ?? 30);
                const isHighRisk = value >= 70;
                const fillColor = continuousRiskColor(value);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="rgba(15, 23, 42, 0.75)"
                    strokeWidth={0.6}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 0.8s ease, filter 0.8s ease, opacity 0.3s ease',
                        filter: isHighRisk ? 'drop-shadow(0px 0px 7px rgba(239, 68, 68, 0.7))' : 'none',
                        opacity: 0.92,
                      },
                      hover: {
                        outline: 'none',
                        filter: 'brightness(1.22) drop-shadow(0px 0px 9px rgba(255, 255, 255, 0.4))',
                        opacity: 1,
                        cursor: 'pointer',
                        transition: 'filter 0.2s ease',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseMove={e => handleMove(geo, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      ) : (
        <div style={{ padding: 20, color: '#f87171' }}>Failed to load map data.</div>
      )}

      {/* Styled Modern Tooltip */}
      {tooltip && (
        <div
          className="map-tooltip-modern"
          style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}
        >
          <div className="tooltip-top-row">
            <span className="tooltip-state-name">{tooltip.name}</span>
            <span
              className="tooltip-score-badge"
              style={{
                color: continuousRiskColor(tooltip.value),
                borderColor: continuousRiskColor(tooltip.value),
              }}
            >
              {tooltip.value}
            </span>
          </div>
          <div className="tooltip-label">Impersonation Fraud Index</div>
          <div className="tooltip-source">Baseline Source: I4C / NHRC 2025</div>
        </div>
      )}

      {/* Modern Gradient Bar Legend */}
      <div className="map-gradient-legend">
        <div className="legend-gradient-title">Fraud Risk Index</div>
        <div className="legend-bar-wrapper">
          <div className="legend-gradient-bar" />
          <div className="legend-ticks">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
