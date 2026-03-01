# Competitive Intel

> Research competitors and produce an actionable intelligence report — positioning, features, pricing, tech stack, and opportunities.

## Variables

target: $ARGUMENTS (required — competitor URL, company name, or "landscape" for a multi-competitor overview)

## Instructions

You are producing a competitive intelligence report. Your goal is to gather publicly available information about competitors and present it in a way that informs business decisions.

**Important:** This command only uses publicly available information — websites, public repos, job postings, press releases, and published content. It does NOT access private systems or proprietary data.

---

### Phase 1: Context & Focus

1. **Read business context:**
   - Read `./context/business-info.md` — understand your organization's services and positioning
   - Read `./context/strategy.md` — understand current priorities and competitive concerns
   - Read `./CLAUDE.md` for project context

2. **Check for previous reports:**
   - Look for `./outputs/competitive-intel-*.md` — previous reports for trend comparison
   - If a previous report exists for the same competitor: note it for change tracking

3. **Determine scope:**
   - If a specific URL/company is provided: deep analysis of that competitor
   - If "landscape" is provided: broader overview of multiple competitors (ask user to list 3-5)
   - If unclear: ask the user who they want to research and why

---

### Phase 2: Research

**For each competitor, gather information across these dimensions:**

**Company & Positioning:**
- What do they do? Who do they serve?
- How do they position themselves? (tagline, hero messaging, value props)
- What's their brand tone? (enterprise, startup, agency, technical, friendly)
- Who are their stated customers? (logos, testimonials, case studies)

**Products & Services:**
- What do they offer? (services, products, packages)
- How is their offering structured? (tiers, custom, à la carte)
- What's their pricing model? (if publicly available)
- What features do they highlight vs. bury?

**Digital Presence:**
- Website quality and design
- Content strategy (blog, resources, guides)
- SEO indicators (title tags, meta descriptions, content depth)
- Social media presence and activity

**Technology (if relevant):**
- Fetch their website and check for technology indicators:
  - Meta tags, generator tags, framework signatures
  - JavaScript libraries and frameworks
  - Hosting and CDN indicators
  - Analytics and tracking tools
- Check for public GitHub repos

**Team & Culture:**
- Team size indicators (LinkedIn, about page, job postings)
- Key hires or departures
- Job postings — what roles are they hiring for? (signals growth areas and gaps)

**Market Signals:**
- Recent press releases or news
- Funding announcements (if applicable)
- Partnerships and integrations
- Customer reviews (G2, Clutch, Google, Trustpilot)

Use web search and web fetch to gather this information. Be thorough but focused on what's actionable.

---

### Phase 3: Analysis

**Compare against your positioning (from context/ files):**

1. **Where they're stronger:**
   - What do they do better or differently?
   - What do they offer that you don't?
   - Where is their messaging more compelling?

2. **Where you're stronger:**
   - What do you offer that they don't?
   - Where is your approach superior?
   - What's your unfair advantage?

3. **Gaps and opportunities:**
   - What's missing from their offering that clients want?
   - Where is the market underserved?
   - What positioning angles are unclaimed?

4. **Threats:**
   - Are they moving into your space?
   - Are they undercutting on price?
   - Are they outpacing on features or content?

---

### Phase 4: Generate Report

Save to `./outputs/competitive-intel-[competitor-name]-[YYYY-MM-DD].md`:

```markdown
# Competitive Intelligence: [Competitor Name]

**Date:** [YYYY-MM-DD]
**Researched by:** [Your Company] (from context/)
**Previous report:** [date, or "First analysis"]

---

## Quick Summary

[3-4 sentences: who they are, how they compare to us, the key takeaway]

## Company Profile

| Attribute | Detail |
|-----------|--------|
| Company | [name] |
| Website | [URL] |
| Founded | [year, if known] |
| Size | [team size estimate] |
| Positioning | [their one-liner positioning] |
| Target Market | [who they serve] |

---

## Product / Service Comparison

| Dimension | [Competitor] | [Us] | Advantage |
|-----------|-------------|------|-----------|
| [Service/Feature] | [their offering] | [our offering] | [who wins] |
| Pricing | [their model] | [our model] | [who wins] |
| [Dimension] | [theirs] | [ours] | [who wins] |

---

## Strengths (Things They Do Well)

1. **[Strength]:** [Why it matters competitively]
2. **[Strength]:** [Why it matters competitively]

## Weaknesses (Where They Fall Short)

1. **[Weakness]:** [The opportunity this creates for us]
2. **[Weakness]:** [The opportunity this creates for us]

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | [detected] |
| Hosting | [detected] |
| Analytics | [detected] |
| CMS | [detected] |

---

## Market Signals

### Recent Activity
- [News, launches, announcements]

### Hiring Signals
- [What roles they're hiring — signals strategy direction]

### Customer Sentiment
- [Review scores, testimonials, complaints if publicly available]

---

## Strategic Implications

### Opportunities
1. [Specific action we can take based on their gaps]
2. [Positioning angle we can claim]

### Threats to Monitor
1. [Trend to watch]
2. [Risk to prepare for]

### Recommended Actions
1. **Immediate:** [Quick win based on this analysis]
2. **Short-term:** [Action for the next 1-3 months]
3. **Long-term:** [Strategic move for the next 6-12 months]

---

## Change Tracking

[If a previous report exists, note what changed:]

| Dimension | Previous | Current | Change |
|-----------|----------|---------|--------|
| [dimension] | [was] | [is now] | [what shifted] |

[If first report: "First analysis — baseline established for future tracking."]
```

**For "landscape" reports:** Create a comparative matrix across all competitors with the same structure, plus a positioning map showing where each player sits.

---

### Phase 5: Present

> "Competitive intelligence report saved to `./outputs/competitive-intel-[name]-[date].md`.
>
> **Key takeaway:** [One-sentence insight]
>
> **Top opportunity:** [Most actionable finding]
>
> **Top threat:** [Most important risk]
>
> Want me to dig deeper on any area, research additional competitors, or create an action plan from these findings?"

---

## Hard Rules

- Only use publicly available information — never attempt to access private systems
- Distinguish between facts and inferences — label speculation clearly
- Be specific and actionable — "they have better SEO" is useless; "they rank #1 for [keyword] while we're on page 3" is useful
- Include both strengths and weaknesses — balanced analysis is more credible
- Note when information is unavailable or uncertain
- If previous reports exist, always include change tracking
- Never fabricate data, reviews, or metrics
