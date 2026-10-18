# Technical Specification

## 1. Application Route Map

### 1.1 Public & Marketing Routes
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Homepage with Clinician / Front Desk hero, interactive feature tabs, social proof, pricing preview | No |
| `/features` | Deep-dive into 01 The Visit, 02 The Note, 03 The Follow-Through | No |
| `/clinical-evidence` | Cited point-of-care medical answers & PHI protection overview | No |
| `/coding-assistant` | ICD-10, CPT, and E/M coding strategist overview & ROI calculator | No |
| `/ehr-push` | One-click browser EHR push & compatibility directory | No |
| `/pricing` | Full pricing comparison (Starter, Core, Premier, Groups) + FAQ | No |
| `/front-desk` | AI Front Desk voice/scheduling overview | No |
| `/how-it-works` | Interactive 3-step clinical scribe tour | No |

### 1.2 Authentication & Onboarding Routes
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/login` | Sign in with Email/Password, Demo Clinician 1-click login, SSO/Google UI, Forgot Password modal | Guest |
| `/signup` | 7-day free trial signup with password strength meter, BAA checkbox, email validation | Guest |
| `/onboarding-personalization` | 2-step personalization wizard (Specialty, Name, Title, Practice Size, EHR) + specialty building screen | Authenticated |

### 1.3 Authenticated Clinical Workspace Routes
| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/record` | New visit & ambient capture workspace with schedule panel & microphone test | Authenticated |
| `/visit/[id]` | Full patient visit workspace: Note Editor (HPI, Objective, A&P, Instructions), Transcript, Pre-chart, Clinical Evidence AI Chat, Coding Assistant, Letters, EHR Push | Authenticated |
| `/templates` | Templates & Phrases hub (`?libraryId=my` \| `freed` \| `dot-phrases`), Template Editor, "Teach Freed your note style" modal | Authenticated |
| `/subscribe` | Interactive plan upgrade & seat management (`Monthly` vs `Annually`, Starter/Core/Premier/Groups) | Authenticated |
| `/settings/profile` | Clinician profile, specialty, clinical title, EHR system | Authenticated |
| `/settings/preferences` | Security, note retention, patient title (`Patient`/`Client`), AI disclosure, hide headers, Dark/Light theme, EHR push preferences | Authenticated |
| `/settings/members` | Team seat management, invite member modal, role assignment (`Admin`, `Clinician`, `MA`) | Authenticated |
| `/settings/invoices` | Subscription overview, trial status, billing & invoice history | Authenticated |
| `/settings/connections` | Freed EHR Extension setup & Zoom telehealth integration | Authenticated |
| `/settings/connections/extension` | Detailed EHR Push field mapping & test simulator | Authenticated |

---

## 2. REST API Specification

