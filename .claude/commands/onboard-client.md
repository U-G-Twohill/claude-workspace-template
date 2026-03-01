# Onboard Client

> Generate a complete client onboarding package — welcome email, project timeline, kickoff agenda, and access request forms.

## Variables

input: $ARGUMENTS (optional — client name, project description, or path to a signed proposal/contract. Default: conversational intake)

## Instructions

You are generating a client onboarding package. Your goal is to produce everything needed to kick off a new client engagement professionally and efficiently.

---

### Phase 1: Gather Information

1. **Read context:**
   - Read `./context/business-info.md` and `./context/personal-info.md`
   - Look for the relevant proposal in `./outputs/proposal-*.md`
   - Read `./CLAUDE.md` for project context

2. **Determine client details:**
   - If a proposal/contract path is provided: extract client name, scope, timeline, and deliverables
   - If a client name is provided: look for matching proposals
   - If no input: ask the user for:
     - Client name and primary contact
     - Project scope (or point to a proposal)
     - Start date
     - Key deliverables and milestones

---

### Phase 2: Generate Onboarding Package

Save all files to `./outputs/onboarding-[client-name]/`:

**1. Welcome Email** (`welcome-email.md`)

```markdown
Subject: Welcome to [Your Company] — [Project Name] Kickoff

Hi [Client Name],

Welcome! We're excited to get started on [project description].

Here's what happens next:

1. **Kickoff call:** [Proposed date/time] — we'll align on priorities and introduce the team
2. **Access setup:** We'll need [list of access items] to get started
3. **First milestone:** [Description] by [date]

I've attached:
- Project timeline with key milestones
- Access request form — please complete before our kickoff
- Kickoff meeting agenda

Looking forward to working together.

[Your Name]
[Your Title]
[Your Company]
```

**2. Project Timeline** (`project-timeline.md`)

```markdown
# Project Timeline: [Project Name]

**Client:** [Client Name]
**Start Date:** [Date]
**Target Completion:** [Date]

| Phase | Milestone | Target Date | Deliverable |
|-------|-----------|------------|-------------|
| Kickoff | Project kickoff call | [date] | Alignment on priorities |
| [Phase] | [Milestone] | [date] | [Deliverable] |
| Launch | Final delivery | [date] | [Deliverable] |

**Communication cadence:** [Weekly updates / Bi-weekly calls / etc.]
**Primary contact:** [Your Name] — [email/phone]
```

**3. Access Request Form** (`access-request.md`)

```markdown
# Access Request: [Project Name]

Please provide the following so we can get started. Share credentials securely (not via email — use [1Password / LastPass / secure link]).

## Required Access

- [ ] [Access item — e.g., "Admin access to your CMS"]
- [ ] [Access item — e.g., "Google Analytics view access"]
- [ ] [Access item — e.g., "Hosting provider login"]
- [ ] [Access item — e.g., "Brand assets (logo, colours, fonts)"]

## Nice to Have

- [ ] [Optional access — e.g., "Social media accounts"]
- [ ] [Optional access — e.g., "Previous analytics reports"]

## Technical Details

| Item | Details |
|------|---------|
| Domain registrar | [Where is the domain managed?] |
| Hosting provider | [Where is the site hosted?] |
| DNS provider | [Where are DNS records managed?] |

<!-- ACTION NEEDED: Customize access items based on the specific engagement -->
```

**4. Kickoff Agenda** (`kickoff-agenda.md`)

```markdown
# Kickoff Meeting Agenda

**Project:** [Project Name]
**Date:** [Proposed date]
**Duration:** 60 minutes
**Attendees:** [Your team], [Client team]

## Agenda

1. **Introductions** (5 min)
   - Team introductions and roles

2. **Project Overview** (10 min)
   - Recap scope and objectives
   - Confirm success criteria
   - Review timeline and milestones

3. **Discovery Questions** (20 min)
   - [Project-specific questions based on scope]
   - Current pain points and priorities
   - Stakeholder expectations

4. **Process & Communication** (10 min)
   - How we'll communicate (Slack / email / calls)
   - Review cadence (weekly / bi-weekly)
   - Feedback and approval process
   - Point of contact on each side

5. **Immediate Next Steps** (10 min)
   - Access setup (review access request form)
   - First deliverable timeline
   - Action items and owners

6. **Questions** (5 min)

## Pre-Meeting Prep

**For the client:**
- Complete the access request form
- Gather brand assets if applicable
- Identify key stakeholders for feedback/approval

**For us:**
- Review proposal and scope
- Prepare discovery questions
- Set up project communication channel
```

---

### Phase 3: Quality Check

1. All dates and names are consistent across documents
2. Scope matches the proposal (if one was referenced)
3. Access request items are relevant to the engagement type
4. Tone is professional and welcoming
5. ACTION NEEDED tags mark anything requiring user input

---

### Phase 4: Present

> "Client onboarding package saved to `./outputs/onboarding-[client-name]/`:
>
> - `welcome-email.md` — ready to send (review and customize)
> - `project-timeline.md` — milestones and dates
> - `access-request.md` — send to client for access setup
> - `kickoff-agenda.md` — meeting structure and prep items
>
> **Review and customize** the sections marked with ACTION NEEDED before sending.
>
> Based on: [proposal reference or conversation summary]"

---

## Hard Rules

- Never include actual credentials or passwords in any document
- Pull real details from proposals when available — don't invent scope or dates
- Mark all sections needing customization with `<!-- ACTION NEEDED: description -->`
- Keep the tone warm and professional — first impressions matter
- Customize access request items based on the actual engagement type
