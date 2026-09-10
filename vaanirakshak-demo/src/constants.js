/**
 * constants.js — Single Source of Truth for VaaniRakshak
 * Shared across Risk Engine, Alert Banners, Spectrogram, and Architecture Inspector.
 */
export const ALERT_THRESHOLD = 70;
export const SAMPLE_RATE = 16000;
export const FEATURE_DIM = 768;
export const MODEL_ID = 'facebook/wav2vec2-base';
export const CLASSIFIER_ARCHITECTURE = 'Linear(768, 256) -> ReLU -> Dropout(0.2) -> Linear(256, 2)';
export const POLL_INTERVAL_MS = 1500;
export const TARGET_LATENCY_SPEC = '< 250 ms';
export const BAND_THRESHOLDS = [0, 30, 60, 85, 100];
