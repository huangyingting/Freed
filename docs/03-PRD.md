# Product Requirements Document (PRD)

## 1. Product Vision & Overview
**Freed AI Medical Scribe** is an intelligent clinical documentation, point-of-care evidence, medical coding, and EHR push platform designed for independent clinicians and multi-provider practices. It listens to patient encounters (or ingests transcripts/recordings), writes specialty-tailored SOAP notes in the clinician's personal style, answers clinical questions with peer-reviewed citations, recommends defensible ICD-10/CPT/E/M codes, drafts patient instructions and referral letters, and pushes structured sections directly to EHR systems.

---

## 2. Target Personas
1. **Solo & Independent Clinician (MD, DO, NP, PA, Behavioral Health Therapist)**
   - Needs instant setup (7-day trial, no credit card), ambient capture during in-person or telehealth visits, personal style learning ("Learn my format"), and 1-click copy/EHR push.
2. **Practice Administrator / Group Lead**
   - Needs team seat management, shared template & dot-phrase libraries, centralized billing, note retention controls, and clinic-wide coding/ROI visibility.
3. **Medical Assistant (MA) / Care Coordinator**
   - Needs pre-charting support, vital sign entry, intake context preparation, and draft review before clinician sign-off.

---

## 3. Core User Journeys & Functional Requirements

### FR-1: Public Marketing & Conversion Funnel
- **Landing & Product Pages**: `/`, `/features`, `/clinical-evidence`, `/coding-assistant`, `/ehr-push`, `/pricing`, `/how-it-works`.
- **Interactive ROI & Pricing Comparison**: Monthly vs Annual billing toggle across Starter ($39/mo), Core ($79/mo), Premier ($119/mo), and Groups tiers.

### FR-2: Account Creation, Authentication & 2-Step Onboarding Wizard
- **Sign Up (`/signup`)**: Email, password with live strength meter, HIPAA/BAA terms acceptance, email deliverability check, automatic 7-day Premier Trial provisioning (`totalSeats: 1`), and automatic demo visit creation (`John Smith · Demo visit`).
- **Sign In (`/login`)**: Email/password authentication, demo clinician quick-login, forgot password workflow.
- **Personalization Wizard (`/onboarding-personalization`)**:
  - **Step 1**: Specialty selection (142+ specialties), First Name, Last Name, Clinical Title (`MD`, `NP`, `DO`, `PA`, etc.) with live note signature preview.
  - **Step 2**: Practice clinician count (`Just me`, `2 to 9`, `10 to 49`, `50 or more`) and EHR system selection (`athenahealth`, `Epic`, `eClinicalWorks`, `DrChrono`, `Cerner`, `aarista`, etc.).
  - **Step 3**: Specialty knowledge & template provisioning screen leading into the `/record` workspace.

### FR-3: 3-Pane Clinical Workspace & Visit Lifecycle (`/record` & `/visit/[id]`)
- **Left Navigation Rail**: `Visits`, `Templates`, `EHR Push`, `Subscribe`, `Settings`, `Help`, `User Profile Menu`.
- **Schedule & Visit List Panel**:
  - `New visit` CTA, pin/collapse schedule panel.
  - Filter between `Active visits`, `Archived / Signed`, and `Trash`.
  - Date filter (`All dates`, `Today`, `Last 7 days`) and instant search by patient name or clinical summary.
  - Multi-select checkboxes with bulk `Move to Trash` and `Restore`.
- **Ambient Capture & Multi-Modal Input**:
  - Patient Name inline editing, Pronoun selector (`He/Him`, `She/Her`, `They/Them`), Visit mode (`In-person`, `Telehealth`, `Dictate`), and Template selector (`Returning Patient`, `New Patient`, `Acute Medical Visit`, `Follow-Up Visit`, `Psychiatric Evaluation`, `Pediatric Well-Child`).
  - **Microphone Test & Audio Level Meter** popup.
  - **Capture / Pause / Resume / End Visit** live recording workflow with timer, live streaming transcript, and realistic clinical simulation presets (Cardiology/Follow-up, Acute URI/Asthma, Behavioral Health/Anxiety, Pediatric Ear Pain) plus custom audio/transcript upload (`Upload recording`, `Upload transcript`).

