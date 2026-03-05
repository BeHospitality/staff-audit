# Staff Audit — Technical Audit Report

**Prepared:** 5 March 2026  
**Application:** Staff Audit by Be Connect  
**URL:** https://staff-audit.be.ie  
**Hosting:** Lovable (Lovable Cloud with integrated Supabase backend)  
**Status:** Live in production

---

## SECTION 1: APPLICATION OVERVIEW

### Identity

- **App Name:** Staff Audit
- **Brand:** Be Connect
- **URL:** https://staff-audit.be.ie
- **Published URL:** https://staff-audit.lovable.app
- **Hosting Platform:** Lovable (React SPA with Lovable Cloud backend)

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18.3.1 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + tailwindcss-animate |
| UI Library | shadcn/ui (Radix primitives) |
| Routing | react-router-dom 6.30.1 |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth (email/password) |
| Email | Brevo (Sendinblue) via Edge Function |
| PDF Generation | jsPDF 4.1.0 |
| Charts | Recharts 2.15.4 (installed, minimal usage) |
| State Management | React useState/useEffect + TanStack React Query 5.83.0 |
| Font | Montserrat (Google Fonts) |

### NPM Dependencies (Full List)

| Package | Version |
|---|---|
| @hookform/resolvers | ^3.10.0 |
| @radix-ui/react-accordion | ^1.2.11 |
| @radix-ui/react-alert-dialog | ^1.1.14 |
| @radix-ui/react-aspect-ratio | ^1.1.7 |
| @radix-ui/react-avatar | ^1.1.10 |
| @radix-ui/react-checkbox | ^1.3.2 |
| @radix-ui/react-collapsible | ^1.1.11 |
| @radix-ui/react-context-menu | ^2.2.15 |
| @radix-ui/react-dialog | ^1.1.14 |
| @radix-ui/react-dropdown-menu | ^2.1.15 |
| @radix-ui/react-hover-card | ^1.1.14 |
| @radix-ui/react-label | ^2.1.7 |
| @radix-ui/react-menubar | ^1.1.15 |
| @radix-ui/react-navigation-menu | ^1.2.13 |
| @radix-ui/react-popover | ^1.1.14 |
| @radix-ui/react-progress | ^1.1.7 |
| @radix-ui/react-radio-group | ^1.3.7 |
| @radix-ui/react-scroll-area | ^1.2.9 |
| @radix-ui/react-select | ^2.2.5 |
| @radix-ui/react-separator | ^1.1.7 |
| @radix-ui/react-slider | ^1.3.5 |
| @radix-ui/react-slot | ^1.2.3 |
| @radix-ui/react-switch | ^1.2.5 |
| @radix-ui/react-tabs | ^1.1.12 |
| @radix-ui/react-toast | ^1.2.14 |
| @radix-ui/react-toggle | ^1.1.9 |
| @radix-ui/react-toggle-group | ^1.1.10 |
| @radix-ui/react-tooltip | ^1.2.7 |
| @supabase/supabase-js | ^2.95.3 |
| @tanstack/react-query | ^5.83.0 |
| class-variance-authority | ^0.7.1 |
| clsx | ^2.1.1 |
| cmdk | ^1.1.1 |
| date-fns | ^3.6.0 |
| embla-carousel-react | ^8.6.0 |
| input-otp | ^1.4.2 |
| jspdf | ^4.1.0 |
| lucide-react | ^0.462.0 |
| next-themes | ^0.3.0 |
| react | ^18.3.1 |
| react-day-picker | ^8.10.1 |
| react-dom | ^18.3.1 |
| react-hook-form | ^7.61.1 |
| react-resizable-panels | ^2.1.9 |
| react-router-dom | ^6.30.1 |
| recharts | ^2.15.4 |
| sonner | ^1.7.4 |
| tailwind-merge | ^2.6.0 |
| tailwindcss-animate | ^1.0.7 |
| vaul | ^0.9.9 |
| zod | ^3.25.76 |

### File Count

- **Total source files (src/):** ~70 custom files
- **UI component library (src/components/ui/):** ~40 shadcn components
- **Edge functions:** 4
- **Approximate lines of code (custom):** ~5,500

---

## SECTION 2: ROUTE MAP

| Route | Page Component | Purpose | Auth Required? | Status |
|---|---|---|---|---|
| `/` | `ChurnCalculator.tsx` | Main landing page — turnover cost calculator + lead capture | No | **Live** |
| `/vibe/:code` | `VibeCheck.tsx` | Team Vibe Check survey (5 questions + demographics) | No | **Live** |
| `/thank-you/:leadId` | `ThankYou.tsx` | Post-lead-submission confirmation + Vibe Check link | No | **Live** |
| `/thank-you` | `ThankYou.tsx` | Generic thank you fallback | No | **Live** |
| `/admin` | `AdminLogin.tsx` | Admin login page | No (is the login) | **Live** |
| `/admin/dossier` | `DossierIndex.tsx` | Admin: list all leads with Vibe Check data | Yes (admin) | **Live** |
| `/admin/dossier/:leadId` | `DossierView.tsx` | Admin: detailed dossier view for a specific lead | Yes (admin) | **Live** |
| `/report/:token` | `SharedReport.tsx` | PIN-protected shareable report for property contacts | PIN gate | **Live** |
| `/pulse/survey` | `PulseSurvey.tsx` | Legacy Pulse Survey (4 questions, org-based) | No | **Live (Legacy)** |
| `/pulse/dashboard` | `PulseDashboard.tsx` | Admin: org-level pulse dashboard | Yes (admin) | **Live (Legacy)** |
| `/pulse/admin` | `AdminDashboard.tsx` | Admin: super admin dashboard with org management | Yes (admin) | **Live (Legacy)** |
| `/pulse/dossier/:code` | `DossierPage.tsx` | Legacy: PIN-protected org dossier (6-digit PIN) | PIN gate | **Live (Legacy)** |
| `/pulse` | Redirect → `/pulse/survey` | Redirect | No | **Live** |
| `/pulse/login` | Redirect → `/admin` | Legacy redirect | No | **Live** |
| `/pulse/signup` | Redirect → `/` | Legacy redirect | No | **Live** |
| `*` | `NotFound.tsx` | 404 page | No | **Live** |

**Unreachable but present in codebase:**
- `src/pages/Index.tsx` — Default Lovable placeholder. Not routed. **Orphan.**
- `src/pages/Login.tsx` — Manager login page. Not routed (old `/pulse/login` redirects to `/admin`). **Orphan.**
- `src/pages/Signup.tsx` — Manager signup page. Not routed (old `/pulse/signup` redirects to `/`). **Orphan.**

---

## SECTION 3: PAGE-BY-PAGE BREAKDOWN

### 3.1 — `src/pages/ChurnCalculator.tsx` (Route: `/`)

