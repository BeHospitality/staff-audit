# BE CONNECT PLATFORM — CROSS-APP INTEGRATION & SECURITY AUDIT

**App Under Audit:** Staff Audit (staff-audit.be.ie)  
**Audit Date:** 10 March 2026  
**Auditor:** Lovable AI  
**Scope:** Database connections, cross-app data flows, GDPR/security compliance

---

## 1. DATABASE CONNECTION VERIFICATION

### A) Supabase Project Details

| Item | Value |
|------|-------|
| **Project Reference ID** | `jjnljjxbvagcewzbegvp` |
| **Supabase URL** | `https://jjnljjxbvagcewzbegvp.supabase.co` |
| **Database Type** | **Isolated** — This is a standalone Supabase project. There is NO shared database connection with DNA Assessment or Hub. |

**Key Finding:** Staff Audit runs on its own isolated Supabase instance. There are **zero database-level integrations** with `dna.be.ie` or `hub.be.ie`. No foreign data wrappers, no shared schemas, no cross-database references exist.

---

### B) Tables This App Can Access

#### Tables This App READS From:

| Table | Where Read | Purpose |
|-------|-----------|---------|
| `leads` | ThankYou, DossierIndex, DossierView, SharedReport, LeadCaptureForm | Lead data, vibe check metadata |
| `organizations` | AdminDashboard, PulseDashboard, Signup, LeadCaptureForm | Org lookup, admin views |
| `pulse_responses` | AdminDashboard, PulseDashboard | Legacy pulse survey results |
| `vibe_check_responses` | DossierView, get-vibe-responses Edge Function | New vibe check results |
| `pulse_dossiers` | DossierPage | Legacy dossier delivery |
| `dossier_actions` | (via Edge Functions) | Action tracking |
| `shared_reports` | SharedReport | PIN-protected report links |
| `user_roles` | check-admin Edge Function | Admin role verification |
| `managers` | Signup (legacy, orphaned) | Legacy manager records |

#### Tables This App WRITES To:

| Table | Where Written | Operation |
|-------|--------------|-----------|
| `leads` | LeadCaptureForm, submitVibeCheck (via RPC) | UPSERT on lead capture, increment responses |
| `organizations` | LeadCaptureForm, AdminDashboard | UPSERT on lead capture, status/notes updates |
| `vibe_check_responses` | submitVibeCheck | INSERT on survey submission |
| `pulse_responses` | PulseSurvey (legacy) | INSERT on legacy survey |
| `pulse_dossiers` | DossierPage, PulseDashboard | UPDATE client_response, INSERT dossiers |
| `dossier_actions` | DossierPage | INSERT action logs |
| `shared_reports` | DossierView (admin) | INSERT share links |
| `managers` | Signup (legacy, orphaned) | INSERT manager records |

#### Tables This App Should NOT Access (But Has Permissions For):

| Table | Concern |
|-------|---------|
| `managers` | Only used by orphaned `Signup.tsx` — no active code path reaches it. RLS allows anon/authenticated INSERT. Should be locked down or removed. |
| `pulse_responses` | Legacy system. Still writable by anonymous users via RLS. If legacy Pulse is deprecated, INSERT policy should be removed. |

---

### C) Cross-App Table Dependencies

#### ⚠️ CRITICAL FINDING: NO CROSS-APP DATABASE INTEGRATION EXISTS

There are **zero shared tables** between Staff Audit, DNA Assessment, and Hub at the database level.

| Data Flow | Status | Evidence |
|-----------|--------|----------|
| Staff Audit → DNA Assessment | **NONE** | No references to `dna.be.ie` in any code file |
| Staff Audit → Hub | **NONE** | No API calls, webhooks, or DB links to `hub.be.ie` |
| DNA Assessment → Staff Audit | **NONE** | No inbound API endpoints or shared auth |
| Hub → Staff Audit | **NONE** | No inbound integrations |

#### Marketing Claims vs Reality:

The `HubCTA.tsx` component contains this text:
> *"Your Vibe Check data migrates directly into the Hub — no re-entry, no starting from scratch."*

