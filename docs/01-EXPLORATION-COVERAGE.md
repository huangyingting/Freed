# Systematic Exploration Coverage & Observed Behavior (`getfreed.ai` & `secure.getfreed.ai`)

## 1. Executive Summary
Using Playwright (`chromium`), we systematically explored both the public marketing portal (`https://www.getfreed.ai/`) and the authenticated clinical AI scribe application (`https://secure.getfreed.ai/`) using a provisioned temporary email account (`dr.alex.rivera.732444@maxxspace.com` via `api.mail.tm`). We captured **35+ high-resolution screenshots** (`exploration/screenshots/`) and **complete API/DOM traces** (`exploration/*.json`) across Desktop (`1440x900`), Tablet (`768x1024`), and Mobile (`390x844`) viewports.

---

## 2. Route & Screenshot Inventory

### 2.1 Public Marketing Routes (`https://www.getfreed.ai`)
| # | URL | Viewport | Screenshot | Key Observed Features & UX Patterns |
|---|-----|----------|------------|-------------------------------------|
| 1 | `https://www.getfreed.ai/` | Desktop (`1440x900`) | `01-home-desktop.png`, `01-home-desktop-full.png` | Hero ("Focus on people, not paperwork"), Clinician vs Front Desk toggle, product pillars (AI Scribe, Clinical Evidence, Coding Assistant, Front Desk), social proof (32.5M+ visits transcribed), pricing preview ($39/mo Scribe, $149/mo Front Desk). |
| 2 | `https://www.getfreed.ai/` | Tablet (`768x1024`) | `02-home-tablet.png` | Responsive 2-column grid adaptation, sticky header CTA. |
| 3 | `https://www.getfreed.ai/` | Mobile (`390x844`) | `03-home-mobile.png`, `03b-home-mobile-menu.png` | Single-column mobile layout, hamburger drawer navigation. |
| 4 | `https://www.getfreed.ai/features` | Desktop (`1440x900`) | `04-features-desktop.png` | 3-stage clinical workflow: `01 · THE VISIT` (Pre-chart, ambient capture, dictation, 90+ languages), `02 · THE NOTE` (Clinician templates, style learning, Ask Freed), `03 · THE FOLLOW-THROUGH` (Instructions, letters, ICD-10/CPT codes, EHR push). |
| 5 | `https://www.getfreed.ai/clinical-evidence` | Desktop (`1440x900`) | `05-clinical-evidence-desktop.png` | Point-of-care medical QA grounded in the active patient visit, 50+ curated sources (PubMed, Cochrane, FDA, CDC, NIH, NEJM, WHO, AAFP), PHI de-identification before query, zero pharma ads. |
| 6 | `https://www.getfreed.ai/coding-assistant` | Desktop (`1440x900`) | `06-coding-assistant-desktop.png` | Automated ICD-10 & CPT code recommendations, E/M level justification, payer specificity recommendations, clinic coding impact metrics. |
| 7 | `https://www.getfreed.ai/ehr-push` | Desktop (`1440x900`) | `07-ehr-push-desktop.png` | One-click field mapping and note transfer into browser-based EHRs. |
| 8 | `https://www.getfreed.ai/pricing` | Desktop (`1440x900`) | `08-pricing-desktop.png` | 4 tiers: Starter ($39/mo), Core ($79/mo), Premier ($119/mo, 7-day free trial default), Groups (Custom). Full feature comparison matrix & FAQ accordion. |
| 9 | `https://www.getfreed.ai/front-desk` | Desktop (`1440x900`) | `09-front-desk-desktop.png` | AI Front Desk agent for inbound/outbound patient calls, scheduling, intake. |
| 10 | `https://www.getfreed.ai/how-it-works` | Desktop (`1440x900`) | `11-how-it-works-desktop.png` | Step-by-step interactive walkthrough of recording, reviewing, and pushing notes. |
| 11 | `https://www.getfreed.ai/specialty/*` | Desktop (`1440x900`) | `13-specialty-nurse-practitioners-desktop.png`, `14-specialty-family-medicine-desktop.png`, `15-specialty-internal-medicine-desktop.png` | Specialty-tailored landing pages with custom SOAP examples. |
| 12 | `https://www.getfreed.ai/non-existent-route-404-test` | Desktop (`1440x900`) | `99-public-404.png` | Custom 404 Not Found error state with return-home CTA. |

