# STAFF AUDIT — COMPREHENSIVE BOARD AUDIT REPORT

**Prepared for:** Board of Advisors, Be Connect  
**Application:** staff-audit.be.ie  
**Date:** 5 March 2026  
**Status:** READ-ONLY AUDIT — No code changes made

---

## SECTION 1 — APPLICATION OVERVIEW

### 1.1 TECHNICAL FOUNDATION

| Item | Detail |
|---|---|
| Framework | React 18.3.1 with TypeScript |
| Build Tool | Vite (via `vite.config.ts`) |
| Package Manager | npm (via `package.json`) |
| Hosting | Lovable Cloud (Supabase-backed) |
| Custom Domain | `staff-audit.be.ie` |
| Published URL | `https://staff-audit.lovable.app` |
| Database/Auth | Supabase (Lovable Cloud integration) |
| Email Service | Brevo (API integration via Edge Function) |

**Environment Variables:**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `VITE_SUPABASE_PROJECT_ID` — Project ID
- `VITE_PUBLIC_URL` — Production URL (fallback: `https://staff-audit.be.ie`)

**Edge Function Secrets:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `BREVO_API_KEY`
- `BREVO_SMTP_KEY`
- `LOVABLE_API_KEY`

**Meta Tags (index.html):**

```html
<title>Staff Audit — Be Connect | Hospitality Turnover Cost Calculator</title>
<meta name="description" content="Calculate your true cost of staff turnover in 60 seconds. See the 81% of costs most properties never account for. Free. Irish-sourced data.">
<meta name="author" content="Be Connect" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://staff-audit.be.ie/" />
<meta property="og:title" content="Staff Audit — Be Connect" />
<meta property="og:description" content="Calculate your true cost of staff turnover in 60 seconds. See the 81% of costs most properties never account for." />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Staff Audit — Be Connect" />
<meta name="twitter:description" content="Calculate your true cost of staff turnover in 60 seconds. Free. Irish-sourced data." />
<meta name="twitter:image" content="/og-image.png" />
<link rel="canonical" href="https://staff-audit.be.ie" />
```

**Key NPM Dependencies:**

| Package | Version | Purpose |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-router-dom | ^6.30.1 | Client-side routing |
| @supabase/supabase-js | ^2.95.3 | Database/auth client |
| @tanstack/react-query | ^5.83.0 | Data fetching (unused in most pages) |
| jspdf | ^4.1.0 | PDF export |
| recharts | ^2.15.4 | Charting (unused in current UI) |
| sonner | ^1.7.4 | Toast notifications |
| lucide-react | ^0.462.0 | Icon library |
| input-otp | ^1.4.2 | OTP/PIN input component |
| zod | ^3.25.76 | Schema validation |
| tailwindcss-animate | ^1.0.7 | CSS animations |
| framer-motion | Not installed | — |

**Font:** Montserrat (Google Fonts, loaded via `<link>` in index.html)

### 1.2 APPLICATION STRUCTURE

This is a **single-page application (SPA)** with multiple routes, served from a single `index.html` entry point.

**Directory structure under `src/`:**

| Directory | File Count | Purpose |
|---|---|---|
| `src/pages/` | 12 files | Page-level components |
| `src/components/` | ~50 files | Reusable UI components |
| `src/config/` | 2 files | Question/demographic config |
| `src/data/` | 1 file | Demo data fixtures |
| `src/utils/` | 3 files | Utility functions |
| `src/lib/` | 3 files | Calculation engine, PDF export |
| `src/hooks/` | 2 files | Custom React hooks |
| `src/integrations/` | 2 files | Supabase client/types (auto-generated) |
| `supabase/functions/` | 4 functions | Edge functions |

### 1.3 NAVIGATION & ROUTING

**All Routes Defined in `src/App.tsx`:**

| Route | Page Component | Purpose | Auth Required? | Status |
|---|---|---|---|---|
| `/` | `ChurnCalculator` | Main calculator + lead funnel | No | ✅ Live |
| `/pulse` | `Navigate → /pulse/survey` | Redirect | No | ✅ Live (redirect) |
| `/pulse/survey` | `PulseSurvey` | Legacy 4-question survey | No | ⚠️ Live but LEGACY |
| `/pulse/dashboard` | `PulseDashboard` | Legacy admin dashboard | Yes (admin) | ⚠️ Live but LEGACY |
| `/pulse/admin` | `AdminDashboard` | Legacy admin super-dashboard | Yes (admin) | ⚠️ Live but LEGACY |
| `/pulse/dossier/:code` | `DossierPage` | PIN-protected legacy dossier | PIN required | ⚠️ Live but LEGACY |
| `/vibe/:code` | `VibeCheck` | New 5-question vibe check survey | No | ✅ Live |
| `/admin` | `AdminLogin` | Admin login page | No | ✅ Live |
| `/admin/dossier` | `DossierIndex` | New dossier admin — lead list | Yes (admin) | ✅ Live |
| `/admin/dossier/:leadId` | `DossierView` | New dossier admin — individual lead | Yes (admin) | ✅ Live |
| `/report/:token` | `SharedReport` | PIN-protected shared report | PIN required | ✅ Live |
| `/thank-you/:leadId` | `ThankYou` | Post-submission thank you page | No | ✅ Live |
| `/thank-you` | `ThankYou` | Generic thank you (no lead ID) | No | ✅ Live |
| `/pulse/login` | `Navigate → /admin` | Legacy redirect | — | ✅ Redirect |
| `/pulse/signup` | `Navigate → /` | Legacy redirect | — | ✅ Redirect |
| `*` | `NotFound` | 404 page | No | ✅ Live |

**Global Navbar:** Minimal — displays only the "Be Connect" logo + Activity icon. No navigation links. Present on `/` (ChurnCalculator) and `/thank-you`.

**Global Footer:** Present on `/` and `/thank-you`. Text: "Staff Audit Pulse™ — Understand your team before they leave."

**Orphaned Pages (exist as files but NOT in router):**
- `src/pages/Index.tsx` — Generic "Welcome to Your Blank App" placeholder. **Not routed.**
- `src/pages/Login.tsx` — Legacy manager login page. **Not routed** (replaced by `AdminLogin`).
- `src/pages/Signup.tsx` — Legacy manager signup page. **Not routed** (redirected to `/`).

---

## SECTION 2 — PAGE-BY-PAGE AUDIT

### PAGE: `src/pages/ChurnCalculator.tsx`
**ROUTE:** `/`
**PURPOSE:** The primary landing page and top of the commercial funnel. Calculates staff turnover costs and captures leads.

**RENDERS:**
- Navbar with Be Connect branding
- Hero section: "Identify Your Hidden Operational Churn Tax"
- RegionSelector (step 1: choose Ireland/USA/UAE/EU, step 2: see regional cost drivers, then "Calculate My Turnover Cost" button)
- Three tabs: **Diagnostic**, **Mastery**, **DIY Toolbox**
  - **Diagnostic (default):** Interactive sliders (Staff Count, Turnover Rate, Agency %, Salary) → Results panel (Stability Score, Daily Bleed, Annual Cost, Forensic Breakdown) → Lead Capture Form
  - **Mastery:** Recovery potential stats → Protocol Dossier (4 accordion items) → Pricing Section → Lead Capture Form
  - **DIY Toolbox:** Three toolbox cards → "400+ hours/year" comparison → Lead Capture Form
- Footer

**COMPONENTS IMPORTED:** `RegionSelector`, `ForensicBreakdown`, `ProtocolDossier`, `PricingSection`, `LeadCaptureForm`, `SliderInput` (local), `StatCard` (local), `ToolboxCard` (local)

**DATA READ:** None from database. All calculations are client-side via `calculateChurn()`. Region preference stored in `localStorage` key `"staff-audit-region"`.

**DATA WRITTEN:** Via `LeadCaptureForm` component (see Section 12).

**USER INPUTS:**
- Region selection (4 buttons: Ireland, USA, UAE, Europe)
- Staff Count slider (1–500, default varies by region)
- Annual Turnover Rate slider (5–80%, default varies by region)
- % Recruited via Agency slider (0–100%, default varies by region)
- Average Monthly Salary slider (varies by region)
- Ramp-Up Months slider (1–12, only for unsupported regions)
- Acquisition Friction slider (only for unsupported regions)
- Tab selection (Diagnostic / Mastery / DIY Toolbox)
- "View Forensic Breakdown" toggle
- Lead capture form (8 fields — see Section 12)

