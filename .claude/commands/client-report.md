# Client Report

> Generate professional client-facing reports by combining project data, audit results, and analytics into a polished deliverable.

## Variables

input: $ARGUMENTS (optional — report type: "progress", "audit", "monthly", "handoff", or a specific topic. Default: auto-detect from available data)

## Instructions

You are generating a client-ready report. Your goal is to transform technical outputs (harden reports, audit results, implementation summaries, analytics) into a professional document that a non-technical client can understand and act on.

---

### Phase 1: Gather Sources

1. **Read business context:**
   - Read `./context/business-info.md` and `./context/personal-info.md` for branding and sender context
   - Read `./CLAUDE.md` for project context

2. **Scan for available data sources:**
   - `./outputs/harden-report-*.md` — security and quality findings
   - `./outputs/audit-deps-*.md` — dependency health
   - `./outputs/deploy-readiness-*.md` — deployment status
   - `./outputs/site-audit-*.md` — website audit results
   - `./outputs/autopilot/` — autopilot run summaries
   - `./plans/` — completed plans showing work done
   - `./outputs/proposal-*.md` — original scope for progress tracking

3. **Determine report type:**
   - If specified in arguments: use that type
   - If not specified: auto-detect based on available data:
     - Site audit reports exist → **audit report**
     - Multiple dated outputs exist → **monthly/progress report**
     - Implementation summaries exist → **progress report**
     - Deployment readiness report exists → **handoff report**

4. **Read the most recent/relevant source files** for the report type

---

### Phase 2: Transform Technical → Client Language

This is the critical step. Translate technical findings into business language:

| Technical | Client Language |
|-----------|----------------|
| "SQL injection vulnerability in user query" | "A security gap was found that could allow unauthorized access to user data" |
| "N+1 query pattern in product listing" | "The product listing page has a performance bottleneck that slows loading times" |
| "Missing CSRF protection on form" | "A form security measure was missing that protects against unauthorized submissions" |
| "Dependencies 3 major versions behind" | "Some software components need updating to maintain security and performance" |

**Rules for client language:**
- Focus on **impact**, not implementation details
- Use risk/benefit framing, not technical jargon
- Quantify where possible ("loads 3x faster", "eliminates 5 security risks")
- Group findings by business impact, not technical category

---

### Phase 3: Generate Report

Write the report to `./outputs/client-report-[type]-[YYYY-MM-DD].md`:

**For Progress Reports:**

```markdown
# Project Progress Report

**Project:** [Project Name]
**Period:** [Date range]
**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company]

---

## Summary

[2-3 sentences: what was accomplished, current status, what's next]

## Completed This Period

| Item | Status | Impact |
|------|--------|--------|
| [Work item] | Complete | [What the client gets from this] |

## In Progress

| Item | Progress | Expected Completion |
|------|----------|-------------------|
| [Work item] | [percentage or status] | [date] |

## Key Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| [metric name] | [value] | [value] | [improvement] |

## Issues & Risks

| Issue | Impact | Status | Resolution |
|-------|--------|--------|-----------|
| [issue] | [business impact] | [open/resolved] | [what's being done] |

## Next Steps

1. [What happens next]
2. [What happens next]

## Hours & Budget

| Category | Hours Used | Budget Used | Remaining |
|----------|-----------|-------------|-----------|
| [category] | [hours] | [amount] | [remaining] |

<!-- ACTION NEEDED: Fill in hours and budget figures -->
```

**For Audit Reports (from site-audit or harden data):**

