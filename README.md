# 🌐 SignalHire AI

**The Substrate for Autonomous Venture Creation & Management**

InnovationOS is a full-stack, AI-native platform designed to simulate, manage, and orchestrate the lifecycle of synthetic and real-world projects. At its core is the **Venture Civilization Layer**—a revolutionary architectural paradigm where AI agents autonomously spawn startups, generate product artifacts, and simulate market dynamics in real-time.

---

## 🚀 The Venture Civilization Layer: Vision

The Venture Civilization Layer transforms the application from a passive management tool into an active, breathing ecosystem. Instead of merely tracking data, InnovationOS acts as an orchestrator for AI-driven ventures. 

* **Autonomous Spawning**: Provide a problem statement, and AI PMs, CTOs, and Analysts orchestrate together to generate a fully realized venture thesis, complete with market sizing and system architecture.
* **Live Ecosystem**: Ventures exist in a dynamic state. Their momentum, market tickers, and order books pulse and shift continuously, providing a living visualization of market fit.
* **Artifact Vaults**: Every venture automatically produces and permanently archives artifacts—PRDs, code snippets, execution plans—accessible instantly via the Venture Memory Engine.

---

## 🏗️ Current Architecture

InnovationOS is built on a high-performance, container-ready modern stack:

* **Frontend Engine**: React 19 + Vite, styled with Tailwind CSS for precision utility layouts.
* **Animation & Visualization**: `framer-motion` for fluid spatial transitions and `recharts` for live market data and momentum graphs.
* **Backend Substrate**: Custom Node.js/Express server (via `server.ts`), compiled blazingly fast with `esbuild` for production.
* **Intelligence Layer**: Powered by the Gemini API (`@google/genai`), enabling the complex autonomous agent execution paths (`/api/spawn-venture`, `/api/ai-execute`).
* **Persistence Layer (Venture Memory Engine)**: Advanced client-side `localStorage` hydration ensuring complex active states, generated artifacts, and project pipelines seamlessly persist across sessions without requiring immediate cloud database provisioning.

---

## ⚡ Technical Capabilities

### 1. Venture Memory Engine
A zero-latency, highly robust persistence layer. It automatically caches the global ecosystem state:
- Real-time startup momentum and configurations.
- Active workspace context (e.g., maintaining focus on a specific agent terminal or founder layer).
- AI-generated markdown artifacts and product documentation.

### 2. Multi-Agent Orchestration
InnovationOS acts as the conductor for specialized AI agents. Through dedicated `/api/` proxy routes, the system routes context to specific roles (AI PM, AI CTO), parsing their outputs into structured deliverables and preserving them in the Artifact Vault.

### 3. Career / Job Project Tracking
The system also includes a localized `ProjectMemory` utility (`src/lib/memory.ts`) to manage real-world operations. Users can track job applications, update pipeline statuses (applied, interviewing, offer), and append AI-generated notes securely.

### 4. Live Data Synthesizer
A local pulse loop continuously calculates and repaints market tickers, order books, and venture metrics to simulate a living global market, rendering smooth data transitions via localized React hooks.

---

## 🛠️ Getting Started

To boot the InnovationOS terminal locally:

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment
# Copy .env.example to .env and add your Gemini API key (GEMINI_API_KEY)
cp .env.example .env

# 3. Ignite the Development Server
npm run dev
```

*The server will boot the Vite middleware and Express API routes simultaneously on `http://localhost:3000`.*
