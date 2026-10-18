# Architecture Decision Records (ADR)

## ADR-001: Full-Stack Framework — Next.js (App Router) with TypeScript & Tailwind CSS
- **Status**: Accepted
- **Context**: We need a unified, high-performance web application serving both public marketing pages (`/`, `/features`, `/clinical-evidence`, `/coding-assistant`, `/ehr-push`, `/pricing`) and a rich, low-latency 3-pane authenticated clinical workspace (`/record`, `/visit/[id]`, `/templates`, `/subscribe`, `/settings/*`).
- **Decision**: Use the latest stable **Next.js App Router** with React Server Components (RSC) for initial data hydration and client components for interactive clinical workflows (live audio recording, waveform visualization, inline SOAP editing, dot-phrase `/` autocomplete, AI chat).
- **Consequences**: Single deployable unit, strict end-to-end TypeScript safety, zero CORS friction between UI and `/api/*` route handlers.

---

## ADR-002: Authentication & Role-Based Authorization — Auth.js / NextAuth v5
- **Status**: Accepted
- **Context**: Freed supports email/password login, 7-day free-trial registration with email validation, OAuth/SSO hooks, and team-based role access (`admin`, `clinician`, `medical_assistant`).
- **Decision**: Implement **Auth.js (NextAuth)** with the Credentials provider (bcrypt password hashing) and session callbacks enriching `session.user` with `id`, `role`, `specialty`, `clinicalTitle`, `onboardingCompleted`, and `organizationId`. Protect authenticated routes (`/record`, `/visit/*`, `/templates`, `/subscribe`, `/settings/*`) via Next.js middleware and server-side session guards.
- **Consequences**: Stateless JWT/cookie sessions work seamlessly across local SQLite development, Playwright E2E tests, and containerized PostgreSQL production deployments.

---

## ADR-003: Dual-Database Persistence Strategy — Prisma ORM with SQLite (Local) & PostgreSQL (Production)
- **Status**: Accepted
- **Context**: The user explicitly requires SQLite for zero-friction local development and automated testing, alongside PostgreSQL for production scalability and HIPAA-grade relational integrity.
- **Decision**: Use **Prisma ORM** with scalar/JSON-compatible models that work identically on SQLite (`prisma/schema.prisma`, `file:./dev.db`) and PostgreSQL (`prisma/schema.postgresql.prisma`, `postgresql://...`), accompanied by portable SQL migrations and deterministic seed data (`prisma/seed.ts`).
- **Consequences**: Developers and CI/E2E suites run immediately against local SQLite without external daemon dependencies, while production deployments use `schema.postgresql.prisma` via Docker Compose.

---

## ADR-004: Hybrid Ambient Capture & AI Scribe Pipeline
- **Status**: Accepted
- **Context**: Clinicians capture visits in 4 ways observed in Freed:
  1. Live microphone ambient capture (`Capture` button + audio level meter + Web Speech / MediaRecorder).
  2. Built-in Interactive Clinical Visit Simulator / Demo Audio playback (crucial for trial evaluation and deterministic testing without a live patient).
  3. Uploading an audio recording (`Upload recording`).
  4. Uploading/pasting a visit transcript or dictation (`Upload transcript`).
- **Decision**: Implement all 4 capture modalities in the browser + backend `/api/visits/[id]/generate-note`. When an external LLM API key (`OPENAI_API_KEY`) is configured, the scribe engine can call the LLM; otherwise, a deterministic, clinically rich **Medical NLP & Specialty Scribe Synthesis Engine** parses the transcript, pre-chart context, and selected template (Learned or Structured) to generate:
  - Clinical One-Liner Summary
  - Subjective / HPI (History of Present Illness, Past Medical/Surgical Hx, Medications, Allergies, Family/Social Hx, ROS)
  - Objective (Vital Signs, Physical Exam, Labs & Imaging)
  - Assessment & Plan (Problem-based A&P with clinical reasoning and actionable bulleted plans)
  - Patient Instructions (Patient-friendly summary in chosen language)
  - ICD-10 & CPT / E/M Coding Suggestions with payer specificity tips
  - Referral / Work / School Letters
- **Consequences**: 100% functional offline/local and in production without failing when external API keys are absent.

---

## ADR-005: Dual Template Engine (Canonical "Learned" Templates + Structural Block Templates) & Dot-Phrases
- **Status**: Accepted
- **Context**: Our API inspection of `GET /api/user_templates` revealed Freed's signature architecture:
  1. **Learned (`canonical`) Templates**: Store exemplar SOAP sections and support "Teach Freed your note style" (uploading/pasting an existing note or AI style learning).
  2. **Structured (`structural`) Templates**: Store configurable JSON section blocks (`format: "paragraph" | "list"`, `enabled`, `showHeader`).
  3. **Freed Specialty Library**: Pre-built templates across 20+ specialties.
  4. **Dot-Phrases (`/shortcut`)**: Typing `/` inside any note editor opens a quick-insert menu of reusable clinical snippets.
- **Decision**: Model `Template` (`templateType: "canonical" | "structural"`, `source: "User" | "Freed"`) and `DotPhrase` (`shortcut`, `content`, `visibility`) directly in Prisma and implement both the "Teach Freed Your Style" analyzer and `/shortcut` inline expansion in the note editor.

---

## ADR-006: Clinical Evidence AI Chat & Coding Strategist Panel
- **Status**: Accepted
- **Context**: In `secure.getfreed.ai/visit/:id`, the right-hand panel hosts **AI Chat & Clinical Evidence**, which de-identifies PHI, answers clinical questions grounded in the current visit, and cites trusted medical literature (`PubMed`, `ADA / diabetesjournals.org`, `AHA/ACC`, `USPSTF`, `AAFP`, `CDC`, `NEJM`), alongside **Magic Edit** note transformations ("Make the plan bulleted", "Translate patient instructions to Spanish").
- **Decision**: Build a unified right-hand dock with tabs for **AI Chat / Clinical Evidence**, **Coding Assistant (ICD-10 / CPT / E/M)**, **Letters & Handouts**, and **EHR Push Mapper**, persisting chat messages and citations per visit in Prisma.