```markdown
# [Website/Application] Audit Report

**Subject:** [Site URL or App Name]
**Date:** [YYYY-MM-DD]
**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company]

---

## Overall Health Score: [A-F or X/100]

## Summary

[2-3 sentences: overall state, most important findings, recommended priority]

## Findings by Priority

### Immediate Action Required

| # | Finding | Business Impact | Recommended Fix | Effort |
|---|---------|----------------|-----------------|--------|
| 1 | [client-friendly description] | [what's at risk] | [what to do] | [hours est.] |

### Should Address Soon

| # | Finding | Business Impact | Recommended Fix | Effort |
|---|---------|----------------|-----------------|--------|

### Opportunities for Improvement

| # | Finding | Business Impact | Recommended Fix | Effort |
|---|---------|----------------|-----------------|--------|

## What's Working Well

[Genuinely highlight positives — clients need to hear what's right too]

- [Positive finding]
- [Positive finding]

## Improvement Roadmap

| Phase | Items | Estimated Hours | ROI |
|-------|-------|-----------------|-----|
| Phase 1 (Urgent) | [count] items | [hours] | [risk reduction / performance gain] |
| Phase 2 (Important) | [count] items | [hours] | [business value] |
| Phase 3 (Enhancement) | [count] items | [hours] | [competitive advantage] |

## Next Steps

1. Review findings and approve priority items
2. [Specific next action]
```

**For Handoff Reports:**

```markdown
# Project Handoff Documentation

**Project:** [Project Name]
**Date:** [YYYY-MM-DD]
**Prepared for:** [Client Name / Receiving Team]
**Prepared by:** [Your Name / Company]

---

## Project Overview

[What was built and why]

## Architecture & Technology

[Non-technical overview of how it works, with just enough technical detail for a developer to get oriented]

## Access & Credentials

| Service | URL | Access Method | Notes |
|---------|-----|--------------|-------|
| [service] | [url] | [how to access] | [notes] |

<!-- ACTION NEEDED: Fill in actual URLs and access details -->

## How to Deploy

[Step-by-step deployment instructions in plain language]

## How to Make Common Changes

| Task | How To |
|------|--------|
| [common task] | [steps] |

## Known Issues & Limitations

| Issue | Impact | Workaround |
|-------|--------|-----------|

## Support & Maintenance

[Ongoing maintenance recommendations, support contact info]
```

**For Monthly Reports (recurring):**

```markdown
# Monthly Report — [Month Year]

**Project:** [Project Name]
**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company]

---

## Month at a Glance

- **Hours used:** [X] of [Y] allocated
- **Key accomplishment:** [one-liner]
- **Health status:** [Green / Yellow / Red]

## Work Completed

[Bulleted list of completed items, in client language]

## Performance Metrics

| Metric | Last Month | This Month | Trend |
|--------|-----------|------------|-------|
| [metric] | [value] | [value] | [up/down/stable] |

## Maintenance & Updates

- [Security patches applied]
- [Dependencies updated]
- [Monitoring alerts resolved]

## Recommendations

[Proactive suggestions based on findings — this is where you demonstrate value]

## Next Month Plan

[What's planned for the upcoming period]
```

---

### Phase 4: Quality Check

1. **Client readability:** Would a non-technical executive understand every section?
2. **No jargon leaks:** Search for technical terms that slipped through — replace with client language
3. **Action items clear:** Does the client know exactly what they need to do?
4. **Positive balance:** Include what's working well, not just problems
5. **Branding consistency:** Company name, tone, and formatting match context files
6. **ACTION NEEDED tags:** Mark any sections needing user input

---

### Phase 5: Present

> "Client report saved to `./outputs/client-report-[type]-[date].md`.
>
> **Report type:** [progress / audit / monthly / handoff]
> **Data sources used:** [list of source files]
> **Sections needing your input:** [list or "None"]
>
> The report is written in client-friendly language. Review it before sending.
>
> Want me to adjust the tone, add/remove sections, or change the detail level?"

---

## Hard Rules

- Never use technical jargon in client-facing text — translate everything
- Never include internal notes, code snippets, or file paths in the client report
- Always include positives alongside findings — balanced perspective builds trust
- Mark sections needing user input with `<!-- ACTION NEEDED: description -->`
- Never fabricate metrics or data — only report what's in the source files
- Frame findings as opportunities, not criticisms of the client's work