**What it renders:** The main landing page. Hero section → Region selector (Ireland/USA/UAE/EU) → Calculator with sliders → Results panel (Stability Score, Daily Bleed, Annual Cost) → Forensic Breakdown → Lead Capture Form. Three tabs: Diagnostic, Mastery (retention protocols + pricing), DIY Toolbox.

**Components imported:**
- `RegionSelector`, `RegionBadge`, `REGIONS` (from `calculator/RegionSelector`)
- `ForensicBreakdown` (from `calculator/ForensicBreakdown`)
- `ProtocolDossier` (from `calculator/ProtocolDossier`)
- `PricingSection` (from `calculator/PricingSection`)
- `LeadCaptureForm` (from `LeadCaptureForm`)
- `SliderInput`, `StatCard`, `ToolboxCard` (inline sub-components)
- shadcn: `Button`, `Slider`, `Card`, `Tabs`

**Data it reads:** None from database. All calculation is client-side via `calculateChurn()`.

**Data it writes:** None directly. Lead capture form writes to `leads` and `organizations` tables.

**User inputs:** Region selection (4 buttons), Staff Count slider, Turnover Rate slider, Agency Split slider, Monthly Salary slider, Ramp-Up Months slider (generic only), Acquisition Friction slider (generic only).

**Business logic:** `calculateChurn()` from `src/lib/churnCalculations.ts`. Region stored in `localStorage`.

