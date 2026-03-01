# Site Audit

> Audit a live website for SEO, performance, accessibility, analytics, and security — produce a client-ready report with scores, prioritised actions, and improvement opportunities.

## Variables

target: $ARGUMENTS (required URL to audit, optionally followed by focus mode and/or "export". Focus modes: "full" (default), "seo", "performance", "accessibility", "analytics", "security". Add "export" to save individual section reports. Examples: "https://example.com", "https://example.com seo", "https://example.com full export", "https://example.com seo export")

## Instructions

You are performing a comprehensive website audit on a live URL. Your goal is to assess the site across multiple dimensions, score each category, and produce a professional, client-facing report. All findings should be written in business language — translate technical issues into business impact.

**Important:** This command analyses and reports. It does NOT modify any website or code. Fixes for agency-built sites go through `/create-plan` → `/implement` with user approval.

---

### Phase 1: Site Reconnaissance

Before auditing, understand what you're working with.

1. **Parse arguments:** Extract the URL, focus mode (default: `full`), and whether `export` was requested.
   - If no URL provided, stop and ask: "Please provide a URL to audit. Usage: `/site-audit https://example.com [focus] [export]`"
2. **Validate the URL** is reachable using WebFetch or curl. If unreachable, report the error and stop.
3. **Detect the tech stack:**
   - WebFetch the URL and inspect HTTP response headers (`Server`, `X-Powered-By`, `X-Generator`)
   - Check HTML source for `<meta name="generator">`, framework-specific patterns (React root divs, Next.js `__NEXT_DATA__`, WordPress body classes, Shopify `Shopify.` globals)
   - Note the CMS/framework, hosting hints, and CDN (Cloudflare, Vercel, Netlify, etc.)
4. **Find sitemap and robots.txt:**
   - Fetch `[domain]/sitemap.xml` and `[domain]/robots.txt`
   - Count pages in sitemap if available
5. **Check for previous audits:**
   - Look for existing reports: `./outputs/site-audit-report-*-[domain].md`
   - Read knowledge base: `./outputs/site-audit-knowledge.md` if it exists
6. **Read skill references** from `./` relative paths (these may be at `.claude/skills/site-audit/references/` in the project or available via the toolkit):
   - SEO checklist, security headers, WCAG checklist, Lighthouse scoring guide

Produce a brief profile: "This is a [platform/framework] site hosted on [provider/CDN]. Sitemap has [N] pages. [First audit / Previous audit on DATE — will include trend comparison]."

---

### Phase 2: SEO Audit

**Skip if focus is `performance`, `accessibility`, `analytics`, or `security` only.**

Reference the SEO checklist and systematically check each category:

1. **Meta Tags:** Title (length, uniqueness), description (length, presence), viewport, charset, language
2. **Headings:** H1 count, heading hierarchy, keyword relevance in H1
3. **Structured Data:** JSON-LD presence, schema.org types used, validity
4. **Sitemap & Robots.txt:** Existence, validity, coverage, cross-reference
5. **Canonical URLs:** Present, self-referencing, absolute, protocol/www consistency
6. **Open Graph & Social:** og:title, og:description, og:image, twitter:card
7. **Images:** Alt text presence and quality, dimensions specified, modern formats, lazy loading
8. **Internal Linking:** Broken links (sample check key navigation links), anchor text quality, link depth
9. **Content Signals:** Content length on key pages, duplicate content indicators
10. **Mobile:** Viewport meta, responsive indicators
11. **Indexability:** HTTP status codes, redirect chains, HTTPS enforcement

**Method:** Use WebFetch for HTML source and headers. For SPAs with JavaScript-rendered content, note that manual browser inspection may be needed for full accuracy.

**Score:** Count pass/fail across checklist items. Calculate percentage score out of 100.

---

### Phase 3: Performance Audit

**Skip if focus is `seo`, `accessibility`, `analytics`, or `security` only.**

