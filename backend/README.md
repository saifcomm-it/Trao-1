# Trao — The AI Interview Prep Kit
> Full-Stack Engineering Assessment | **Document ID**: `FS-AI-INTERVIEW-01`

Trao turns any job description and company website URL into a personalized, high-yield interview preparation kit. It crawls the company website to discover hiring philosophies and engineering practices, mines public interview discussions, extracts core requirements into must-haves and nice-to-haves, generates targeted questions and flashcards, and algorithmically constructs a day-by-day study schedule with guaranteed coverage.

---

## Table of Contents
1. [Tech Stack & Justification](#1-tech-stack--justification)
2. [Setup & Quick Start](#2-setup--quick-start)
3. [Batch Entry Point (Section 9 Mandatory)](#3-batch-entry-point-section-9-mandatory)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Retrieval & Crawler Approach](#5-retrieval--crawler-approach)
6. [Research & Generation Sequencing](#6-research--generation-sequencing)
7. [The Builder: Generated, Edited & Pinned State](#7-the-builder-generated-edited--pinned-state)
8. [Deterministic Schedule Allocation](#8-deterministic-schedule-allocation)
9. [Practice Mode & Creative Feature](#9-practice-mode--creative-feature)
10. [Key Design Decisions, Trade-offs & Limitations](#10-key-design-decisions-trade-offs--limitations)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. Tech Stack & Justification

| Component | Technology | Version | Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Shell** | Next.js | `16.3.4` | Modern SSR host, optimized asset bundling, and clean root layout. |
| **UI Library** | React | `19.2.8` | High-performance reactive UI with client state preservation. |
| **Routing** | React Router DOM | `7.18.3` | **Architectural Choice**: Centralized client routing (`<Routes>`, `<Route>`, `<Navigate>`) hosted inside Next.js. Delivers instant, zero-flicker transitions, eliminates redundant nested `page.tsx` directories, and maintains client builder state across views. |
| **Styling** | Tailwind CSS + PostCSS | `3.4.19` | Utility-first styling with responsive, accessible layouts and dark mode support. |
| **Backend API** | Node.js + Express | `4.21.2` | Clean, modular REST endpoints for auth, prep kit generation, and mock simulations. |
| **Language** | TypeScript | `5.7.3` | End-to-end type safety and strict schema validation. |
| **Database** | MongoDB + Mongoose | `8.9.5` | Document database for storing candidates, prep kits, and mock interview attempts. |
| **AI / LLM** | Google Gemini 2.5 Flash | SDK `0.24.0` | High-quality structured JSON output with a genuine free tier. |
| **Validation** | Zod | `3.24.1` | Runtime validation strictly enforcing Appendix A and Appendix B schemas. |
| **Testing** | Jest + ts-jest | `29.7.0` | Comprehensive unit tests for schedule allocation, coverage checking, and schema validation. |

---

## 2. Setup & Quick Start

### Prerequisites
- Node.js `v20` or `v22`
- MongoDB running locally (`mongodb://localhost:27017/trao`) or a MongoDB Atlas URI

### Local Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd Trao

# 2. Install dependencies across projects
npm install --prefix backend
npm install --prefix frontend --legacy-peer-deps

# 3. Configure environment variables
cp .env.example .env
cp .env.example backend/.env
```

### Running the Application
```bash
# Terminal 1: Start Backend API (runs on port 5000)
npm run dev:backend

# Terminal 2: Start Frontend UI (runs on port 3000)
npm run dev:frontend
```

Visit `http://localhost:3000` to access the application.

### Running Automated Tests
```bash
npm test
```
All 3 test suites (**Coverage Checker**, **Schedule Allocator**, and **Appendix Validator**) run and pass with 100% success.

---

## 3. Batch Entry Point (Section 9 Mandatory)

The repository provides a single mandatory batch evaluation CLI runnable directly from the root on a clean clone:

```bash
npm run evaluate -- --input <path/to/cases.json> --output <path/to/kits.json>
```

### Example:
```bash
npm run evaluate -- --input backend/helpers/cases-test.json --output test-output.json
```

### Features of the Batch Runner:
- Reads an array of case objects: `[{ id, jd, company_url, days }]`.
- Runs the **exact same pipeline code** as the interactive UI.
- Validates that the output strictly adheres to **Appendix B** and **Appendix A**.
- Supports local test addresses (e.g. `http://localhost:8099/acme/`).
- Continues execution upon individual case failures and records failure details rather than aborting.
- Pacing rate-limits calls to complete 5 cases well within the 15-minute budget.

---

## 4. High-Level Architecture

```
                       +------------------------+
                       ¦  Candidate Input / CLI ¦
                       ¦   (JD, URL, Days)      ¦
                       +------------------------+
                                   ¦
                                   ?
        +-----------------------------------------------------+
        ¦                 Research Pipeline                   ¦
        ¦  1. Crawler: Domain fetch, link rank, discussions   ¦
        ¦  2. Requirements: Extract must/nice & technical IDs ¦
        ¦  3. Company Brief: Synthesize mission & hiring lens ¦
        +-----------------------------------------------------+
                                   ¦
                                   ?
        +-----------------------------------------------------+
        ¦            Question & Flashcard Generation          ¦
        ¦  4. Pass 1: Categorized questions (tech/sys/behav)  ¦
        ¦  5. Pass 2 (Loop): Deterministic coverage check     ¦
        ¦     - Uncovered must-haves -> targeted synthesis    ¦
        ¦  6. Active Recall: Flashcard synthesis              ¦
        +-----------------------------------------------------+
                                   ¦
                                   ?
        +-----------------------------------------------------+
        ¦           Deterministic Code Arithmetic             ¦
        ¦  7. Schedule Allocator:                             ¦
        ¦     - Must-haves and high difficulty scheduled early¦
        ¦     - Integer minutes allocated across exact days   ¦
        +-----------------------------------------------------+
                                   ¦
                                   ?
        +-----------------------------------------------------+
        ¦           Storage & Interactive Experience          ¦
        ¦  - Kit Builder: Inline edit, pinned state survival  ¦
        ¦  - Practice Mode: Spaced repetition flashcards      ¦
        ¦  - Creative: AI Mock Interview Simulator            ¦
        +-----------------------------------------------------+
```

---

## 5. Retrieval & Crawler Approach

Finding hiring pages cannot rely on hard-coded URLs because modern companies distribute career details across unpredictable paths (`/careers`, `/jobs`, `/handbook`, `/about`, engineering blogs).

### Retrieval Process:
1. **Homepage Discovery**: Fetches the root URL and parses all internal anchor tags via Cheerio.
2. **Heuristic Link Ranking**: Scores candidate URLs using weighted keyword heuristics (`careers`, `jobs`, `culture`, `engineering`, `handbook`, `values`, `interview`).
3. **Public Discussion Mining**: Gathers publicly available interview discussions and patterns for the target firm.
4. **Resilience & Rate Limiting**:
   - Retries with exponential backoff on transient failures.
   - If a source returns 404 or times out, it is reported in `pages_used` without halting the pipeline.
   - Capped at 1MB per page and 8000ms timeouts to prevent hanging.
5. **Security & SSRF Mitigation**:
   - External URLs are strictly validated.
   - Loopback and private IP ranges (`127.0.0.1`, `10.x.x.x`, `172.16.x.x`, `192.168.x.x`) are rejected in production.
   - Crawled web text is treated strictly as **untrusted data**, isolated in distinct prompt blocks to prevent prompt injection.

---

## 6. Research & Generation Sequencing

The kit is generated through deliberate, sequenced stages rather than a monolithic single prompt:

1. `fetching_company`: Crawls target domain and discovers engineering/careers content.
2. `extracting_requirements`: Parses the job description to extract structured requirements with stable IDs (`r1`, `r2`, etc.), tagged by kind (`technical`, `behavioural`, `domain`) and priority (`must` vs `nice`).
3. `generating_brief`: Synthesizes what the company does and its interview approach based on crawled data.
4. `generating_questions_pass_1`: Generates questions mapped to extracted requirement IDs across 4 categories (`technical`, `system-design`, `behavioural`, `company-fit`).
5. `closing_gaps_pass_2` (**The Second Pass**): Runs an in-code deterministic coverage verification. Any must-have requirement lacking questions is sent back in a focused loop to generate missing questions, guaranteeing 100% must-have coverage.
6. `building_schedule`: Synthesizes flashcards and runs deterministic integer arithmetic to allocate material across the requested days.

---

## 7. The Builder: Generated, Edited & Pinned State

> **Assessment Challenge**: *"Regenerating one section must not discard edits the user has made elsewhere, and a question the user wrote or edited by hand must survive a regeneration of its category."*

### Our State Solution:
Every question in the builder tracks:
- `origin`: `'generated' | 'edited' | 'manual'`
- `isPinned`: `boolean`

```typescript
// When a category regeneration is triggered:
const manualAndPinned = kit.questions.filter(
  (q) => q.category === targetCategory && (q.origin === 'manual' || q.origin === 'edited' || q.isPinned)
);

// Newly regenerated questions are merged alongside preserved user work:
const updatedQuestions = [...otherCategoryQuestions, ...manualAndPinned, ...regeneratedNewQuestions];
```

- Any inline edit made by the user automatically marks `origin = 'edited'` and `isPinned = true`.
- Hand-created questions receive `origin = 'manual'` and `isPinned = true`.
- During regeneration, the backend and frontend filter out only pristine generated questions, completely preserving user custom content.

---

## 8. Deterministic Schedule Allocation

Per Section 8, schedule allocation is **pure arithmetic performed in TypeScript, not by the LLM**:

1. **Priority Weighting**: Questions covering `must` requirements receive an initial +1000 weight bonus. Additional weight is assigned based on difficulty (`L3: 40`, `L2: 20`, `L1: 10`) and category priority.
2. **Early Landing**: Highest-weight topics land on Day 1 and earlier days, ensuring demanding concepts are mastered before the interview eve.
3. **Exact Day Distribution**:
   - When `days <= questions.length`: Material is partitioned into contiguous buckets across exactly `days`.
   - When `days > questions.length` (e.g. 30 or 60 days): Primary questions are distributed over early days, and remaining days are allocated for cyclical spaced repetition and targeted deep dives.
4. **Integer Minutes**: Each day calculates duration as integer minutes based on question volume and complexity (30–120 minutes).
5. **Coverage Guarantee**: Programmatically validates that every `must` requirement appears in the schedule.

---

## 9. Practice Mode & Creative Feature

### Practice Mode
- Active recall flashcard deck with flip animation and keyboard controls (`Space` to flip, `1` / `2` / `3` for Low / Medium / High confidence).
- Progress tracker reporting percentage covered and confidence breakdown.
- Smart Session Sorter that reorders upcoming rounds by prioritizing unreviewed and low-confidence cards.

### Optional Creative Feature: AI Mock Interview Simulator
- Located within each kit at `/kit/:id` and via dedicated simulation controls.
- Allows candidates to conduct real-time mock interviews on any question from their kit.
- Supports voice-to-text / written answers and returns an AI assessment scoring accuracy, communication, technical depth, and actionable improvement tips.

---

## 10. Key Design Decisions, Trade-offs & Limitations

1. **Single Client Router inside Next.js Shell**:
   - *Decision*: Centralized routing via `react-router-dom` in `Routing.tsx` wrapped by Next.js `layout.tsx` and wildcard rewrites.
   - *Trade-off*: Sacrifices native Next.js nested folder routing in exchange for instant page transitions, zero client state thrashing, and a clean, maintainable single-router entry point.
2. **Honest Reporting over Fabrication**:
   - *Decision*: When given a two-line stub job description or a company with no public careers page, the pipeline reports a concise, honest brief rather than hallucinating requirements.
3. **Paced Rate Limiting**:
   - *Decision*: A minimum inter-request interval (`minIntervalMs = 600`) and exponential backoff ensure the application operates stably within free-tier API limits.

---

## 11. Deployment Guide

### Frontend (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api`
4. Deploy.

### Backend (Render / Railway)
1. Create a Web Service pointing to the repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
   - `GEMINI_API_KEY=<your-gemini-api-key>`
   - `JWT_SECRET=<your-jwt-secret>`
   - `PORT=5000`
   - `NODE_ENV=production`
   - `ALLOW_LOCAL_URLS=false`