**BUSINESS LOGIC:** Calculator updates in real-time as sliders move. `useMemo` recalculates on every input change. See Section 4 for full calculation logic.

**EXTERNAL INTEGRATIONS:** Google Calendar link for "Book a Strategy Session" → `https://calendar.app.google/jnoS2WB8um1GHo1S9`

**MOBILE BEHAVIOUR:** Responsive grid layout (`lg:grid-cols-5`). Sliders work on mobile. Tabs stack vertically.

**KNOWN ISSUES:** None critical.

---

### PAGE: `src/pages/VibeCheck.tsx`
**ROUTE:** `/vibe/:code`
**PURPOSE:** Team member anonymous survey (5 questions + demographics). The primary new survey flow.

**RENDERS:** Multi-screen flow:
1. **Loading** — Spinner while validating code
2. **Landing** — Property name, description, "Start Assessment →" button, anonymity assurances
3. **Pre-screen** — GDPR consent text, 4 demographic dropdowns (Department, Role, Tenure, Employment Type)
4. **Questions** (5 screens, one at a time) — Question text, 5 emoji options, progress bar, Back/Next buttons
5. **Submitting** — Spinner
6. **Done** — "Thank You!" message
7. **Error** — Retry button
8. **Invalid** — "This link doesn't seem to be valid"
9. **No Code** — "You need a valid team link"
10. **Already Done** — "You've already completed this assessment" (with "Take it again?" link)

**COMPONENTS IMPORTED:** `VibeProgressBar`, `QuestionOption`

**DATA READ:**
- `supabase.rpc("get_vibe_check_property", { check_code: code })` — validates code against `leads` table, returns `lead_id`, `property_name`, `staff_count`

**DATA WRITTEN:** Via `submitVibeCheck()`:
- `supabase.from("vibe_check_responses").insert(...)` — inserts all 5 scores + demographics
- `supabase.rpc("increment_vibe_check_responses", { lead_uuid: leadId })` — increments counter on `leads` table

**USER INPUTS:** 4 demographic dropdowns (all required), 5 question selections (1–5 each, all required before Next)

**BUSINESS LOGIC:**
- Code validation via RPC function (SECURITY DEFINER)
- Duplicate prevention via `sessionStorage` key `vibe_done_{code}`
- Anonymous ID generated via `crypto.randomUUID()`

**GDPR CONSENT TEXT (exact):**
> "Your answers are completely anonymous. Your manager never sees your individual responses — only team-level patterns when 3 or more people from the same department have responded. Your results are stored securely by Be Connect and shared with your property's nominated contact."

This text appears **BEFORE** the demographic dropdowns — compliance correct.

**MOBILE BEHAVIOUR:** Designed mobile-first. `max-w-md` container. Large tap targets on emoji options (min-h-[56px]). Works well at 375px.

**KNOWN ISSUES:** None.

---

### PAGE: `src/pages/ThankYou.tsx`
**ROUTE:** `/thank-you/:leadId` or `/thank-you?id=...`
**PURPOSE:** Post-submission confirmation page. Displays audit results and provides the Vibe Check link for sharing.

**RENDERS:**
1. Confirmation header with checkmark
2. `AuditResultsSummary` — turnover cost calculations
3. `VibeCheckLinkSection` — shareable link with WhatsApp/Email/Copy buttons
4. `ResponseTracker` — live response count with progress bar
5. "What Happens Next?" section with "Book a Strategy Session" CTA

**DATA READ:** `supabase.from("leads").select(...)..eq("id", leadId).single()`

**DATA WRITTEN:** None.

**KNOWN ISSUES:**
- 🔴 **CRITICAL:** `VibeCheckLinkSection` generates the Vibe Check URL as `/pulse/survey?org={code}` (line 28), which routes to the **legacy** `PulseSurvey` page, NOT the new `/vibe/{code}` flow. Team members who receive this link will take the wrong survey (4 questions instead of 5, different data tables).
- 🔴 **CRITICAL:** `AuditResultsSummary` hardcodes `"ireland"` as the region (line 19: `calculateChurn("ireland", ...)`), so non-Irish properties see Irish-sourced cost figures on the thank you page.

---

### PAGE: `src/pages/PulseSurvey.tsx`
**ROUTE:** `/pulse/survey`
**PURPOSE:** LEGACY 4-question pulse survey. Should be deprecated in favor of `/vibe/:code`.

**RENDERS:** Single-page survey with 4 emoji-based questions (Energy, Support, Growth, Spirit), optional open feedback, and optional department selection.

**DATA READ:** `supabase.from("organizations").select("id, org_name").eq("org_code", orgCode).single()`

**DATA WRITTEN:** `supabase.from("pulse_responses").insert(...)` — writes to the **legacy** `pulse_responses` table (NOT `vibe_check_responses`). Also manually increments `leads.vibe_check_responses` counter.

**KNOWN ISSUES:**
- ⚠️ This is the LEGACY survey. Data goes to `pulse_responses`, not `vibe_check_responses`. The new admin dossier system (`/admin/dossier`) reads from `vibe_check_responses`. This means **responses submitted via this legacy flow will not appear in the new dossier system**.
- Default org code fallback is `"kilkea-castle"` (line 17) if no `?org=` parameter.
- Duplicate prevention uses `localStorage` (7-day cooldown), not `sessionStorage` like the new flow.

---

### PAGE: `src/pages/PulseDashboard.tsx`
**ROUTE:** `/pulse/dashboard`
**PURPOSE:** LEGACY admin dashboard showing organization health scores from `pulse_responses` table.

**DATA READ:** `organizations` table + `pulse_responses` table (filtered for `is_demo_data = false`)

**KNOWN ISSUES:** Legacy system. Admin login currently redirects to `/pulse/dashboard` (AdminLogin.tsx line 36) instead of `/admin/dossier`.

---

### PAGE: `src/pages/AdminDashboard.tsx`
**ROUTE:** `/pulse/admin`
**PURPOSE:** LEGACY admin "super dashboard" with internal notes, status tracking, CSV export.

**DATA READ:** `organizations` + `pulse_responses` + `leads` tables

**KNOWN ISSUES:** Legacy. Reads from `pulse_responses` — not aligned with new Vibe Check system.

---

### PAGE: `src/pages/AdminLogin.tsx`
**ROUTE:** `/admin`
**PURPOSE:** Admin authentication page.

**RENDERS:** Email + password form. "Sign In" button.

**DATA READ:** `supabase.auth.signInWithPassword(...)` then `supabase.functions.invoke("check-admin")`

**BUSINESS LOGIC:** After successful login, calls the `check-admin` Edge Function which verifies the user has the `admin` role in the `user_roles` table using service role key.

**KNOWN ISSUES:**
- ⚠️ On successful login, redirects to `/pulse/dashboard` (line 36) — the LEGACY dashboard. Should redirect to `/admin/dossier`.

---

### PAGE: `src/pages/admin/DossierIndex.tsx`
**ROUTE:** `/admin/dossier`
**PURPOSE:** New admin lead management dashboard. Lists all leads with Vibe Check requested, shows response progress.

**DATA READ:** `supabase.from("leads").select(...).eq("vibe_check_requested", true)`

**COMPONENTS IMPORTED:** `AdminRouteGuard`

**BUSINESS LOGIC:** Status derived from response rate: New (0), Low (<50%), Building (50–79%), Ready (≥80%).

---

### PAGE: `src/pages/admin/DossierView.tsx`
**ROUTE:** `/admin/dossier/:leadId`
**PURPOSE:** Individual lead dossier view with Vibe Check analysis. Admin can toggle between Admin View and Shareable View.

**DATA READ:**
- `supabase.from("leads").select(...).eq("id", leadId).single()`
- `supabase.from("vibe_check_responses").select("*").eq("lead_id", leadId)` — reads from the **correct** new table
- `supabase.from("shared_reports").select("token").eq("lead_id", leadId)` — checks for existing share link

**DATA WRITTEN:**
- `supabase.from("shared_reports").insert(...)` — creates shareable link with PIN hash

