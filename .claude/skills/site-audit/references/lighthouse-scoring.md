# Lighthouse Scoring Reference

> Reference for interpreting Lighthouse scores, metric definitions, and mapping to the A-F grading system used in `/site-audit` reports.

---

## Running Lighthouse

**Via npx (no install needed):**

```bash
npx lighthouse https://example.com --output=json --output-path=./outputs/lighthouse-report.json --chrome-flags="--headless=new --no-sandbox"
```

**Multiple output formats:**

```bash
npx lighthouse https://example.com --output=json --output=html --output-path=./outputs/lighthouse-report --chrome-flags="--headless=new --no-sandbox"
```

**Specific categories only:**

```bash
npx lighthouse https://example.com --only-categories=performance,seo --output=json --output-path=./outputs/lighthouse-report.json --chrome-flags="--headless=new --no-sandbox"
```

**If Lighthouse is unavailable:** Fall back to manual checks. The command should note which checks could not be automated and provide manual assessment instead.

---

## Score Categories

### Performance (0-100)

Measures page loading speed and responsiveness.

| Score Range | Rating | Colour |
|-------------|--------|--------|
| 90-100 | Good | Green |
| 50-89 | Needs Improvement | Orange |
| 0-49 | Poor | Red |

### Accessibility (0-100)

Measures automated WCAG compliance checks.

| Score Range | Rating | Note |
|-------------|--------|------|
| 90-100 | Good | Automated checks pass — manual checks still needed |
| 50-89 | Needs Improvement | Several automated checks failing |
| 0-49 | Poor | Fundamental accessibility issues |

**Important:** Lighthouse only catches ~30-40% of accessibility issues automatically. A high score does NOT guarantee full WCAG compliance. Supplement with the WCAG checklist reference.

### Best Practices (0-100)

Measures general web development best practices.

| Score Range | Rating |
|-------------|--------|
| 90-100 | Good |
| 50-89 | Needs Improvement |
| 0-49 | Poor |

### SEO (0-100)

Measures basic SEO requirements.

| Score Range | Rating | Note |
|-------------|--------|------|
| 90-100 | Good | Basic SEO foundations solid |
| 50-89 | Needs Improvement | Missing basic SEO elements |
| 0-49 | Poor | Fundamental SEO issues |

**Important:** Lighthouse SEO checks are basic (meta tags, crawlability). The SEO checklist reference covers much more (structured data, internal linking, content quality, etc.).

---

## Core Web Vitals Metrics

These are Google's official page experience metrics and affect search ranking.

### Largest Contentful Paint (LCP)

Measures loading performance — when the largest content element becomes visible.

| Rating | Threshold | Business Impact |
|--------|-----------|-----------------|
| Good | <= 2.5 seconds | Visitors see content quickly, stay engaged |
| Needs Improvement | 2.5 - 4.0 seconds | Some visitors may leave before content loads |
| Poor | > 4.0 seconds | High bounce rate — users leave before seeing content |

**Common causes of poor LCP:** Slow server response, render-blocking CSS/JS, unoptimized hero images, lazy-loaded above-fold images.

### Interaction to Next Paint (INP)

Measures responsiveness — how quickly the page responds to user interactions.

| Rating | Threshold | Business Impact |
|--------|-----------|-----------------|
| Good | <= 200ms | Feels instant — users trust the interface |
| Needs Improvement | 200 - 500ms | Noticeable delay — may feel sluggish |
| Poor | > 500ms | Users feel the site is broken or frozen |

**Common causes of poor INP:** Long-running JavaScript, heavy main thread work, expensive event handlers.

### Cumulative Layout Shift (CLS)

Measures visual stability — how much the page layout shifts during loading.

| Rating | Threshold | Business Impact |
|--------|-----------|-----------------|
| Good | <= 0.1 | Layout is stable — no accidental clicks |
| Needs Improvement | 0.1 - 0.25 | Some layout shifts — occasional mis-clicks |
| Poor | > 0.25 | Significant shifts — users click wrong elements, frustrating experience |

**Common causes of poor CLS:** Images without dimensions, ads/embeds that resize, dynamically injected content, web fonts causing text reflow.

---

## Other Performance Metrics

### First Contentful Paint (FCP)

When the first text or image is rendered. Target: under 1.8 seconds.

### Total Blocking Time (TBT)

Sum of blocking time from long tasks on the main thread. Target: under 200ms. Proxy for INP in lab testing.

### Speed Index (SI)

How quickly content is visually populated. Target: under 3.4 seconds.

### Time to First Byte (TTFB)

Server response time. Target: under 800ms. Affected by server processing, CDN, and network latency.

---

## Mapping Lighthouse to A-F Grades

Use this mapping when converting Lighthouse scores to the client-facing A-F grading system:

| Lighthouse Score | Grade | Client Language |
|-----------------|-------|----------------|
| 95-100 | A+ | Excellent — industry-leading |
| 90-94 | A | Strong — meets all best practices |
| 85-89 | B+ | Good — minor improvements possible |
| 75-84 | B | Solid — some optimisations recommended |
| 65-74 | C+ | Fair — noticeable room for improvement |
| 55-64 | C | Below average — improvements needed |
| 45-54 | D | Weak — significant issues affecting performance |
| 30-44 | D- | Poor — major issues requiring attention |
| 15-29 | F | Failing — critical issues harming the business |
| 0-14 | F- | Severely failing — immediate action required |

**For the overall site grade** (across all categories): use a weighted average:
- Performance: 30% (directly affects user experience and SEO)
- SEO: 25% (directly affects discoverability)
- Accessibility: 25% (affects usability and legal compliance)
- Security: 15% (from security checklist, not Lighthouse)
- Analytics: 5% (from analytics audit, not Lighthouse)

---

## Lighthouse JSON Output Structure

Key paths for parsing the JSON output:

```
categories.performance.score          → 0-1 (multiply by 100)
categories.accessibility.score        → 0-1
categories.best-practices.score       → 0-1
categories.seo.score                  → 0-1

audits.largest-contentful-paint.numericValue    → milliseconds
audits.cumulative-layout-shift.numericValue     → CLS score
audits.total-blocking-time.numericValue         → milliseconds
audits.first-contentful-paint.numericValue      → milliseconds
audits.speed-index.numericValue                 → milliseconds
audits.interactive.numericValue                 → TTI in milliseconds

audits[audit-id].score                → 0 (fail), 0.5 (partial), 1 (pass)
audits[audit-id].details.items        → array of specific findings
```

**To extract failing audits:**

Look for audits where `score < 1` and `details.items` contains entries. Each item typically includes:
- `node.snippet` — the HTML causing the issue
- `node.selector` — CSS selector to find the element
- `node.explanation` — what's wrong
