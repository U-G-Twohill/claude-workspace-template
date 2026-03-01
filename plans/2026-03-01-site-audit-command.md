# Plan: Create `/site-audit` Command — Comprehensive Website Audit for Agency Client Delivery

**Created:** 2026-03-01
**Status:** Implemented
**Request:** Create commands for SEO, analytics, performance, accessibility, and security auditing of live websites, with professional client-facing reports that support upsell opportunities and recurring maintenance plans.

---

## Overview

### What This Plan Accomplishes

Adds a `/site-audit` command that audits live websites across five dimensions — SEO, performance, accessibility, analytics, and security — producing professional, client-ready reports with scored grades, prioritised actions, trend tracking, and an upsell-ready "Improvement Opportunities" section. Includes a companion skill with reference checklists for consistent, thorough audits.

### Why This Matters

The agency needs a repeatable, professional audit workflow that serves three purposes: (1) quality assurance on sites the agency builds, (2) a deliverable product to sell as website health audits, and (3) the backbone of weekly/monthly maintenance plans where clients see tracked progress over time. A single command that handles all of this — with client-facing language, business impact framing, and built-in upsell structure — turns every audit into both a quality tool and a revenue driver.

---

## Current State

### Relevant Existing Structure

- `.claude/commands/harden.md` — Code-level security/bug auditing (9-phase structure, knowledge base, report template, focus modes). This is the primary pattern to follow, but `/harden` audits source code while `/site-audit` audits live websites.
- `.claude/commands/frontend-design.md` — Puppeteer auto-setup pattern, URL handling, external tool dependency management.
- `.claude/commands/discover.md` — Gap analysis pattern, structured findings tables.
- `.claude/skills/` — Existing skills (mcp-integration, skill-creator) show the pattern for companion reference material.
- `scripts/install-toolkit.sh` — Command manifest at lines 99-108, needs new entry.

### Gaps or Problems Being Addressed

- No command exists for auditing live/deployed websites (only source code via `/harden`)
- No standardised report format for client delivery
- No trend tracking across recurring audits of the same site
- No structured upsell mechanism built into audit outputs
- Agency has no repeatable process for maintenance plan audits

---

## Proposed Changes

### Summary of Changes

- Create `/site-audit` command with 9 phases mirroring `/harden` structure
- Create companion skill `.claude/skills/site-audit/` with reference checklists (SEO, security headers, WCAG, Lighthouse scoring)
- Auto-generate a `lighthouse-audit.mjs` script per-project for Lighthouse CLI integration
- Update `CLAUDE.md` with command documentation
- Update `install-toolkit.sh` command manifest
- Update `install.sh` to include the new skill in project scaffolding

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `.claude/commands/site-audit.md` | Main command — 9-phase website audit workflow |
| `.claude/skills/site-audit/SKILL.md` | Skill overview and usage guidance |
| `.claude/skills/site-audit/references/seo-checklist.md` | Complete SEO audit checklist with pass/fail criteria |
| `.claude/skills/site-audit/references/security-headers.md` | HTTP security headers checklist with correct values |
| `.claude/skills/site-audit/references/wcag-checklist.md` | WCAG 2.1 AA requirements mapped to automated checks |
| `.claude/skills/site-audit/references/lighthouse-scoring.md` | Lighthouse score thresholds, metric definitions |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `CLAUDE.md` | Add `/site-audit` to workspace structure tree, commands section, and pipeline notes |
| `scripts/install-toolkit.sh` | Add `site-audit.md` to COMMANDS array and help text |
| `scripts/install.sh` | Add skill files to copy manifest |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **One command with focus modes, not separate commands.** Mirrors the proven `/harden` pattern. A single comprehensive report is more compelling for client delivery than separate documents. Focus modes (`seo`, `performance`, `accessibility`, `analytics`, `security`, `full`) still allow targeted weekly checks. Keeps the command count manageable.

