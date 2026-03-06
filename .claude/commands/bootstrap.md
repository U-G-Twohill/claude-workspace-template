# Bootstrap

> Scaffold a project, extract context from a business document, and build a full prototype unattended — designed for "start it and walk away" prototyping.

## Variables

options: $ARGUMENTS (required — path to the business document. Optional flags: `--no-frontend` to skip UI polish, `--frontend-ref <image>` to match a design mockup, `--skip-to <phase>`, `status`)

## Instructions

You are bootstrapping a project from a business document into a working prototype. Your singular goal is to **maximize functional coverage** — build as much working functionality as possible before the user returns. Every decision should favor shipping working features over perfection.

**Critical rules:**
- Each phase writes output to `./outputs/bootstrap/`. When starting a new phase, read ONLY the previous phase's artifact — not the full conversation history.
- Update the state file after every phase transition.
- Never deploy, push, or publish anything. Build locally only.
- Never ask the user questions. Make opinionated decisions and document your reasoning.
- Prioritize breadth of functionality over depth. A working prototype with 10 features at 80% beats 3 features at 100%.
- Only harden for issues that would prevent the user from testing (crashes, broken routes, data loss). Skip style, performance, and low-severity findings entirely.
- If you encounter a blocking error, try an alternative approach. Only stop if truly stuck.

---

### Phase 0: Initialize

**Parse arguments:**

The first non-flag argument is the path to the business document. This is required.

- `status` → read and display `./outputs/bootstrap-state.json`, then stop
- `--no-frontend` → skip frontend design polish (default: frontend design IS included)
- `--frontend-ref <path>` → use a reference image for frontend design to match
- `--skip-to <phase>` → resume from a specific phase (valid: `context`, `scope`, `plan`, `build`, `frontend`, `expand`)

**Validate the business document exists.** Supported formats: `.md`, `.txt`, `.pdf`, `.docx` (read what you can). If the file doesn't exist, stop with a clear error.

**Check for learnings:**

Read `./outputs/bootstrap-learnings.md` if it exists. Apply any process improvements from previous runs.

**Check for interrupted run:**

Read `./outputs/bootstrap-state.json` if it exists.

- If `"status": "running"`: tell the user "A previous run was interrupted at phase [X]. Resume from there, or start fresh?" This is the ONE interactive prompt.
- If `--skip-to` was specified: use that instead
- If no state file or status is `"complete"`: start fresh

**Create/reset state file:**

Write `./outputs/bootstrap-state.json`:

```json
{
  "status": "running",
  "started": "<YYYY-MM-DD HH:MM>",
  "phase": "scaffold",
  "document": "<path to business doc>",
  "flags": {
    "frontend": true,
    "frontendRef": null,
    "skipTo": null
  },
  "buildPasses": 0,
  "phases": {}
}
```

Create `./outputs/bootstrap/` directory if it doesn't exist.

---

### Phase 1: Scaffold

Update state: `"phase": "scaffold"`

Check if the project is already scaffolded (has `./CLAUDE.md`, `./context/`, etc.).

**If NOT scaffolded:**

Run the scaffolding process inline — create the same structure that `install.sh` would create:

1. Create directories: `context/`, `plans/`, `outputs/`, `reference/`, `scripts/`, `.claude/skills/`
2. Create template files: `context/personal-info.md`, `context/business-info.md`, `context/strategy.md`, `context/current-data.md`
3. Create `.claude/settings.local.json` with default permissions
4. Create a minimal `CLAUDE.md` (will be populated in the next phase)

**If already scaffolded:** Note this and proceed.

Update state with completion.

---

### Phase 2: Extract Context

Update state: `"phase": "context"`

**Read the entire business document.** For long documents, read in chunks. Extract ALL of the following:

**From the document, identify and extract:**

