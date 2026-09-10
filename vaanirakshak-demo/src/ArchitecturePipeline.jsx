/**
 * ArchitecturePipeline.jsx — Step 10
 * Interactive animated pipeline visualization of the end-to-end VaaniRakshak architecture.
 *
 * Flow: Live Audio (PCM) -> 16kHz Resampler -> wav2vec2 Extractor -> Dense Head -> Risk Engine -> Alert Engine
 * - Illuminated based on real call state & alert threshold
 * - Pulse packets synchronized with real network/inference chunk events
 * - Click any node to open an interactive technical inspector with defensible live measurements & shared constants
 */
import { useState } from 'react';
import {
  ALERT_THRESHOLD,
  SAMPLE_RATE,
  FEATURE_DIM,
  MODEL_ID,
  CLASSIFIER_ARCHITECTURE,
  POLL_INTERVAL_MS,
  TARGET_LATENCY_SPEC,
} from './constants';

export default function ArchitecturePipeline({
  isInCall = false,
  riskScore = 0,
  latency = null,
  rollingLatency = null,
  pulseActive = false,
  cloneIsPlaying = false,
}) {
  const [selectedNode, setSelectedNode] = useState('risk');

  const isAlert = isInCall && riskScore > ALERT_THRESHOLD;
  const isNormal = isInCall && !isAlert;

  const NODES = [
    {
      id: 'audio',
      num: '01',
      title: 'Live Call Audio',
      subtitle: 'PCM Capture',
      icon: '🎙️',
      spec: {
        'Source Input': 'Microphone / Telecom VoIP Stream',
        'Audio Format': 'Raw Linear PCM (Float32)',
        'Capture Channel': '1 (Mono)',
        'Chunk Window': `${POLL_INTERVAL_MS} ms rolling slice`,
      },
      detail: 'Captures in-call audio frames via Web Audio API, preparing continuous voice time-series buffers for downstream spectral and acoustic feature extraction.',
    },
    {
      id: 'resampler',
      num: '02',
      title: '16kHz Resampler',
      subtitle: 'Audio Preprocessing',
      icon: '⚡',
      spec: {
        'Target Sample Rate': `${SAMPLE_RATE.toLocaleString()} Hz`,
        'Filter Method': 'Polyphase Anti-Aliasing Sinc Filter',
        'Nyquist Limit': `${(SAMPLE_RATE / 2).toLocaleString()} Hz`,
        'Normalization': 'Zero-Mean Peak Normalization [-1.0, 1.0]',
      },
      detail: 'Resamples telephonic or microphone streams to the exact 16 kHz acoustic baseline expected by self-supervised pretrained speech models.',
    },
    {
      id: 'wav2vec2',
      num: '03',
      title: 'wav2vec2 Extractor',
      subtitle: 'Acoustic Embeddings',
      icon: '🧠',
      spec: {
        'Pretrained Backbone': MODEL_ID,
        'Hidden Dimension': `${FEATURE_DIM}-dim representation`,
        'Temporal Pooling': 'Global Mean Pooling across frames',
        'Extracted Tensor': `(1, ${FEATURE_DIM})`,
      },
      detail: 'Passes 16kHz audio through 12 transformer encoder blocks, extracting deep contextualized acoustic representations that capture subtle phase and prosody artifacts.',
    },
    {
      id: 'classifier',
      num: '04',
      title: 'Dense Classifier Head',
      subtitle: 'Neural Discriminator',
      icon: '🔬',
      spec: {
        'Architecture': CLASSIFIER_ARCHITECTURE,
        'Activation Function': 'ReLU with Dropout (p=0.20)',
        'Output Classes': '2: [Human Speech, Synthetic/Clone]',
        'Loss Metric': 'Binary Cross-Entropy (Log-Softmax)',
      },
      detail: 'A specialized dense neural classification network trained to differentiate authentic human laryngeal vibration patterns from vocoder and neural TTS synthesis signatures.',
    },
    {
      id: 'risk',
      num: '05',
      title: 'Risk Engine',
      subtitle: 'Real-Time Scoring',
      icon: '🛡️',
      spec: {
        'Live Round-Trip Latency': latency !== null ? `${latency} ms` : 'Not yet measured',
        'Rolling Avg Latency (Last 5)': rollingLatency !== null ? `${rollingLatency} ms` : 'Not yet measured',
        'Target Latency Spec': TARGET_LATENCY_SPEC,
        'Decision Threshold': `${ALERT_THRESHOLD} / 100 (Alert Trigger)`,
        'Current Live Score': isInCall ? `${riskScore} / 100` : 'Idle (0)',
      },
      detail: 'Evaluates model probabilities into an actionable 0-100 Impersonation Risk Score, logging rolling latency and determining telecommunication intervention status.',
    },
    {
      id: 'telecom',
      num: '06',
      title: 'Intervention Engine',
      subtitle: 'Telecom Alert & 2FA',
      icon: '🚨',
      spec: {
        'Trigger Condition': `Risk Score > ${ALERT_THRESHOLD}`,
        'Current State': isAlert ? '⚠️ ALERT ACTIVE — VERIFICATION REQUIRED' : isInCall ? 'Monitoring Stream (Secure)' : 'Standby',
        'Intervention Vector': 'In-Call UI Warning Banner & Out-of-Band SMS OTP',
        'Telecom Protocol': 'STIR-SHAKEN / SIP Signalling Hook',
      },
      detail: 'Initiates immediate in-call visual warnings and triggers out-of-band verification prompts to prevent biometric voice impersonation fraud.',
    },
  ];

  const activeNode = NODES.find(n => n.id === selectedNode) || NODES[4];

  return (
    <section className="section section-3">
      <div className="section-header">
        <div className="section-header-left">
          <h2>End-to-End Detection Architecture</h2>
          <span className="pipeline-live-status">
            <span className={`status-pip${isInCall ? (isAlert ? ' alert-pip' : ' active-pip') : ''}`} />
            {isInCall ? (isAlert ? 'ALERT CONDITION ACTIVE' : 'PIPELINE RUNNING') : 'STANDBY'}
          </span>
        </div>
        <div className="section-divider" />
      </div>

      <div className="pipeline-container">
        {/* Pipeline Nodes Row */}
        <div className="pipeline-nodes-row">
          {NODES.map((node, index) => {
            const isSelected = selectedNode === node.id;
            const isNodeActive = isInCall;
            const nodeAlertClass = isAlert ? 'node-alert' : isNormal ? 'node-active' : 'node-idle';

            return (
              <div key={node.id} className="pipeline-step-wrapper">
                <button
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={`pipeline-node-card ${nodeAlertClass}${isSelected ? ' node-selected' : ''}`}
                >
                  <div className="node-top-bar">
                    <span className="node-number">{node.num}</span>
                    <span className="node-icon">{node.icon}</span>
                  </div>
                  <div className="node-title">{node.title}</div>
                  <div className="node-subtitle">{node.subtitle}</div>

                  {/* Indicator Pip */}
                  <div className="node-footer-pip">
                    <span className="pip-dot" />
                    <span className="pip-status-text">
                      {isNodeActive ? (isAlert ? 'HIGH RISK' : 'HEALTHY') : 'READY'}
                    </span>
                  </div>
                </button>

                {/* Connector Arrow & Pulse Packet */}
                {index < NODES.length - 1 && (
                  <div className={`pipeline-connector${isInCall ? ' connector-active' : ''}${isAlert ? ' connector-alert' : ''}`}>
                    <div className="connector-line" />
                    <div className="connector-arrow">›</div>
                    {isInCall && (
                      <div
                        className={`pulse-packet${pulseActive ? ' pulse-burst' : ''}${isAlert ? ' packet-alert' : ''}`}
                        style={{ animationDelay: `${index * 0.18}s` }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Technical Inspector Drawer */}
        <div className="pipeline-inspector-drawer">
          <div className="inspector-header">
            <div className="inspector-title-wrap">
              <span className="inspector-badge">STAGE {activeNode.num} INSPECTOR</span>
              <h3 className="inspector-node-name">{activeNode.title}</h3>
              <span className="inspector-node-sub">{activeNode.subtitle}</span>
            </div>
            <div className="inspector-status-pill">
              <span className="spec-defensible-tag">✓ SOURCE OF TRUTH LINKED</span>
            </div>
          </div>

          <p className="inspector-description">{activeNode.detail}</p>

          <div className="inspector-specs-grid">
            {Object.entries(activeNode.spec).map(([key, value]) => {
              const isLatencyField = key.includes('Latency');
              const isThresholdField = key.includes('Threshold');

              return (
                <div key={key} className="spec-card">
                  <div className="spec-key">{key}</div>
                  <div className={`spec-value${isLatencyField ? ' highlight-green' : isThresholdField ? ' highlight-amber' : ''}`}>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
