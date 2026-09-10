/**
 * WaveformComparison.jsx — Step 9 (Full-Height Spectrogram Upgrade)
 * Renders real scrolling spectrograms for both the live microphone stream
 * and the synthetic cloned voice sample. Split 50/50 vertically to eliminate gaps.
 */
import { useEffect, useRef } from 'react';

// ── Perceptual Colormap LUT (Inferno / Viridis inspired) ────
const COLOR_LUT = new Array(256);
(function initLUT() {
  const STOPS = [
    { pos: 0,   r: 7,   g: 10,  b: 18 },  // Deep dark navy
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
        ctx.fillStyle = '#070a12';
        ctx.fillRect(0, 0, W, H);
      }
      return;
    }

    const binCount = analyser.frequencyBinCount;
    if (!dataRef.current || dataRef.current.length !== binCount) {
      dataRef.current = new Uint8Array(binCount);
    }
    const freqData = dataRef.current;
    const usableBins = Math.floor(binCount * 0.72);

    function step() {
      if (!isActive && preserveOnStop) {
        return;
      }

      rafRef.current = requestAnimationFrame(step);
      analyser.getByteFrequencyData(freqData);

      // 1. Shift canvas content left by 2 pixels
      ctx.drawImage(canvas, -2, 0);

      // 2. Draw new 2px column on right edge
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
        width={420}
        height={95}
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
    <div className="chart-card spectrogram-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <span className="chart-title">Acoustic Signature Spectrogram</span>
          <span className="live-pill" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' }}>
            DUAL-SPECTRUM
          </span>
        </div>
        <div className="spectrogram-scale-legend">
          <span className="scale-label">Quiet</span>
          <div className="scale-gradient" />
          <span className="scale-label">Energy Peak</span>
        </div>
      </div>

      <div className="spectrogram-split-body">
        {/* Top 50%: Live Voice Spectrogram */}
        <div className="spectrogram-half live-half">
          <div className="track-tag live">
            <div className="tag-indicator green" />
            <span className="track-name">Live Voice Spectrum (Real-Time Mic)</span>
            <span className="track-freq-hint">0 Hz – 8 kHz</span>
          </div>
          <SpectrogramTrack
            analyser={analyser}
            isActive={true}
            preserveOnStop={false}
          />
        </div>

        {/* Bottom 50%: Synthetic Cloned Sample Spectrogram */}
        <div className="spectrogram-half clone-half">
          <div className="track-tag clone">
            <div className="tag-indicator purple" />
            <span className="track-name">Synthetic Voice Spectrum (Cloned Sample)</span>
            {!clonePlayed && (
              <span className="track-pending">Click &quot;Play Cloned Sample&quot; to test</span>
            )}
            {clonePlayed && !cloneIsPlaying && (
              <span className="track-pending captured">Captured Signature (Frozen)</span>
            )}
            {clonePlayed && cloneIsPlaying && (
              <span className="track-pending active-scan">Analyzing Cloned Formants…</span>
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
