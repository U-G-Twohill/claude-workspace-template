# Scope

> Guide a project from initial discovery through scope definition to first prototype plan.

## Variables

phase: $ARGUMENTS (optional — "discover", "define", "plan", or omit for full pipeline. Default: run full pipeline)

## Instructions

You are running the scoping pipeline for this project. This takes a project from "what do we have?" through "what should we build?" to "here's the plan to build it."

### Pipeline Overview

```
/discover → Define Scope → /create-plan → /implement
   ↓            ↓              ↓             ↓
 Audit      Prioritize     Plan MVP      Build it
```

This command handles the middle two stages. Use `/discover` first if the project hasn't been audited yet. Use `/create-plan` and `/implement` after scoping to execute.

---

### Stage 1: Context Check

Before scoping, verify the project has been properly documented:

1. Read `./CLAUDE.md` and `./context/` files
2. Check if context files are filled in (not just templates)
3. If context is thin or missing, recommend running `/discover` first
4. Summarize current understanding of the project's state

---

### Stage 2: Scope Discovery

Engage the user in a structured conversation to define what to build:

**Questions to cover (adapt to context — skip what's already known):**

1. **Vision**: "What does success look like for this project in [timeframe]?"
2. **Users**: "Who uses this? What are their top pain points?"
3. **Constraints**: "What are the hard constraints? (timeline, budget, tech stack, team size)"
4. **Prior art**: "What exists today? What's working, what's not?"
5. **Priority**: "If you could only ship one thing, what would it be?"

Don't ask all questions at once — have a conversation. Use what you learned from `./context/` and `./CLAUDE.md` to skip known information.

---

### Stage 3: Scope Definition

Based on the conversation, produce a scope document:

```
## Scope Definition: [Project/Feature Name]

### Problem Statement
[1-2 sentences — what problem are we solving?]

### Target Users
[Who benefits and how]

### MVP Requirements (Must Have)
1. [Requirement]
2. [Requirement]
3. [Requirement]

### Nice-to-Have (Post-MVP)
- [Feature]
- [Feature]

### Out of Scope
- [Explicitly excluded]

### Technical Approach
[High-level technical direction]

### Constraints
- [Timeline, tech, team, budget constraints]

### Success Criteria
1. [How we'll know MVP is done]
2. [How we'll know it's working]
```

Save this to `./plans/scope-[descriptive-name].md`

---

### Stage 4: Bridge to Implementation

After the scope is approved by the user:

1. Confirm the scope document captures everything
2. Suggest next step: "Ready to create an implementation plan? Run `/create-plan [description based on scope]`"
3. If the user wants to proceed immediately, invoke the planning workflow inline

---

### Adaptation Notes

This pipeline adapts to project context:
- **New project**: Full pipeline, heavy on discovery
- **Existing project, new feature**: Light discovery, focus on scope definition
- **Refactor/improvement**: Focus on current state analysis and gap identification
- **Client project**: Include stakeholder communication and approval checkpoints
