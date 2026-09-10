/**
 * useClonedSample.js — Step 6 & 9
 * Manages playback of the cloned audio + steps through precomputed score sequence.
 * Connects Web Audio AnalyserNode for frequency analysis (spectrogram).
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const SCORES_URL = '/cloned_scores.json';
const AUDIO_URL  = '/audio/cloned_sample.mp3';

export function useClonedSample({ isInCall, onScoreOverride, onScoreClear }) {
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [cloneAnalyser, setCloneAnalyser] = useState(null);
  const [loadError,     setLoadError]     = useState(null);

  const audioRef         = useRef(null);
  const audioCtxRef      = useRef(null);
  const cloneAnalyserRef = useRef(null);
  const sourceNodeRef    = useRef(null);
  const scoresRef        = useRef(null);
  const timeoutsRef      = useRef([]);

  // Pre-load scores JSON once
  useEffect(() => {
    fetch(SCORES_URL)
      .then(r => r.json())
      .then(data => { scoresRef.current = data; })
      .catch(() => setLoadError('Could not load cloned_scores.json'));
  }, []);

  // Stop everything when call ends
  useEffect(() => {
    if (!isInCall) stop();
  }, [isInCall]);

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsPlaying(false);
    onScoreClear();
  }

  const play = useCallback(() => {
    if (isPlaying || !isInCall) return;

    const scores = scoresRef.current;
    if (!scores) { console.warn('[VaaniRakshak] score sequence not loaded yet'); return; }

    // Create / reuse audio element + Web Audio Analyser
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_URL);
      audio.crossOrigin = 'anonymous';

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.75;
          const source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioCtxRef.current = ctx;
          cloneAnalyserRef.current = analyser;
          sourceNodeRef.current = source;
          setCloneAnalyser(analyser);
        }
      } catch (err) {
        console.warn('[VaaniRakshak] Could not create clone audio context:', err);
      }

      audio.onerror = () => {
        console.warn('[VaaniRakshak] cloned_sample.mp3 failed to load — running score sequence only');
      };

      audioRef.current = audio;
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});

    setIsPlaying(true);

    // Schedule score overrides
    scores.forEach(({ t, risk_score, confidence }) => {
      const id = setTimeout(() => {
        onScoreOverride({ riskScore: risk_score, confidence });
      }, t * 1000);
      timeoutsRef.current.push(id);
    });

    // When sequence finishes
    const lastT = scores[scores.length - 1].t;
    const endId = setTimeout(() => {
      setIsPlaying(false);
      onScoreClear();
    }, (lastT + 1.5) * 1000);
    timeoutsRef.current.push(endId);

    if (audioRef.current) {
      audioRef.current.onended = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setIsPlaying(false);
        onScoreClear();
      };
    }
  }, [isPlaying, isInCall, onScoreOverride, onScoreClear]);

  return { play, stop, isPlaying, cloneAnalyser, loadError };
}
