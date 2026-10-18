# System Architecture & Data Model

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                        CLIENT BROWSER (Desktop / Tablet / Mobile)                 |
|                                                                                   |
|  +-----------------------+  +-------------------------+  +---------------------+  |
|  | Public Marketing UI   |  | Auth & 2-Step           |  | 3-Pane Clinical     |  |
|  | /, /features, /pricing|  | Onboarding Wizard       |  | Scribe Workspace    |  |
|  | /clinical-evidence    |  | /login, /signup,        |  | /record, /visit/:id |  |
|  | /coding-assistant     |  | /onboarding-...         |  | /templates, /settings| |
|  +-----------+-----------+  +------------+------------+  +----------+----------+  |
|              |                           |                          |             |
|  +-----------v---------------------------v--------------------------v----------+  |
|  | Ambient Audio Recorder (Web Audio API / MediaRecorder / Live Speech Sim)    |  |
|  | + Dot-Phrase (/) Expansion Engine + Theme & State Manager                   |  |
+--------------+---------------------------+--------------------------+-------------+
               | HTTPS / JSON              | Auth.js Session Cookie   |
+--------------v---------------------------v--------------------------v-------------+
|                         NEXT.JS APP ROUTER SERVER LAYER                           |
|                                                                                   |
|  +-----------------------+  +-------------------------+  +---------------------+  |
|  | Auth.js (NextAuth v5) |  | Clinical Scribe &       |  | Clinical Evidence & |  |
|  | Credentials + RBAC    |  | Style Learning Engine   |  | Coding Strategist   |  |
|  | Middleware Guards     |  | SOAP / ICD-10 / Letters |  | Cited Medical QA    |  |
|  +-----------+-----------+  +------------+------------+  +----------+----------+  |
|              |                           |                          |             |
|              +---------------------------+--------------------------+             |
|                                          |                                        |
|                               +----------v----------+                             |
|                               |   Prisma ORM Layer  |                             |
|                               +----------+----------+                             |
+------------------------------------------|----------------------------------------+
                                           |
                     +---------------------+---------------------+
                     |                                           |
         +-----------v------------+                 +------------v-----------+
         | SQLite (Local / CI)    |                 | PostgreSQL (Production)|
         | file:./dev.db          |                 | Docker / Cloud Managed |
         +------------------------+                 +------------------------+
```

---

## 2. Entity-Relationship Data Model

### Core Entities
1. **`User`**:
   - Stores clinician credentials, profile (`firstName`, `lastName`, `clinicalTitle`, `specialty`, `specialtyGroup`, `practiceSize`, `profileEhrType`), onboarding state (`onboardingCompleted`), role (`admin`, `clinician`, `medical_assistant`), preferences (`retentionDays`, `patientTitle`, `aiDisclosureEnabled`, `hideEmptyHeaders`, `themeMode`, `ehrAutoPush`), and subscription (`planTier`, `billingCycle`, `trialEndsAt`, `totalSeats`).
2. **`Visit`**:
   - Represents a patient encounter (`id`, `userId`, `patientName`, `pronouns`, `visitDate`, `visitMode`, `status`: `"new"` | `"recording"` | `"paused"` | `"completed"` | `"signed"` | `"trash"`, `durationSeconds`, `isDemo`).
   - Clinical artifacts: `preChartNotes`, `transcript`, `oneLiner`, `hpi`, `objective`, `anp` (Assessment & Plan), `instructions` (Patient Instructions), `instructionsLang`, `codingJson` (ICD-10, CPT, E/M level, rationale), `lettersJson` (Referral, Work/School Excuse, Prior Auth), `ehrPushStatus`, `ehrPushedAt`, `templateId`, `templateName`.
3. **`Template`**:
   - Supports both Freed `canonical` (Learned SOAP templates) and `structural` (JSON section block templates), plus `source` (`"User"` | `"Freed"`), `specialty`, `isFavorite`, `isDefault`, `autoLearnEnabled`, and `contentJson`.
4. **`DotPhrase`**:
   - Stores reusable `/` macro shortcuts (`id`, `userId`, `shortcut`, `content`, `visibility`: `"personal"` | `"team"`).
5. **`EvidenceMessage`**:
   - Stores point-of-care AI Chat & Clinical Evidence conversation turns per visit (`id`, `visitId`, `role`: `"user"` | `"assistant"`, `mode`: `"evidence"` | `"magic_edit"`, `content`, `citationsJson`, `createdAt`).
6. **`TeamMember`**:
   - Stores clinic team seats (`id`, `ownerId`, `name`, `email`, `role`, `status`, `lastSeenAt`, `daysLeftInTrial`).
7. **`BillingInvoice`**:
   - Tracks subscription invoices and plan upgrades (`id`, `userId`, `planTier`, `billingCycle`, `seats`, `amountCents`, `status`, `periodStart`, `periodEnd`).

---

## 3. Prisma Schema Compatibility (SQLite & PostgreSQL)
- All structured sub-documents (`contentJson`, `codingJson`, `lettersJson`, `citationsJson`, `preferencesJson`) are stored as serialized JSON strings (or native text columns parsed in a typed data-access helper) so that the exact same schema definition, migrations, and queries work identically across SQLite (`provider = "sqlite"`) and PostgreSQL (`provider = "postgresql"`).