**This is currently FALSE.** There is no code, API, webhook, or database connection that migrates data from Staff Audit to Hub. This is a marketing promise with no technical implementation.

#### Current Cross-App "Integration" (Text Only):

| Component | Reference | Type |
|-----------|-----------|------|
| `HubCTA.tsx` | `team@beconnect.ie`, `beconnect.ie` | Contact links only |
| `DossierView.tsx` | `team@beconnect.ie`, `beconnect.ie` | PDF footer text |
| `DossierPage.tsx` | `beconnect.ie` | "Learn More" external link |

**All cross-app references are static text/links. Zero programmatic integration.**

---

## 2. DATA FLOW MAPPING

### Complete Data Flow Within Staff Audit:

```
[User visits calculator] → [Fills lead form]
       ↓
[LeadCaptureForm.tsx]
       ↓
  ┌────┴────┐
  │         │
  ↓         ↓
[leads]  [organizations]    ← UPSERT both tables
  │         
  ↓         
[send-lead-emails Edge Fn]  ← Brevo SMTP (fire-and-forget)
  │
  ├→ Confirmation email to lead (with Vibe Check link)
  └→ Internal email to hello@be.ie
       
[Employee receives link] → [/vibe/:code]
       ↓
[VibeCheck.tsx] → [submitVibeCheck.ts]
       ↓
  ┌────┴────┐
  │         │
  ↓         ↓
[vibe_check_responses]  [leads.vibe_check_responses++]
                              (via increment_vibe_check_responses RPC)

[Admin visits /admin] → [AdminLogin.tsx] → [check-admin Edge Fn]
       ↓
[/admin/dossier/:leadId] → [DossierView.tsx]
       ↓
[Creates shared report link] → [shared_reports table]
       ↓
[/report/:token] → [SharedReport.tsx] → [PIN verification] → [Report display]
```

### External Data Flows:

| Direction | Service | Data Sent | Security |
|-----------|---------|-----------|----------|
| **OUT** → Brevo SMTP API | Email delivery | Lead name, email, property, vibe check link, staff count, turnover rate | API key stored as secret `BREVO_API_KEY` |
| **OUT** → Google Calendar | Booking link | None (static URL in email) | N/A |
| **IN** ← User browser | Form submissions | PII (name, email, phone, property) | HTTPS only, no encryption at rest beyond Supabase defaults |

---

## 3. GDPR & DATA PROTECTION AUDIT

### A) Personal Data Inventory

| Table | PII Fields | Data Subject | Lawful Basis |
|-------|-----------|-------------|--------------|
| `leads` | `full_name`, `email`, `phone`, `property_name`, `role` | Property managers/owners | Consent (form submission) |
| `organizations` | `manager_email`, `org_name` | Property managers | Legitimate interest |
| `vibe_check_responses` | `department`, `role_level`, `tenure`, `employment_type` | Employees | Consent (survey participation) |
| `managers` | `email`, `name` | Legacy managers | Consent (legacy signup) |
| `shared_reports` | `created_by` (admin email) | Admins | Legitimate interest |

### B) GDPR Compliance Issues

#### 🔴 CRITICAL: No Privacy Policy or Cookie Notice

- **No privacy policy page** exists in the application
- **No cookie consent banner** — the app uses `localStorage` for session persistence
- **No data processing agreement** reference
- **No "right to erasure" mechanism** — no way for leads to request data deletion
- **No data retention policy** — leads data persists indefinitely

#### 🔴 CRITICAL: No Consent Record

- The lead capture form has **no explicit consent checkbox** for data processing
- No record of when/how consent was given
- The text "100% confidential" appears but this is not GDPR consent

#### 🟡 WARNING: Employee Survey Anonymity