### FR-4: AI Note Editor, Style Learning & Dot-Phrases
- **Structured SOAP Sections**:
  - **Clinical One-Liner Summary** (predicted 1-line patient synthesis).
  - **Subjective / HPI** (Chief Complaint, HPI, PMH, PSH, Medications, Allergies, Family/Social Hx, Review of Systems).
  - **Objective** (Vital Signs, Physical Exam, Lab/Imaging Results).
  - **Assessment & Plan** (Problem-grouped Assessment & Plan in paragraph or bulleted list format).
  - **Patient Instructions** (Clear, empathetic patient handout with multilingual translation support: English, Spanish, French, Mandarin).
- **Per-Section & Full-Note Actions**:
  - Inline editing with auto-save.
  - `/` **Dot-Phrase Autocomplete**: Typing `/pe`, `/ros`, `/bp`, or any custom phrase expands reusable clinical text inline.
  - `Copy section` and `Copy full note` buttons with visual confirmation.
  - `Learn my format` toggle to adapt template structure from clinician edits.

### FR-5: Right-Hand Intelligence Dock (Clinical Evidence, Magic Edit, Coding Assistant, Letters, EHR Push)
- **AI Chat & Clinical Evidence**:
  - Ask point-of-care medical questions grounded in the current patient's chart (with automatic PHI scrubbing badge).
  - Returns structured, cited clinical answers with journal/guideline badges (`ADA Standards of Care`, `ACC/AHA`, `USPSTF`, `AAFP`, `PubMed`, `CDC`).
  - Supports **Magic Edit** commands ("Make Assessment & Plan concise bullets", "Add smoking cessation counseling to plan", "Translate instructions to Spanish") that directly update the note.
- **Coding Assistant**:
  - Suggests justified **ICD-10-CM** diagnosis codes, **CPT** procedure codes, and **E/M Level** (`99213`, `99214`, `99215`, `99204`) with MDM rationale and payer specificity recommendations.
- **Letters & Handouts Generator**:
  - Generates Specialist Referral Letters, Work/School Excuse Notes, and Prior Authorization Justification letters from the visit context.
- **One-Click EHR Push**:
  - Maps HPI, Objective, Assessment & Plan, Instructions, and ICD-10/CPT codes to the clinician's configured EHR fields (`athenahealth`, `Epic`, `eClinicalWorks`, etc.) and logs the push event with timestamp and status.

### FR-6: Templates Library & Dot-Phrases Manager (`/templates`)
- **My Library**: View, edit, favorite, duplicate, or delete Learned (`canonical`) and Structured (`structural`) templates.
- **Teach Freed Your Note Style Modal**: Paste or upload an existing SOAP note to automatically extract a new Learned Template, or build/customize section blocks (`paragraph` vs `list`, `showHeader`, `enabled`).
- **Freed Specialty Library (`?libraryId=freed`)**: Browse and clone 12+ specialty-tuned templates (Family Medicine, Internal Medicine, Pediatrics, Psychiatry, Cardiology, Dermatology, Endocrinology, Gastroenterology, OB/GYN, Orthopedic Surgery, Emergency Medicine, Behavioral Health).
- **Phrases (`?libraryId=dot-phrases`)**: Create, edit, search, and delete `/shortcut` dot-phrases with Personal or Team visibility.

### FR-7: Settings, Team Management, Connections & Subscription (`/settings/*` & `/subscribe`)
- **Profile (`/settings/profile`)**: First/Last Name, Role at practice, Clinical title, Specialty, EHR selection, Signature preview.
- **Preferences & Security (`/settings/preferences`)**: Password change, Email change, 2FA toggle, Note Retention policy (7 days, 30 days, 90 days, Forever), Patient title preference (`Patient` vs `Client`), Freed AI disclosure footer toggle, Hide empty headers toggle, Theme mode (`Light`, `Dark`, `System`), EHR Push field mapping preferences.
- **Team Members (`/settings/members`)**: Seat usage indicator (`X of Y seats used`), Invite member modal (Name, Email, Role: `Admin`, `Clinician`, `Medical Assistant`), member role management & removal.
- **Subscription & Billing (`/settings/invoices` & `/subscribe`)**: Current plan status, trial countdown, Monthly/Annual plan upgrade/switch (`Starter`, `Core`, `Premier`, `Groups`), seat count adjustment, invoice history table.
- **Integrations & Connections (`/settings/connections`)**: Freed EHR Chrome Extension configuration & test push, Zoom Telehealth connection toggle.
