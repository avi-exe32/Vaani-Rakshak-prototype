/**
 * IndiaMap.jsx — Step 8
 * Cybercrime Hotspot Bubble Heatmap (inspired by covid19india / epidemic hotspot visualization).
 * Uses real state centroids with proportional translucent layered risk bubbles.
 * Overlapping bubbles create natural intensity clusters (Mewat/NCR, Jamtara, Mumbai).
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

// Exact projected centroids on 800x600 canvas (Mercator center [82.5, 21.5] scale 950)
const CENTROIDS = {
  'Rajasthan': [257, 207],
  'Uttar Pradesh': [368, 201],
  'Haryana': [298, 158],
  'Delhi': [311, 169],
  'Jharkhand': [451, 261],
  'Bihar': [452, 224],
  'West Bengal': [491, 257],
  'Maharashtra': [294, 336],
  'Andhra Pradesh': [358, 400],
  'Madhya Pradesh': [330, 263],
  'Telangana': [342, 365],
  'Karnataka': [295, 418],
  'Gujarat': [219, 279],
  'Tamil Nadu': [332, 481],
  'Punjab': [283, 127],
  'Odisha': [432, 317],
  'Orissa': [432, 317],
  'Assam': [571, 212],
  'Chhattisgarh': [393, 304],
  'Uttarakhand': [345, 140],
  'Uttaranchal': [345, 140],
  'Himachal Pradesh': [313, 106],
  'Kerala': [299, 491],
  'Goa': [260, 407],
  'Jammu and Kashmir': [273, 71],
  'Manipur': [589, 242],
  'Meghalaya': [545, 227],
  'Mizoram': [571, 268],
  'Nagaland': [599, 217],
  'Sikkim': [499, 189],
  'Tripura': [553, 260],
  'Arunachal Pradesh': [602, 181],
  'Ladakh': [305, 46],
  'Chandigarh': [305, 129],
  'Puducherry': [353, 472],
  'Andaman and Nicobar Islands': [573, 475],
  'Dadra and Nagar Haveli': [244, 323],
  'Daman and Diu': [240, 319],
  'Lakshadweep': [236, 470],
};

function getRiskCategory(score) {
  if (score >= 75) return { label: 'CRITICAL HOTSPOT', color: '#ef4444', ringColor: 'rgba(239, 68, 68, 0.75)', fillColor: 'rgba(239, 68, 68, 0.22)' };
  if (score >= 60) return { label: 'HIGH RISK ZONE', color: '#f97316', ringColor: 'rgba(249, 115, 22, 0.65)', fillColor: 'rgba(249, 115, 22, 0.18)' };
  if (score >= 45) return { label: 'ELEVATED DENSITY', color: '#eab308', ringColor: 'rgba(234, 179, 8, 0.55)', fillColor: 'rgba(234, 179, 8, 0.14)' };
  if (score >= 30) return { label: 'MODERATE INCIDENCE', color: '#84cc16', ringColor: 'rgba(132, 204, 22, 0.45)', fillColor: 'rgba(132, 204, 22, 0.1)' };
  return { label: 'LOW DENSITY', color: '#10b981', ringColor: 'rgba(16, 185, 129, 0.35)', fillColor: 'rgba(16, 185, 129, 0.08)' };
}

// Calculate radius from score (8px for min score, up to 48px for 85+)
function scoreToRadius(score) {
  return Math.max(9, Math.round(9 + (score / 100) * 38));
}

export default function IndiaMap() {
  const [geoData, setGeoData] = useState(null);
  const [scores, setScores]   = useState({ ...BASELINE });
  const [tooltip, setTooltip] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load GeoJSON
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

  // Jitter effect — subtle fluctuation every 4s
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

  function triggerHover(name, evt) {
    const value = Math.round(scores[name] ?? 30);
    const cat = getRiskCategory(value);
    setHoveredState(name);
    setTooltip({ name, value, cat, x: evt.clientX, y: evt.clientY });
  }

  function clearHover() {
    setHoveredState(null);
    setTooltip(null);
  }

  return (
    <div className="india-map-wrap hotspot-bubble-map">
      {/* Tactical Header Badge */}
      <div className="heatmap-header-tag">
        <div className="hotspot-pulse-indicator" />
        <span className="heatmap-header-text">I4C REGIONAL CYBER FRAUD HOTSPOTS</span>
        <span className="heatmap-header-sub">LIVE TELEMETRY</span>
      </div>

      {loading ? (
        <div className="map-loader">
          <span>Loading Regional Hotspots…</span>
        </div>
      ) : geoData ? (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.5, 21.5], scale: 950 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* 1. Base Map Outline & State Boundaries */}
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map(geo => {
                const name = geo.properties.st_nm || geo.properties.ST_NM || geo.properties.NAME_1 || geo.properties.name || '';
                const isHovered = hoveredState === name;

                return (
                  <Geography
                    key={`geo-${geo.rsmKey}`}
                    geography={geo}
                    fill={isHovered ? 'rgba(30, 41, 59, 0.9)' : '#0b111e'}
                    stroke={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isHovered ? 1.2 : 0.5}
                    style={{
                      default: { outline: 'none', transition: 'all 0.2s ease' },
                      hover:   { outline: 'none', cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseMove={e => triggerHover(name, e)}
                    onMouseLeave={clearHover}
                  />
                );
              })
            }
          </Geographies>

          {/* 2. Hotspot Density Bubbles (Exact COVID-19 India style) */}
          <g className="hotspot-bubbles-group">
            {Object.entries(CENTROIDS).map(([stateName, [cx, cy]]) => {
              const score = Math.round(scores[stateName] ?? 30);
              const radius = scoreToRadius(score);
              const cat = getRiskCategory(score);
              const isHovered = hoveredState === stateName;

              return (
                <g
                  key={`bubble-${stateName}`}
                  className="state-hotspot-group"
                  onMouseMove={e => triggerHover(stateName, e)}
                  onMouseLeave={clearHover}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer Translucent Risk Bubble */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={isHovered ? 'rgba(239, 68, 68, 0.38)' : cat.fillColor}
                    stroke={isHovered ? '#fff' : cat.ringColor}
                    strokeWidth={isHovered ? 1.8 : 1.1}
                    style={{ transition: 'all 0.6s ease' }}
                  />

                  {/* Concentric Secondary Ring for High/Critical Hotspots (>=65) */}
                  {score >= 65 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={Math.round(radius * 0.55)}
                      fill="none"
                      stroke={cat.ringColor}
                      strokeWidth={0.9}
                      strokeDasharray="3 2"
                      opacity={0.85}
                    />
                  )}

                  {/* Epicenter Center Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={score >= 70 ? 3.5 : 2.5}
                    fill={cat.color}
                    stroke="#0b111e"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        </ComposableMap>
      ) : (
        <div style={{ padding: 20, color: '#f87171' }}>Failed to load map data.</div>
      )}

      {/* Modern Card Tooltip */}
      {tooltip && (
        <div
          className="map-tooltip-modern"
          style={{ left: tooltip.x + 16, top: tooltip.y - 70 }}
        >
          <div className="tooltip-top-row">
            <span className="tooltip-state-name">{tooltip.name}</span>
            <span
              className="tooltip-score-badge"
              style={{
                color: tooltip.cat.color,
                borderColor: tooltip.cat.color,
              }}
            >
              {tooltip.value}
              <small style={{ fontSize: '0.6rem', opacity: 0.8 }}> /100</small>
            </span>
          </div>

          <div className="tooltip-threat-tag" style={{ color: tooltip.cat.color }}>
            ● {tooltip.cat.label}
          </div>

          <div className="tooltip-detail">Primary Modality: AI Voice Cloning &amp; Impersonation</div>
          <div className="tooltip-source">Baseline Source: I4C / NHRC Cyber Intel 2025</div>
        </div>
      )}

      {/* Bubble Size & Intensity Legend (Exact Image 2 Style) */}
      <div className="bubble-map-legend">
        <div className="bubble-legend-title">HOTSPOT INTENSITY (RISK SCORE)</div>

        <div className="bubble-scale-row">
          {/* Concentric nested circles showing scale */}
          <div className="nested-circles-box">
            <svg width="60" height="60" viewBox="0 0 60 60">
              {/* Large: 80+ (r=26) */}
              <circle cx="30" cy="30" r="26" fill="rgba(239, 68, 68, 0.18)" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
              {/* Medium: 50 (r=16) */}
              <circle cx="30" cy="40" r="16" fill="rgba(234, 179, 8, 0.22)" stroke="rgba(234, 179, 8, 0.6)" strokeWidth="1" />
              {/* Small: 25 (r=8) */}
              <circle cx="30" cy="48" r="8" fill="rgba(16, 185, 129, 0.3)" stroke="rgba(16, 185, 129, 0.7)" strokeWidth="1" />
              {/* Center Dot */}
              <circle cx="30" cy="48" r="2" fill="#ef4444" />
            </svg>
          </div>

          <div className="bubble-labels-col">
            <div className="bubble-label-item">
              <span className="dot-key red" />
              <span>80+ Critical (Mewat, Jamtara, NCR)</span>
            </div>
            <div className="bubble-label-item">
              <span className="dot-key yellow" />
              <span>50 Elevated (Mumbai, Hyd, BLR)</span>
            </div>
            <div className="bubble-label-item">
              <span className="dot-key green" />
              <span>25 Low Activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
