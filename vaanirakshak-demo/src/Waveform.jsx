/**
 * Waveform.jsx — Step 3
 * Canvas-based live waveform driven by a Web Audio AnalyserNode.
 */
import { useEffect, useRef } from 'react';

export default function Waveform({ analyser }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!analyser) {
      // Draw flat line when no mic
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray    = new Uint8Array(bufferLength);

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Glow line
      ctx.lineWidth   = 2;
      ctx.strokeStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur  = 8;
      ctx.beginPath();

      const sliceWidth = W / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Draw flat line on cleanup
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={50}
      style={{
        width: '100%',
        height: '50px',
        borderRadius: '6px',
        background: 'rgba(34,197,94,0.04)',
        border: '1px solid rgba(34,197,94,0.15)',
        display: 'block',
      }}
    />
  );
}