1. **Try Lighthouse first:**

   ```bash
   npx lighthouse [URL] --output=json --output-path=./outputs/lighthouse-[domain].json --chrome-flags="--headless=new --no-sandbox" 2>/dev/null
   ```

   If Lighthouse is available, parse the JSON output for:
   - Performance score (0-100)
   - Core Web Vitals: LCP, INP/TBT, CLS
   - FCP, Speed Index, TTI
   - Specific audit failures with element details

2. **If Lighthouse is unavailable,** perform manual checks:
   - WebFetch and measure response time (TTFB approximation)
   - Check response headers for caching (`Cache-Control`, `Expires`)
   - Check for compression (`Content-Encoding: gzip` or `br`)
   - Analyse HTML source for render-blocking resources (CSS in `<head>` without `media`, synchronous JS before content)
   - Check image formats and sizes
   - Count third-party script domains
   - Note: "Lighthouse was unavailable. Install with `npm install -g lighthouse` for automated Core Web Vitals scoring. Manual assessment provided below."

3. **Reference** the Lighthouse scoring guide for metric interpretation and grade mapping.

**Score:** Use Lighthouse score directly if available; otherwise estimate based on manual checks.

---

### Phase 4: Accessibility Audit

**Skip if focus is `seo`, `performance`, `analytics`, or `security` only.**

1. **Use Lighthouse accessibility results** if available from Phase 3
2. **Reference** the WCAG checklist and check each category:
   - **Perceivable:** Alt text, colour contrast, heading hierarchy, form labels, landmarks
   - **Operable:** Keyboard accessibility, focus visibility, skip navigation, target sizes
   - **Understandable:** Page language, form error handling, consistent navigation
   - **Robust:** Valid HTML, ARIA usage, status messages
3. **Note legal context** for the client: "WCAG 2.1 AA compliance is increasingly a legal requirement (Equality Act 2010 in the UK, ADA in the US, European Accessibility Act from 2025). Non-compliance carries both legal and reputational risk."

**Score:** Combine Lighthouse accessibility score with manual checklist assessment.

---

### Phase 5: Analytics Audit

**Skip if focus is `seo`, `performance`, `accessibility`, or `security` only.**

1. **Detect analytics tools** by WebFetching the page source and searching for:
   - Google Analytics 4: `gtag.js`, measurement ID pattern `G-XXXXXXX`
   - Google Tag Manager: `googletagmanager.com/gtm.js`, container ID `GTM-XXXXXX`
   - Facebook Pixel: `fbq(`, `connect.facebook.net`
   - Microsoft Clarity: `clarity.ms`
   - Hotjar: `hotjar.com`
   - Plausible: `plausible.io`
   - Fathom: `usefathom.com`
   - Other: search for common analytics script patterns

2. **Evaluate implementation quality:**
   - Tag placement: Is analytics in `<head>` (recommended) or `<body>`?
   - Loading: Are scripts loaded `async` or `defer`?
   - Cookie consent: Is there a consent management platform (CMP)? Does analytics fire before consent? (GDPR/PECR compliance issue)
   - dataLayer: Is `window.dataLayer` present? (Required for GTM)
   - Conversion tracking: Any evidence of form submission tracking, e-commerce events, or custom event tracking?

3. **Assess completeness:**
   - Is page-level analytics in place? (Basic pageviews)
   - Is event tracking configured? (User interactions)
   - Is conversion tracking present? (Goal completions)
   - Are UTM parameters being captured? (Campaign attribution)

**Score:** Based on presence and quality of analytics implementation.

| Score | Criteria |
|-------|---------|
| 90-100 | GA4 + GTM properly configured, consent management, event tracking, conversion tracking |
| 70-89 | Analytics present and loading correctly, some event tracking |
| 50-69 | Basic analytics present but missing conversion tracking or loading incorrectly |
| 30-49 | Analytics present but misconfigured (no consent, blocking render, etc.) |
| 0-29 | No analytics detected or completely broken implementation |

---

### Phase 6: Security Audit

**Skip if focus is `seo`, `performance`, `accessibility`, or `analytics` only.**

Reference the security headers checklist and check:

1. **HTTP Security Headers:** Fetch response headers and check for:
   - `Strict-Transport-Security` (HSTS)
   - `Content-Security-Policy` (CSP)
   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `Referrer-Policy`
   - `Permissions-Policy`
   - Cross-Origin headers (COOP, CORP, COEP)

2. **SSL/TLS:**
   - Certificate validity (not expired, not self-signed)
   - Certificate expiry date (flag if < 30 days)
   - HTTP → HTTPS redirect (should be 301)
   - Mixed content (HTTP resources on HTTPS pages)

3. **Exposed Paths** — probe these with HEAD requests and note any that return 200:
   - `/.env`, `/.git`, `/wp-admin`, `/wp-login.php`, `/admin`
   - `/phpinfo.php`, `/server-status`, `/.htaccess`, `/.htpasswd`
   - `/api`, `/debug`, `/test`, `/backup`
   - **Observation only** — do not attempt to access, authenticate, or exploit

4. **Information Disclosure:**
   - `Server` header revealing version numbers
   - `X-Powered-By` header
   - Generator meta tags with version info
   - Source code comments with credentials or internal IPs

5. **Cookie Security:** Check `Set-Cookie` headers for `Secure`, `HttpOnly`, `SameSite` attributes

6. **Redirect Security:** HTTP→HTTPS, www canonicalization, redirect chain length

**Score:** Use the security headers scoring guide from the reference.

---

### Phase 7: Compile Client-Facing Report

Save the full report to `./outputs/site-audit-report-[YYYY-MM-DD]-[domain].md`.

Use this exact report template, filling in all sections with findings:

```markdown
# Website Audit Report: [Domain]

**Prepared by:** [Agency name from ./context/business-info.md if available, otherwise "Website Audit"]
**Prepared for:** [Client name if known from context, otherwise omit this line]
**Date:** [YYYY-MM-DD]
**Audit scope:** [Full / SEO / Performance / Accessibility / Analytics / Security]
**Site:** [URL]

---

## Executive Summary

[3-4 sentences a non-technical client can understand. State the overall health of the site, the most impactful findings, and a one-line recommendation. Frame positively where possible — lead with strengths before issues.]

**Overall Grade: [A-F]**

---

## Scores at a Glance

| Category | Score | Grade | Status |
|----------|-------|-------|--------|
| SEO | [X]/100 | [A-F] | [Excellent/Good/Needs Attention/Critical] |
| Performance | [X]/100 | [A-F] | [Excellent/Good/Needs Attention/Critical] |
| Accessibility | [X]/100 | [A-F] | [Excellent/Good/Needs Attention/Critical] |
| Analytics | [X]/100 | [A-F] | [Excellent/Good/Needs Attention/Critical] |
| Security | [X]/100 | [A-F] | [Excellent/Good/Needs Attention/Critical] |
| **Overall** | **[X]/100** | **[A-F]** | |

[Only include categories that were audited based on focus mode.]

---

## Priority Actions

### Immediate (This Week)

| # | Issue | Category | Business Impact | Effort |
|---|-------|----------|-----------------|--------|
| 1 | [Non-technical description] | [Category] | [Business impact in plain language] | [Low/Medium/High] |

### Short-Term (This Month)

| # | Issue | Category | Business Impact | Effort |
|---|-------|----------|-----------------|--------|
| 1 | [Non-technical description] | [Category] | [Business impact in plain language] | [Low/Medium/High] |

### Recommended Improvements (Next Quarter)

| # | Issue | Category | Business Impact | Effort |
|---|-------|----------|-----------------|--------|
| 1 | [Non-technical description] | [Category] | [Business impact in plain language] | [Low/Medium/High] |

---

## Detailed Findings

### SEO

[Group findings by sub-category. Use business language. Each finding should explain what was found, why it matters, and the impact.]

#### What's Working Well
[List positive findings — things the site does right]

#### Issues Found
[List issues with business-language descriptions]

### Performance

[Lighthouse scores, specific bottlenecks, translated to business impact]
[e.g., "The site takes 4.2 seconds to become interactive. Industry data shows that 53% of mobile users abandon sites that take longer than 3 seconds to load."]

### Accessibility

[Compliance status, specific failures, legal risk context]
[e.g., "12 images are missing descriptive alt text, making them invisible to the ~2.2 million people in the UK using screen readers."]

### Analytics

[What's tracked, what's missing, data quality assessment]
[e.g., "Google Analytics is installed but no conversion tracking is configured, meaning you cannot measure which marketing channels drive enquiries."]

### Security

[Header status, certificate status, exposure risks]
[e.g., "The site is missing Content-Security-Policy headers, which protect against cross-site scripting attacks — a common method used to steal user data."]

---

## Improvement Opportunities

[This is the upsell section. Frame each improvement as a business opportunity with estimated investment and expected return.]

| Opportunity | Expected Impact | Estimated Hours | ROI Timeframe |
|-------------|----------------|-----------------|---------------|
| [Fix Core Web Vitals] | [+15-20% organic traffic potential — Google uses page speed as a ranking factor] | [8-12 hours] | [1-3 months] |
| [Add structured data markup] | [Rich snippets in search results — typically 20-30% higher click-through rates] | [4-6 hours] | [2-4 weeks] |
| [Implement security headers] | [Protect against XSS attacks, build visitor trust, improve browser security score] | [2-4 hours] | [Immediate] |
| [Configure conversion tracking] | [Measure which marketing efforts generate enquiries — enables data-driven budget allocation] | [3-5 hours] | [Immediate] |
| [WCAG 2.1 AA compliance] | [Expand audience reach by ~15-20%, reduce legal risk, improve brand reputation] | [12-20 hours] | [1-2 months] |

---

## Trend Tracking

[If previous reports exist for this domain, include a comparison table:]

| Metric | Previous ([date]) | Current | Change |
|--------|-------------------|---------|--------|
| Overall Score | [X]/100 | [X]/100 | [+/-X — Improving/Declining/Stable] |
| SEO | [X]/100 | [X]/100 | [+/-X] |
| Performance | [X]/100 | [X]/100 | [+/-X] |
| Accessibility | [X]/100 | [X]/100 | [+/-X] |
| Analytics | [X]/100 | [X]/100 | [+/-X] |
| Security | [X]/100 | [X]/100 | [+/-X] |

[If no previous reports: "This is the first audit for this domain. Future audits will include trend tracking to measure progress."]

---

## Methodology

This audit was conducted using industry-standard tools and criteria:

- **SEO:** Assessed against Google Search Essentials and schema.org structured data standards
- **Performance:** [Lighthouse automated testing / Manual assessment] with Core Web Vitals (LCP, INP, CLS) per Google's page experience ranking signals
- **Accessibility:** WCAG 2.1 Level AA criteria, supplemented by [Lighthouse automated checks / manual inspection]
- **Analytics:** Manual inspection of tracking implementation and data collection completeness
- **Security:** OWASP security headers recommendations, SSL/TLS best practices, common exposure pattern checks

---

## Next Steps

[Clear call to action tailored to the relationship:]

[For agency-built sites:]
> We recommend addressing the [N] Immediate priority items first, followed by the Short-Term improvements. Our team can implement these changes as part of your maintenance plan. Would you like us to proceed with a fix plan?

[For external/prospect sites:]
> This report identifies [N] opportunities to improve your website's performance, visibility, and security. We can provide a detailed proposal and timeline for implementing these improvements. Contact us to discuss next steps.

[For maintenance plan clients:]
> [N] items have been addressed since the last audit. [M] new items have been identified. We recommend focusing on [top priority] this [week/month]. The next scheduled audit is [date].
```

---

### Phase 8: Export Individual Reports

**This phase only runs if `export` was included in the arguments.**

For each category that was audited, save an individual report to `./outputs/`:

- `./outputs/site-audit-seo-[YYYY-MM-DD]-[domain].md` — SEO findings only
- `./outputs/site-audit-performance-[YYYY-MM-DD]-[domain].md` — Performance findings only
- `./outputs/site-audit-accessibility-[YYYY-MM-DD]-[domain].md` — Accessibility findings only
- `./outputs/site-audit-analytics-[YYYY-MM-DD]-[domain].md` — Analytics findings only
- `./outputs/site-audit-security-[YYYY-MM-DD]-[domain].md` — Security findings only