1. **Product/Service Description** — what is being built, core value proposition
2. **Target Users** — who uses this, their needs, personas if described
3. **Features & Requirements** — every feature, capability, user story, or requirement mentioned
4. **Technical Specifications** — any tech stack preferences, integrations, APIs, platforms mentioned
5. **Business Model** — monetization, pricing, revenue model if described
6. **Competitive Landscape** — competitors, differentiators mentioned
7. **Constraints** — timeline, budget, regulatory, technical constraints
8. **Success Metrics** — KPIs, goals, milestones mentioned
9. **Brand/Design** — visual identity, tone, design preferences if described
10. **Architecture/Infrastructure** — hosting, scaling, deployment preferences if described

**Populate context files with extracted information:**

Write `./context/business-info.md`:
- Organization overview from the document
- Products/services described
- Key context (market position, team, constraints)

Write `./context/strategy.md`:
- Current focus (the prototype being built)
- Strategic priorities extracted from the document
- What success looks like (from the document's success metrics)

Write `./context/current-data.md`:
- Any metrics, market data, or benchmarks from the document
- Current state of the project (starting from scratch)

Write `./context/personal-info.md`:
- Leave as a general template if no personal info is in the document
- Note the user's role if inferable from the document

**Update `./CLAUDE.md`:**

Write a project-specific CLAUDE.md that includes:
- What the project is (from extracted context)
- Tech stack decisions (inferred or stated)
- Key architectural decisions
- Project structure (will be updated as build progresses)

**Write the extraction report:**

Write `./outputs/bootstrap/01-context.md`:

```markdown
# Bootstrap: Context Extraction

**Source document:** <path>
**Document length:** <approximate word/page count>

## Product Summary
<2-3 sentence summary of what's being built>

## Extracted Features (Complete List)
1. <Feature> — <brief description>
2. <Feature> — <brief description>
...

## Technical Direction
- **Stack:** <chosen or inferred stack>
- **Architecture:** <chosen pattern>
- **Key integrations:** <any APIs/services needed>

## Extraction Confidence
| Area | Confidence | Notes |
|------|-----------|-------|
| Features | High/Medium/Low | <what was clear vs inferred> |
| Tech stack | High/Medium/Low | <stated vs chosen> |
| Design | High/Medium/Low | <described vs not> |

## Items Needing User Review
- <anything ambiguous or where multiple interpretations exist>
```

Update state with completion.

---

### Phase 3: Scope & Prioritize

Update state: `"phase": "scope"`

Read `./outputs/bootstrap/01-context.md`.

**Your job is to turn the full feature list into a buildable prototype plan.** Prioritize ruthlessly — the goal is a testable prototype, not a finished product.

**Prioritization framework:**

1. **Core Loop First** — What's the primary user flow? Build that complete, end to end.
2. **Visible Features** — Features the user can see and interact with during testing.
3. **Data Model** — The underlying data structure that makes features work.
4. **Supporting Features** — Secondary flows that enhance the core experience.
5. **Polish** — Nice-to-haves, edge cases, error handling refinement.

**Organize features into build passes:**

- **Pass 1 (Foundation):** Project setup, data models, core architecture, routing, basic layout
- **Pass 2 (Core Features):** Primary user flow end-to-end, main screens/pages
- **Pass 3 (Secondary Features):** Supporting features, secondary user flows
- **Pass 4 (Frontend Polish):** UI refinement, responsive design, visual polish (skipped if `--no-frontend`)
- **Pass 5+ (Expansion):** Additional features from the document, stretch goals

Each pass should produce something incrementally more testable.

Write `./outputs/bootstrap/02-scope.md`:

```markdown
# Bootstrap: Scope & Build Passes

## Core User Flow
<The primary thing a user does in this app, step by step>

## Build Passes

### Pass 1: Foundation
**Goal:** Project runs, data models exist, basic navigation works
- [ ] <task>
- [ ] <task>
**Testable outcome:** <what the user can verify>

### Pass 2: Core Features
**Goal:** Primary user flow works end-to-end
- [ ] <task>
- [ ] <task>
**Testable outcome:** <what the user can verify>

### Pass 3: Secondary Features
**Goal:** Supporting features enhance the core experience
- [ ] <task>
- [ ] <task>
**Testable outcome:** <what the user can verify>

### Pass 4: Frontend Polish (unless --no-frontend)
**Goal:** UI looks professional and is responsive
- [ ] <task>
**Testable outcome:** <what the user can verify>

### Pass 5+: Expansion
**Goal:** Additional features from the business document
- [ ] <task>
**Testable outcome:** <what the user can verify>

## Deferred (Not in Prototype)
- <feature> — *Reason: <why deferred>*

## Tech Stack Decision
- **Framework:** <choice and why>
- **Database:** <choice and why>
- **Styling:** <choice and why>
- **Key packages:** <list>
```

Update state with completion.

---

### Phase 4: Build Pass Loop

This is the core of the command. You will execute multiple build passes, each creating a plan, implementing it, and doing a quick smoke test before moving on.

**For each build pass (starting at Pass 1):**

Update state: `"phase": "build", "buildPasses": <N>`

#### 4a: Create Plan

Read `./outputs/bootstrap/02-scope.md` for the current pass's tasks.

If this is Pass 2+, also read the previous pass's implementation summary to understand what exists.

Write a focused implementation plan to `./plans/bootstrap-pass-<N>.md` using the standard plan format. Keep it focused — this plan covers ONE build pass, not the whole project.

#### 4b: Implement

Execute the plan step by step:

1. Read any existing files that will be affected
2. Make changes precisely
3. For new files, write complete implementations — not stubs or placeholders
4. Use real, working code — not TODO comments
5. If something can't work without an external service (API key, database), create a reasonable mock or fallback

**Implementation principles:**
- Working code over perfect code
- Real data structures over placeholder strings
- Functional UI over beautiful UI (unless frontend pass)
- Complete flows over partial flows

#### 4c: Smoke Test

After implementing, verify the pass works:

1. Check for syntax errors in created/modified files
2. If it's a web project: attempt to start the dev server and verify it runs
3. If tests exist: run them
4. Check that the "testable outcome" from the scope is achievable

**Fix critical issues only** — things that prevent the app from running or the feature from working. Do NOT fix:
- Style issues
- Performance concerns
- Edge cases
- Code quality nits
- Warnings (only errors)

#### 4d: Write Pass Summary

Write `./outputs/bootstrap/pass-<N>-summary.md`:

```markdown
# Bootstrap: Build Pass <N> Summary

**Pass:** <N> — <pass name from scope>
**Goal:** <goal from scope>

## Completed
- <what was built>

## Files Created
- <path>

## Files Modified
- <path> — <what changed>

## Smoke Test
- Server starts: <yes/no>
- Core flow works: <yes/no>
- Issues found and fixed: <list or "none">

## Current State
<What the user can now do/test in the app>

## Ready for Next Pass: <yes/no>
```

#### 4e: Continue or Stop

**Continue to next pass if:**
- There are more passes defined in the scope
- The app is stable enough to build on
- Context window has capacity (if you're running low, write a detailed handoff and stop)

**Stop building if:**
- All passes are complete
- You've hit a blocking error you can't resolve
- Context is running low — write a handoff document

**Before each new pass:** Re-read only the scope document and the previous pass summary. Do NOT re-read all prior passes.

---

### Phase 5: Frontend Design (default ON, skip with `--no-frontend`)

**Skip entirely if `--no-frontend` was specified.**

Update state: `"phase": "frontend"`

Read the most recent pass summary to understand what's built.

Follow the frontend-design command pattern:

1. Check for Puppeteer, install if missing
2. Create `screenshot.mjs` and `serve.mjs` if they don't exist
3. Detect CSS approach and framework
4. If a reference image was provided: analyze and match it
5. If no reference: design with high craft based on any brand/design notes from the business document
6. Start dev server, screenshot, compare, iterate (minimum 2 rounds)

Focus on:
- The main screens/pages of the core user flow
- Consistent visual language
- Responsive layout
- Professional appearance

Write results to `./outputs/bootstrap/frontend-summary.md`.

Update state with completion.

---

### Phase 6: Stability Pass

Update state: `"phase": "stability"`

This is a lightweight harden — focused ONLY on making the prototype testable.

**Check for:**
1. **Crashes** — anything that prevents the app from starting or running
2. **Broken routes/navigation** — pages that 404 or error
3. **Data loss scenarios** — forms that lose data, broken save/submit flows
4. **Missing error handling on user-facing forms** — basic validation so the user doesn't see raw stack traces

**Do NOT check for:**
- Security vulnerabilities (it's a prototype)
- Performance issues
- Code quality
- Edge cases
- Accessibility
- SEO

Fix what you find inline — no separate plan/implement cycle. Just fix it.

Write `./outputs/bootstrap/stability-report.md`:

```markdown
# Bootstrap: Stability Report

## Issues Found and Fixed
| Issue | Location | Fix Applied |
|-------|----------|-------------|
| <issue> | <file:line> | <what was done> |

## Known Limitations (Not Fixed — Prototype Only)
- <limitation>

## Prototype Status
- App starts: <yes/no>
- Core flow works end-to-end: <yes/no>
- All routes accessible: <yes/no>
- Forms submit without crashing: <yes/no>
```

---

### Phase 7: Finalize

Update state: `"phase": "finalize"`

**Update CLAUDE.md** with the actual project structure, tech stack, and architecture that was built. This makes the next session immediately productive.

**Write the final summary:**

Write `./outputs/bootstrap/summary.md`:

```markdown
# Bootstrap Summary

**Date:** <YYYY-MM-DD>
**Source document:** <path>
**Build passes completed:** <N>
**Frontend design:** <yes/no>

## What Was Built

### Product
<1-2 sentence description>

### Tech Stack
- **Framework:** <what>
- **Database:** <what>
- **Styling:** <what>
- **Key packages:** <list>

### Features Implemented
1. <Feature> — <working/partial/stubbed>
2. <Feature> — <working/partial/stubbed>
...

### Features Not Implemented (Deferred)
- <Feature> — *Reason: <why>*

## How to Test

### Start the App
```
<exact commands to run the app>
```

### Test the Core Flow
1. <Step-by-step instructions for testing the main user flow>
2. <Step>
3. <Step>

### Test Secondary Features
- <Feature>: <how to test it>

## What to Look For
- <Specific things the user should evaluate>
- <Known rough edges>
- <Areas where decisions were made that might need adjustment>

## Recommended Next Steps
1. **Test the core flow** and note what feels wrong
2. **Run `/harden`** for a full security and quality audit
3. **Run `/create-plan`** to address feedback and add deferred features
4. **Fill in `context/personal-info.md`** with your details for better future sessions

## Architecture Overview
```
<directory tree of what was built>
```

## Opinionated Decisions Made
| Decision | Chose | Reasoning |
|----------|-------|-----------|
| <what> | <choice> | <why> |
```

**Update learnings file:**

Read `./outputs/bootstrap-learnings.md` if it exists. If not, create it.

```markdown
# Bootstrap Learnings

> Process improvements from bootstrap runs. Read at start of every run.

## Run History
| Date | Document | Stack | Passes | Key Insight |
|------|----------|-------|--------|-------------|

## What Worked
<Approaches that produced good prototypes>

## What Didn't Work
<Approaches that wasted time>

## Stack Heuristics
<Which stacks work best for which project types>
```

Update with this run's learnings.

**Update state:**

```json
{
  "status": "complete",
  "finished": "<YYYY-MM-DD HH:MM>",
  "phase": "complete",
  "buildPasses": <N>,
  "summary": "outputs/bootstrap/summary.md"
}
```

**Present the final summary.** Lead with:
1. How to start and test the app
2. What features are working
3. What decisions need review
4. Recommended next steps
