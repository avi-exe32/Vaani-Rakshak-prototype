/**
 * WaveformComparison.jsx — Step 9 (Spectrogram Upgrade)
 * Renders real scrolling spectrograms for both the live microphone stream
 * and the synthetic cloned voice sample using getByteFrequencyData().
 */
import { useEffect, useRef } from 'react';

// ── Perceptual Colormap LUT (Inferno / Viridis inspired) ────
const COLOR_LUT = new Array(256);
(function initLUT() {
  const STOPS = [
    { pos: 0,   r: 8,   g: 12,  b: 20 },  // Deep dark navy
    { pos: 35,  r: 49,  g: 46,  b: 129 }, // Indigo
    { pos: 80,  r: 14,  g: 165, b: 233 }, // Cyan
    { pos: 130, r: 16,  g: 185, b: 129 }, // Emerald green
    { pos: 180, r: 234, g: 179, b: 8 },   // Amber yellow
    { pos: 220, r: 249, g: 115, b: 22 },  // Orange
    { pos: 255, r: 239, g: 68,  b: 68 },  // Red peak
  ];

  for (let i = 0; i < 256; i++) {
    let lower = STOPS[0];
    let upper = STOPS[STOPS.length - 1];
    for (let s = 0; s < STOPS.length - 1; s++) {
      if (i >= STOPS[s].pos && i <= STOPS[s + 1].pos) {
        lower = STOPS[s];
        upper = STOPS[s + 1];
        break;
      }
    }
    const range = upper.pos - lower.pos;
    const factor = range === 0 ? 0 : (i - lower.pos) / range;
    const r = Math.round(lower.r + factor * (upper.r - lower.r));
    const g = Math.round(lower.g + factor * (upper.g - lower.g));
    const b = Math.round(lower.b + factor * (upper.b - lower.b));
    COLOR_LUT[i] = `rgb(${r},${g},${b})`;
  }
})();

function SpectrogramTrack({ analyser, isActive = true, preserveOnStop = false, placeholderText = '' }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const dataRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width;
    const H = canvas.height;

    // If analyser not present and we shouldn't preserve previous image
    if (!analyser) {
      if (!preserveOnStop) {
        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, W, H);
      }
      return;
    }

    const binCount = analyser.frequencyBinCount; // e.g. 128 bins
    if (!dataRef.current || dataRef.current.length !== binCount) {
      dataRef.current = new Uint8Array(binCount);
    }
    const freqData = dataRef.current;

    // Use lower ~70% of frequency spectrum where vocal formants reside
    const usableBins = Math.floor(binCount * 0.7);

    function step() {
      if (!isActive && preserveOnStop) {
        // Keep the last frozen frame without scrolling
        return;
      }

      rafRef.current = requestAnimationFrame(step);
      analyser.getByteFrequencyData(freqData);

      // 1. Shift canvas content left by 2 pixels
      ctx.drawImage(canvas, -2, 0);

      // 2. Draw the new 2px column on the right edge
      const colX = W - 2;
      const binH = H / usableBins;

      for (let i = 0; i < usableBins; i++) {
        // Low frequencies at bottom (y = H), high at top (y = 0)
        const y = H - (i + 1) * binH;
        const energy = freqData[i];
        ctx.fillStyle = COLOR_LUT[energy];
        ctx.fillRect(colX, y, 2, Math.ceil(binH));
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, isActive, preserveOnStop]);

  return (
    <div className="spectrogram-canvas-wrap">
      <canvas
        ref={canvasRef}
        width={380}
        height={56}
        className="spectrogram-canvas"
      />
      {placeholderText && (
        <div className="spectrogram-placeholder-overlay">
          <span>{placeholderText}</span>
        </div>
      )}
    </div>
  );
}

export default function WaveformComparison({
  analyser,
  cloneAnalyser,
  cloneIsPlaying = false,
  clonePlayed = false
}) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <span className="chart-title">Acoustic Signature Spectrogram</span>
          <span className="live-pill" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' }}>
            SPECTROGRAPHIC
          </span>
        </div>
        <div className="spectrogram-scale-legend">
          <span className="scale-label">0 dB</span>
          <div className="scale-gradient" />
          <span className="scale-label">Peak</span>
        </div>
      </div>

      <div className="wave-compare-body">
        {/* Track 1: Live Voice Spectrogram */}
        <div className="wave-track">
          <div className="track-tag live">
            <div className="tag-indicator green" />
            <span>Live Microphone (Continuous Formants)</span>
          </div>
          <SpectrogramTrack
            analyser={analyser}
            isActive={true}
            preserveOnStop={false}
          />
        </div>

        {/* Track 2: Synthetic Cloned Sample Spectrogram */}
        <div className="wave-track">
          <div className="track-tag clone">
            <div className="tag-indicator purple" />
            <span>Synthetic Voice Signature (Cloned Sample)</span>
            {!clonePlayed && (
              <span className="track-pending">Click &quot;Play Cloned Sample&quot; to inspect</span>
            )}
            {clonePlayed && !cloneIsPlaying && (
              <span className="track-pending" style={{ color: '#a78bfa' }}>Captured Signature (Frozen)</span>
            )}
          </div>
          <SpectrogramTrack
            analyser={cloneAnalyser}
            isActive={cloneIsPlaying}
            preserveOnStop={true}
            placeholderText={!clonePlayed ? 'Waiting for cloned sample playback…' : ''}
          />
        </div>
      </div>
    </div>
  );
}
