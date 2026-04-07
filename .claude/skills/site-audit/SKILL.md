---
name: Site Audit
description: Reference checklists and scoring guides for comprehensive website auditing across SEO, performance, accessibility, analytics, and security. Consumed by the /site-audit command to ensure consistent, thorough audits with industry-standard criteria.
version: 0.1.0
paths:
  - "outputs/site-audit-*"
  - "outputs/harden-*"
  - "**/*.html"
  - "**/lighthouse-*.json"
---

# Site Audit Reference Material

## Overview

This skill provides the domain knowledge used by the `/site-audit` command when auditing live websites. It contains structured checklists, scoring criteria, and technical references that ensure every audit is thorough, consistent, and based on current industry standards.

**This skill is consumed by a command** — it is not invoked directly. The `/site-audit` command reads these references during its audit phases.

## Reference Files

| File | Used In | Purpose |
|------|---------|---------|
| `references/seo-checklist.md` | Phase 2 (SEO Audit) | Complete SEO audit criteria: meta tags, headings, structured data, sitemap, canonicals, Open Graph, images, internal linking, content, mobile, indexability |
| `references/security-headers.md` | Phase 6 (Security Audit) | HTTP security headers checklist, SSL/TLS checks, cookie security, exposed paths to probe, information disclosure checks |
| `references/wcag-checklist.md` | Phase 4 (Accessibility Audit) | WCAG 2.1 Level AA requirements organised by principle (Perceivable, Operable, Understandable, Robust), with Lighthouse coverage notes |
| `references/lighthouse-scoring.md` | Phase 3 (Performance Audit) | Lighthouse CLI usage, score interpretation, Core Web Vitals thresholds, metric definitions, A-F grade mapping, JSON output parsing |

## How It Works

1. The `/site-audit` command starts its audit phases
2. At each phase, it reads the relevant reference file
3. Reference checklists guide what to check and how to score findings
4. Findings are compiled into a client-facing report using the scoring guides

## Standards Covered

- **SEO:** Google Search Essentials, structured data (schema.org), Core Web Vitals ranking signals
- **Security:** OWASP security headers, SSL/TLS best practices, common exposure patterns
- **Accessibility:** WCAG 2.1 Level AA, with legal context (Equality Act, ADA, European Accessibility Act)
- **Performance:** Google Lighthouse methodology, Core Web Vitals (LCP, INP, CLS)