2. **Client-facing language, not developer language.** Unlike `/harden` which says "N+1 query pattern at file:line", `/site-audit` translates everything to business impact: "Page load time of 6.2 seconds means approximately 40% of mobile visitors leave before seeing your content." Reports use grades (A-F), effort estimates, and ROI framing.

3. **Lighthouse as the performance/accessibility backbone.** Rather than reimplementing web performance analysis, lean on `npx lighthouse` for industry-standard scores that clients can verify independently. The auto-generated `lighthouse-audit.mjs` script wraps this for consistent usage.

4. **Structural upsell section.** The "Improvement Opportunities" table with estimated hours and expected business impact is baked into every report template. This is not optional — it's core to the agency use case.

5. **Automatic trend tracking.** When previous reports exist for the same domain, the command detects them and includes a comparison table showing improvement/regression. This is what makes maintenance plans valuable — clients see measurable progress.

6. **Companion skill for reference material.** SEO checklists, WCAG requirements, and security header specs are extensive. Putting them in a skill keeps the command file focused on workflow while the skill provides domain knowledge. The skill auto-triggers when the command runs.

7. **Same site works for agency-built and external sites.** The command works identically for both. The difference surfaces in Phase 9 (Bridge to Action): agency-built sites bridge to `/create-plan` for fixes; external sites frame the report as a proposal/quote.

8. **URL is required, focus is optional.** Differs from `/harden` which operates on the current directory. `/site-audit` must target a specific URL since it audits live websites, not source code.

### Alternatives Considered

- **Two separate commands (`/seo-audit` + `/security-scan`):** Rejected because it fragments the report, doubles the maintenance burden, and misses cross-domain findings (e.g., Core Web Vitals affect both performance AND SEO ranking).
- **Five separate commands (one per audit dimension):** Rejected as excessive command proliferation. Focus modes achieve the same targeting without the cognitive overhead.
- **No companion skill (everything in the command file):** Rejected because the SEO and WCAG checklists alone would make the command file 500+ lines. Skills are the established pattern for reference material.

### Open Questions

1. **Client branding:** Should the report template include a placeholder for agency logo/branding, or keep it plain markdown? (Can be added later — start with clean markdown.)
2. **Lighthouse installation:** Should the command install Lighthouse globally (`npm install -g lighthouse`) or use `npx lighthouse` (no install needed, slightly slower)? Recommendation: `npx` for zero-setup, with a note that global install is faster for recurring use.

---

## Step-by-Step Tasks

### Step 1: Create the SEO Checklist Reference

Create `.claude/skills/site-audit/references/seo-checklist.md` with comprehensive SEO audit criteria organised by category:

**Actions:**
- Create the file with sections: Meta Tags, Headings, Structured Data, Sitemap & Robots.txt, Canonical URLs, Open Graph / Social, Images, Internal Linking, Content Signals, Mobile, Indexability
- Each item should have: what to check, how to check it (tool/method), pass/fail criteria, business impact if failing
- Keep it as a reference Claude reads during the audit, not instructions for the user

**Files affected:**
- `.claude/skills/site-audit/references/seo-checklist.md`

---

### Step 2: Create the Security Headers Reference

Create `.claude/skills/site-audit/references/security-headers.md` with the complete HTTP security headers checklist.

**Actions:**
- Cover: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection (deprecated but still checked), Cross-Origin headers
- Include: correct values, common misconfigurations, what each header protects against
- Also cover: SSL/TLS checks, cookie flags, mixed content, exposed paths to probe

**Files affected:**
- `.claude/skills/site-audit/references/security-headers.md`

---

### Step 3: Create the WCAG Checklist Reference

Create `.claude/skills/site-audit/references/wcag-checklist.md` with WCAG 2.1 Level AA requirements.