**BUSINESS LOGIC:**
- Generates 12-character token for shareable link
- Generates 4-digit PIN, hashed with SHA-256 + random salt
- PIN hash stored in `shared_reports` table
- Share link expires after 30 days
- Admin view shows contact details (name, email, phone); Shareable view hides them
- PDF export available via jsPDF

**KNOWN ISSUES:**
- ⚠️ `annualCost` calculation on line 230–232 uses a hardcoded `€15,000` replacement cost: `staffCount * (turnoverRate / 100) * 15000`. This is inconsistent with the sophisticated calculator on the landing page.

---

### PAGE: `src/pages/report/SharedReport.tsx`
**ROUTE:** `/report/:token`
**PURPOSE:** PIN-protected shareable report for property managers.

**DATA READ:**
- `supabase.from("shared_reports").select("lead_id, expires_at, pin_hash, pin_salt").eq("token", token).single()`
- `supabase.from("leads").select("property_name, staff_count, turnover_rate").eq("id", leadId).single()`
- `supabase.functions.invoke("get-vibe-responses", { body: { lead_id: leadId } })`

**BUSINESS LOGIC:**
- Checks expiry date first
- If PIN exists, shows `PinEntry` component
- 🔴 **CRITICAL SECURITY ISSUE:** PIN verification happens CLIENT-SIDE. The `pin_hash` and `pin_salt` are fetched from the database and sent to the browser (line 37–39). The browser then computes `SHA-256(salt + pin)` and compares against the hash. This means:
  - The hash and salt are visible in browser DevTools → Network tab
  - A 4-digit PIN has only 9,000 possible values
  - An attacker can brute-force all combinations in under 1 second using JavaScript
  - The `PinEntry` lockout (5 attempts, 5-minute cooldown) is stored in `sessionStorage` and can be cleared or bypassed trivially

**KNOWN ISSUES:**
- 🔴 **CRITICAL:** Client-side PIN verification is insecure. Must be moved server-side.
- The `PinEntry` component has a lockout mechanism (5 attempts → 5-minute lockout) but it's stored in `sessionStorage` which is easily cleared.

---

### PAGE: `src/pages/DossierPage.tsx`
**ROUTE:** `/pulse/dossier/:code`
**PURPOSE:** LEGACY PIN-protected dossier for the old pulse system.

**BUSINESS LOGIC:** PIN verification happens server-side via the `get-dossier` Edge Function. This is the correct pattern (unlike `SharedReport.tsx`).

**KNOWN ISSUES:** Legacy system. Uses 6-digit PIN stored as raw text in `pulse_dossiers.pin_code` column. PIN is compared server-side, which is secure.

---

### PAGE: `src/pages/NotFound.tsx`
**ROUTE:** `*`
**PURPOSE:** 404 error page.
**KNOWN ISSUES:** Background uses `bg-muted` instead of `bg-background`, creating an inconsistent appearance.

---

### Orphaned Pages (NOT in router):

**`src/pages/Index.tsx`** — Generic Lovable template. Not used.  
**`src/pages/Login.tsx`** — Legacy manager login. Not routed. References `/pulse/signup`.  
**`src/pages/Signup.tsx`** — Legacy manager signup. Not routed. Creates auth users, organizations, and managers.

---

## SECTION 3 — COMPONENT INVENTORY

### Active Components

| Component | File Path | Used By | Purpose |
|---|---|---|---|
| LeadCaptureForm | `src/components/LeadCaptureForm.tsx` | ChurnCalculator (×3 tabs) | Lead capture form with upsert |
| RegionSelector | `src/components/calculator/RegionSelector.tsx` | ChurnCalculator | Region selection + cost drivers |
| ForensicBreakdown | `src/components/calculator/ForensicBreakdown.tsx` | ChurnCalculator | Expandable cost breakdown |
| ProtocolDossier | `src/components/calculator/ProtocolDossier.tsx` | ChurnCalculator (Mastery tab) | 4 retention protocol accordions |
| PricingSection | `src/components/calculator/PricingSection.tsx` | ChurnCalculator (Mastery tab) | DIY vs White-Glove pricing |
| VibeProgressBar | `src/components/vibe/VibeProgressBar.tsx` | VibeCheck | Progress indicator |
| QuestionOption | `src/components/vibe/QuestionOption.tsx` | VibeCheck | Emoji option button |
| AuditResultsSummary | `src/components/thankyou/AuditResultsSummary.tsx` | ThankYou | Turnover cost summary |
| VibeCheckLinkSection | `src/components/thankyou/VibeCheckLinkSection.tsx` | ThankYou | Share link with WhatsApp/Email |
| ResponseTracker | `src/components/thankyou/ResponseTracker.tsx` | ThankYou | Live response counter |
| PinEntry | `src/components/report/PinEntry.tsx` | SharedReport | 4-digit OTP PIN entry |
| AdminRouteGuard | `src/components/admin/AdminRouteGuard.tsx` | DossierIndex, DossierView | Auth + email-based access control |
| VibeScoreCard | `src/components/admin/VibeScoreCard.tsx` | DossierView, SharedReport | Overall vibe score display |
| BreakdownTable | `src/components/admin/BreakdownTable.tsx` | DossierView, SharedReport | Dept/Role/Tenure breakdown table |
| RiskFlags | `src/components/admin/RiskFlags.tsx` | DossierView, SharedReport | Risk flag alerts |
| HubCTA | `src/components/admin/HubCTA.tsx` | DossierView (shareable), SharedReport | Be Connect upsell CTA |
| OrgDetailView | `src/components/dashboard/OrgDetailView.tsx` | AdminDashboard, PulseDashboard | Org-level analysis (LEGACY) |
| DossierList | `src/components/dashboard/DossierList.tsx` | AdminDashboard, PulseDashboard | Dossier table (LEGACY) |
| GenerateDossierModal | `src/components/dashboard/GenerateDossierModal.tsx` | AdminDashboard, PulseDashboard | Create legacy dossier |
| WelcomeModal | `src/components/dashboard/WelcomeModal.tsx` | PulseDashboard (conditionally) | Post-signup welcome (LEGACY) |

### Orphaned/Unused Components

| Component | File Path | Imported? | Recommendation |
|---|---|---|---|
| NavLink | `src/components/NavLink.tsx` | **No** — not imported anywhere | DELETE |
| WelcomeModal | `src/components/dashboard/WelcomeModal.tsx` | Imported in PulseDashboard but never rendered in current code | DELETE or verify |

---

## SECTION 4 — CALCULATION ENGINE

### 4.1 STAFF AUDIT CALCULATOR

**File:** `src/lib/churnCalculations.ts`

#### INPUT VARIABLES

| Variable | UI Element | Default (Ireland) | Min/Max | Label |
|---|---|---|---|---|
| `teamCapacity` | Slider | 160 | 1–500 | Total Staff Count |
| `churnVelocity` | Slider | 30 | 5–60 | Annual Turnover Rate |
| `agencySplit` | Slider | 60 | 0–100 | % Recruited via Agency |
| `baseSalary` | Slider | €2,400 | €1,800–€5,000 | Average Monthly Salary |
| `rampMonths` | Slider (generic only) | 3 | 1–12 | Ramp-Up (Months) |
| `acqFriction` | Slider (generic only) | €2,500 | €500–€10,000 | Acquisition Friction |

#### CALCULATION LOGIC (Ireland)

```
Step 1: Annual departures = teamSize × (turnoverRate / 100)
        = 160 × 0.30 = 48

Step 2: Recruitment cost (blended per departure)
  Agency cost = €3,880 (fee €3,500 + HR €200 + onboarding €180)
  Direct cost = €1,280 (job boards €400 + HR screening €400 + manager interviews €300 + onboarding €180)
  Blended = (agencySplit/100 × 3880) + ((100-agencySplit)/100 × 1280)
           = (0.60 × 3880) + (0.40 × 1280) = 2328 + 512 = €2,840

  Category 1 Annual = €2,840 × 48 = €136,320

Step 3: Training & Compliance = €350 per departure
  (Fire Safety €80 + Manual Handling €60 + HACCP €60 + Uniform €150)
  Category 2 Annual = €350 × 48 = €16,800

Step 4: Productivity Loss = scales with salary
  Formula: max(600, min(2400, (baseSalary / 2400) × 1200))
  At €2,400/mo: (2400/2400) × 1200 = €1,200
  Category 3 Annual = €1,200 × 48 = €57,600

Step 5: Early Departure Risk = €800 per departure
  (20% failure rate × €3,990 sunk cost)
  Category 4 Annual = €800 × 48 = €38,400

Step 6: Cost per departure = Total / Departures

Step 7: Total annual cost = Cat1 + Cat2 + Cat3 + Cat4
         = 136,320 + 16,800 + 57,600 + 38,400 = €249,120

Step 8: Daily cost = 249,120 / 365 = €683

Step 9: Monthly cost = 249,120 / 12 = €20,760

Step 10: Visible cost = Category 1 (Recruitment) = €136,320
         Hidden cost = Total - Visible = €112,800
         Invisible % = 112,800 / 249,120 = 45%
```

