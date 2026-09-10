/**
 * useClonedSample.js — Step 6
 * Manages playback of the cloned audio + steps through precomputed score sequence.
 * While playing, overrides the live /analyze polling with the sequence values.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const SCORES_URL = '/cloned_scores.json';
const AUDIO_URL  = '/cloned_sample.mp3'; // drop your real clip here

export function useClonedSample({ isInCall, onScoreOverride, onScoreClear }) {
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [loadError,  setLoadError]  = useState(null);

  const audioRef    = useRef(null);
  const scoresRef   = useRef(null);
  const timeoutsRef = useRef([]);

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

    // Create / reuse audio element
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL);
      audioRef.current.onerror = () => {
        // Audio file missing — still run the score sequence (score demo still works)
        console.warn('[VaaniRakshak] cloned_sample.mp3 not found — running score sequence only');
      };
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {}); // ignore autoplay block

    setIsPlaying(true);

    // Schedule score overrides at each timestamp
    const startedAt = performance.now();
    scores.forEach(({ t, risk_score, confidence }) => {
      const id = setTimeout(() => {
        onScoreOverride({ riskScore: risk_score, confidence });
      }, t * 1000);
      timeoutsRef.current.push(id);
    });

    // When clip ends (or last keyframe fires), return to live scoring
    const lastT = scores[scores.length - 1].t;
    const endId = setTimeout(() => {
      setIsPlaying(false);
      onScoreClear();
    }, (lastT + 1.5) * 1000);
    timeoutsRef.current.push(endId);

    // Also listen for natural audio end
    if (audioRef.current) {
      audioRef.current.onended = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        setIsPlaying(false);
        onScoreClear();
      };
    }
  }, [isPlaying, isInCall, onScoreOverride, onScoreClear]);

  return { play, stop, isPlaying, loadError };
}