**Actions:**
- Organise by WCAG principle: Perceivable, Operable, Understandable, Robust
- Focus on checks that can be automated or visually inspected (not subjective criteria)
- Include: colour contrast ratios, ARIA usage, form labels, keyboard navigation, heading hierarchy, language attributes, link purpose, error identification
- Note which checks Lighthouse covers vs which need manual inspection

**Files affected:**
- `.claude/skills/site-audit/references/wcag-checklist.md`

---

### Step 4: Create the Lighthouse Scoring Reference

Create `.claude/skills/site-audit/references/lighthouse-scoring.md` with score interpretation.

**Actions:**
- Cover: Performance, Accessibility, Best Practices, SEO scores
- Include: score ranges (0-49 poor, 50-89 needs improvement, 90-100 good), metric definitions (LCP, FID/INP, CLS, FCP, TBT, SI)
- Include: how to map Lighthouse scores to the A-F grading system used in reports
- Note: Lighthouse JSON output structure for parsing

**Files affected:**
- `.claude/skills/site-audit/references/lighthouse-scoring.md`

---

### Step 5: Create the Skill SKILL.md

Create `.claude/skills/site-audit/SKILL.md` as the skill overview.

**Actions:**
- Follow the pattern from `.claude/skills/mcp-integration/SKILL.md`
- Describe what the skill provides: reference checklists for website auditing
- List the reference files and when each is used
- Note that this skill is consumed by the `/site-audit` command

**Files affected:**
- `.claude/skills/site-audit/SKILL.md`

---

### Step 6: Create the Main Command File

Create `.claude/commands/site-audit.md` with the full 9-phase audit workflow.

**Actions:**

The command should have this structure:

```
# Site Audit
> Audit a live website for SEO, performance, accessibility, analytics, and security — produce a client-ready report.

## Variables
target: $ARGUMENTS (required URL to audit, optionally followed by focus mode: "full", "seo", "performance", "accessibility", "analytics", "security". Default: "full")

## Instructions
[9 phases as detailed below]
```

**Phase 1: Site Reconnaissance**
- Parse URL from arguments, validate reachable (curl/WebFetch)
- Detect tech stack from HTTP headers, meta generator tags, page source patterns
- Find sitemap.xml and robots.txt
- Check for previous reports: `./outputs/site-audit-report-*-[domain].md`
- Read knowledge base: `./outputs/site-audit-knowledge.md` if exists
- Read skill references from `.claude/skills/site-audit/references/`
- Produce brief profile: "This is a [platform] site. [N] pages in sitemap. [Previous/first] audit."

**Phase 2: SEO Audit** (skip if focus excludes SEO)
- Reference: `.claude/skills/site-audit/references/seo-checklist.md`
- Check all items on the SEO checklist using WebFetch for HTML source and headers
- Use Puppeteer if site is an SPA (JavaScript-rendered content)
- Score out of 100 based on checklist pass rate

**Phase 3: Performance Audit** (skip if focus excludes performance)
- Check if Lighthouse is available: `npx lighthouse --version`
- If available, run: `npx lighthouse [URL] --output=json --output-path=./outputs/lighthouse-[domain].json --chrome-flags="--headless=new --no-sandbox"`
- Parse JSON output for scores and specific metrics
- If Lighthouse unavailable, perform manual checks: WebFetch for page weight, header inspection for caching/compression, source analysis for render-blocking resources
- Reference: `.claude/skills/site-audit/references/lighthouse-scoring.md`

**Phase 4: Accessibility Audit** (skip if focus excludes accessibility)
- Use Lighthouse accessibility results if available from Phase 3
- Reference: `.claude/skills/site-audit/references/wcag-checklist.md`
- Supplement with manual checks: colour contrast (from computed styles via Puppeteer), keyboard navigation, ARIA completeness
- Note legal risk framing: "WCAG 2.1 AA compliance is increasingly a legal requirement"