#### TEST CASE VERIFICATION

With inputs: Staff 160, Turnover 30%, Agency 60/40, Salary €2,400/mo:

| Metric | Expected | Actual | Match? |
|---|---|---|---|
| Annual departures | 48 | 48 | ✅ |
| Cost per departure | €5,190 | €5,190 | ✅ |
| Annual cost | €249,120 | €249,120 | ✅ |
| Daily cost | €683 | €683 | ✅ |
| Monthly cost | €20,760 | €20,760 | ✅ |

**The calculator produces the exact expected numbers.**

#### STABILITY SCORE

For Ireland: `stabilityScore = max(0, min(100, 100 - turnoverRate))`

At 30% turnover: score = 70.

Note: For the generic fallback, the stability score formula is broken:
```javascript
stabilityScore: Math.max(0, Math.min(100, 100 - Math.round((annualSalary * 0 + departures * 0) * 0)))
```
This always returns **100** regardless of inputs (all multiplied by 0). This only affects unsupported regions.

#### FORENSIC BREAKDOWN

- **4 categories** for Ireland/USA/EU, **5 categories** for UAE
- Labels: "Recruitment & Onboarding", "Training & Compliance", "Productivity Loss", "Early Departure Risk" (+ "Housing Coordination" and "End-of-Service Risk" for UAE)
- Percentages are calculated as `Math.round((categoryAnnual / totalAnnual) * 100)`. Due to rounding, they may not sum to exactly 100%.
- Each category is displayed in an expandable accordion (`CategoryRow` component) showing line items and source citations.

#### THE "INVISIBLE 81%" CALCULATION

- **"Visible" costs** are defined as **Category 1: Recruitment & Onboarding only**
- **"Invisible" costs** are everything else (Training, Productivity Loss, Early Departure Risk)
- Formula: `invisiblePercentage = Math.round((hiddenCost / totalAnnual) * 100)`
- At default Irish values (160 staff, 30% turnover, 60/40 agency): invisible percentage = **45%**, not 81%.
- The "81%" figure referenced in meta tags and marketing copy does NOT match the calculator output at default values. The actual invisible percentage varies by inputs and is typically 40–55% for Ireland.
- ⚠️ **The meta description claims "See the 81% of costs most properties never account for" but the calculator shows ~45% at defaults. This is a credibility issue for board presentations.**

#### SOURCES CITED

**Ireland:**
- "IHF, Excel Recruitment 2026 Salary Guide, ITIC March 2024" (Recruitment)
- "Fáilte Ireland mandatory compliance requirements" (Training)
- "CSO avg weekly wage, Fáilte Ireland sector analysis" (Productivity)
- "IHF labour retention data, Fáilte Ireland 90-day attrition studies" (Early Departure)

**USA:**
- "SHRM 2025/2026 Talent Acquisition Benchmarking, BLS, AHLA"
- "OSHA, National Restaurant Association, state compliance requirements"
- "Cornell Center for Hospitality Research, SHRM onboarding benchmarks"
- "BLS JOLTS data, SHRM cost-of-bad-hire benchmarks"

**UAE:**
- "MOHRE, Gateway Hospitality, KPMG Dubai Hospitality Report 2025"
- "Dubai Municipality, UAE Civil Defence, DTCM service standards"
- "Emirates Academy of Hospitality Management, HFTP Middle East"
- "UAE Federal Labour Law (Decree-Law No. 33/2021)"

**EU:**
- "Eurostat, HOTREC, Destatis, INSEE, ONS"
- "EU Framework Directive 89/391/EEC, HACCP, GDPR"
- "HOTREC retention data, Eurostat job tenure statistics"

### 4.2 BACKGROUND CHECKS

The string `"background check"` appears in **2 files**:

1. `src/components/calculator/RegionSelector.tsx` line 66:
   ```
   { title: "Background Checks: Standard practice", detail: "Criminal, reference, and drug screening on every hire" }
   ```
   Context: USA region cost driver description.

2. `src/lib/churnCalculations.ts` line 190:
   ```
   { label: "Includes background checks (criminal + reference + drug screen)", amount: 200 * departures }
   ```
   Context: USA recruitment line item. $200 per departure for background checks.

`"garda vetting"` — **Not found anywhere.**
`"police clearance"` — **Not found anywhere.**

### 4.3 VIBE CHECK SCORING

**File:** `src/utils/dossierCalculations.ts`

The 5 question scores (each 1–5) are aggregated by simple arithmetic mean:

```javascript
overall = (q1 + q2 + q3 + q4 + q5) / 5
```

**Risk Level Thresholds:**

| Overall Score | Risk Level | Emoji |
|---|---|---|
| ≤ 2.0 | Critical | 🔴 |
| 2.1 – 3.0 | At Risk | 🟡 |
| 3.1 – 4.0 | Stable | 🟢 |
| 4.1 – 5.0 | Strong | 💚 |

This scoring is actively used in `VibeScoreCard`, `BreakdownTable`, `RiskFlags`, `HubCTA`, and the `SharedReport` page.

### 4.4 DOSSIER CALCULATIONS

**Department/Role/Tenure/Employment Breakdowns:**
- Responses are grouped by the relevant field using `groupByField(responses, field)`
- Each group calculates average scores for Q1–Q5 and an overall average

**Suppression Rule (< 3 respondents):**

```javascript
const MIN_SEGMENT_SIZE = 3;

// In groupByField():
if (items.length < MIN_SEGMENT_SIZE) {
  suppressed.push(...items);
} else {
  result.push(calcSegmentScore(getLabel(key), items));
}

// After grouping, if suppressed responses total ≥ 3:
if (suppressed.length >= MIN_SEGMENT_SIZE) {
  result.push(calcSegmentScore("Other", suppressed));
}
```

This applies to **all four breakdowns** (department, role, tenure, employment type). Suppressed groups are merged into an "Other" category if the combined count reaches ≥ 3. If fewer than 3 total, they are excluded entirely.

**Risk Flags — Every Condition:**

| # | Condition | Severity | Text Pattern |
|---|---|---|---|
| 1 | Any department overall ≤ 2.5 | 🔴 Red | "{dept} is in critical territory" |
| 2 | Q1 (filling roles) < 2.0 | 🔴 Red | "Recruitment is a crisis" |
| 3 | Q3 (competitor risk) < 2.5 | 🔴 Red | "High poaching risk" |
| 4 | Q4 (90-day retention) < 2.5 | 🔴 Red | "New hire retention is failing" |
| 5 | Manager overall - Team Member overall > 1.0 | 🟡 Yellow | "Perception gap: Managers rate... team members at..." |
| 6 | New starters (< 6 months) overall < tenured (3+ years) - 0.8 | 🟡 Yellow | "New starter experience is poor" |

**Score Color Coding:**

| Score | Color | CSS Class |
|---|---|---|
| ≤ 2.0 | Red | `text-destructive` |
| 2.1 – 2.5 | Orange | `text-orange-400` |
| 2.6 – 3.5 | Amber (primary) | `text-primary` |
| 3.6+ | Green | `text-green-400` |

---

## SECTION 5 — DATABASE SCHEMA