Each individual report should be a standalone document that can be sent to a client on its own. Use this structure:

```markdown
# [Category] Audit Report: [Domain]

**Prepared by:** [Agency name if available]
**Date:** [YYYY-MM-DD]
**Site:** [URL]

---

## Summary

[2-3 sentence overview of this category's findings. Overall grade for this category.]

**[Category] Grade: [A-F] ([X]/100)**

---

## Findings

### What's Working Well
[Positive findings for this category]

### Issues Found

| # | Issue | Business Impact | Priority | Effort |
|---|-------|-----------------|----------|--------|
| 1 | [Finding] | [Impact] | [Immediate/Short-Term/Recommended] | [Low/Medium/High] |

---

## Improvement Opportunities

| Opportunity | Expected Impact | Estimated Hours | ROI Timeframe |
|-------------|----------------|-----------------|---------------|
| [Improvement] | [Impact] | [Hours] | [Timeframe] |

---

## Methodology

[Brief methodology note for this specific category]
```

After exporting, list all exported files:

> "Individual reports exported:
> - `./outputs/site-audit-seo-[date]-[domain].md`
> - `./outputs/site-audit-performance-[date]-[domain].md`
> - ..."

---

### Phase 9: Update Knowledge Base

**This phase runs every time, regardless of focus mode.**

After compiling the report, update (or create) `./outputs/site-audit-knowledge.md` — a persistent knowledge base that makes every future audit faster and more thorough.

**If the file doesn't exist, create it with this structure:**

```markdown
# Site Audit Knowledge Base

> Cumulative learnings from all website audits. Read by `/site-audit` at the start of every run to improve efficiency and coverage.

---

## Audit History

| Date | Domain | Scope | Overall | SEO | Perf | A11y | Analytics | Security | Key Finding |
|------|--------|-------|---------|-----|------|------|-----------|----------|-------------|

---

## Domain-Specific Patterns

[Patterns observed for specific domains across multiple audits — useful for maintenance plan clients]

---

## Common Findings Across Portfolio

[Issues that appear repeatedly across different client sites — indicates areas to check first]

---

## Tool Notes

[Notes about tool availability, workarounds, and reliability]

---

## False Positives

[Things that look like issues but aren't — avoid wasting time on these]

---

## Fix Effectiveness Tracker

| Domain | Finding | Fix Applied | Date Fixed | Verified Fixed? | Regression? |
|--------|---------|-------------|------------|-----------------|-------------|
```

**If the file already exists, update it by:**

1. Adding a new row to the **Audit History** table
2. Updating **Domain-Specific Patterns** if this domain has been audited before
3. Adding any new **Common Findings** patterns
4. Updating the **Fix Effectiveness Tracker** for previously reported findings
5. Keeping the file concise — summarise, don't duplicate the full report

---

### Phase 10: Bridge to Action

After presenting the report (and exporting if requested), provide next steps:

1. **State the report location:** "Full report saved to `./outputs/site-audit-report-[date]-[domain].md`"
2. **If individual exports were created,** list them
3. **Summarise the key numbers:** "[N] Immediate, [M] Short-Term, [K] Recommended items found."

4. **Detect if this is an agency-built site:**
   - Check if the current project directory has source code matching the audited domain (look for deployment configs, package.json `homepage` field, Vercel/Netlify config with the domain, `.env` with the domain)
   - If agency-built: "This appears to be a site you manage. Run `/create-plan fix immediate priority findings from site audit` to plan fixes."
   - If external site: "This report can be shared directly with the client as a website health assessment. The Improvement Opportunities section provides scoped estimates for a follow-up proposal."

5. **For maintenance plan clients** (previous reports exist): "Compared to the previous audit on [date]: [N] items improved, [M] new items found. Overall score changed from [X] to [Y]."

6. **Ask:** "Would you like to create a fix plan for the highest priority items, or export individual category reports?"