---

### 2.2 Authentication & Onboarding Routes (`https://secure.getfreed.ai`)
| # | URL | Viewport | Screenshot | Key Observed Features, APIs & Edge/Error States |
|---|-----|----------|------------|-------------------------------------------------|
| 13 | `https://secure.getfreed.ai/` | Desktop | `21-auth-login-desktop.png`, `22-auth-login-error-state.png`, `23-auth-forgot-password.png` | Email/password sign-in, Google OAuth, SSO login, Forgot Password modal, inline validation error states. |
| 14 | `https://secure.getfreed.ai/signup` | Desktop | `20-auth-signup-desktop.png`, `24-auth-signup-validation-error.png`, `25-auth-signup-filled.png` | 7-day trial signup (no credit card required), live password strength indicator ("Great" + Password tips), HIPAA/BAA agreement checkbox, email deliverability verification via `GET /api/validate_user_email`. |
| 15 | `https://secure.getfreed.ai/onboarding-personalization` | Desktop | `27-onboarding-step1-empty.png`, `28-onboarding-specialty-dropdown.png`, `29-onboarding-step1-filled.png`, `30a-onboarding-clinician-count-options.png`, `30b-onboarding-ehr-options.png`, `30c-onboarding-step2-filled.png`, `31-main-app-initial.png` | **Step 1**: Specialty selector (142+ specialties), First Name, Last Name, Clinical Title (`MD, NP, etc.`) with live preview card ("New Note — Signed, Alex Rivera, MD"). **Step 2**: Practice size (`Just me (solo practice)`, `2 to 9`, `10 to 49`, `50 or more`) and EHR selector (180+ EHRs). **Step 3**: Animated specialty provisioning screen ("Building your Family Medicine experience"). |

---