**Phase 5: Analytics Audit** (skip if focus excludes analytics)
- WebFetch page source, search for: gtag.js, GTM container, GA4 measurement ID (G-XXXXXXX), dataLayer
- Check for other analytics: Facebook Pixel (fbq), Hotjar, Microsoft Clarity, Plausible, Fathom
- If Puppeteer available, check runtime: `window.dataLayer`, `window.gtag`, `window.fbq`
- Evaluate: consent management present, analytics fires after consent, tag placement (head vs body, async)
- Check for conversion tracking signals: form submissions, e-commerce events

**Phase 6: Security Audit** (skip if focus excludes security)
- Reference: `.claude/skills/site-audit/references/security-headers.md`
- Check all security headers via curl/WebFetch
- SSL/TLS: certificate validity and expiration
- Probe common exposed paths: /.env, /.git, /wp-admin, /wp-login.php, /server-status, /phpinfo.php, /admin, /api
- Check for information disclosure: Server header, X-Powered-By, generator meta tags with version numbers
- Cookie security: Secure, HttpOnly, SameSite flags
- Mixed content detection
- HTTP → HTTPS redirect chain

**Phase 7: Compile Client-Facing Report**
- Save to `./outputs/site-audit-report-[YYYY-MM-DD]-[domain].md`
- Use the client-facing report template (specified in command) with:
  - Executive Summary (non-technical, 3-4 sentences, overall grade)
  - Site Profile (platform, hosting, pages audited)
  - Scores at a Glance table (category, score/100, grade A-F, status)
  - Priority Actions: Immediate (this week), Short-Term (this month), Recommended (next quarter)
  - Detailed Findings by category (business-language descriptions)
  - Improvement Opportunities table (opportunity, expected impact, investment hours, ROI timeframe) — this is the upsell section
  - Trend Tracking (if previous reports exist for same domain)
  - Methodology (tools and standards used — builds credibility)
  - Next Steps (clear call to action)

**Phase 8: Update Knowledge Base**
- Create/update `./outputs/site-audit-knowledge.md` following the `/harden` knowledge base pattern
- Track: audit history table, domain-specific patterns, common findings across client portfolio, false positives, fix effectiveness
- This enables trend tracking and makes recurring audits faster

**Phase 9: Bridge to Action**
- Present report path and summary
- Detect if this is an agency-built site (check if current project directory has source code matching the audited domain — look for deployment configs, package.json homepage field, etc.)
- If agency-built: offer to run `/create-plan fix [priority] findings from site audit`
- If external site: frame the report as a deliverable/proposal — "This report can be shared directly with the client as a website health assessment"
- For maintenance: note what changed since last audit, suggest scheduling next audit

**Files affected:**
- `.claude/commands/site-audit.md`

---

### Step 7: Update CLAUDE.md

Add the new command to CLAUDE.md.

**Actions:**
- Add `site-audit.md` to the workspace structure tree under `.claude/commands/`
- Add `site-audit/` to the workspace structure tree under `.claude/skills/`
- Add `/site-audit` command documentation to the Commands section (after `/frontend-design`)
- Add a note in the pipeline section that `/site-audit` is standalone (like `/frontend-design`)

**Files affected:**
- `CLAUDE.md`

---

### Step 8: Update Install Scripts

Add the new command and skill to both install scripts.

**Actions:**
- `scripts/install-toolkit.sh`: Add `"site-audit.md"` to the COMMANDS array and update the help text
- `scripts/install.sh`: Add the skill files to the copy manifest (following the mcp-integration pattern)

**Files affected:**
- `scripts/install-toolkit.sh`
- `scripts/install.sh`

---

### Step 9: Validate

Run through the testing checklist from the command development guide.

**Actions:**
- Verify command file follows the correct format (title, description, variables, instructions)
- Verify all paths are relative (`./`)
- Verify the command handles missing arguments (no URL provided) gracefully
- Verify focus modes work (each phase has skip logic)
- Verify skill references exist at the expected paths
- Run `bash scripts/install-toolkit.sh --force` to deploy
- Test `/site-audit https://example.com` in a project to verify end-to-end flow

