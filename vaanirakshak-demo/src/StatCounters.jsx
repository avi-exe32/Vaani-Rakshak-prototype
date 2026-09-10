/**
 * StatCounters.jsx — Step 11
 * Animated count-up stat cards triggered when scrolled into view via IntersectionObserver.
 * Only plays once per page load. Uses 4 real cited figures (no fake live numbers).
 */
import { useState, useEffect, useRef } from 'react';

const STATS_DATA = [
  {
    id: 'losses-2025',
    target: 22495,
    prefix: '₹',
    suffix: ' Cr',
    label: 'Cyber fraud losses in India',
    sublabel: 'Calendar Year 2025',
    citation: 'Source: I4C / Ministry of Home Affairs 2025',
  },
  {
    id: 'losses-cumulative',
    target: 52976,
    prefix: '₹',
    suffix: ' Cr',
    label: 'Cumulative national fraud losses',
    sublabel: '6-Year Aggregate (2019–2025)',
    citation: 'Source: Parliamentary Standing Committee Report',
  },
  {
    id: 'growth-vishing',
    target: 442,
    prefix: '+',
    suffix: '%',
    label: 'Surge in voice phishing & deepfakes',
    sublabel: 'H2 2024 vs H1 2024',
    citation: 'Source: Cloudflare Threat Intelligence Report',
  },
  {
    id: 'victim-loss-rate',
    target: 83,
    prefix: '',
    suffix: '%',
    label: 'Victims suffering direct financial loss',
    sublabel: 'Among Indian AI voice scam targets',
    citation: 'Source: McAfee "Mind the Fake" India Survey',
  },
];

export default function StatCounters() {
  const containerRef = useRef(null);
  const [counts, setCounts] = useState(STATS_DATA.map(() => 0));
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          observer.disconnect(); // Only play once per page load

          const duration = 1800; // 1.8s
          const startTime = performance.now();

          function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease-out cubic curve
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts(
              STATS_DATA.map(stat => Math.round(stat.target * easeOut))
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasTriggered]);

  return (
    <div ref={containerRef} className="stat-counters-container">
      <div className="stat-counters-header">
        <div className="stat-header-tag">NATIONAL THREAT METRICS</div>
        <span className="stat-header-sub">Documented Impact on Indian Digital Infrastructure</span>
      </div>

      <div className="stat-cards-grid">
        {STATS_DATA.map((stat, idx) => {
          const currentVal = counts[idx];
          const formattedVal = `${stat.prefix}${currentVal.toLocaleString()}${stat.suffix}`;

          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-number">{formattedVal}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sublabel">{stat.sublabel}</div>
              <div className="stat-citation">{stat.citation}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