| Method & Path | Purpose | Request Body / Params | Response Shape |
|---------------|---------|-----------------------|----------------|
| `GET /api/validate_user_email` | Validates email format & deliverability on signup | `?email=...` | `{ address, is_disposable_address, result: "deliverable", risk: "low" }` |
| `POST /api/auth/register` | Creates new clinician user, default templates, and demo visit | `{ email, password, agreedToBaa }` | `{ user, redirectUrl: "/onboarding-personalization" }` |
| `GET /api/user_metadata` | Returns authenticated clinician profile & subscription metadata | Session cookie | `{ id, email, firstName, lastName, clinicalTitle, specialty, profileEhrType, accessLevel, subscription, preferences }` |
| `POST /api/update_user_profile` | Updates clinician onboarding/profile & preferences | `{ firstName, lastName, clinicalTitle, specialty, practiceSize, profileEhrType, preferences }` | `{ user }` |
| `GET /api/visits` | Lists visits filtered by status (`active`, `trash`, `signed`), date, and search query | `?status=active&q=...&date=...` | `{ visits: Visit[] }` |
| `POST /api/visits` | Creates a new patient visit (or starts capture) | `{ patientName, pronouns, templateId, visitMode, preChartNotes }` | `{ visit }` |
| `GET /api/visits/[id]` | Fetches full visit details, SOAP note, transcript, coding, letters, and chat history | `id` | `{ visit }` |
| `PATCH /api/visits/[id]` | Updates visit patient name, pronouns, template, SOAP sections, transcript, status, or EHR push state | Partial `Visit` fields | `{ visit }` |
| `DELETE /api/visits/[id]` | Soft-deletes (`status: "trash"`) or permanently deletes a visit | `?permanent=true` | `{ success: true }` |
| `POST /api/visits/[id]/generate-note` | Runs the AI Medical Scribe Engine on transcript + pre-chart context + selected template | `{ transcript, templateId, visitMode, scenarioKey }` | `{ visit }` (populated with `oneLiner`, `hpi`, `objective`, `anp`, `instructions`, `codingJson`, `lettersJson`) |
| `POST /api/visits/[id]/clinical-evidence` | Answers a clinical question with peer-reviewed citations or executes a Magic Edit instruction on the note | `{ query, mode: "evidence" \| "magic_edit" }` | `{ message, updatedVisit? }` |
| `POST /api/visits/[id]/ehr-push` | Pushes mapped SOAP sections & ICD-10/CPT codes to configured EHR | `{ targetEhr, sections }` | `{ pushLog, visit }` |
| `GET /api/user_templates` | Lists user templates (`canonical` & `structural`), Freed library templates, and dot-phrases | `?libraryId=...` | `{ userTemplates, freedTemplates, dotPhrases }` |
| `POST /api/user_templates` | Creates a new template (manual, duplicated from Freed library, or learned from pasted SOAP note) | `{ name, description, templateType, specialty, content, sampleNoteText }` | `{ template }` |
| `PATCH /api/user_templates/[id]` | Updates template content, favorite/default status, or `autoLearnEnabled` | Partial `Template` | `{ template }` |
| `DELETE /api/user_templates/[id]` | Deletes a custom user template | `id` | `{ success: true }` |
| `POST /api/dot_phrases` | Creates or updates a `/shortcut` dot-phrase | `{ shortcut, content, visibility }` | `{ dotPhrase }` |
| `DELETE /api/dot_phrases/[id]` | Deletes a dot-phrase | `id` | `{ success: true }` |
| `GET /api/team` | Lists team members and seat usage | Session cookie | `{ members, totalSeats, usedSeats }` |
| `POST /api/team` | Invites a new team member or updates member role | `{ name, email, role }` | `{ member }` |
| `POST /api/subscription` | Updates subscription tier (`starter`, `core`, `premier`, `groups`), billing cycle (`monthly`, `annual`), and seat count | `{ planTier, billingCycle, seats }` | `{ subscription, invoice }` |

---

## 3. Responsive Layout & Visual Design Specification
- **Color Palette**:
  - Primary Brand Purple/Indigo (`#4F46E5` / `#6366F1` accent buttons & active states, matching `secure.getfreed.ai`'s "Capture" and "Get started" buttons)
  - Warm Ivory/Alabaster Marketing Surface (`#FAF8F5`) and Crisp Clinical Workspace Surface (`#FFFFFF` / `#F8FAFC` in light mode, `#0F172A` / `#1E293B` in dark mode)
  - Clinical Status Badges: Recording Coral (`#EF4444`), Ready Emerald (`#10B981`), Trial Amber (`#F59E0B`), Citation Sky (`#0284C7`)
- **Breakpoints**:
  - **Desktop (`>= 1024px`)**: 3-pane layout — Left Icon Rail (`72px`), Collapsible Visit Schedule Panel (`280px`), Center Note & Capture Workspace (`flex-1`), Right Clinical Evidence / Coding / EHR Dock (`360px`).
  - **Tablet (`768px - 1023px`)**: Collapsible drawer for Schedule Panel, main Note Workspace + slide-over Right Intelligence Dock.
  - **Mobile (`< 768px`)**: Sticky top recording/visit bar, full-width tabbed Note/Transcript/Evidence view, fixed bottom navigation bar (`Visits`, `Templates`, `EHR Push`, `Subscribe`, `Settings`).
