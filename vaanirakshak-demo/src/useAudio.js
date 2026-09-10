/**
 * useAudio.js — Step 3
 * Custom hook: manages getUserMedia + Web Audio AnalyserNode lifecycle.
 * Returns { analyser, micError } — analyser is null when mic is not active.
 */
import { useState, useEffect, useRef } from 'react';

export function useAudio(active) {
  const [micError, setMicError] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  const contextRef = useRef(null);
  const streamRef  = useRef(null);

  useEffect(() => {
    if (!active) {
      // Tear down cleanly
      streamRef.current?.getTracks().forEach(t => t.stop());
      contextRef.current?.close();
      streamRef.current  = null;
      contextRef.current = null;
      setAnalyser(null);
      setMicError(null);
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        const ctx      = new AudioContext();
        const source   = ctx.createMediaStreamSource(stream);
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;
        source.connect(analyserNode);

        contextRef.current = ctx;
        streamRef.current  = stream;
        setAnalyser(analyserNode);
        setMicError(null);
      } catch (err) {
        if (!cancelled) {
          setMicError('Microphone access denied. Please allow mic permission and restart the call.');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      contextRef.current?.close();
      streamRef.current  = null;
      contextRef.current = null;
      setAnalyser(null);
    };
  }, [active]);

  return { analyser, micError };
}