- `vibe_check_responses` uses `anonymous_id` (random UUID) — good
- However, demographic fields (`department`, `role_level`, `tenure`, `employment_type`) combined with small team sizes could **re-identify individuals**
- No minimum response threshold is enforced at the database level (the UI mentions 80% but doesn't enforce it)

#### 🟡 WARNING: Email Data Sent to Third Party

- Lead PII (name, email, phone, property, staff data) is sent to **Brevo** (Sendinblue) via SMTP API
- No data processing agreement (DPA) with Brevo is referenced
- No mention of Brevo in any privacy disclosure

#### 🟢 GOOD: Anonymous Survey Design

- Employee responses use random UUIDs, not user accounts
- No authentication required for survey submission
- No IP addresses or device fingerprints stored

---

## 4. SECURITY AUDIT

### A) Authentication & Authorization

| Area | Status | Detail |
|------|--------|--------|
| Admin auth | ✅ Server-side | `check-admin` Edge Function verifies JWT + role via service role key |
| Admin emails | ⚠️ Hardcoded | `AdminRouteGuard.tsx` hardcodes `["hello@be.ie", "info@be.ie"]` — redundant with DB role check but creates maintenance burden |
| Public survey | ✅ No auth needed | Anonymous by design |
| Lead capture | ✅ No auth needed | Public form, appropriate for lead gen |

### B) Row-Level Security (RLS) Assessment

| Table | RLS Enabled | Issues |
|-------|-------------|--------|
| `leads` | ✅ | ⚠️ **Anyone can SELECT all leads** — policy says "by id" but expression is `true` (no ID filter). Any anonymous user can enumerate all leads. |
| `organizations` | ✅ | ⚠️ **Anyone can SELECT all orgs** — same issue, expression is `true` |
| `vibe_check_responses` | ✅ | ✅ INSERT open (needed), SELECT restricted to authenticated |
| `pulse_responses` | ✅ | ⚠️ Anonymous INSERT still open for deprecated legacy system |
| `shared_reports` | ✅ | ⚠️ **Anyone can SELECT all shared reports** — exposes `pin_hash` and `pin_salt` to anonymous users |
| `user_roles` | ✅ | ✅ Properly locked down |
| `pulse_dossiers` | ✅ | ⚠️ Anyone can read AND update any dossier |
| `managers` | ✅ | ⚠️ Anon/authenticated can INSERT freely |

### C) Critical Security Vulnerabilities

#### 🔴 CRITICAL: Client-Side PIN Verification (SharedReport.tsx)

```typescript
// Lines 100-108 — PIN hash & salt sent to browser, compared client-side
const handlePinSubmit = async (enteredPin: string): Promise<boolean> => {
  if (!reportData?.pinHash || !reportData?.pinSalt) return false;
  const hash = await hashPin(enteredPin, reportData.pinSalt);
  if (hash === reportData.pinHash) { ... }
};
```

**Impact:** The `shared_reports` table's `pin_hash` and `pin_salt` are fetched to the client browser. Since PINs are only 4 digits (10,000 combinations), an attacker can brute-force offline in milliseconds.

**Fix Required:** Move PIN verification to a server-side Edge Function.

#### 🔴 CRITICAL: Overly Permissive RLS on `leads` Table

The SELECT policy named "Anyone can read leads by id" has expression `true` — meaning **any anonymous user can query ALL leads** including names, emails, phones, and property data. This is a GDPR data breach risk.

**Fix Required:** Restrict SELECT to authenticated admins, or filter by specific ID in the policy.

#### 🔴 CRITICAL: Overly Permissive RLS on `shared_reports` Table

The "Public read shared report by token" policy has expression `true` — meaning any anonymous user can SELECT all shared reports, including `pin_hash` and `pin_salt` fields. Combined with client-side PIN verification, this exposes all report PINs.

**Fix Required:** Restrict SELECT to match on `token` column, or remove `pin_hash`/`pin_salt` from public-facing queries.

#### 🟡 WARNING: Leads Table Fully Updatable by Anyone

The UPDATE policy on `leads` has both `USING` and `WITH CHECK` set to `true`. Any anonymous user can update any lead record (change email, name, phone, etc.).

**Fix Required:** Restrict updates to specific fields needed for anonymous operations (e.g., only `vibe_check_responses` increment via RPC).

---

## 5. CROSS-APP INTEGRATION RECOMMENDATIONS

Since no technical integration currently exists between the three apps, here are recommendations if cross-app data sharing is planned:

### Option A: Shared Supabase Project (Simplest)
- Move all three apps to a single Supabase project
- Use separate schemas or table prefixes per app
- Share the `leads` table as the common data bridge
- **Risk:** Single point of failure, complex RLS

### Option B: API-Based Integration (Recommended)
- Each app keeps its own database
- Create Edge Functions that expose specific data endpoints
- Staff Audit → Hub: POST lead data when Vibe Check completes
- Hub → Staff Audit: Webhook to update lead status
- DNA → Hub: POST career profile data
- **Benefit:** Clean separation of concerns, auditable data flows

### Option C: Event-Driven (Most Scalable)
- Use a message queue (e.g., Supabase Realtime or external)
- Apps publish events (lead_created, vibe_check_completed, etc.)
- Other apps subscribe to relevant events
- **Benefit:** Loosely coupled, extensible

---

## 6. SUMMARY OF FINDINGS

### Critical Issues (Must Fix):

| # | Issue | Risk | Location |
|---|-------|------|----------|
| 1 | Client-side PIN verification | Security — trivial brute-force | `SharedReport.tsx:100-108` |
| 2 | `leads` SELECT RLS too permissive | GDPR — full PII exposure | RLS policy on `leads` table |
| 3 | `shared_reports` SELECT RLS too permissive | Security — exposes PIN hashes | RLS policy on `shared_reports` |
| 4 | No privacy policy or consent mechanism | GDPR — non-compliant | Entire application |
| 5 | No data retention/erasure process | GDPR — non-compliant | No implementation exists |
| 6 | `leads` UPDATE RLS too permissive | Security — anyone can modify lead data | RLS policy on `leads` table |

### High Priority Issues:

| # | Issue | Risk | Location |
|---|-------|------|----------|
| 7 | HubCTA claims data migration that doesn't exist | Trust/Legal — false marketing claim | `HubCTA.tsx:49` |
| 8 | No Brevo DPA reference | GDPR — third-party processor | `send-lead-emails/index.ts` |
| 9 | Vibe Check links point to wrong route (`/pulse/survey`) | Functional — broken data flow | `LeadCaptureForm.tsx:129`, `VibeCheckLinkSection.tsx:28` |
| 10 | No cross-app integration exists despite product positioning | Strategic — platform is 3 isolated apps | All codebase |

### Low Priority:

| # | Issue | Location |
|---|-------|----------|
| 11 | Orphaned files (Login.tsx, Signup.tsx, WelcomeModal.tsx) | `src/pages/` |
| 12 | Legacy Pulse system still has open INSERT RLS | `pulse_responses` table |
| 13 | AdminLogin redirects to wrong dashboard | `AdminLogin.tsx` |

---

## 7. CROSS-APP DATA SHARING MATRIX

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   STAFF AUDIT    │     │  DNA ASSESSMENT  │     │       HUB        │
│ staff-audit.be.ie│     │    dna.be.ie     │     │    hub.be.ie     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ DB: jjnljjxb...  │     │ DB: ???          │     │ DB: ???          │
│                  │     │                  │     │                  │
│ Tables:          │     │ Tables:          │     │ Tables:          │
│ • leads          │     │ • (unknown)      │     │ • (unknown)      │
│ • organizations  │     │                  │     │                  │
│ • vibe_check_*   │     │                  │     │                  │
│ • pulse_*        │     │                  │     │                  │
│ • shared_reports │     │                  │     │                  │
│ • user_roles     │     │                  │     │                  │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│                  │     │                  │     │                  │
│  ──── NO CONNECTION ────── NO CONNECTION ───    │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Data flows between apps: ZERO
Shared authentication: ZERO  
Shared tables: ZERO
API integrations: ZERO
Webhooks: ZERO
```

---

*End of Cross-Platform Audit Report*
