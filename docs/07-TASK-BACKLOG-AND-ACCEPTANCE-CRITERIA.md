# Task Backlog & Acceptance Criteria

## Epic 1: Public Marketing & Product Discovery
| ID | Task | Priority | Acceptance Criteria (Testable) |
|----|------|----------|--------------------------------|
| TB-101 | Public Landing Page (`/`) | P0 | **Given** a visitor on `/`, **When** they toggle "For clinicians" and "For front desk" or inspect product pillars (AI Scribe, Clinical Evidence, Coding Assistant, EHR Push), **Then** the hero, interactive preview cards, social proof counters, and CTAs render accurately across desktop and mobile. |
| TB-102 | Product & Pricing Pages (`/features`, `/clinical-evidence`, `/coding-assistant`, `/ehr-push`, `/pricing`, `/front-desk`, `/how-it-works`) | P0 | **Given** a visitor navigating the top navbar links, **When** they open each product page and toggle Monthly/Annual pricing on `/pricing`, **Then** plan rates ($39/$79/$119) and feature comparison matrices update dynamically. |
| TB-103 | Custom 404 Error State | P1 | **Given** a request to an unknown route, **When** the page renders, **Then** a clean 404 screen with navigation back to `/` and `/record` is displayed. |

---

## Epic 2: Authentication, Email Validation & 2-Step Onboarding
| ID | Task | Priority | Acceptance Criteria (Testable) |
|----|------|----------|--------------------------------|
| TB-201 | Trial Signup & Email Validation (`/signup`) | P0 | **Given** a new clinician on `/signup`, **When** they submit an empty form or disposable/invalid email, **Then** inline validation errors appear; **When** they enter a valid email, strong password, and check the HIPAA/BAA box, **Then** an account and demo visit (`John Smith`) are provisioned and they are redirected to `/onboarding-personalization`. |
| TB-202 | Sign In & Forgot Password (`/login`) | P0 | **Given** an existing user on `/login`, **When** they enter invalid credentials, **Then** an error banner appears; **When** they sign in with valid credentials (or click Demo Clinician Login), **Then** they are authenticated and redirected to `/record`. |
| TB-203 | 2-Step Onboarding Personalization (`/onboarding-personalization`) | P0 | **Given** a newly registered clinician, **When** they select Specialty (`Family Medicine`), enter First/Last Name and Title (`MD`) on Step 1, and select Practice Size and EHR on Step 2, **Then** the live note signature preview updates, the specialty building screen displays, and the user lands on `/record` with their profile saved. |

---

## Epic 3: Clinical Visits, Ambient Recording & SOAP Note Generation
| ID | Task | Priority | Acceptance Criteria (Testable) |
|----|------|----------|--------------------------------|
| TB-301 | Schedule & Visit List Management (`/record`, `/visit/[id]`) | P0 | **Given** an authenticated clinician, **When** they filter by `Active visits` / `Trash`, search by patient name, or select visits to move to Trash, **Then** the visit list updates immediately and persists in the database. |
| TB-302 | Ambient Capture, Audio Test & Transcript Upload | P0 | **Given** a new or active visit, **When** the clinician opens the Microphone Test popup, selects a clinical scenario or enters a transcript, and clicks `Capture` -> `End visit`, **Then** the recording timer runs, transcript streams, and a structured SOAP note is generated. |
| TB-303 | Structured SOAP Note Editor & Dot-Phrases (`/`) | P0 | **Given** a generated visit note (`One-Liner`, `HPI`, `Objective`, `Assessment & Plan`, `Patient Instructions`), **When** the clinician edits any section, types `/` to insert a dot-phrase, changes pronouns (`He/Him`, `She/Her`, `They/Them`), or clicks `Copy Note` / `Copy Section`, **Then** changes auto-save and clipboard copy confirmation appears. |

---

## Epic 4: Clinical Evidence AI Chat, Coding Assistant, Letters & EHR Push
| ID | Task | Priority | Acceptance Criteria (Testable) |
|----|------|----------|--------------------------------|
| TB-401 | Clinical Evidence Cited QA & Magic Edit | P0 | **Given** a visit in `/visit/[id]`, **When** the clinician asks a medical question in the AI Chat / Clinical Evidence panel, **Then** a patient-contextualized answer with peer-reviewed source citations (`diabetesjournals.org`, `PubMed`, `ACC/AHA`) is returned and saved; **When** they issue a Magic Edit instruction, **Then** the note sections update accordingly. |
| TB-402 | Medical Coding Strategist (ICD-10, CPT, E/M) | P0 | **Given** a completed visit note, **When** the clinician views the Coding Assistant tab, **Then** justified ICD-10 diagnosis codes, CPT codes, E/M level (`99214`), and payer specificity recommendations are displayed and selectable. |
| TB-403 | Letters Generator & One-Click EHR Push | P0 | **Given** a completed visit note, **When** the clinician generates a Referral or Work/School Excuse letter or clicks `Push to EHR`, **Then** the letter is drafted and the EHR Push modal maps sections and records a verified push timestamp. |

---

## Epic 5: Templates, Dot-Phrases, Settings & Subscription Management
| ID | Task | Priority | Acceptance Criteria (Testable) |
|----|------|----------|--------------------------------|
| TB-501 | Templates Library & "Teach Freed Your Style" (`/templates`) | P0 | **Given** `/templates`, **When** the clinician switches between `My library`, `Freed library`, and `Phrases`, duplicates a specialty template, or pastes a sample SOAP note into `Teach Freed your note style`, **Then** the new Learned Template is created and available in the visit template selector. |
| TB-502 | Dot-Phrases CRUD (`/templates?libraryId=dot-phrases`) | P0 | **Given** the Phrases tab, **When** the clinician clicks `New phrase`, enters shortcut ` cardio ` (`/cardio`) and content, and saves, **Then** `/cardio` appears in the table and in the note editor `/` autocomplete menu. |
| TB-503 | Settings (`Profile`, `Preferences`, `Members`, `Subscription`, `Connections`) & `/subscribe` | P0 | **Given** `/settings/*` and `/subscribe`, **When** the clinician updates profile/EHR, toggles Dark Mode or Note Retention, invites a team member, or upgrades their subscription plan, **Then** all changes persist in the database and reflect immediately in the UI. |
