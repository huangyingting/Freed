# Implementation Plan

## Phase 1: Project Scaffolding, Database & Authentication (`scaffold-nextjs`)
1. Initialize Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons) in `/home/azadmin/Freed`.
2. Configure Prisma with SQLite (`prisma/schema.prisma`) for local development and PostgreSQL (`prisma/schema.postgresql.prisma`) for production deployment.
3. Generate initial database migration and write a comprehensive seed script (`prisma/seed.ts`) that populates:
   - Demo Clinician account (`dr.alex.rivera@getfreed.ai` / `FreedDemo!2026`) + Admin account (`admin@getfreed.ai` / `FreedAdmin!2026`).
   - Default User Learned Templates (`Returning Patient`, `New Patient`) and Structural Templates (`New Patient Visit`, `Follow-Up Visit`, `Acute Medical Visit`, `Soap Compact`).
   - 12 Specialty Freed Library Templates (`Family Medicine`, `Internal Medicine`, `Pediatrics`, `Psychiatry`, `Cardiology`, `Dermatology`, `Endocrinology`, `Gastroenterology`, `OB/GYN`, `Orthopedic Surgery`, `Emergency Medicine`, `Behavioral Health`).
   - Default Dot-Phrases (`/pe`, `/ros`, `/bp`, `/dm2`, `/return`, `/warn`).
   - Rich patient visits including the canonical `John Smith` Cardiology/Internal Medicine demo visit, `Elena Rostova` Acute Asthma/URI visit, `Marcus Vance` Type 2 Diabetes & Hypertension visit, and `Sophia Chen` Pediatric Otitis Media visit.
4. Implement Auth.js / NextAuth (`/api/auth/[...nextauth]`), registration (`/api/auth/register`), email validation (`/api/validate_user_email`), and route protection middleware.

---

## Phase 2: Public Marketing Portal & Auth/Onboarding Flows (`implement-core-features` Part A)
1. Build shared responsive navigation header and footer matching `getfreed.ai`.
2. Implement Public Pages:
   - `/` (Homepage with Clinician vs Front Desk toggle, interactive product showcase, social proof metrics, pricing preview).
   - `/features`, `/clinical-evidence`, `/coding-assistant`, `/ehr-push`, `/pricing`, `/front-desk`, `/how-it-works`.
3. Implement Auth & Onboarding Pages:
   - `/login` (with email/password, 1-click Demo Clinician login, SSO/Google UI, Forgot Password modal, error states).
   - `/signup` (with live password strength meter, HIPAA/BAA agreement checkbox, disposable email validation, automatic demo visit creation).
   - `/onboarding-personalization` (2-step wizard with 142+ specialties, live signature card preview, practice size & 180+ EHR selector, and animated "Building your specialty experience" transition).

---

## Phase 3: Authenticated 3-Pane Clinical Workspace & AI Scribe Engine (`implement-core-features` Part B)
1. Build the 3-Pane Workspace Layout (`Sidenav`, `Schedule/Visit List Panel`, `Main Visit & Note Editor`, `Right Clinical Evidence & Coding Dock`) with full Desktop, Tablet, and Mobile responsiveness and Dark/Light theme support.
2. Implement **Ambient Visit Recording & Multi-Modal Capture** (`/record` & `/visit/[id]`):
   - Live microphone audio level meter & mic test popup (`test-audio-popup`).
   - `Capture` / `Pause` / `Resume` / `End visit` state machine with live timer and simulated real-time clinical dialogue streaming (plus Web Speech API & audio/transcript file upload).
3. Implement **AI Medical Scribe Note Generation Engine** (`/api/visits/[id]/generate-note`):
   - Synthesizes `oneLiner`, `hpi`, `objective`, `anp` (Assessment & Plan), `instructions`, `codingJson` (ICD-10, CPT, E/M level + MDM rationale), and `lettersJson` (Referral letter, Work/School note, Prior Auth).
4. Implement **Note Editor**:
   - Inline editable sections, `/` Dot-Phrase popup autocomplete, `Copy section`, `Copy full note`, `Learn my format` style adaptation, patient instructions language translator (`English`, `Spanish`, `French`, `Mandarin`), and pronoun selector (`He/Him`, `She/Her`, `They/Them`).
5. Implement **Right-Hand Intelligence Dock**:
   - **AI Chat & Clinical Evidence** (`/api/visits/[id]/clinical-evidence`): De-identified clinical QA with peer-reviewed citations (`diabetesjournals.org`, `PubMed`, `ACC/AHA`, `USPSTF`, `CDC`) + **Magic Edit** commands that transform the note in real time.
   - **Coding Assistant Tab**: Interactive ICD-10-CM, CPT, E/M level justification, and payer specificity recommendations.
   - **Letters & Handouts Tab**: Editable Referral, Work/School Excuse, and Prior Auth letters with 1-click copy.
   - **EHR Push Modal & Action**: Field mapping preview and 1-click push to configured EHR (`athenahealth`, `Epic`, `eClinicalWorks`, `aarista`, etc.).

---

## Phase 4: Templates Library, Phrases, Settings & Subscription (`implement-core-features` Part C)
1. Implement `/templates` with 3 tabs:
   - `My library` (Learned & Structured templates, edit drawer, `Teach Freed your note style` modal).
   - `Freed library` (`?libraryId=freed`, specialty filter, 1-click duplicate to My Library).
   - `Phrases` (`?libraryId=dot-phrases`, create/edit/delete `/shortcut` dot-phrases).
2. Implement `/subscribe`:
   - Monthly vs Annual toggle, seat selector, Starter ($39/mo), Core ($79/mo), Premier ($119/mo), Groups, instant plan switch.
3. Implement `/settings/*`:
   - `/settings/profile`, `/settings/preferences`, `/settings/members`, `/settings/invoices`, `/settings/connections` (plus `/settings/connections/extension`).

---

## Phase 5: Automated Testing, Verification & Production Deployment Config (`implement-tests-deploy`)
1. Write unit/integration tests (`vitest`) for the AI Scribe synthesis engine, template formatting, dot-phrase expansion, coding assistant, and email validation.
2. Write comprehensive Playwright E2E tests (`e2e/freed.spec.ts`) covering public pages, signup/onboarding, login, ambient capture & SOAP note generation, dot-phrases, Clinical Evidence AI chat, Coding Assistant, EHR push, Templates & Phrases CRUD, Settings, Subscription upgrade, and Mobile/Tablet responsive viewports.
3. Add `Dockerfile`, `docker-compose.yml` (with PostgreSQL service), and `.env.example`.