### 2.3 Authenticated Application Routes (`https://secure.getfreed.ai`)
| # | URL | Viewport | Screenshot | Key Observed Features & Data Flows |
|---|-----|----------|------------|------------------------------------|
| 16 | `https://secure.getfreed.ai/nux` | Desktop | `32-workspace-landing-desktop.png` | Welcome modal (`aiux-welcome-modal`: "Your documentation just got faster"), automatic demo visit creation (`POST /api/generate_example_visits_aiux`). |
| 17 | `https://secure.getfreed.ai/record` | Desktop | `33-auth-welcome-modal.png`, `37-auth-new-visit.png`, `38-auth-visit-search.png`, `39-auth-visit-filter-menu.png` | 3-pane workspace: Left Sidenav (`Visits`, `Templates`, `EHR Push`, `Subscribe`, `Settings`, `Help`, `Avatar Menu`), Collapsible Schedule/Visit List panel (`New visit`, `Active visits` vs `Trash` filter, Date filter, Search bar, Multi-select + Move to Trash), Main Capture workspace (`PatientNameForVisit-TextField`, `+ add pronoun`, `Select Template`, `Capture` button, `Upload recording`, `Upload transcript`, Microphone selector & live audio level meter popup). |
| 18 | `https://secure.getfreed.ai/visit/:id` | Desktop | `35-auth-visit-selected.png`, `50-auth-john-smith-visit.png`, `51-auth-visit-template-dropdown.png`, `52-auth-visit-pronoun-menu.png`, `53-auth-active-recording.png`, `57-auth-clinical-evidence-complete.png` | Patient encounter view (`John Smith · Demo visit`). Pronoun menu (`He/Him`, `She/Her`, `They/Them`). Template selector (`Returning Patient`, `New Patient`, `Acute Medical Visit`, `Follow-Up Visit`). Active recording banner (`00:05`, `Resume`, `End visit`). Right panel: **AI Chat & Clinical Evidence** with cited medical answers (`diabetesjournals.org`). |
| 19 | `https://secure.getfreed.ai/templates` | Desktop | `43-auth-templates-library.png`, `44b-auth-templates-freed-library.png`, `44c-auth-templates-phrases.png`, `58-auth-new-template-modal.png`, `59-auth-new-phrase-modal.png` | **My library** (Learned templates vs Structured templates), **Freed library** (`?libraryId=freed`, specialty-curated templates), **Phrases** (`?libraryId=dot-phrases`, `/` shortcut expansion macros). Includes **Teach Freed your note style** modal (upload/paste sample SOAP note or duplicate from library) and **New phrase** modal (`/shortcut` + content). |
| 20 | `https://secure.getfreed.ai/subscribe` | Desktop | `41-auth-subscribe-plans.png` | In-app plan selector with `Monthly` / `Annually` toggle, seat count dropdowns, `Starter ($39/mo)`, `Core ($79/mo)`, `Premier ($119/mo - Your trial / Most popular)`, `Groups (Contact sales)`. |
| 21 | `https://secure.getfreed.ai/settings/preferences` | Desktop | `40-auth-settings-panel.png` | Security (Change password, Change email, 2FA), Note retention toggle, Patient title preference (`Patient` vs `Client`), Freed AI disclosure toggle, Hide headers toggle, Theme mode (`Light`, `Dark`, `System`), EHR push preferences. |
| 22 | `https://secure.getfreed.ai/settings/profile` | Desktop | `46-auth-settings-profile.png` | Clinician profile management: First name, Last name, Role at practice (`Clinical staff`), Clinical title (`MD`), Specialty (`Family Medicine`), EHR (`aarista` / `Epic` / `athenahealth`). |
| 23 | `https://secure.getfreed.ai/settings/members` | Desktop | `47-auth-settings-members.png` | Team seat counter (`1 of 1 seats used`), `Invite members` button, paginated team table (`Name`, `Email`, `Role`, `Time last seen`, `Days left in trial`). |
| 24 | `https://secure.getfreed.ai/settings/invoices` | Desktop | `48-auth-settings-subscription.png` | Active trial/subscription badge (`Premier Trial · Ends on Oct 25, 2026`), billing management & invoices. |
| 25 | `https://secure.getfreed.ai/settings/connections` | Desktop | `45-auth-ehr-push-page.png`, `49-auth-settings-connections.png` | Integrations hub: **Freed Extension** (`/settings/connections/extension?ehr=...`) for 1-click EHR push and **Zoom** telehealth integration. |
| 26 | `https://secure.getfreed.ai/visit/:id` | Tablet & Mobile | `55-auth-workspace-tablet.png`, `56-auth-workspace-mobile.png` | Responsive adaptation: bottom navigation bar (`Visits`, `Templates`, `EHR Push`, `Subscribe`), compact top action bar (`AI Chat`, `End visit`, `Resume`, timer), slide-over visit drawer. |

---

## 3. Observed Backend API Contracts & Data Structures

During authenticated Playwright exploration, we captured the exact JSON structures used by Freed's backend:

1. **`GET /api/user_metadata`**:
   - Fields: `sub`, `email`, `email_verified`, `access_level` (`"admin"`), `specialty` (`"Family Medicine"`), `specialty_group` (`"Medicine"`), `profile_ehr_type`, `subscription_id`, `total_seats`, `userCreatedAt`.
2. **`GET /api/user_templates`**:
   - Supports two distinct template models:
     - **`canonical` (Learned Templates)**: Stores full exemplar text for `hpi`, `objective`, `anp` (Assessment & Plan), and `instructions` (Patient Instructions), plus metadata (`name`, `description`, `is_favorite`, `is_default`, `autoLearnEnabled`, `source: "User" | "Freed"`).
     - **`structural` (Structured Templates)**: Stores arrays of section descriptor objects for `hpi`, `objective`, and `anp`, where each section has `{ type, format: "paragraph" | "list", header, enabled, showHeader, innerSections }`.
3. **`POST /api/generate_example_visits_aiux`**:
   - Provisions a starter demo patient (`John Smith`, 65yo male with CAD, HTN, dyslipidemia, T2DM) and demo visit (`visitIds: [...]`) so new clinicians can immediately test note generation, Clinical Evidence, and Coding Assistant.
4. **`POST /api/predicted_one_liner_summary`**:
   - Generates a clinical 1-liner summary at the top of the Assessment & Plan (`"65-year-old male with coronary artery disease status post PCI with stent to LAD (2020), hypertension, dyslipidemia, and type 2 diabetes mellitus, presenting for routine follow-up."`).
5. **`POST /api/asr/visit-started`**:
   - Signals start of ambient audio/speech capture for a visit.
