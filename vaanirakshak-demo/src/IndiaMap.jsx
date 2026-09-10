/**
 * IndiaMap.jsx — Step 8
 * India state-level choropleth shaded by fraud risk index.
 * Live jitter: every 4s each state nudges ±3 back toward its baseline.
 */
import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = '/india-states.json';

// ── Baseline fraud risk per state (0-100) ─────────────────
// Source: I4C / NHRC 2025 cyber-fraud data (approximated)
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

function riskColor(value) {
  if (value >= 75) return '#ef4444';
  if (value >= 60) return '#f97316';
  if (value >= 45) return '#eab308';
  if (value >= 30) return '#84cc16';
  return '#22c55e';
}

export default function IndiaMap() {
  const [scores, setScores] = useState({ ...BASELINE });
  const [tooltip, setTooltip] = useState(null); // { name, value, x, y }

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
    <div className="india-map-wrap">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [80, 22], scale: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name  = geo.properties.st_nm || geo.properties.ST_NM || geo.properties.NAME_1 || geo.properties.name || '';
                const value = scores[name] ?? 30;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={riskColor(value)}
                    stroke="#0a0e14"
                    strokeWidth={0.5}
                    style={{
                      default:  { outline: 'none', opacity: 0.85 },
                      hover:    { outline: 'none', opacity: 1, filter: 'brightness(1.25)' },
                      pressed:  { outline: 'none' },
                    }}
                    onMouseMove={e => handleMove(geo, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <strong>{tooltip.name}</strong>
          <span>Risk Index: {tooltip.value}</span>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        {[
          { color: '#22c55e', label: 'Low (<30)' },
          { color: '#84cc16', label: '30–44' },
          { color: '#eab308', label: '45–59' },
          { color: '#f97316', label: '60–74' },
          { color: '#ef4444', label: 'High (75+)' },
        ].map(({ color, label }) => (
          <div key={label} className="legend-item">
            <div className="legend-swatch" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