**Files affected:**
- All new files (validation only, no modifications)

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` — Lists all commands and workspace structure
- `scripts/install-toolkit.sh` — Command manifest for deployment
- `scripts/install.sh` — Skill files for project scaffolding
- `reference/getting-started.md` — May want to mention the new command in the walkthrough

### Updates Needed for Consistency

- CLAUDE.md workspace structure tree (add command + skill)
- CLAUDE.md commands section (add documentation)
- install-toolkit.sh COMMANDS array + help text
- install.sh copy manifest for skill files

### Impact on Existing Workflows

- No impact on existing commands — `/site-audit` is standalone
- Complements `/harden` (code-level) with website-level auditing
- Can chain to `/create-plan` for fixing findings on agency-built sites
- Shares Puppeteer dependency with `/frontend-design` (already in toolkit)

---

## Validation Checklist

- [ ] Command file `.claude/commands/site-audit.md` exists and follows format conventions
- [ ] All 4 skill reference files exist under `.claude/skills/site-audit/references/`
- [ ] Skill SKILL.md exists and describes the skill correctly
- [ ] CLAUDE.md updated with command in structure tree and commands section
- [ ] `install-toolkit.sh` includes `site-audit.md` in COMMANDS array and help text
- [ ] `install.sh` includes skill files in copy manifest
- [ ] Command handles missing URL argument gracefully (error message)
- [ ] All focus modes documented and skip logic present in each phase
- [ ] Report template includes all required sections (executive summary, scores, priority actions, improvement opportunities, trend tracking)
- [ ] Knowledge base template follows `/harden` pattern
- [ ] All paths in command use `./` relative references
- [ ] Deploys successfully via `install-toolkit.sh --force`

---

## Success Criteria

The implementation is complete when:

1. `/site-audit https://example.com` produces a full client-facing report in `./outputs/`
2. Focus modes work: `/site-audit https://example.com seo` runs only the SEO phase
3. Repeat audits on the same domain show trend tracking in the report
4. The "Improvement Opportunities" section provides actionable upsell items with effort estimates
5. The knowledge base updates cumulatively across runs
6. The command deploys to all projects via `install-toolkit.sh`

---

## Notes

- **Future enhancement: PDF export.** Client reports in markdown are functional but PDF would be more polished for delivery. A future command or script could convert the markdown report to a branded PDF using a tool like `md-to-pdf` or Puppeteer's print-to-PDF. Not in scope for v1.
- **Future enhancement: Multi-page crawl.** v1 audits the URL provided (typically the homepage). A future version could crawl the sitemap and audit multiple pages, producing per-page scores with a summary roll-up.
- **Future enhancement: Scheduled audits.** Maintenance plans could be automated with a cron job or CI/CD pipeline that runs the audit weekly and commits the report. The knowledge base trend tracking already supports this — just needs the automation wrapper.
- **Lighthouse availability:** `npx lighthouse` requires Chrome/Chromium installed. On most dev machines this is present. If not available, Phase 3 degrades gracefully to manual checks. The command should note this clearly rather than failing.

---

## Implementation Notes

**Implemented:** 2026-03-01

### Summary

All 9 steps executed successfully. Created 6 new files (command + skill with 4 reference docs + SKILL.md), modified 3 existing files (CLAUDE.md, install-toolkit.sh, install.sh). Command deployed via install-toolkit.sh and is now available in all projects.

### Deviations from Plan

- **Added Phase 8: Export Individual Reports** — user requested the ability to export individual category reports (e.g., SEO-only report) for client delivery. Added `export` argument support and a dedicated phase that saves standalone per-category reports to `./outputs/`.
- **10 phases instead of 9** — the export phase was inserted as Phase 8, pushing the original Phase 8 (Knowledge Base) and Phase 9 (Bridge to Action) to Phases 9 and 10.

### Issues Encountered

None.
