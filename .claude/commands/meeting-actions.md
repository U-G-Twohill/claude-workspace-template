# Meeting Actions

> Extract action items, decisions, and follow-ups from meeting notes or transcripts — create tasks, draft emails, and update project docs.

## Variables

input: $ARGUMENTS (required — path to meeting notes/transcript file, or paste the notes inline)

## Instructions

You are processing meeting notes to extract actionable output. Your goal is to ensure nothing falls through the cracks — every decision is recorded, every action item is assigned, and every follow-up is drafted.

---

### Phase 1: Ingest Meeting Content

1. **Read the input:**
   - If a file path is provided: read the file
   - If text is provided inline: use it directly
   - If no input: ask the user to paste their meeting notes or provide a file path

2. **Read project context:**
   - Read `./context/` files to understand the project and people involved
   - Read `./CLAUDE.md` for project context
   - Read recent plans or outputs for current work context

3. **Parse the meeting:**
   - Identify attendees (if mentioned)
   - Identify the meeting's purpose
   - Extract the date (if mentioned)

---

### Phase 2: Extract & Categorize

Go through the meeting content line by line and extract:

**1. Decisions Made**
- Concrete decisions that were agreed upon
- Include context for why the decision was made (if available)

**2. Action Items**
- Specific tasks that someone committed to doing
- Identify: who's responsible, what they need to do, by when (if mentioned)
- Flag items with no clear owner

**3. Questions & Open Items**
- Questions raised but not answered
- Topics that need further discussion
- Items deferred to a future meeting

**4. Key Information Shared**
- Important facts, metrics, or context that was shared
- Updates on previous action items

**5. Follow-Up Communications Needed**
- Emails that need to be sent
- People who need to be informed
- Documents that need to be shared

---

### Phase 3: Generate Output

Save to `./outputs/meeting-actions-[YYYY-MM-DD].md`:

```markdown
# Meeting Actions: [Meeting Title/Topic]

**Date:** [YYYY-MM-DD]
**Attendees:** [list]
**Purpose:** [one-line description]

---

## Decisions

| # | Decision | Context | Impact |
|---|----------|---------|--------|
| D1 | [What was decided] | [Why] | [What changes as a result] |

## Action Items

| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| A1 | [Specific task] | [Person] | [Date if known] | Pending |
| A2 | [Specific task] | [Person] | [Date if known] | Pending |
| A3 | [Specific task] | **Unassigned** | [Date if known] | Needs Owner |

## Open Questions

| # | Question | Raised By | Needs Answer From |
|---|----------|-----------|-------------------|
| Q1 | [Question] | [Person] | [Person/Team] |

## Key Information

- [Important fact or update shared]
- [Important fact or update shared]

## Follow-Up Communications

| # | Type | To | Subject | Status |
|---|------|----|---------|--------|
| F1 | Email | [Person] | [Topic] | Draft below |
| F2 | Update | [Team/Channel] | [Topic] | Draft below |
```

---

### Phase 4: Draft Follow-Up Communications

For each follow-up communication identified:

**Meeting Summary Email:**

```markdown
### Draft: Meeting Summary Email

**To:** [Attendees]
**Subject:** [Meeting Topic] — Summary & Action Items

Hi all,

Thanks for the meeting on [topic]. Here's a summary:

**Key Decisions:**
- [Decision 1]
- [Decision 2]

**Action Items:**
| Action | Owner | Due |
|--------|-------|-----|
| [Task] | [Person] | [Date] |

**Open Questions:**
- [Question — please respond by date]

Let me know if I missed anything.

[Your Name]
```

Draft any additional follow-up emails identified in Phase 2.

---

### Phase 5: Update Project Context (Optional)

If the meeting produced decisions or information that should be captured in project context:

1. Check if any decisions affect `./context/strategy.md` — offer to update
2. Check if any information updates `./context/current-data.md` — offer to update
3. If action items relate to existing plans in `./plans/` — note the connection

---

### Phase 6: Present

> "Meeting processed. Output saved to `./outputs/meeting-actions-[date].md`.
>
> **Extracted:**
> - [N] decisions
> - [N] action items ([M] need owners)
> - [N] open questions
> - [N] follow-up communications drafted
>
> **Drafts ready to review:**
> - Meeting summary email
> - [Any additional follow-up drafts]
>
> Want me to update any project context files with the decisions, or refine any of the follow-up drafts?"

---

## Hard Rules

- Extract action items precisely — "we should probably look into X" is different from "John will investigate X by Friday"
- Flag action items without clear owners — don't assign them yourself
- Flag vague deadlines — "soon" and "ASAP" should be noted as needing specific dates
- Don't add or infer information that wasn't in the meeting notes
- Keep follow-up emails brief and scannable — bullet points over paragraphs
- Preserve the original context for decisions — future-you needs to know WHY, not just WHAT
