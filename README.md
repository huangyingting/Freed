# Freed — AI Medical Scribe, Clinical Evidence & 1-Click EHR Push Platform

A full-stack, production-ready implementation of the **Freed AI Medical Scribe (`getfreed.ai` / `secure.getfreed.ai`)** platform built with **Next.js (App Router)**, **Auth.js / NextAuth**, **Prisma ORM** (SQLite for local development, PostgreSQL for production), and **Tailwind CSS**.

---

## Documentation & Architecture Suite (`docs/`)

All exploration findings, screenshots (`exploration/screenshots/`), architectural decisions, and feature parity matrices are documented in `docs/`:

1. [`docs/01-EXPLORATION-COVERAGE.md`](docs/01-EXPLORATION-COVERAGE.md) — Systematic Playwright exploration of `www.getfreed.ai` and `secure.getfreed.ai` (including temporary email onboarding, 35+ screenshots across Desktop/Tablet/Mobile, and API payloads).
2. [`docs/02-ADR.md`](docs/02-ADR.md) — Architecture Decision Records (Next.js App Router, Dual SQLite/PostgreSQL Prisma Strategy, Auth.js + Email Deliverability Validation, Dual Canonical/Structural Template Engine, De-identified Clinical Evidence & Magic Edit Dock).
3. [`docs/03-PRD.md`](docs/03-PRD.md) — Product Requirements Document.
4. [`docs/04-TECHNICAL-SPEC.md`](docs/04-TECHNICAL-SPEC.md) — Route-by-Route & API Technical Specification.
5. [`docs/05-ARCHITECTURE-AND-DATA-MODEL.md`](docs/05-ARCHITECTURE-AND-DATA-MODEL.md) — System Architecture & ER Data Model.
6. [`docs/06-IMPLEMENTATION-PLAN.md`](docs/06-IMPLEMENTATION-PLAN.md) — Phased Implementation Plan.
7. [`docs/07-TASK-BACKLOG-AND-ACCEPTANCE-CRITERIA.md`](docs/07-TASK-BACKLOG-AND-ACCEPTANCE-CRITERIA.md) — Epics, User Stories & Acceptance Criteria.
8. [`docs/08-FEATURE-PARITY-MATRIX.md`](docs/08-FEATURE-PARITY-MATRIX.md) — 100% Feature Parity Verification Matrix.

---

## Quick Start (Local Development — SQLite)

```bash
# 1. Install dependencies
npm install

# 2. Apply SQLite migrations and seed demo clinical data
npm run db:setup

# 3. Start the development server on http://localhost:3000
npm run dev
```

### Demo Clinician Credentials
- **Email**: `dr.alex.rivera@getfreed.ai`
- **Password**: `FreedDemo!2026`
- Or click **"1-Click Demo Login (Dr. Alex Rivera, MD)"** on `/login`.

---

## Production Deployment (PostgreSQL + Docker)

```bash
# Launch PostgreSQL 16 + Freed Web App via Docker Compose
docker compose up --build -d

# Or run Prisma against PostgreSQL directly:
npm run db:generate:pg
npm run db:push:pg
```

---

## Testing & Verification

```bash
# Run Unit Tests (Vitest)
npm run test:unit

# Run Production Next.js Build
npm run build

# Run End-to-End Playwright Tests
npm run test:e2e
```