### TABLE: `leads`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| id | uuid | No | `gen_random_uuid()` | Primary key |
| full_name | text | No | — | Contact name |
| property_name | text | No | — | Hotel/property name |
| email | text | No | — | Contact email (upsert key) |
| phone | text | No | — | Contact phone |
| role | text | Yes | — | Contact's role (Owner, GM, etc.) |
| staff_count | integer | Yes | — | Number of staff |
| turnover_rate | integer | Yes | — | Estimated turnover % |
| biggest_challenge | text | Yes | — | Selected challenge |
| vibe_check_code | text | Yes | — | 6-char alphanumeric code |
| vibe_check_requested | boolean | Yes | `true` | Always true on submission |
| vibe_check_responses | integer | Yes | `0` | Counter incremented per response |
| vibe_check_total_staff | integer | Yes | — | Same as staff_count |
| dossier_pin | text | Yes | — | Unused in new flow |
| dossier_url | text | Yes | — | Unused in new flow |
| report_sent_at | timestamptz | Yes | — | When report was sent |
| status | text | No | `'new'` | Lead status |
| created_at | timestamptz | No | `now()` | Creation timestamp |
| updated_at | timestamptz | No | `now()` | Auto-updated via trigger |

**RLS Policies:**
- Anyone can INSERT (public lead capture)
- Anyone can SELECT by id (thank you page)
- Anyone can UPDATE (response counter increment)

**⚠️ Security Note:** The `leads` table has extremely permissive RLS — anyone can read ANY lead by ID, and anyone can update ANY lead. Lead IDs are UUIDs so not easily guessable, but this is still a concern.

### TABLE: `vibe_check_responses`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| id | uuid | No | `gen_random_uuid()` | Primary key |
| lead_id | uuid | Yes | — | FK → leads.id |
| anonymous_id | text | No | — | Random UUID per response |
| department | text | No | — | e.g. "fb", "kitchen" |
| role_level | text | No | — | e.g. "team_member" |
| tenure | text | No | — | e.g. "under_6m" |
| employment_type | text | No | — | e.g. "full_time" |
| q1_score – q5_score | integer (×5) | No | — | Scores 1–5 |
| created_at | timestamptz | No | `now()` | Submission time |

**RLS Policies:**
- Anyone can INSERT (anonymous survey submission)
- Only authenticated users can SELECT (admin only)

### TABLE: `shared_reports`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| id | uuid | No | `gen_random_uuid()` | Primary key |
| lead_id | uuid | Yes | — | FK → leads.id |
| token | text | No | — | 12-char access token |
| pin_hash | text | Yes | — | SHA-256 hash of PIN |
| pin_salt | text | Yes | — | 16-byte random salt |
| created_by | text | No | — | Admin email |
| expires_at | timestamptz | Yes | — | 30-day expiry |
| created_at | timestamptz | No | `now()` | Creation time |

**RLS Policies:**
- Admin manage (ALL) — restricted to `hello@be.ie` and `info@be.ie`
- Public can SELECT by token (anyone can read report metadata including pin_hash — **security issue**)

### TABLE: `organizations` (LEGACY — still active)

Used by the old PulseSurvey system. Also created by `LeadCaptureForm` to ensure legacy pulse survey links work.

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| id | uuid | No | `gen_random_uuid()` | Primary key |
| org_name | text | No | — | Organization name |
| org_code | text | No | — | Unique code (matches vibe_check_code) |
| manager_email | text | Yes | — | Manager's email |
| industry | text | Yes | — | Industry type |
| status | text | No | `'active'` | Status |
| internal_notes | text | Yes | — | Admin notes |
| created_at | timestamptz | No | `now()` | Creation time |

### TABLE: `pulse_responses` (LEGACY)

Used by old PulseSurvey. Has 4 questions (not 5). Separate data from `vibe_check_responses`.

### TABLE: `pulse_dossiers` (LEGACY)

Used by legacy dossier system at `/pulse/dossier/:code`. PIN stored as **raw text** in `pin_code` column (6-digit).

### TABLE: `dossier_actions` (LEGACY)

Tracks actions on legacy dossiers (pin_verified, protocol_expand, cta_interested, etc.).

### TABLE: `managers` (LEGACY)

Manager records linked to organizations. Created by legacy signup flow.

### TABLE: `user_roles`

| Column | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| id | uuid | No | `gen_random_uuid()` | Primary key |
| user_id | uuid | No | — | FK → auth.users |
| role | app_role enum | No | — | 'admin' or 'manager' |

---

## SECTION 6 — RPC FUNCTIONS & DATABASE FUNCTIONS

| Function | Parameters | Returns | Called From | Purpose | Security |
|---|---|---|---|---|---|
| `get_vibe_check_property` | `check_code: text` | `TABLE(lead_id uuid, property_name text, staff_count integer)` | `VibeCheck.tsx` | Validates vibe check code | SECURITY DEFINER |
| `increment_vibe_check_responses` | `lead_uuid: uuid` | void | `submitVibeCheck.ts` | Increments response counter atomically | SECURITY DEFINER |
| `has_role` | `_user_id: uuid, _role: app_role` | boolean | RLS policies | Checks user role | SECURITY DEFINER |
| `update_updated_at_column` | — (trigger) | trigger | `leads` table trigger (but **no triggers exist** according to config) | Auto-update `updated_at` | Normal |

---

## SECTION 7 — CONFIGURATION FILES

### 7.1 VIBE CHECK QUESTIONS

| # | Question Text | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Q1 | How easy is it to fill an open role right now? | 😰 Nightmare | 😟 Very difficult | 😐 Takes time | 😊 Manageable | 😌 No problem |
| Q2 | How many of your team would you rehire tomorrow? | 😬 Very few | 😟 Less than half | 😐 About half | 😊 Most of them | 😍 Almost all |
| Q3 | If a competitor offered €1/hr more, how many would stay? | 😰 We'd lose many | 😟 We'd lose some | 😐 Hard to say | 💪 Most would stay | 💪 They'd stay for sure |
| Q4 | How often do new hires make it past 90 days? | 😬 Rarely | 😟 Sometimes | 😐 About half | 😊 Usually | ✅ Almost always |
| Q5 | Rate your team's energy on a typical Monday morning. | 😴 Flat/exhausted | 😟 Low energy | 😐 Neutral | 😊 Pretty good | 🔥 Buzzing |

**Note:** Q3 mentions "€1/hr more" which is Ireland-specific language. Non-Irish users may find this confusing.

### 7.2 DEMOGRAPHICS

| Dropdown | Options |
|---|---|
| Department | Food & Beverage, Housekeeping, Front Desk/Reception, Kitchen, Maintenance/Facilities, Spa & Leisure, Admin/Office, Other |
| Role Level | Team Member, Supervisor/Team Lead, Manager |
| Tenure | Less than 6 months, 6–12 months, 1–3 years, 3+ years |
| Employment Type | Full-time, Part-time, Seasonal/Contract |

### 7.3 DESIGN SYSTEM

