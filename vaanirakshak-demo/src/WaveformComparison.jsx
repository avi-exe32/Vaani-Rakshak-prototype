/**
 * WaveformComparison.jsx — Step 9
 * Compares live voice audio stream against synthetic cloned sample signature.
 */
import { useEffect, useRef } from 'react';

export default function WaveformComparison({ analyser, clonePlayed = false }) {
  const liveCanvasRef  = useRef(null);
  const cloneCanvasRef = useRef(null);
  const rafRef         = useRef(null);

  // Animate live mic stream
  useEffect(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    if (!analyser) {
      // flat baseline
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray    = new Uint8Array(bufferLength);

    function render() {
      rafRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth   = 1.8;
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();

      const sliceWidth = W / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
    }

    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  // Render static/precomputed synthetic pattern once clone has been played
  useEffect(() => {
    const canvas = cloneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!clonePlayed) {
      // Empty state
      ctx.strokeStyle = 'rgba(167,139,250,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      return;
    }

    // High frequency synthetic signature wave with characteristic harmonics
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#a78bfa';
    ctx.shadowColor = '#a78bfa';
    ctx.shadowBlur = 4;
    ctx.beginPath();

    const points = 180;
    for (let i = 0; i < points; i++) {
      const x = (i / points) * W;
      const freq1 = Math.sin((i / 8) * Math.PI) * (H * 0.28);
      const freq2 = Math.sin((i / 3) * Math.PI) * (H * 0.12);
      const y = H / 2 + freq1 + freq2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [clonePlayed]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-title">Acoustic Signature Comparison</span>
        <span className="chart-meta">Spectrographic Trace</span>
      </div>

      <div className="wave-compare-body">
        {/* Track 1: Live Voice */}
        <div className="wave-track">
          <div className="track-tag live">
            <div className="tag-indicator green" />
            <span>Live Microphone (Human Baseline)</span>
          </div>
          <canvas ref={liveCanvasRef} width={380} height={42} className="track-canvas" />
        </div>

        {/* Track 2: Cloned Sample */}
        <div className="wave-track">
          <div className="track-tag clone">
            <div className="tag-indicator purple" />
            <span>Synthetic Voice Signature (Cloned Sample)</span>
            {!clonePlayed && <span className="track-pending">Click &quot;Play Cloned Sample&quot; to test</span>}
          </div>
          <canvas ref={cloneCanvasRef} width={380} height={42} className="track-canvas" />
        </div>
      </div>
    </div>
  );
}
