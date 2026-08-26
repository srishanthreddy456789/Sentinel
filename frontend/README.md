# 🛡️ SENTINEL — LLM Reliability, Evaluation & Self-Healing Platform

**SENTINEL** is a high-performance developer desktop application for monitoring, evaluating, diagnosing, and autonomously self-healing multi-model AI workflows. Built as a calm, technical developer tool (inspired by VS Code, Cursor, and Linear aesthetics), SENTINEL provides continuous observability across connected AI APIs and local LLM endpoints.

---

## ✨ Features

- **🌐 Level 1: Global Dashboard**:
  - Aggregated KPIs across all connected models: Total Models, Total Requests, Overall Quality %, Total Failures, Healing Success Rate, and Average Latency.
  - **Unified Model Health Table**: Monitor real-time status (`● Healthy`, `⚠ Degraded`, `🟣 Healing`, `🔴 Critical`) with row-level workspace navigation.
  - **Global Recharts Visualizations**: Quality by Model, Request Volume Trends, Failure Rate Breakdown, and Latency benchmarks.

- **🤖 Level 2: Individual API/Model Workspace**:
  - Context-isolated workspace header with `← Dashboard` back navigation, exact model display name, provider badge, status dot, and action shortcuts (`[ Run Evaluation ]`, `[ Test ]`, `[ Settings ]`).

- **💬 Multi-Turn Model Chat Interface**:
  - Direct real-time interactive messaging with connected models using your API Key or local Ollama / SENTINEL Free Local Model.
  - **Per-Message SENTINEL Reliability Telemetry**: Shows Faithfulness %, Hallucination risk check, Context retrieval citations, Latency, and Token counts.
  - Active System Prompt Version selector (`v1.4`, `v1.3`, `v1.0`) and Model Parameter Sliders (Temperature, Top_P, Max Tokens).

- **⚡ Playground & Evaluations**:
  - Real-time prompt sandbox with system prompt editor, user input execution, latency timer, and live verification badges (`Correctness ✓`, `Faithfulness ✓`, `Safety ✓`).
  - Comprehensive evaluation history logs and test suite breakdown modals.

- **🔍 Failure Diagnosis Engine**:
  - Deep-dive root cause analysis comparing Question vs Generated Answer (Actual) vs Expected Answer (Ground Truth).
  - Confidence scoring, Evidence metrics (Model Agreement, Retrieval Coverage, Historical Failure Rate), and **Visual Causal Flow Graph**.
  - One-click `[ Apply Fix ]` button to trigger self-healing reranking and prompt adjustments.

- **🛠️ Self-Healing Inspector**:
  - Healing history log comparing BEFORE Quality vs AFTER Quality with percentage improvement deltas.
  - Interactive controls: `[ Promote Fix ]` and `[ Rollback ]`.

- **🧪 Experiments & Prompt Versioning**:
  - A/B testing suite comparing candidate prompt versions (Version A vs Version B) with `[ Promote Winner ]` flow.
  - Full system prompt registry with active, candidate, and deprecated version tags.

- **🔌 Developer Integration & SDK**:
  - Python SDK code snippets (`pip install sentinel-sdk`).
  - Masked API Key manager (`sk_live_••••••••••••`), key creation, and revocation.

- **⚙️ Dynamic Model Settings**:
  - Customize Display Name (updates verbatim everywhere live), Provider, Model ID, Base URL, Quality SLA targets, and Autonomous Healing toggles.

---

## 🏷️ Exact Display Naming Rule

When connecting an API or model, SENTINEL displays the exact name you enter:
- *Example*: User enters `"My Customer Support Bot"`.
- *Display*: Shown as `"My Customer Support Bot"` across sidebar, global tables, workspace headers, and chat traces.
- *Rule*: Never renamed to generic terms like "Project".

---

## 🛠️ Tech Stack

- **Core Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 + Custom Dark Developer Styling System
- **Icons & Charts**: Lucide React + Recharts
- **Desktop Packaging**: Electron + Electron Packager

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Local Run

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building Standalone Windows Desktop App (.exe)

To package SENTINEL into a native, standalone Windows desktop application:

```bash
# Inside the frontend directory
npm run build:exe
```

### Output Location:
```text
frontend/release/win-unpacked/sentinel-desktop.exe
```

Double-click `sentinel-desktop.exe` to run SENTINEL as a native Windows desktop app without needing any web browser or terminal server.

---

## 📤 Sharing with Friends

1. Go to `frontend/release/`.
2. Right-click the `win-unpacked` folder and select **Compress to ZIP**.
3. Name it **`sentinel-1.0.0.zip`** *(avoid using `.doc.zip` double extensions)*.
4. Upload to Google Drive / OneDrive / WeTransfer and send the download link to your friend.
5. Your friend extracts the ZIP folder and double-clicks **`sentinel-desktop.exe`** to launch!

---

## 📜 License

MIT License © 2026 SENTINEL Team. All rights reserved.
