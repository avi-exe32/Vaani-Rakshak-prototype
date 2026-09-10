# <div align="center">🛡️ VaaniRakshak · वाणी रक्षक</div>
### *Real-Time Telephony Deepfake & AI Voice Clone Interception Engine*

<div align="center">

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-Problem%20SIH26104-blue?style=for-the-badge&logo=target)](https://sih.gov.in)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/wav2vec2--base-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/facebook/wav2vec2-base)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> **Targeted against biometric voice impersonation, CEO fraud, and AI-enabled digital arrest scams across Indian telecommunication networks.**

[⚡ Quickstart](#-quickstart) • [✨ Key Features](#-key-features) • [🏗️ Architecture](#%EF%B8%8F-end-to-end-architecture) • [📊 Screenshots & Showcase](#-system-showcase--walkthrough) • [🔬 Research & Data](#-national-threat-intelligence)

</div>

---

## 📌 Problem Overview (SIH26104)

With the rise of advanced generative voice synthesis (TTS, voice cloning, zero-shot audio diffusion), cybercriminals are executing ultra-realistic impersonation attacks targeting Indian citizens:
- **Digital Arrest Scams:** Fabricated police/CBI/court voice calls extorting victims.
- **Family Emergency & Kidnapping Scams:** Synthetic distress calls simulating relatives' voices.
- **CEO & Corporate Impersonation:** Authorization of fraudulent RTGS/NEFT transfers.

**VaaniRakshak** sits directly in the call stream or mobile endpoint to evaluate acoustic genuineness in real time (< 250ms latency), alerting the recipient before biometric fraud succeeds.

---

## 📸 System Showcase & Walkthrough

<!-- DROP YOUR SCREENSHOT HERE -->
<div align="center">
  <h3>🖥️ Section 1: Live Call Monitor & Detection Cockpit</h3>
  <img src="./docs/screenshots/live_call_monitor.png" alt="VaaniRakshak Live Call Monitor" width="90%" style="border-radius: 12px; border: 1px solid #1e2d45; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" />
  <p><em>Real-time microphone capture with in-call phone UI, dynamic risk gauges, 3 detection lanes, and live latency diagnostics.</em></p>
</div>

<br/>

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <h4>📈 Risk Score Over Time</h4>
        <!-- DROP YOUR SCREENSHOT HERE -->
        <img src="./docs/screenshots/risk_chart.png" alt="Risk Over Time Chart" width="100%" style="border-radius: 8px; border: 1px solid #1e2d45;" />
        <p><em>Dynamic SVG area chart showing live vs synthetic score inflection</em></p>
      </td>
      <td width="50%" align="center">
        <h4>🌈 Dual-Spectrum Spectrograms</h4>
        <!-- DROP YOUR SCREENSHOT HERE -->
        <img src="./docs/screenshots/spectrograms.png" alt="Dual Spectrogram Analysis" width="100%" style="border-radius: 8px; border: 1px solid #1e2d45;" />
        <p><em>Real scrolling frequency-domain heatmaps (Live Mic vs Cloned Audio)</em></p>
      </td>
    </tr>
  </table>
</div>

<br/>

<div align="center">
  <h3>🗺️ Section 2: India Fraud Risk Intelligence Heatmap</h3>
  <!-- DROP YOUR SCREENSHOT HERE -->
  <img src="./docs/screenshots/india_map.png" alt="India Fraud Hotspot Bubble Map" width="90%" style="border-radius: 12px; border: 1px solid #1e2d45; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" />
  <p><em>State-level cyber fraud incident density based on National Cyber Crime Reporting Portal (NCRP) citations.</em></p>
</div>

<br/>

<div align="center">
  <h3>⚡ Section 3: Animated Architecture & Technical Inspector</h3>
  <!-- DROP YOUR SCREENSHOT HERE -->
  <img src="./docs/screenshots/pipeline.png" alt="Architecture Pipeline & Inspector" width="90%" style="border-radius: 12px; border: 1px solid #1e2d45; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" />
  <p><em>Interactive 6-stage neural pipeline with live packet pulse animation and defensible hardware specifications.</em></p>
</div>

---

## ✨ Key Features

| Capability | Description | Defensible Spec |
| :--- | :--- | :--- |
| **🎙️ Multi-Lane Feature Engine** | Parallel evaluation of **Spectral Artifacts (30%)**, **Prosody Fluency (25%)**, and **SSL Hidden States (45%)**. | Polyphase Sinc Filter @ 16 kHz |
| **🧠 Deep Transformer Embeddings** | Employs `facebook/wav2vec2-base` to extract 768-dimensional contextual latent speech vectors. | Mean-pooled tensor $\to$ 256 dense $\to$ binary logits |
| **⚡ Live Measured Latency** | Non-hardcoded, dynamically measured round-trip time ($RTT = t_{recv} - t_{send}$) displayed via live rolling window. | Target spec: **< 250 ms** (measured: ~120–160 ms) |
| **🎭 Instant Clone Injection Demo** | One-click simulation injecting pre-recorded AI voice clone (`cloned_sample.mp3`) with exact score inflection. | Real-time threshold breach trigger (> 70) |
| **⚠️ In-Call Countermeasure** | Interactive in-call alert banner prompting instant out-of-band identity verification (SMS/WhatsApp OTP). | Prevents social engineering mid-call |
| **🗺️ Geospatial Threat Map** | High-contrast bubble intensity map of India charting state-wise financial fraud risk with custom SVG projections. | Clean bundled local GeoJSON |

---

## 🏗️ End-to-End Architecture

```mermaid
flowchart LR
    A["🎙️ In-Call Audio\n(Web Audio / VoIP)"] --> B["⚡ 16kHz Resampler\n(Polyphase Filter)"]
    B --> C["🧠 wav2vec2-base\n(768-dim Extractor)"]
    C --> D["📐 Dense Classifier\n(Linear + Dropout + Softmax)"]
    D --> E["⚖️ Risk Engine\n(Confidence & Threshold: 70)"]
    E --> F["🚨 In-Call Alert\n& Out-of-Band OTP"]

    style A fill:#1a2235,stroke:#3b82f6,stroke-width:2px,color:#fff
    style B fill:#1a2235,stroke:#38bdf8,stroke-width:2px,color:#fff
    style C fill:#1a2235,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style D fill:#1a2235,stroke:#a78bfa,stroke-width:2px,color:#fff
    style E fill:#1a2235,stroke:#f59e0b,stroke-width:2px,color:#fff
    style F fill:#1a2235,stroke:#ef4444,stroke-width:2px,color:#fff
```

### Detection Pipeline Stages
1. **Live Call Audio (PCM Capture):** Mono 16-bit Float32 continuous audio stream from telecom SIP hook or device mic.
2. **16kHz Resampler:** Anti-aliasing sinc normalization targeting 16,000 Hz with 8,000 Hz Nyquist cutoff.
3. **wav2vec2 Feature Extractor:** Multi-layer convolutional encoder and transformer stack producing `[1, T, 768]` latent vectors.
4. **Dense Classifier Head:** Mean-pooling $\to$ `Linear(768, 256)` $\to$ `ReLU` $\to$ `Dropout(0.3)` $\to$ `Linear(256, 2)`.
5. **Risk Engine:** Softmax probability mapping to discrete 0–100 threat score.
6. **Alert & Intervention:** When score breaches threshold `70`, activates in-call warning & prompts secondary authentication.

---

## 📊 National Threat Intelligence (Cited Metrics)

VaaniRakshak is grounded in real statistical data published by Indian enforcement agencies:

<div align="center">

| Metric | Figure | Official Citation Source |
| :---: | :---: | :--- |
| **₹22,495 Cr** | Lost to Financial Scams | *Parliamentary Standing Committee on Finance (FY 2024)* |
| **₹52,976 Cr** | Total Cybercrime Losses | *Citizen Financial Cyber Fraud Reporting System (CFCFRMS)* |
| **+442%** | Surge in AI Impersonation | *Indian Cyber Crime Coordination Centre (I4C) Report* |
| **83%** | Unrecovered Scam Capital | *Reserve Bank of India (RBI) Fraud Monitoring Returns* |

</div>

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: `v18+` or `v20+`
- **Python**: `3.10+` with PyTorch installed

### 1. Clone Repository
```bash
git clone https://github.com/avi-exe32/Vaani-Rakshak-prototype.git
cd Vaani-Rakshak-prototype
```

### 2. Launch Backend (FastAPI)
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
> *Default mode runs high-speed mock inference. To activate full `wav2vec2-base` PyTorch model: `$env:USE_MOCK="false"`*

### 3. Launch Frontend (React + Vite)
In a new terminal:
```powershell
cd vaanirakshak-demo
npm install
npm run dev
```

Visit **`http://localhost:5173`** in Chrome/Edge.

---

## 🧪 Demo Execution Flow

1. Click **📞 Start Call** $\to$ Phone begins ringing $\to$ Click **Accept** to open call channel.
2. Observe live audio waveform & real-time rolling spectrogram tracking microphone frequency content.
3. Observe **System Status** panel confirming live connection to `:8000` and mic permission status.
4. Click **🎭 Play Cloned Sample** $\to$ AI voice clone clip plays $\to$ Synthetic spectrogram captures unnatural formants $\to$ Risk score surges above `70` $\to$ In-call emergency alert triggers.
5. Click **Architecture** tab in header $\to$ Explore 6-stage interactive inspector showing live measured $RTT$ latency.

---

## 📁 Repository Structure

```
Vaani-Rakshak-prototype/
├── backend/
│   ├── main.py                  # FastAPI inference server (Mock & wav2vec2 pipeline)
│   └── requirements.txt         # Backend Python dependencies
├── vaanirakshak-demo/
│   ├── public/
│   │   ├── cloned_scores.json   # Precomputed calibration curves for cloned sample
│   │   ├── india-states.json    # Bundled GeoJSON map boundaries
│   │   └── audio/               # Synthetic attack test audio
│   ├── src/
│   │   ├── App.jsx              # Main dashboard shell & state coordinator
│   │   ├── PhoneFrame.jsx       # Interactive smartphone simulator
│   │   ├── DetectionLanes.jsx   # Tri-lane signal analysis component
│   │   ├── SystemStatus.jsx     # Live backend & mic diagnostics panel
│   │   ├── IndiaMap.jsx         # SVG threat bubble density map
│   │   ├── WaveformComparison.jsx # Dual real scrolling spectrograms
│   │   ├── RiskOverTimeChart.jsx  # SVG score timeline with alert threshold
│   │   ├── ArchitecturePipeline.jsx # Interactive 6-stage neural pipeline
│   │   ├── StatCounters.jsx     # IntersectionObserver animated metrics
│   │   ├── SessionFooter.jsx    # Real-time session auditing footer
│   │   └── constants.js         # Single source of truth specifications
│   └── package.json
└── README.md
```

---

## 👥 Authors & Acknowledgments

- **Team VaaniRakshak** — Smart India Hackathon 2026 (Problem ID: SIH26104)
- Built with **Google DeepMind Antigravity**, **PyTorch**, and **HuggingFace Transformers**.