- **Primary color:** HSL `38 92% 50%` → Amber/Gold (#E6A817 approximate)
- **Background:** HSL `0 0% 10%` → Near-black (#1A1A1A)
- **Font:** Montserrat (all weights 300–900)
- **Dark mode only** — no light mode defined
- **Border radius:** 0.75rem
- **Destructive:** HSL `347 77% 50%` → Rose/Pink
- **Success:** HSL `160 84% 39%` → Green

---

## SECTION 8 — AUTHENTICATION & ACCESS CONTROL

### 8.1 AUTHENTICATION

Uses Supabase Auth with email/password sign-in. No social auth. No signup flow in the current router (legacy signup page exists but is redirected to `/`).

### 8.2 ADMIN ACCESS

**Admin Login:** `/admin` → `AdminLogin.tsx`

**Route Guard:** Two mechanisms:
1. `AdminRouteGuard` component — checks session, then compares `session.user.email` against hardcoded list: `["hello@be.ie", "info@be.ie"]`
2. `check-admin` Edge Function — verifies user has `admin` role in `user_roles` table using service role key

**Admin email addresses:** `hello@be.ie`, `info@be.ie` (hardcoded in `AdminRouteGuard.tsx` line 6)

**Admin capabilities vs public:**
- View all leads with contact details (email, phone, name)
- View individual Vibe Check responses aggregated by department/role/tenure
- Generate shareable links with PINs
- Export PDF reports
- Access legacy pulse dashboard and admin dashboard

### 8.3 PIN PROTECTION

**New System (SharedReport at `/report/:token`):**
- 4-digit PIN (range 1000–9999)
- Stored as SHA-256 hash + 16-byte salt
- 🔴 Verified CLIENT-SIDE (insecure — see Section 2)
- Lockout: 5 attempts → 5-minute lockout (stored in `sessionStorage` — easily bypassed)
- Links expire after 30 days

**Legacy System (DossierPage at `/pulse/dossier/:code`):**
- 6-digit PIN stored as RAW TEXT
- Verified SERVER-SIDE via `get-dossier` Edge Function (secure)
- No expiry on links
- No lockout mechanism

---

## SECTION 9 — DATA FLOWS

### FLOW 1: STAFF AUDIT → LEAD → THANK YOU

```
User loads `/` →
  ChurnCalculator renders RegionSelector (step 1: pick region) →
  User picks Ireland → sees cost drivers → clicks "Calculate My Turnover Cost" →
  Calculator renders with sliders (Staff: 160, Turnover: 30%, Agency: 60%) →
  User adjusts inputs → calculateChurn() recalculates via useMemo →
  Results display: Stability Score 70, Daily Bleed €683, Annual Cost €249,120 →
  User scrolls to LeadCaptureForm (bottom of any tab) →
  User fills: Full Name*, Property Name*, Role, Email*, Phone*, Staff Count, Turnover Rate, Biggest Challenge →
  On submit: LeadCaptureForm.handleSubmit() is called →
    Validates: name ≥ 2 chars, property ≥ 2 chars, valid email regex, phone ≥ 7 digits →
    Generates vibe check code: generateVibeCode() → 6 random chars from [a-z0-9] →
    Formats phone: formatIrishPhone() converts "08..." to "+353..." →
    Upserts into `leads` table with onConflict: "email" →
    Upserts into `organizations` table with onConflict: "org_code" →
    Fire-and-forget: supabase.functions.invoke("send-lead-emails") with:
      vibeCheckLink: `${VITE_PUBLIC_URL}/pulse/survey?org=${vibeCode}` ← 🔴 WRONG ROUTE
    Catches email errors silently →
  Redirects to `/thank-you?id=${leadId}` →
  ThankYou page loads →
    Fetches lead data from `leads` table by id →
    Displays: CheckCircle, "Your Staff Audit is Complete" →
    AuditResultsSummary: recalculates using Ireland defaults ← 🔴 HARDCODED REGION →
    VibeCheckLinkSection: shows link `/pulse/survey?org=${code}` ← 🔴 WRONG ROUTE →
    ResponseTracker: shows 0 of N responses →
    "Book a Strategy Session" button → Google Calendar link
```

### FLOW 2: VIBE CHECK (TEAM MEMBER)

```
Team member opens `/vibe/{code}` →
  VibeCheck.tsx mounts →
  Checks sessionStorage for `vibe_done_{code}` →
  If not done: calls supabase.rpc("get_vibe_check_property", { check_code: code }) →
  Function queries `leads` table where vibe_check_code = code →
  If valid: screen = "landing", shows property_name, anonymity assurances →
  User taps "Start Assessment →" →
  Pre-screen renders:
    GDPR consent text (quoted in Section 2) BEFORE dropdowns ✅ →
    4 required dropdowns: Department (8 options), Role (3 options), Tenure (4 options), Employment Type (3 options) →
  User completes pre-screen, taps "Next →" →
  Q1 renders: "How easy is it to fill an open role right now?" with 5 emoji options →
  Progress bar shows "Question 1 of 5" →
  User answers Q1-Q5 one per screen →
    Answers stored in local state: { 1: score, 2: score, ... } →
  On Q5 submit:
    submitVibeCheck(leadId, demographics, answers) →
      Generates anonymous_id via crypto.randomUUID() →
      Inserts into `vibe_check_responses` table: lead_id, anonymous_id, department, role_level, tenure, employment_type, q1-q5 scores →
      Calls supabase.rpc("increment_vibe_check_responses", { lead_uuid: leadId }) →
    Sets sessionStorage `vibe_done_{code}` = "true" →
  Completion screen: "Thank You!" + "Your response has been recorded." + confidentiality assurance
```

### FLOW 3: ADMIN DOSSIER PREPARATION

```
Admin navigates to `/admin` →
  AdminLogin renders email/password form →
  Admin logs in → supabase.auth.signInWithPassword() →
  check-admin Edge Function verifies admin role in user_roles table →
  ⚠️ Redirects to `/pulse/dashboard` (should be `/admin/dossier`) →
  Admin manually navigates to `/admin/dossier` →
  AdminRouteGuard checks session + email ∈ ["hello@be.ie", "info@be.ie"] →
  DossierIndex queries leads table where vibe_check_requested = true →
  Displays: Status, Property, Contact, Staff, Responses, Date, Action →
  Admin clicks "Open →" for specific lead →
  DossierView loads at `/admin/dossier/{leadId}` →
  Fetches lead data from `leads` table →
  Fetches responses from `vibe_check_responses` table where lead_id = leadId →
  Runs calculations:
    Overall score: (q1+q2+q3+q4+q5)/5 via calcOverallScores() →
    Department breakdown: groupByField(responses, "department") →
    Suppression: segments < 3 merged into "Other" →
    Risk flags: 6 conditions checked (see Section 4.4) →
  Admin view shows: Contact info, response progress, cost estimate, score card, 4 breakdown tables, risk flags →
  Toggle to "Shareable View": hides contact details, shows HubCTA →
  Generate shareable link:
    Creates 12-char token via crypto.randomUUID().replace(/-/g,"").slice(0,12) →
    Generates 4-digit PIN via generatePin() (1000-9999) →
    Salt: 16 random bytes →
    Hash: SHA-256(salt + pin) →
    Inserts into `shared_reports`: lead_id, token, pin_hash, pin_salt, created_by, expires_at (30 days) →
    Modal shows URL + PIN + "Save this PIN now — it cannot be retrieved later"
```

### FLOW 4: MANAGER ACCESSES PIN-PROTECTED REPORT

```
Manager opens `/report/{token}` →
  SharedReport.tsx mounts →
  Queries `shared_reports` table: select lead_id, expires_at, pin_hash, pin_salt where token = token →
  If not found: "Report Not Found" →
  If expired (expires_at < now): "Report Expired" →
  If pin_hash exists:
    Stores { leadId, pinHash, pinSalt } in state →
    Fetches property_name from leads table (just for display) →
    PinEntry renders with 4 OTP input boxes →
    On submit:
      🔴 Client computes: SHA-256(salt + enteredPin) →
      🔴 Compares against pinHash in state →
      If wrong: "Incorrect PIN. Please try again." Attempts tracked in sessionStorage →
      After 5 failures: "Too many attempts. Please try again in 5 minutes" →
      If correct:
        Calls supabase.functions.invoke("get-vibe-responses", { body: { lead_id } }) →
        Edge function fetches from vibe_check_responses using service role key →
        Renders full report:
          - Property name, date, "Confidential" label
          - VibeScoreCard (overall score + 5 question scores)
          - BreakdownTable × 4 (department, role, tenure, employment type) — with "Size" labels not counts
          - RiskFlags
          - HubCTA (Be Connect upsell)
        Does NOT show: Contact name, email, phone, lead ID, raw individual responses
```

---

## SECTION 10 — GDPR & PRIVACY COMPLIANCE

### 10.1 CONSENT

The GDPR consent statement appears in `VibeCheck.tsx` on the pre-screen (BEFORE demographic dropdowns). Exact text:

> "Your answers are completely anonymous. Your manager never sees your individual responses — only team-level patterns when 3 or more people from the same department have responded. Your results are stored securely by Be Connect and shared with your property's nominated contact."

A user **cannot** proceed without seeing it — it is displayed on the same screen as the required demographic dropdowns.

### 10.2 DATA COLLECTION

**PII Collected (via LeadCaptureForm → `leads` table):**

| PII | Table | Column | Form Field |
|---|---|---|---|
| Full name | leads | full_name | "Full Name *" |
| Email | leads | email | "Email *" |
| Phone | leads | phone | "Phone *" |
| Property name | leads | property_name | "Property Name *" |
| Role | leads | role | "Your Role" (optional) |

**Anonymous Data (via VibeCheck → `vibe_check_responses` table):**

All survey responses are anonymous. The `anonymous_id` is a random UUID generated per submission — it cannot be traced back to an individual. No IP address, device fingerprint, or session identifier is stored.

**Anonymity Safeguards:**
1. `anonymous_id` is `crypto.randomUUID()` — not linked to any user identity
2. No authentication required for survey submission
3. Suppression rule: segments with < 3 respondents are merged into "Other"
4. Shareable view shows "Size" labels (Small/Medium/Large) instead of exact counts

### 10.3 SUPPRESSION RULE

The `< 3` respondent suppression is enforced in `src/utils/dossierCalculations.ts`, function `groupByField()`, line 86:

```javascript
const MIN_SEGMENT_SIZE = 3;
if (items.length < MIN_SEGMENT_SIZE) {
  suppressed.push(...items);
}
```

It applies to **all four breakdowns**: department, role_level, tenure, employment_type.

Suppressed data is merged into an "Other" category if the combined suppressed count ≥ 3. If < 3, the data is excluded entirely from the breakdown.

### 10.4 ACCESS CONTROL

| Who | Can See | Enforced By |
|---|---|---|
| Admin (hello@be.ie, info@be.ie) | All aggregated data, raw response counts (not individual answers), contact details | `AdminRouteGuard` + `check-admin` Edge Function |
| Property manager (via /report/:token) | Aggregated scores, size labels (not counts), risk flags, HubCTA | Token + PIN (client-side) |
| Public | Nothing beyond their own survey submission | RLS policies |

A property manager **cannot** see individual responses. The `get-vibe-responses` Edge Function returns raw rows, but `SharedReport.tsx` only renders aggregated data via `groupByField()` and `calcOverallScores()`.

However, the RLS on `vibe_check_responses` allows only authenticated users to SELECT. The `get-vibe-responses` Edge Function uses the service role key to bypass this, which is correct.

### 10.5 DATA RETENTION

- **No auto-deletion logic** exists in the codebase
- Shared report links expire after **30 days** (checked on access)
- No mechanism exists to delete a lead's data on request (would require manual database intervention)
- Legacy dossier links (`/pulse/dossier/:code`) have **no expiry**

---

## SECTION 11 — EMAIL INTEGRATIONS

**Edge Function:** `supabase/functions/send-lead-emails/index.ts`

| Trigger | Recipient | Subject | Content Summary | Service | Status |
|---|---|---|---|---|---|
| Lead form submit | Lead (contactEmail) | "Your Staff Audit Results — {propertyName}" | Confirmation + Vibe Check link + Strategy Session CTA | Brevo API | ✅ Live |
| Lead form submit | hello@be.ie (internal) | "New Staff Audit Lead: {propertyName}" | Full lead details: name, email, phone, staff count, turnover, vibe check code | Brevo API | ✅ Live |

**Template:** Hardcoded HTML in the Edge Function. Not configurable without code deployment.

**Error Handling:** The `LeadCaptureForm` calls `supabase.functions.invoke("send-lead-emails")` with `.catch(() => {})` — email failures are silently ignored. The lead is still saved to the database.

**🔴 CRITICAL:** The Vibe Check link in the confirmation email uses the legacy route:
```javascript
vibeCheckLink: `${baseUrl}/pulse/survey?org=${vibeCode}`
```
This should be `${baseUrl}/vibe/${vibeCode}`.

---

## SECTION 12 — FORMS & DATA CAPTURE

### FORM: LeadCaptureForm

**LOCATION:** ChurnCalculator (appears in all 3 tabs)

**FIELDS:**

| Field | Type | Required | Validation | Pre-filled From |
|---|---|---|---|---|
| Full Name | text | Yes | ≥ 2 chars | — |
| Property Name | text | Yes | ≥ 2 chars | — |
| Your Role | select | No | — | — |
| Email | email | Yes | Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$` | — |
| Phone | tel | Yes | ≥ 7 digits after stripping spaces/hyphens | — |
| Full-time Staff Count | number | No | min=1 | Calculator slider value |
| Approx. Turnover Rate | number | No | 0–100 (or "Not sure" checkbox) | Calculator slider value |
| Biggest Challenge | select | No | — | — |

**ON SUBMIT:**
- `handleSubmit()` called
- Validates all required fields
- Generates 6-char vibe code
- Formats Irish phone numbers (08... → +353...)
- Upserts into `leads` table (conflict on email)
- Upserts into `organizations` table (conflict on org_code)
- Fire-and-forget email via Edge Function
- Redirects to `/thank-you?id=${data.id}`
- On failure: displays error message, does not redirect
- Submit button shows spinner during loading and is disabled

**Duplicate Detection:** Upsert with `onConflict: "email"` means the same email will update the existing lead record (new vibe code overwrites previous).

---

## SECTION 13 — VISUAL & UX AUDIT

### 13.1 TABS

The Diagnostic page (ChurnCalculator) has 3 tabs:

| Tab | Label | Content | Default? |
|---|---|---|---|
| 1 | Diagnostic | Calculator sliders + results + lead form | ✅ Yes |
| 2 | Mastery | Recovery stats + Protocol Dossier + Pricing + lead form | No |
| 3 | DIY Toolbox | 3 toolbox cards + time comparison + lead form | No |

### 13.2 BRAND CONSISTENCY

- **Primary accent:** HSL `38 92% 50%` (~#E6A817, amber/gold)
- **Font:** Montserrat throughout
- **Heading consistency:** Generally consistent. H1 uses `text-3xl md:text-5xl font-bold`
- **CTA buttons:** Use `variant="gold"` consistently — amber/gold with dark text
- ⚠️ Some hardcoded colors exist: `text-orange-400`, `text-green-400`, `text-green-500` in `dossierCalculations.ts` — not using design tokens

### 13.3 MOBILE RESPONSIVENESS

- Calculator: ✅ Stacks correctly. Sliders usable.
- Vibe Check: ✅ Designed mobile-first. Excellent at 375px.
- Thank You: ✅ Clean single-column layout.
- DossierView: ⚠️ Tables may overflow on very small screens (has `overflow-x-auto`).
- WhatsApp share button: ✅ Full width, large tap target.

### 13.4 ANIMATIONS

- `animate-fade-in`: Used extensively (fade in + translateY 10px)
- `animate-slide-up`: Used on survey cards (translateY 20px)
- `animate-pulse`: Used on demo mode badge
- `hover-scale`: Custom utility (`scale-105` on hover)
- Calculator updates in real-time as sliders move (via `useMemo`)
- No animations cause layout shift.

### 13.5 LOADING STATES

| Page | Loading State? | Details |
|---|---|---|
| Thank You | ✅ Yes | Spinner while fetching lead data |
| Vibe Check | ✅ Yes | Spinner while validating code |
| DossierView | ✅ Yes | Spinner while loading |
| SharedReport | ✅ Yes | Spinner while loading |
| DossierIndex | ✅ Yes | "Loading leads..." text |
| ChurnCalculator | N/A | No async data fetching |

No pages flash empty content before data loads.

---

## SECTION 14 — LEGACY & DEPRECATED CODE

### 14.1 OLD PULSE SYSTEM

| Item | Type | Still Referenced? | Recommendation |
|---|---|---|---|
| `organizations` table | DB table | Yes — created by LeadCaptureForm, read by legacy dashboards | KEEP (needed for legacy dossier system) |
| `pulse_responses` table | DB table | Yes — read by PulseSurvey, PulseDashboard, AdminDashboard, DossierPage | KEEP until legacy fully removed |
| `PulseSurvey.tsx` | Page | Yes — routed at `/pulse/survey` | REDIRECT to `/vibe/:code` |
| `PulseDashboard.tsx` | Page | Yes — routed at `/pulse/dashboard` | REPLACE with `/admin/dossier` |
| `AdminDashboard.tsx` | Page | Yes — routed at `/pulse/admin` | DEPRECATE |
| `DossierPage.tsx` | Page | Yes — routed at `/pulse/dossier/:code` | KEEP for existing shared links |
| `OrgDetailView.tsx` | Component | Yes — used by both legacy dashboards | DEPRECATE with dashboards |
| `DossierList.tsx` | Component | Yes — used by both legacy dashboards | DEPRECATE with dashboards |
| `GenerateDossierModal.tsx` | Component | Yes — used by both legacy dashboards | DEPRECATE |
| `WelcomeModal.tsx` | Component | Imported but likely never rendered | DELETE |
| `pdfExport.ts` | Utility | Yes — used by OrgDetailView | DEPRECATE with dashboard |
| `demoData.ts` | Data | Yes — used by OrgDetailView, PulseDashboard, get-dossier EF | KEEP for demo mode |

### 14.2 ORPHANED FILES

| File | Imported By | Recommendation |
|---|---|---|
| `src/pages/Index.tsx` | Not in router | DELETE |
| `src/pages/Login.tsx` | Not in router | DELETE |
| `src/pages/Signup.tsx` | Not in router | DELETE |
| `src/components/NavLink.tsx` | Not imported anywhere | DELETE |

### 14.3 CONSOLE ERRORS

Not tested in this audit (read-only). Expected: TypeScript `as any` casts throughout the codebase (used to work around strict type checking on Supabase client). These produce no runtime errors but indicate type safety gaps.

---

## SECTION 15 — KNOWN ISSUES & TECHNICAL DEBT

| # | Issue | Location | Severity | Fix Required |
|---|---|---|---|---|
| 1 | Vibe Check links use legacy `/pulse/survey?org=` route instead of `/vibe/{code}` | `VibeCheckLinkSection.tsx` L28, `LeadCaptureForm.tsx` L129, `send-lead-emails` EF | CRITICAL | Change to `/vibe/{code}` in all 3 locations |
| 2 | PIN verification is client-side — exposes hash+salt to browser | `SharedReport.tsx` L37-39, L100-108 | CRITICAL | Move to server-side Edge Function |
| 3 | `shared_reports` RLS allows public SELECT of `pin_hash` and `pin_salt` | RLS policy "Public read shared report by token" | CRITICAL | Restrict SELECT to only `lead_id, expires_at` columns or move PIN check server-side |
| 4 | Admin login redirects to legacy `/pulse/dashboard` | `AdminLogin.tsx` L36 | HIGH | Change to `/admin/dossier` |
| 5 | AuditResultsSummary hardcodes Ireland region | `AuditResultsSummary.tsx` L19 | HIGH | Pass region from calculator or lead data |
| 6 | "81%" in marketing copy doesn't match calculator output (~45%) | `index.html` meta tags, marketing | HIGH | Either update the calculator to produce 81% or change the copy |
| 7 | Legacy PulseSurvey writes to `pulse_responses` but new dossier reads `vibe_check_responses` | `PulseSurvey.tsx`, `DossierView.tsx` | HIGH | Either redirect `/pulse/survey` to `/vibe/:code` or merge data |
| 8 | Stability score in generic fallback always returns 100 | `churnCalculations.ts` L53 | MEDIUM | Fix formula |
| 9 | Q3 references "€1/hr" — not appropriate for USA/UAE/EU | `vibeCheckQuestions.ts` L39 | MEDIUM | Regionalize or generalize language |
| 10 | `leads` table has overly permissive RLS (anyone can read/update) | DB RLS policies | MEDIUM | Restrict to specific use cases |
| 11 | `DossierView` cost estimate uses hardcoded €15,000/departure | `DossierView.tsx` L230-232 | MEDIUM | Use actual calculator engine |
| 12 | `NotFound.tsx` uses `bg-muted` not `bg-background` | `NotFound.tsx` L12 | LOW | Fix background |
| 13 | Orphaned files: Index.tsx, Login.tsx, Signup.tsx, NavLink.tsx | Various | LOW | Delete |
| 14 | No data retention/deletion mechanism | Entire app | LOW | Implement for GDPR compliance |
| 15 | Email upsert on `leads` overwrites vibe_check_code | `LeadCaptureForm.tsx` L106-111 | MEDIUM | Previous team links become invalid if same email resubmits |

---

## SECTION 16 — COMMERCIAL FUNNEL ASSESSMENT

### 16.1 FUNNEL INTEGRITY

| Stage | Built? | Functional? | Handoff | Data Carry-Forward | Friction |
|---|---|---|---|---|---|
| **Staff Audit (Calculator)** | ✅ Yes | ✅ Yes | Lead form → Thank You page | staff_count, turnover_rate pre-filled | Smooth |
| **Vibe Check (Survey)** | ✅ Yes | ⚠️ Partially | 🔴 Link uses wrong route | vibe_check_code links lead to responses | **BROKEN** — link goes to legacy survey |
| **Dossier (Admin Analysis)** | ✅ Yes | ✅ Yes | Admin generates shareable link with PIN | lead_id → vibe_check_responses | Smooth (admin-side) |
| **Shared Report (Manager)** | ✅ Yes | ⚠️ Security issue | HubCTA → "team@beconnect.ie" | All vibe data displayed | PIN vulnerability |
| **Hub CTA** | ✅ Yes | ✅ Yes | Email/website link | Risk flags + cost data in CTA | Final conversion touch |

### 16.2 CONVERSION POINTS

- Lead is captured in `LeadCaptureForm` at the bottom of any calculator tab
- CTA text: **"Send Me My Free Vibe Check"**
- Immediately after submission: redirect to `/thank-you?id={leadId}`
- Vibe Check link available immediately on Thank You page AND sent via email
- 🔴 **The path from "I'm curious" to "my team is taking the Vibe Check" is BROKEN** because the shared link routes to the wrong survey

### 16.3 DATA CONTINUITY

- ✅ Lead form generates UUID → stored in `leads.id`
- ✅ UUID carries through to Thank You page via URL parameter
- ✅ `vibe_check_code` links back to same lead (via `get_vibe_check_property` RPC)
- ✅ Vibe check responses reference `lead_id` correctly
- ✅ Admin dossier pulls from same `lead_id` and aggregates correctly
- 🔴 **Chain breaks at the Vibe Check link** — wrong route means responses go to `pulse_responses` (legacy table) instead of `vibe_check_responses` (new table), so the admin dossier shows 0 responses

---

## SECTION 17 — DEMO READINESS ASSESSMENT

### 17.1 Is the Staff Audit calculator ready for a live demo with an Irish hotel GM?

**YES** — with one caveat. The calculator works correctly, produces accurate numbers, and the UI is polished. The only issue is the "81%" marketing claim vs the ~45% the calculator actually shows. This could cause a credibility question if the GM notices the discrepancy.

### 17.2 Is the Vibe Check flow ready for a GM to send the link to their team?

**NO** — **Blocker:** The link generated on the Thank You page and in the confirmation email routes to `/pulse/survey?org={code}`, which opens the LEGACY 4-question survey. The new 5-question Vibe Check at `/vibe/{code}` works perfectly, but nobody receives that link.

**Fix:** Change 3 lines of code (VibeCheckLinkSection.tsx L28, LeadCaptureForm.tsx L129, send-lead-emails/index.ts L74).

### 17.3 Is the admin dossier ready for the Be Connect team to use in a strategy call?

**YES** — provided the Vibe Check link issue is fixed first (otherwise there will be 0 responses to analyze). The dossier system is comprehensive: score cards, breakdown tables, risk flags, shareable links, PDF export.

### 17.4 Is the PIN-protected shareable dossier ready to send to a GM?

**PARTIALLY** — It works functionally, but the client-side PIN verification is a security vulnerability. For a demo, this is acceptable. For production use with real client data, the PIN check must be moved server-side.

### 17.5 What is the single strongest element?

**The Calculator.** The region-aware, source-cited, forensic breakdown with expandable line items is compelling. The "Daily Bleed" metric creates urgency ("You're losing €683 today"). The real-time slider updates make it interactive and personal. A GM seeing their exact property's numbers will lean forward.

### 17.6 What is the single weakest element?

**The broken Vibe Check link.** Every lead who fills in the form receives a link that sends their team to the wrong survey. This means zero data flows into the new dossier system, making the entire downstream funnel — dossier, shared report, HubCTA — empty and useless. This is a single-line fix but it undermines the entire product.

### 17.7 If you could only fix three things before a live demo next week:

1. **Fix the Vibe Check link** — Change `/pulse/survey?org={code}` to `/vibe/{code}` in VibeCheckLinkSection.tsx, LeadCaptureForm.tsx, and send-lead-emails Edge Function. (30 minutes)

2. **Fix the admin login redirect** — Change `navigate("/pulse/dashboard")` to `navigate("/admin/dossier")` in AdminLogin.tsx. (2 minutes)

3. **Fix the AuditResultsSummary hardcoded region** — Pass the selected region through to the Thank You page or detect from the lead's data. (30 minutes)

---

## END OF AUDIT REPORT

**Prepared by:** Lovable AI Audit System  
**Date:** 5 March 2026  
**Classification:** Confidential — Board of Advisors Only