**External integrations:** Google Calendar booking link (https://calendar.app.google/jnoS2WB8um1GHo1S9).

**Known issues:**
- `€24,000/year` is hardcoded in DIY Toolbox tab regardless of region.
- "Only 7 Slots Remaining" in PricingSection is a hardcoded marketing claim, not dynamic.

---

### 3.2 — `src/pages/VibeCheck.tsx` (Route: `/vibe/:code`)

**What it renders:** Mobile-first 5-question survey with landing screen, demographic pre-screen (GDPR consent), one question per screen, and completion screen.

**Components imported:**
- `VibeProgressBar`, `QuestionOption`
- `submitVibeCheck` utility

**Data it reads:** `get_vibe_check_property` RPC function (validates code, returns `lead_id`, `property_name`, `staff_count`).

**Data it writes:** `vibe_check_responses` table (insert), `increment_vibe_check_responses` RPC function.

**User inputs:** 4 demographic dropdowns (department, role level, tenure, employment type), 5 rating questions (1-5 scale with emoji options).

**Business logic:** Code validation via RPC. Session-based "already done" check via `sessionStorage`. Anonymous ID generated via `crypto.randomUUID()`.

**External integrations:** None.

**Known issues:** None identified — this is a clean, well-structured flow.

---

### 3.3 — `src/pages/ThankYou.tsx` (Route: `/thank-you/:leadId`)

**What it renders:** Confirmation page after lead submission. Shows: checkmark, audit results summary, Vibe Check link with share buttons (WhatsApp, Email, Copy), response tracker with progress bar, "What Happens Next" section with booking CTA.

**Components imported:** `AuditResultsSummary`, `VibeCheckLinkSection`, `ResponseTracker`

**Data it reads:** `leads` table (single row by ID).

**Data it writes:** None.

**User inputs:** Copy link, Share via WhatsApp, Share via Email, Refresh response count, Book Strategy Session button.

**Known issues:**
- `VibeCheckLinkSection` generates the survey URL as `/pulse/survey?org=${vibeCheckCode}` — this goes to the **legacy** PulseSurvey page, NOT the new `/vibe/:code` Vibe Check page. **This is a significant routing mismatch.** The confirmation email also sends this legacy link.
- `AuditResultsSummary` hardcodes Ireland region (`"ireland"`) for all calculations, regardless of what region the user selected on the calculator page.

---

### 3.4 — `src/pages/AdminLogin.tsx` (Route: `/admin`)

**What it renders:** Simple email/password login form branded "Admin Access — Restricted to Be Connect team only."

**Data it reads:** None.
**Data it writes:** None directly. Calls `supabase.auth.signInWithPassword()` and then `check-admin` edge function.

**Business logic:** After successful login, calls `check-admin` edge function to verify admin role. If not admin, signs user out. If admin, redirects to `/pulse/dashboard`.

**Known issues:** Redirects to `/pulse/dashboard` (legacy dashboard), not `/admin/dossier` (the new dossier system).

---

### 3.5 — `src/pages/admin/DossierIndex.tsx` (Route: `/admin/dossier`)

**What it renders:** Admin table of all leads that have `vibe_check_requested = true`. Shows property name, contact info, staff count, response progress bar, and status badges.

**Data it reads:** `leads` table (filtered by `vibe_check_requested = true`).
**Data it writes:** None.

**Business logic:** Status derived from response rate: ⚪ New (0), 🟡 Low (<50%), 🟠 Building (50-79%), 🟢 Ready (≥80%).

---

### 3.6 — `src/pages/admin/DossierView.tsx` (Route: `/admin/dossier/:leadId`)

**What it renders:** Full dossier view for a specific lead. Admin view shows lead details, audit cost estimate, Vibe Check breakdowns (department, role, tenure, employment type), risk flags, and CTA section. Toggle to "Shareable View" hides admin-only data. Share section generates PIN-protected links.

**Data it reads:** `leads` table, `vibe_check_responses` table, `shared_reports` table (checks for existing share link).
**Data it writes:** `shared_reports` table (inserts new report with token, PIN hash, salt, expiry).

**Business logic:**
- Audit cost = `staff_count × (turnover_rate / 100) × €15,000`. This is a **simplified estimate** — not the full `calculateChurn()` engine.
- PIN generation: 4-digit (1000-9999), hashed with SHA-256 + random 16-byte salt.
- Share links expire after 30 days.

**Known issues:**
- PDF export uses `require()` (CommonJS) for dynamic imports of `calcOverallScores` — this works in bundled builds but is an antipattern in ESM.

---

### 3.7 — `src/pages/report/SharedReport.tsx` (Route: `/report/:token`)

**What it renders:** PIN-protected report for property contacts. Shows Vibe Check results identical to "Shareable View" in DossierView, plus HubCTA.

**Data it reads:** `shared_reports` table (token validation + PIN hash), `leads` table, `get-vibe-responses` edge function.
**Data it writes:** None.

**Business logic:** PIN verification via client-side SHA-256 hash comparison. Lockout after 5 failed attempts (5 minutes, stored in `sessionStorage`).

**Known issues:**
- PIN verification happens client-side. The `pin_hash` and `pin_salt` are sent to the client. A determined attacker could brute-force the 4-digit PIN (only 9,000 possibilities) by computing hashes locally, bypassing the lockout mechanism. **This is a low-severity security concern** given the data is not highly sensitive (team sentiment scores).

---

### 3.8 — `src/pages/PulseSurvey.tsx` (Route: `/pulse/survey`)

**What it renders:** Legacy 4-question emoji survey (energy, support, growth, spirit) with department selector and open feedback textarea.

**Data it reads:** `organizations` table (by `org_code` query param).
**Data it writes:** `pulse_responses` table, `leads` table (increments `vibe_check_responses`).

**Status:** **Legacy.** This is the OLD survey system. The new Vibe Check (`/vibe/:code`) supersedes it, but this page is still live and reachable via Vibe Check links sent in confirmation emails.

---

### 3.9 — `src/pages/PulseDashboard.tsx` (Route: `/pulse/dashboard`)

**What it renders:** Admin dashboard showing all organizations with response counts, health scores, and demo mode toggle.

**Data it reads:** `organizations` table, `pulse_responses` table.
**Data it writes:** None.

**Status:** **Legacy.** Intertwined with the old Pulse system. Still functional.

---

### 3.10 — `src/pages/AdminDashboard.tsx` (Route: `/pulse/admin`)

**What it renders:** Super admin dashboard with org table, status management, internal notes, CSV export, follow-up email composer.

**Data it reads:** `organizations`, `pulse_responses`, `leads` tables.
**Data it writes:** `organizations` table (status, internal_notes updates).

**Status:** **Legacy.** Still used by admins.

---

### 3.11 — `src/pages/DossierPage.tsx` (Route: `/pulse/dossier/:code`)

**What it renders:** Legacy PIN-protected dossier page using 6-digit PINs via the `get-dossier` edge function.

**Data it reads:** `pulse_dossiers` table, `get-dossier` edge function (which reads `pulse_responses`).
**Data it writes:** `pulse_dossiers` (client_response), `dossier_actions` (action tracking).

**Status:** **Legacy.** Uses the old Pulse system's org-based dossiers. The new system uses `/report/:token` with SHA-256 hashed 4-digit PINs.

---

### 3.12 — `src/pages/NotFound.tsx` (Route: `*`)

**What it renders:** Simple 404 page with "Return to Home" link.

---

## SECTION 4: COMPONENT INVENTORY

| Component | File Path | Used By | Props | Purpose |
|---|---|---|---|---|
| `LeadCaptureForm` | `src/components/LeadCaptureForm.tsx` | ChurnCalculator (×3 tabs) | `prefillStaffCount, prefillTurnoverRate` | Lead capture form with validation, writes to `leads` + `organizations`, triggers email edge function |
| `NavLink` | `src/components/NavLink.tsx` | **Not imported anywhere** | `className, activeClassName, pendingClassName, to` | React Router NavLink wrapper. **Orphan.** |
| `AdminRouteGuard` | `src/components/admin/AdminRouteGuard.tsx` | DossierIndex, DossierView | `children` | Checks auth session + hardcoded admin email list |
| `BreakdownTable` | `src/components/admin/BreakdownTable.tsx` | DossierView, SharedReport | `title, segments, shareable` | Renders segment breakdown table with Q1-Q5 scores |
| `HubCTA` | `src/components/admin/HubCTA.tsx` | DossierView (shareable), SharedReport | `responses, propertyName, staffCount, turnoverRate` | Sales CTA with risk flag count and cost estimate |
| `RiskFlags` | `src/components/admin/RiskFlags.tsx` | DossierView, SharedReport | `responses` | Displays generated risk flags |
| `VibeScoreCard` | `src/components/admin/VibeScoreCard.tsx` | DossierView, SharedReport | `responses` | Overall vibe score with Q1-Q5 breakdown |
| `ForensicBreakdown` | `src/components/calculator/ForensicBreakdown.tsx` | ChurnCalculator | `calc, currency, visible, region` | Expandable cost category breakdown |
| `PricingSection` | `src/components/calculator/PricingSection.tsx` | ChurnCalculator (Mastery tab) | `onCTA` | DIY vs White-Glove pricing comparison |
| `ProtocolDossier` | `src/components/calculator/ProtocolDossier.tsx` | ChurnCalculator (Mastery tab) | None | Accordion of 4 retention protocols |
| `RegionSelector` | `src/components/calculator/RegionSelector.tsx` | ChurnCalculator | `onRegionConfirmed, onChangeRegion, isConfirmed, currentRegion` | Region selection with cost driver details |
| `DossierList` | `src/components/dashboard/DossierList.tsx` | PulseDashboard, AdminDashboard | None | Lists all `pulse_dossiers` with PIN codes visible. **Legacy.** |
| `GenerateDossierModal` | `src/components/dashboard/GenerateDossierModal.tsx` | PulseDashboard, AdminDashboard | `orgId, orgName, onClose` | Generates `pulse_dossiers` entries with 6-digit PINs. **Legacy.** |
| `OrgDetailView` | `src/components/dashboard/OrgDetailView.tsx` | PulseDashboard, AdminDashboard | `orgId, orgName, orgCode, onBack, onGenerateDossier, demoMode` | Detailed org view with pulse data. **Legacy.** |
| `WelcomeModal` | `src/components/dashboard/WelcomeModal.tsx` | **Not imported anywhere** | `orgName, pulseLink, email, onClose` | Post-signup welcome modal. **Orphan.** |
| `PinEntry` | `src/components/report/PinEntry.tsx` | SharedReport | `propertyName, onSubmit` | 4-digit OTP PIN entry with lockout |
| `AuditResultsSummary` | `src/components/thankyou/AuditResultsSummary.tsx` | ThankYou | `staffCount, turnoverRate` | Summarizes calculator results on thank-you page |
| `ResponseTracker` | `src/components/thankyou/ResponseTracker.tsx` | ThankYou | `leadId, initialResponses, staffCount` | Live response counter with progress bar |
| `VibeCheckLinkSection` | `src/components/thankyou/VibeCheckLinkSection.tsx` | ThankYou | `vibeCheckCode, propertyName, fullName, email` | Displays and shares the Vibe Check link |
| `QuestionOption` | `src/components/vibe/QuestionOption.tsx` | VibeCheck | `option, selected, onSelect` | Single emoji option button |
| `VibeProgressBar` | `src/components/vibe/VibeProgressBar.tsx` | VibeCheck | `currentStep, totalSteps` | Progress bar for vibe check flow |

**Orphaned components (exist but not imported):**
- `src/components/NavLink.tsx`
- `src/components/dashboard/WelcomeModal.tsx`

---

## SECTION 5: DATABASE SCHEMA

### Table: `leads`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `full_name` | TEXT | No | — | Contact name |
| `property_name` | TEXT | No | — | Hotel/property name |
| `email` | TEXT | No | — | Contact email (unique constraint for upsert) |
| `phone` | TEXT | No | — | Phone number |
| `role` | TEXT | Yes | NULL | Contact's role (Owner, GM, etc.) |
| `staff_count` | INTEGER | Yes | NULL | Total staff count |
| `turnover_rate` | INTEGER | Yes | NULL | Estimated turnover % |
| `biggest_challenge` | TEXT | Yes | NULL | Selected challenge from dropdown |
| `status` | TEXT | No | `'new'` | Lead status |
| `vibe_check_requested` | BOOLEAN | Yes | NULL | Whether Vibe Check was requested |
| `vibe_check_code` | TEXT | Yes | NULL | 6-char alphanumeric code |
| `vibe_check_responses` | INTEGER | Yes | NULL | Response counter |
| `vibe_check_total_staff` | INTEGER | Yes | NULL | Staff count for response tracking |
| `dossier_pin` | TEXT | Yes | NULL | **Unused column** — legacy, not referenced in code |
| `dossier_url` | TEXT | Yes | NULL | **Unused column** — legacy, not referenced in code |
| `report_sent_at` | TIMESTAMP | Yes | NULL | **Unused column** — not referenced in code |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMP | No | `now()` | Last update timestamp |

**Foreign keys:** None  
**Indexes:** Unique on `email` (for upsert)

---

### Table: `vibe_check_responses`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `lead_id` | UUID | Yes | NULL | FK → `leads.id` |
| `anonymous_id` | TEXT | No | — | Client-generated UUID for anonymity |
| `department` | TEXT | No | — | Selected department |
| `role_level` | TEXT | No | — | Selected role level |
| `tenure` | TEXT | No | — | Selected tenure bracket |
| `employment_type` | TEXT | No | — | Full-time/Part-time/Seasonal |
| `q1_score` | INTEGER | No | — | "How easy to fill roles" (1-5) |
| `q2_score` | INTEGER | No | — | "How many would you rehire" (1-5) |
| `q3_score` | INTEGER | No | — | "Competitor poaching risk" (1-5) |
| `q4_score` | INTEGER | No | — | "90-day retention" (1-5) |
| `q5_score` | INTEGER | No | — | "Monday morning energy" (1-5) |
| `created_at` | TIMESTAMP | No | `now()` | Submission timestamp |

**Foreign keys:** `lead_id` → `leads.id`

---

### Table: `shared_reports`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `lead_id` | UUID | Yes | NULL | FK → `leads.id` |
| `token` | TEXT | No | — | 12-char URL token |
| `created_by` | TEXT | No | — | Admin email who created it |
| `pin_hash` | TEXT | Yes | NULL | SHA-256 hash of salt+PIN |
| `pin_salt` | TEXT | Yes | NULL | 32-char hex salt |
| `expires_at` | TIMESTAMP | Yes | NULL | Expiry (30 days from creation) |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |

**Foreign keys:** `lead_id` → `leads.id`

---

### Table: `organizations`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `org_name` | TEXT | No | — | Organization name |
| `org_code` | TEXT | No | — | Unique code (slug) |
| `manager_email` | TEXT | Yes | NULL | Manager email |
| `industry` | TEXT | Yes | NULL | Industry type |
| `status` | TEXT | No | `'active'` | Organization status |
| `internal_notes` | TEXT | Yes | NULL | Admin notes |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |

**Foreign keys:** None  
**Note:** This table is shared between the legacy Pulse system and the new Vibe Check system. The `LeadCaptureForm` creates an org entry using the `vibe_check_code` as the `org_code`.

---

### Table: `pulse_responses`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `organization_id` | UUID | No | — | FK → `organizations.id` |
| `department` | TEXT | Yes | NULL | Department name |
| `question_1_energy` | INTEGER | No | — | Energy score (1-5) |
| `question_2_support` | INTEGER | No | — | Support score (1-5) |
| `question_3_growth` | INTEGER | No | — | Growth score (1-5) |
| `question_4_spirit` | INTEGER | Yes | NULL | Spirit score (1-5) |
| `open_feedback` | TEXT | Yes | NULL | Free-text feedback |
| `is_demo_data` | BOOLEAN | No | `false` | Demo data flag |
| `submitted_at` | TIMESTAMP | No | `now()` | Submission timestamp |

**Foreign keys:** `organization_id` → `organizations.id`  
**Status:** **Legacy.** Used by `/pulse/survey` and the old dashboard system.

---

### Table: `pulse_dossiers`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `organization_id` | UUID | No | — | FK → `organizations.id` |
| `unique_code` | TEXT | No | — | 8-char URL code |
| `pin_code` | TEXT | No | — | 6-digit PIN (**stored in plaintext**) |
| `status` | TEXT | No | `'not_sent'` | Dossier status |
| `view_count` | INTEGER | No | `0` | View counter |
| `first_viewed_at` | TIMESTAMP | Yes | NULL | First view timestamp |
| `last_viewed_at` | TIMESTAMP | Yes | NULL | Last view timestamp |
| `client_response` | TEXT | Yes | NULL | "interested" or "passed" |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |

**Foreign keys:** `organization_id` → `organizations.id`  
**Status:** **Legacy.** PINs stored in plaintext. The new `shared_reports` system uses hashed PINs.

---

### Table: `dossier_actions`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `dossier_id` | UUID | No | — | FK → `pulse_dossiers.id` |
| `action_type` | TEXT | No | — | Action type string |
| `created_at` | TIMESTAMP | No | `now()` | Action timestamp |

**Foreign keys:** `dossier_id` → `pulse_dossiers.id`  
**Status:** **Legacy.** Only used by `DossierPage.tsx`.

---

### Table: `managers`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `email` | TEXT | No | — | Manager email |
| `name` | TEXT | Yes | NULL | Manager name |
| `organization_id` | UUID | No | — | FK → `organizations.id` |
| `created_at` | TIMESTAMP | No | `now()` | Creation timestamp |

**Foreign keys:** `organization_id` → `organizations.id`  
**Status:** **Legacy.** Only written to by `Signup.tsx` (which is an orphaned page).

---

### Table: `user_roles`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | No | — | References `auth.users(id)` |
| `role` | `app_role` enum | No | — | `'admin'` or `'manager'` |

**Enum `app_role`:** `admin`, `manager`  
**Used by:** `check-admin` edge function, `has_role()` database function.

---

## SECTION 6: RPC FUNCTIONS & DATABASE FUNCTIONS

| Function Name | Called From | Parameters | Returns | Purpose |
|---|---|---|---|---|
| `get_vibe_check_property` | `VibeCheck.tsx` | `check_code TEXT` | `lead_id UUID, property_name TEXT, staff_count INTEGER` | Validates a vibe check code and returns lead info |
| `increment_vibe_check_responses` | `submitVibeCheck.ts` | `lead_uuid UUID` | `void` | Atomically increments the `vibe_check_responses` counter on `leads` |
| `has_role` | RLS policies | `_user_id UUID, _role app_role` | `BOOLEAN` | Security definer function to check user roles without triggering RLS recursion |

---

## SECTION 7: CALCULATION ENGINE

### 7.1 — Staff Audit Calculator (`src/lib/churnCalculations.ts`)

**Input Variables:**

| Variable | Type | Default (Ireland) | UI Element |
|---|---|---|---|
| `region` | `Region` (ireland/usa/uae/eu/null) | None — must select | 4-button selector |
| `teamSize` | number | 160 | Slider (1–500) |
| `turnoverRate` | number | 30 | Slider (5–60%) |
| `baseMonthlySalary` | number | €2,400 | Slider (€1,800–€5,000) |
| `agencySplit` | number | 60 | Slider (0–100%) |
| `rampMonths` | number | 3 | Slider (generic only) |
| `acqFriction` | number | €2,500 | Slider (generic only) |

**Formula — Ireland:**

```
departures = round(teamSize × turnoverRate / 100)
annualSalary = baseMonthlySalary × 12
employerPRSI = annualSalary × 0.1125
loadedAnnualCost = annualSalary + employerPRSI

// Category 1: Recruitment & Onboarding (blended)
agencyRecruitmentCost = €3,880  (agency fee €3,500 + HR €200 + onboarding €180)
directRecruitmentCost = €1,280  (job boards €400 + HR screening €400 + interviews €300 + onboarding €180)
recruitmentCostPer = (agencySplit/100 × €3,880) + (directSplit/100 × €1,280)
cat1Total = round(recruitmentCostPer) × departures

// Category 2: Training & Compliance — €350/departure
cat2Total = 350 × departures
  // Fire Safety €80, Manual Handling €60, HACCP €60, Uniform €150

// Category 3: Productivity Loss — scales with salary
productivityCostPer = clamp(600, 2400, (baseMonthlySalary / 2400) × 1200)
cat3Total = productivityCostPer × departures

// Category 4: Early Departure Risk — €800/departure
cat4Total = 800 × departures  // 20% failure rate × €3,990 sunk cost

totalAnnual = cat1 + cat2 + cat3 + cat4
dailyBleed = totalAnnual / 365
monthlyCost = totalAnnual / 12
perDeparture = totalAnnual / departures
stabilityScore = max(0, min(100, 100 - turnoverRate))

visibleCost = cat1Total (recruitment)
hiddenCost = totalAnnual - visibleCost
invisiblePercentage = round(hiddenCost / totalAnnual × 100)
```

**Test Case: 160 staff, 30% turnover, 60/40 agency split, €2,400/mo salary:**

```
departures = round(160 × 0.30) = 48
annualSalary = €28,800
employerPRSI = €3,240
loadedAnnualCost = €32,040

// Cat 1: Recruitment
agencyHires = round(48 × 0.60) = 29
directHires = 48 - 29 = 19
recruitmentCostPer = (0.60 × 3880) + (0.40 × 1280) = 2328 + 512 = 2840
cat1Total = 2840 × 48 = 136,320

// Cat 2: Training
cat2Total = 350 × 48 = 16,800

// Cat 3: Productivity
productivityCostPer = clamp(600, 2400, (2400/2400) × 1200) = 1200
cat3Total = 1200 × 48 = 57,600

// Cat 4: Early Departure
cat4Total = 800 × 48 = 38,400

totalAnnual = 136,320 + 16,800 + 57,600 + 38,400 = 249,120
dailyBleed = 249,120 / 365 = €682/day
monthlyCost = 249,120 / 12 = €20,760
perDeparture = 249,120 / 48 = €5,190
stabilityScore = 100 - 30 = 70

visibleCost = €136,320
hiddenCost = €112,800
invisiblePercentage = round(112,800 / 249,120 × 100) = 45%
```

**Other regions follow the same pattern with different cost constants:**
- **USA:** Agency €5,250 / Direct €1,950 / Training €500 / Productivity scaled from $3,500 base / Early Departure €1,000
- **UAE:** Agency AED 17,800 / Direct AED 7,700 / Training AED 3,000 / Productivity scaled from AED 5,500 / Housing AED 2,000 / End-of-Service AED 3,000 (5 categories)
- **EU:** Agency €3,650 / Direct €1,230 / Training €400 / Productivity scaled from €2,800 / Early Departure €700
- **Generic:** Uses rampMonths and acqFriction sliders directly

### 7.2 — Vibe Check Scoring (`src/utils/dossierCalculations.ts`)

**Aggregation:**
- Each question scored 1-5
- Overall = average of (q1 + q2 + q3 + q4 + q5) / 5

**Risk Levels:**

| Score Range | Level | Emoji |
|---|---|---|
| ≤ 2.0 | Critical | 🔴 |
| 2.1 – 3.0 | At Risk | 🟡 |
| 3.1 – 4.0 | Stable | 🟢 |
| 4.1 – 5.0 | Strong | 💚 |

**Where used:** `VibeScoreCard`, `RiskFlags`, `HubCTA`, `SharedReport`, `DossierView`

### 7.3 — Dossier Calculations

**Segment Breakdown:**
- Groups responses by field (department, role_level, tenure, employment_type)
- For each group: calculates average of q1-q5 and overall average
- **Suppression rule:** Groups with < 3 respondents are merged into an "Other" group (only if the merged group also has ≥ 3)

**Risk Flag Generation:**

| # | Condition | Severity | Message |
|---|---|---|---|
| 1 | Any department overall ≤ 2.5 | 🔴 Red | "{dept} is in critical territory ({score}/5)" |
| 2 | Q1 (filling roles) < 2.0 | 🔴 Red | "Recruitment is a crisis" |
| 3 | Q3 (competitor risk) < 2.5 | 🔴 Red | "High poaching risk" |
| 4 | Q4 (90-day retention) < 2.5 | 🔴 Red | "New hire retention is failing" |
| 5 | Manager - Team Member gap > 1.0 | 🟡 Yellow | "Perception gap: Managers vs team members" |
| 6 | New starters < tenured - 0.8 | 🟡 Yellow | "New starter experience is poor" |

**Color-coding thresholds (scores):**
- ≤ 2.0 → `text-destructive` (red)
- ≤ 2.5 → `text-orange-400`
- ≤ 3.5 → `text-primary` (amber/gold)
- \> 3.5 → `text-green-400`

---

## SECTION 8: CONFIGURATION FILES

### `src/config/vibeCheckQuestions.ts`

5 questions, each with 5 options (value 1-5, emoji, label):

**Q1:** "How easy is it to fill an open role right now?"
- 1: 😰 Nightmare | 2: 😟 Very difficult | 3: 😐 Takes time | 4: 😊 Manageable | 5: 😌 No problem

**Q2:** "How many of your team would you rehire tomorrow?"
- 1: 😬 Very few | 2: 😟 Less than half | 3: 😐 About half | 4: 😊 Most of them | 5: 😍 Almost all

**Q3:** "If a competitor offered €1/hr more, how many would stay?"
- 1: 😰 We'd lose many | 2: 😟 We'd lose some | 3: 😐 Hard to say | 4: 💪 Most would stay | 5: 💪 They'd stay for sure

**Q4:** "How often do new hires make it past 90 days?"
- 1: 😬 Rarely | 2: 😟 Sometimes | 3: 😐 About half | 4: 😊 Usually | 5: ✅ Almost always

**Q5:** "Rate your team's energy on a typical Monday morning."
- 1: 😴 Flat / exhausted | 2: 😟 Low energy | 3: 😐 Neutral | 4: 😊 Pretty good | 5: 🔥 Buzzing

### `src/config/demographics.ts`

**Departments:** Food & Beverage, Housekeeping, Front Desk / Reception, Kitchen, Maintenance / Facilities, Spa & Leisure, Admin / Office, Other

**Role Levels:** Team Member, Supervisor / Team Lead, Manager

**Tenure:** Less than 6 months, 6–12 months, 1–3 years, 3+ years

**Employment Types:** Full-time, Part-time, Seasonal / Contract

### `src/components/calculator/RegionSelector.tsx` — Region Configuration

4 regions with full defaults:

| Region | Base Salary | Staff Default | Turnover Default | Agency Split | Currency |
|---|---|---|---|---|---|
| Ireland 🇮🇪 | €2,400 | 160 | 30% | 60% | € |
| USA 🇺🇸 | $3,500 | 150 | 28% | 40% | $ |
| EU 🇪🇺 | €2,800 | 180 | 25% | 45% | € |
| UAE 🇦🇪 | AED 5,500 | 300 | 33% | 70% | AED |

### Design System (`src/index.css`)

Dark theme only. Key tokens:
- Background: `hsl(0 0% 10%)` (near-black)
- Primary: `hsl(38 92% 50%)` (amber/gold)
- Destructive: `hsl(347 77% 50%)` (pink-red)
- Success: `hsl(160 84% 39%)` (teal-green)
- Font: Montserrat

---

## SECTION 9: UTILITY FUNCTIONS

| File | Functions Exported | Used By | Purpose |
|---|---|---|---|
| `src/lib/churnCalculations.ts` | `calculateChurn()` + types | ChurnCalculator, AuditResultsSummary | Full turnover cost calculation engine |
| `src/lib/pdfExport.ts` | `exportPDF()` | OrgDetailView | Legacy pulse report PDF export |
| `src/utils/dossierCalculations.ts` | `groupByField()`, `calcOverallScores()`, `generateRiskFlags()`, `getScoreEmoji()`, `getScoreColor()`, `getOverallIndicator()`, `getSizeLabel()`, `getLabel()`, `questionLabels` | DossierView, SharedReport, VibeScoreCard, BreakdownTable, RiskFlags, HubCTA | Vibe Check scoring, segmentation, risk analysis |
| `src/utils/pinUtils.ts` | `generatePin()`, `generateSalt()`, `hashPin()` | DossierView, SharedReport | PIN generation and SHA-256 hashing |
| `src/utils/submitVibeCheck.ts` | `submitVibeCheck()` | VibeCheck | Inserts vibe check response + increments counter |
| `src/lib/utils.ts` | `cn()` | All shadcn components | Tailwind class merging utility |

---

## SECTION 10: AUTHENTICATION & ACCESS CONTROL

### 10.1 — Authentication Method

**Supabase Auth** with email/password sign-in. No magic links, no OAuth providers.

### 10.2 — Routes Requiring Authentication

| Route Pattern | Guard | Method |
|---|---|---|
| `/admin/dossier` | `AdminRouteGuard` | Session check + email whitelist |
| `/admin/dossier/:leadId` | `AdminRouteGuard` | Session check + email whitelist |
| `/pulse/dashboard` | Inline check | Session + `check-admin` edge function |
| `/pulse/admin` | Inline check | Session + `check-admin` edge function |

### 10.3 — Admin Route Guard

**`AdminRouteGuard`** (`src/components/admin/AdminRouteGuard.tsx`) uses a **dual mechanism**:

1. **Client-side email whitelist:** Hardcoded array `["hello@be.ie", "info@be.ie"]`. If the logged-in user's email matches, access is granted.
2. **Edge function verification:** The `check-admin` edge function checks the `user_roles` table for an `admin` role entry.

**⚠️ Security note:** The `AdminRouteGuard` uses the client-side email whitelist, while the dashboard pages use the edge function. These are **two different authorization mechanisms** that could potentially diverge.

### 10.4 — Admin Email Addresses

Hardcoded in `AdminRouteGuard.tsx`:
- `hello@be.ie`
- `info@be.ie`

Additionally, any user with `role = 'admin'` in the `user_roles` table passes the edge function check.

### 10.5 — Admin vs Non-Admin Access

| Feature | Admin | Non-Admin / Public |
|---|---|---|
| Calculator (`/`) | ✅ | ✅ |
| Vibe Check (`/vibe/:code`) | ✅ | ✅ |
| Thank You page | ✅ | ✅ |
| Shared Report (`/report/:token`) | ✅ (with PIN) | ✅ (with PIN) |
| Lead form submission | ✅ | ✅ |
| Dossier Admin (`/admin/dossier`) | ✅ | ❌ |
| Pulse Dashboard | ✅ | ❌ |
| Super Admin | ✅ | ❌ |

### 10.6 — PIN-Protected Dossier Authentication

**New System (`/report/:token`):**
- 4-digit PIN (1000-9999), generated via `Math.random()`
- Salt: 16 random bytes → 32-char hex string
- Hash: SHA-256 of `salt + pin` (computed client-side via `crypto.subtle.digest`)
- Storage: `pin_hash` and `pin_salt` stored in `shared_reports` table
- Verification: Client receives hash + salt, computes hash locally, compares
- Lockout: 5 failed attempts → 5-minute lockout (stored in `sessionStorage`)

**Legacy System (`/pulse/dossier/:code`):**
- 6-digit PIN, stored in plaintext in `pulse_dossiers.pin_code`
- Verified server-side via `get-dossier` edge function

---

## SECTION 11: DATA FLOW DIAGRAMS

### Flow 1: Staff Audit → Lead → Thank You

```
1. User loads / (ChurnCalculator)
2. Selects region → sliders appear → adjusts inputs
3. calculateChurn() runs client-side → results update in real-time
4. Scrolls down to LeadCaptureForm
5. Fills: Name, Property, Role, Email, Phone, Staff Count, Turnover Rate, Challenge
6. Clicks "Send Me My Free Vibe Check"
7. → Generates 6-char vibeCode (alphanumeric)
8. → Formats phone (Irish 08→+353)
9. → UPSERT into `leads` table (onConflict: email)
10. → UPSERT into `organizations` table (org_code = vibeCode)
11. → Fire-and-forget: invoke `send-lead-emails` edge function
     → Sends confirmation email to lead (via Brevo)
     → Sends internal notification to hello@be.ie (via Brevo)
12. → Redirect to /thank-you?id={lead.id}
13. ThankYou page loads:
     → Fetches lead data from `leads` table
     → Shows AuditResultsSummary (recalculates Ireland costs)
     → Shows VibeCheckLinkSection with link: /pulse/survey?org={vibeCode}
     → Shows ResponseTracker (polls leads table for response count)
```

### Flow 2: Vibe Check (Team Member)

```
1. Team member receives link: /vibe/{code}
2. VibeCheck.tsx loads
3. → Checks sessionStorage for `vibe_done_{code}` (already done?)
4. → If not done: calls RPC `get_vibe_check_property(check_code: code)`
     → Returns lead_id, property_name, staff_count
     → If error/empty → "invalid" screen
5. Shows landing screen with property name + anonymity guarantees
6. User taps "Start Assessment →"
7. Pre-screen with GDPR consent banner + 4 dropdowns:
   - Department, Role Level, Tenure, Employment Type
8. Q1 through Q5 — one question per screen, emoji options (1-5)
9. User taps "Submit" on Q5
10. → submitVibeCheck() called:
     → Generates crypto.randomUUID() as anonymous_id
     → INSERT into `vibe_check_responses` (lead_id, anonymous_id, demographics, q1-q5)
     → Calls RPC `increment_vibe_check_responses(lead_uuid: leadId)`
11. → Sets sessionStorage `vibe_done_{code} = true`
12. Shows "Thank You" completion screen
```

### Flow 3: Admin Dossier Preparation

```
1. Admin navigates to /admin → AdminLogin
2. Enters email + password → signInWithPassword()
3. → Calls `check-admin` edge function
   → Gets JWT token → getUser() → checks user_roles for admin role
4. If admin → redirect to /pulse/dashboard
5. Admin navigates to /admin/dossier (DossierIndex)
   → AdminRouteGuard checks session + email whitelist
   → Fetches `leads` WHERE vibe_check_requested = true
   → Shows table with status badges based on response rate
6. Admin clicks "Open →" on a lead → /admin/dossier/{leadId}
   → Fetches lead data from `leads`
   → Fetches all `vibe_check_responses` WHERE lead_id = leadId
   → Runs groupByField() for dept/role/tenure/empType
   → Runs calcOverallScores() + generateRiskFlags()
   → Checks `shared_reports` for existing share links
7. Admin toggles "Shareable View" to preview what client sees
8. Admin clicks "Generate Shareable Link"
   → Generates 12-char token (UUID without dashes, sliced)
   → Generates 4-digit PIN (1000-9999)
   → Generates 16-byte random salt → hex string
   → Computes SHA-256 hash of salt+PIN
   → INSERT into `shared_reports` (lead_id, token, created_by, expires_at, pin_hash, pin_salt)
   → Shows modal with URL + raw PIN (show once, cannot retrieve later)
```

### Flow 4: Manager Accesses Dossier

```
1. Manager receives link: /report/{token}
2. SharedReport.tsx loads
3. → Fetches `shared_reports` WHERE token = {token}
   → If not found → "Report Not Found"
   → If expires_at < now → "Report Expired"
   → If pin_hash exists → show PinEntry gate
     → Also fetches leads.property_name for display
4. Manager enters 4-digit PIN
5. → Client computes SHA-256 hash of salt+enteredPin
   → Compares to stored pin_hash
   → If match:
     → Fetches leads data (property_name, staff_count, turnover_rate)
     → Invokes `get-vibe-responses` edge function (returns vibe_check_responses[])
     → Renders full report: VibeScoreCard, Breakdowns, RiskFlags, HubCTA
   → If no match:
     → Increments attempt counter (sessionStorage)
     → After 5 failures → 5-minute lockout
6. Report shows: team vibe scores, department/role/tenure breakdowns, risk flags, Be Connect CTA
```

---

## SECTION 12: GDPR & PRIVACY COMPLIANCE

### 12.1 — GDPR Consent Statement

**Location:** `VibeCheck.tsx`, pre-screen page, inside a `bg-secondary` box with a Lock icon.

**Exact text:**
> "Your answers are completely anonymous. Your manager never sees your individual responses — only team-level patterns when 3 or more people from the same department have responded. Your results are stored securely by Be Connect and shared with your property's nominated contact."

### 12.2 — Personally Identifiable Information (PII)

| Data | Where Stored | Who Can Access |
|---|---|---|
| Full name | `leads.full_name` | Admin only |
| Email | `leads.email` | Admin only |
| Phone | `leads.phone` | Admin only |
| Property name | `leads.property_name` | Admin + shared report |
| Auth user email | `auth.users` | System only |

### 12.3 — Anonymous Data

**Vibe Check responses** are anonymous:
- `anonymous_id` is a client-generated UUID (not linked to any user identity)
- No name, email, or phone is collected during the Vibe Check
- Demographic data (department, role, tenure, employment type) is collected but cannot identify individuals
- **Suppression rule:** Groups with < 3 respondents are merged into "Other"

**Pulse Survey responses** (legacy) are also anonymous:
- No identifying information beyond optional department selection

### 12.4 — Suppression Rule Enforcement

**File:** `src/utils/dossierCalculations.ts`, function `groupByField()`

```typescript
const MIN_SEGMENT_SIZE = 3;
// Groups with < 3 are pushed to a "suppressed" array
// If suppressed array has ≥ 3, they're shown as "Other"
// If suppressed array has < 3, those responses are not shown in breakdowns
// (but they ARE still included in overall scores)
```

### 12.5 — Data Access Matrix

| Role | Leads PII | Vibe Responses (raw) | Vibe Responses (aggregated) | Org Data |
|---|---|---|---|---|
| Public (unauthenticated) | ❌ | ❌ | ❌ | ❌ |
| Team member (survey taker) | ❌ | ❌ | ❌ | ❌ |
| Property contact (via PIN) | Property name only | ❌ | ✅ (aggregated) | ❌ |
| Admin (Be Connect team) | ✅ | ✅ | ✅ | ✅ |

### 12.6 — Data Retention

- **No auto-deletion or expiry logic** exists for any data.
- `shared_reports.expires_at` prevents access to shared links after 30 days, but the data itself is not deleted.
- No data retention policy is documented or enforced in code.

### 12.7 — Data Exports & Third-Party Integrations

- **Brevo (Sendinblue):** Receives lead PII (name, email, phone, property name, staff count, turnover rate, vibe check code) for email delivery. This is the only third-party data share.
- **CSV export:** Admin can export org data as CSV (client-side, no external service).
- **PDF export:** Generated client-side via jsPDF, not transmitted anywhere.

---

## SECTION 13: EMAIL INTEGRATIONS

| Trigger | Recipient | Subject | Content Summary | Service | Status |
|---|---|---|---|---|---|
| Lead form submit | Property contact | "Your Staff Audit Results — {propertyName}" | Confirmation + Vibe Check link + booking CTA | Brevo (SMTP API) | **Live** |
| Lead form submit | hello@be.ie | "New Staff Audit Lead: {propertyName}" | Internal notification with all lead details + admin link | Brevo (SMTP API) | **Live** |

**Edge Function:** `supabase/functions/send-lead-emails/index.ts`

**Sender:** `Be Connect <hello@be.ie>`

**Known issues:**
- The Vibe Check link in the confirmation email points to `/pulse/survey?org=${vibeCode}` (legacy Pulse Survey), not `/vibe/${vibeCode}` (new Vibe Check). **These are different surveys with different questions.**
- No error notification to user if email fails — fire-and-forget pattern.

---

## SECTION 14: ENVIRONMENT VARIABLES

| Variable | Purpose | Required? | Source |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | Auto-configured by Lovable Cloud |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Yes | Auto-configured by Lovable Cloud |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes | Auto-configured by Lovable Cloud |
| `VITE_PUBLIC_URL` | Base URL for generated links | Yes | Secret — set to `https://staff-audit.be.ie` |
| `BREVO_API_KEY` | Brevo SMTP API key | Yes (for emails) | Secret |
| `BREVO_SMTP_KEY` | Brevo SMTP key (appears unused in code) | No | Secret |
| `LOVABLE_API_KEY` | Lovable AI API key | System-managed | Auto-configured |
| `SUPABASE_URL` | Used in edge functions | Yes | Auto-provided to edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Used in edge functions | Yes | Auto-provided to edge functions |

---

## SECTION 15: KNOWN ISSUES & TECHNICAL DEBT

### 🔴 Critical

1. **Vibe Check link mismatch:** The thank-you page and confirmation email both generate links to `/pulse/survey?org=${code}` (legacy 4-question Pulse Survey), not `/vibe/${code}` (new 5-question Vibe Check). Team members clicking the link get the **wrong survey**. The data goes into `pulse_responses` (legacy) instead of `vibe_check_responses` (new).

2. **PIN hash sent to client:** In `SharedReport.tsx`, the `pin_hash` and `pin_salt` are fetched to the client for local verification. With only 9,000 possible 4-digit PINs, an attacker can brute-force the hash in milliseconds. The lockout mechanism only exists in `sessionStorage` and can be bypassed.

### 🟡 Moderate

3. **Admin login redirect:** `AdminLogin.tsx` redirects to `/pulse/dashboard` (legacy) after login, not `/admin/dossier` (new system). Admins must manually navigate.

4. **Dual auth mechanisms:** `AdminRouteGuard` uses a hardcoded email whitelist, while `PulseDashboard` and `AdminDashboard` use the `check-admin` edge function. These could diverge.

5. **Legacy plaintext PINs:** `pulse_dossiers.pin_code` stores 6-digit PINs in plaintext. The new `shared_reports` system uses hashed PINs.

6. **`AuditResultsSummary` hardcodes Ireland:** The thank-you page always recalculates using `"ireland"` region, even if the user selected a different region on the calculator.

7. **`as any` type casts throughout:** Many Supabase queries use `as any` to bypass TypeScript type checking, indicating the types may be out of sync with the actual schema or the code was written before types were generated.

### 🟢 Minor

8. **Unused columns on `leads`:** `dossier_pin`, `dossier_url`, `report_sent_at` are defined in the schema but never read or written by any code.

9. **PDF export uses `require()`:** `DossierView.tsx` uses CommonJS `require()` for dynamic imports — works in bundled builds but is an antipattern.

10. **Missing error handling:** `LeadCaptureForm` does fire-and-forget for email sending — user gets no feedback if emails fail.

11. **No loading states for some queries:** Some admin pages don't show loading indicators during data fetch.

12. **Hardcoded marketing claims:** "Only 7 Slots Remaining" (PricingSection), "€24,000/year" (ToolboxCard) are static values.

13. **`recharts` installed but barely used:** Only imported by `src/components/ui/chart.tsx` (shadcn default). No custom charts in the application.

14. **Several unused shadcn components:** Many UI components in `src/components/ui/` are default shadcn installations never used by custom code (e.g., calendar, carousel, context-menu, drawer, hover-card, menubar, etc.).

---

## SECTION 16: LEGACY / DEPRECATED CODE

### Legacy Pulse System vs New Vibe Check System

The codebase contains TWO parallel survey systems:

| Feature | Legacy Pulse System | New Vibe Check System |
|---|---|---|
| Survey route | `/pulse/survey?org={code}` | `/vibe/{code}` |
| Questions | 4 (energy, support, growth, spirit) | 5 (fill roles, rehire, competitor, 90-day, energy) |
| Response table | `pulse_responses` | `vibe_check_responses` |
| Demographics | Department only | Department + role + tenure + employment type |
| GDPR consent | Implicit ("anonymous") | Explicit consent banner |
| Dossier route | `/pulse/dossier/{code}` | `/report/{token}` |
| PIN security | 6-digit, plaintext | 4-digit, SHA-256 hashed |
| Dossier table | `pulse_dossiers` | `shared_reports` |

### Files to Review for Cleanup

| File/Table | Still Referenced? | Recommendation |
|---|---|---|
| `src/pages/PulseSurvey.tsx` | Yes — routed at `/pulse/survey` | **Migrate or remove.** Currently receives traffic from Vibe Check links. |
| `src/pages/PulseDashboard.tsx` | Yes — routed at `/pulse/dashboard` | **Keep for now** — still used by admins for org overview. |
| `src/pages/AdminDashboard.tsx` | Yes — routed at `/pulse/admin` | **Keep for now** — has admin features not replicated in DossierView. |
| `src/pages/DossierPage.tsx` | Yes — routed at `/pulse/dossier/:code` | **Deprecate** — replaced by `/report/:token`. Keep if existing dossier links are still in circulation. |
| `src/pages/Login.tsx` | **No** — not routed | **Remove.** Orphaned file. |
| `src/pages/Signup.tsx` | **No** — not routed | **Remove.** Orphaned file. |
| `src/pages/Index.tsx` | **No** — not routed | **Remove.** Default Lovable placeholder. |
| `src/components/NavLink.tsx` | **No** — not imported | **Remove.** Orphaned. |
| `src/components/dashboard/WelcomeModal.tsx` | **No** — not imported | **Remove.** Orphaned. |
| `pulse_responses` table | Yes — legacy survey writes here | **Keep** — contains historical data. Stop new writes when Pulse Survey is retired. |
| `pulse_dossiers` table | Yes — legacy dossier system | **Deprecate** — replaced by `shared_reports`. |
| `dossier_actions` table | Yes — only used by `DossierPage.tsx` | **Deprecate** with DossierPage. |
| `managers` table | Only written by orphaned `Signup.tsx` | **Remove** — no code reads from it. |
| `organizations` table | Yes — bridge between both systems | **Keep** — still used by LeadCaptureForm and admin dashboards. |
| `src/lib/pdfExport.ts` | Yes — imported by `OrgDetailView.tsx` | **Keep** — legacy but still functional. |
| `src/data/demoData.ts` | Yes — used by dashboards + `get-dossier` edge function | **Keep** — demo mode still active. |

---

*End of Technical Audit Report*
