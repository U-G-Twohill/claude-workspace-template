# Proposal

> Generate client proposals from a brief, RFP, or conversation — pulling from your context, case studies, and capabilities.

## Variables

input: $ARGUMENTS (optional — path to an RFP/brief document, a client name, or a description of the engagement. Default: conversational intake)

## Instructions

You are generating a professional client proposal. Your goal is to produce a near-complete, polished proposal that the user only needs to review and adjust — not write from scratch.

---

### Phase 1: Gather Context

1. **Read business context:**
   - Read `./context/business-info.md` — understand the organization, services, and positioning
   - Read `./context/personal-info.md` — understand who's sending this proposal
   - Read `./context/strategy.md` — understand current priorities and pricing approach
   - Read `./CLAUDE.md` for workspace context

2. **Check for reference materials:**
   - Look for `./reference/case-studies/` — past work examples to reference
   - Look for `./reference/proposals/` or `./outputs/proposal-*.md` — past proposals for tone and format
   - Look for `./reference/pricing.md` or `./reference/rate-card.md` — pricing guidance
   - Look for `./reference/services.md` — service descriptions and capabilities

3. **Read the input:**
   - If a file path was provided: read the RFP/brief document
   - If a description was provided: use it as the engagement brief
   - If no input: ask the user to describe the engagement:
     - What does the client need?
     - What's the rough scope?
     - Any timeline or budget constraints?
     - Is this a new client or existing?

4. **Identify key details from the brief/conversation:**
   - Client name and industry
   - Problem they're trying to solve
   - Scope of work requested
   - Timeline expectations
   - Budget signals (if any)
   - Decision criteria (speed, quality, cost, expertise)
   - Competitive situation (are they evaluating others?)

---

### Phase 2: Structure the Proposal

Based on the input and context, determine the proposal type:

- **Project proposal:** Fixed scope, clear deliverables, defined timeline
- **Retainer/maintenance proposal:** Ongoing services, monthly hours, support tiers
- **Audit/discovery proposal:** Assessment phase before committing to a larger project
- **Phased proposal:** Multiple stages with go/no-go decision points

Select the appropriate structure and proceed.

---

### Phase 3: Generate the Proposal

Write the proposal to `./outputs/proposal-[client-name]-[YYYY-MM-DD].md`:

```markdown
# Proposal: [Project/Engagement Title]

**Prepared for:** [Client Name]
**Prepared by:** [Your Name / Company] (from context/personal-info.md and context/business-info.md)
**Date:** [YYYY-MM-DD]
**Valid until:** [date — 30 days from today]

---

## Executive Summary

[2-3 paragraphs: understand their problem, propose your solution, establish credibility. This should show you understand their world, not just list your services.]

---

## Understanding Your Needs

[Restate the client's problem/goals in your own words. Demonstrate that you've listened and understood. Reference specific details from the brief.]

### Key Challenges
1. [Challenge from their perspective]
2. [Challenge from their perspective]

### Desired Outcomes
1. [What success looks like for them]
2. [What success looks like for them]

---

## Proposed Approach

[High-level strategy for how you'll solve their problem. Connect your approach to their specific challenges.]

### Phase 1: [Phase Name] — [Timeline]
**Objective:** [What this phase achieves]
**Deliverables:**
- [Specific deliverable]
- [Specific deliverable]

### Phase 2: [Phase Name] — [Timeline]
**Objective:** [What this phase achieves]
**Deliverables:**
- [Specific deliverable]
- [Specific deliverable]

[Add phases as needed]

---

## Deliverables

| Deliverable | Description | Timeline |
|------------|-------------|----------|
| [Name] | [What they get] | [When] |

---

## Investment

[Use the pricing approach from reference materials if available, otherwise provide structure for the user to fill in]

| Item | Description | Amount |
|------|------------|--------|
| [Phase/Service] | [What's included] | [$ amount or "TBD"] |
| | **Total** | **[$ amount or "TBD"]** |

**Payment terms:** [Net 30 / 50% upfront + 50% on completion / monthly retainer / etc.]

[If pricing references aren't available, note: "<!-- PRICING: Fill in based on your rate card and scope assessment -->"]

---

## Timeline

| Milestone | Target Date | Dependencies |
|-----------|------------|-------------|
| Project kickoff | [date] | Signed agreement |
| [Milestone] | [date] | [dependency] |
| [Milestone] | [date] | [dependency] |
| Project completion | [date] | [dependency] |

---

## Why [Your Company]

[Pull from business-info.md and case studies. Focus on relevant experience, not a generic company pitch.]

### Relevant Experience

[If case studies exist in reference/case-studies/:]
- **[Case Study Name]:** [1-2 sentences about what you did and the result]
- **[Case Study Name]:** [1-2 sentences about what you did and the result]

[If no case studies: "<!-- Add 2-3 relevant case studies or examples of similar work -->"]

---

## Next Steps

1. Review this proposal and let us know any questions
2. Schedule a call to discuss [specific topic needing clarification]
3. Sign the agreement to begin [Phase 1 name]

---

## Terms & Conditions

[Standard terms — keep brief, reference a separate MSA if one exists]

- This proposal is valid for 30 days from the date above
- Work begins upon signed agreement and receipt of initial payment
- Scope changes will be documented and approved before implementation
- [Additional terms as appropriate]
```

---

### Phase 4: Quality Check

Before presenting:

1. **Verify alignment:** Does the proposal address every point from the brief/conversation?
2. **Check tone:** Professional but not corporate. Confident but not arrogant. Specific, not generic.
3. **Check completeness:** Are there any sections that need the user's input? Mark them clearly with HTML comments: `<!-- ACTION NEEDED: ... -->`
4. **Check pricing:** If pricing info was available, verify the math. If not, flag clearly.
5. **Remove filler:** Every sentence should earn its place. Cut generic marketing language.

---

### Phase 5: Present

> "Proposal saved to `./outputs/proposal-[client]-[date].md`.
>
> **Sections needing your review:**
> - [List any sections marked with ACTION NEEDED comments]
>
> **Based on:** [Brief/RFP summary or conversation notes]
>
> The proposal is structured as a [project/retainer/phased] engagement with [N] phases.
>
> Want me to adjust the scope, tone, pricing structure, or any specific section?"

---

## Hard Rules

- Never invent case studies — only reference real ones from `reference/case-studies/`
- Never commit to pricing without reference materials — use placeholders with clear ACTION NEEDED comments
- Never use generic marketing language ("synergy", "leverage", "best-in-class", "cutting-edge")
- Always restate the client's problem before proposing solutions — show you've listened
- Keep it concise — proposals that win are specific and scannable, not long
- Mark every section needing user input with `<!-- ACTION NEEDED: description -->`
