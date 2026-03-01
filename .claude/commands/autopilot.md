# Autopilot

> Run the full toolkit pipeline unattended — discover, scope, plan, implement, and harden in one session.

## Variables

options: $ARGUMENTS (optional — `--frontend [reference-image]`, `--skip-to <phase>`, `--focus <area>`, `status`, or no arguments for a full run)

## Instructions

You are running the full toolkit pipeline as an unattended orchestrator. You will prime, discover, scope, plan, implement, and harden — making opinionated decisions where commands would normally ask the user. Every decision you make must be documented with reasoning so the user can review later.

**Critical rules:**
- Each phase writes its output to `./outputs/autopilot/`. When starting a new phase, read ONLY the previous phase's artifact file — not the full conversation history.
- Update the state file after every phase transition.
- Never deploy, push, or publish anything. This command builds and hardens locally only.
- If you encounter a blocking error you cannot resolve, update the state file with the error details and stop gracefully.

---

### Phase 0: Initialize

**Parse arguments:**

- No arguments → full pipeline run
- `status` → read and display `./outputs/autopilot-state.json`, then stop
- `--frontend [path]` → include frontend design phase after implement (Phase 5b)
- `--skip-to <phase>` → resume from a specific phase (valid: `prime`, `discover`, `scope`, `plan`, `implement`, `harden`, `frontend`)
- `--focus <area>` → narrow the scope phase to a specific area or feature

**Check for learnings:**

Read `./outputs/autopilot-learnings.md` if it exists. Apply any process improvements and heuristics noted there to this run. Note what you're applying: "Applying N learnings from previous runs."

**Check for interrupted run:**

Read `./outputs/autopilot-state.json` if it exists.

- If it shows `"status": "running"`: tell the user "A previous run was interrupted at phase [X]. Resume from there, or start fresh?" Wait for their answer. This is the ONE interactive prompt — after this, run unattended.
- If `--skip-to` was specified: use that instead of the interrupted state
- If no state file or status is `"complete"`: start fresh

**Create/reset state file:**

Write `./outputs/autopilot-state.json`:

```json
{
  "status": "running",
  "started": "<YYYY-MM-DD HH:MM>",
  "phase": "prime",
  "flags": {
    "frontend": false,
    "frontendRef": null,
    "focus": null,
    "skipTo": null
  },
  "phases": {}
}
```

Create `./outputs/autopilot/` directory if it doesn't exist.

---

### Phase 1: Prime

Update state: `"phase": "prime"`

1. Read `./CLAUDE.md` if it exists
2. Read all files in `./context/` if the directory exists
3. Scan the project: run `ls -la` and examine directory structure
4. Check for package files (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile`, `pyproject.toml`, etc.)
5. Read `README.md` if it exists
6. Check for existing plans in `./plans/`

Write `./outputs/autopilot/01-prime.md`:

```markdown
# Autopilot: Prime Summary

**Project:** <name or directory>
**Type:** <web app / CLI / library / API / monorepo / etc.>
**Stack:** <languages, frameworks, key dependencies>
**Structure:** <architectural pattern>

## Context Quality
- CLAUDE.md: <exists and filled / exists but template / missing>
- context/ files: <filled / template / partial / missing>

## Key Files
<List the most important files for understanding this project>

## Existing State
- Plans: <any active plans>
- Outputs: <any existing outputs>
- Tests: <test framework and location if found>

## Initial Assessment
<2-3 sentences: what is this project, what state is it in, what does it need>
```

Update state: `"phases": {"prime": {"status": "complete", "artifact": "outputs/autopilot/01-prime.md"}}`

---

### Phase 2: Discover

Update state: `"phase": "discover"`

Read `./outputs/autopilot/01-prime.md` for context.

Investigate the codebase systematically:

**Architecture & Structure:**
- Scan directory structure for patterns (monorepo, microservices, MVC, etc.)
- Identify key entry points (main files, index files, server files)
- Map dependencies from package files
- Identify frameworks and major libraries in use

**Configuration & Environment:**
- Check for config files (.env.example, docker-compose.yml, CI configs)
- Identify environment variables referenced in code
- Look for deployment configurations
- Check for database schemas or migrations

**Patterns & Conventions:**
- Identify coding patterns (naming conventions, file organization)
- Check for testing patterns and test structure
- Look for API patterns (REST, GraphQL, RPC)
- Identify error handling patterns

**Build & Development:**
- Check for build scripts, Makefiles, task runners
- Identify development workflow (build, test, lint, deploy commands)

**Hidden Knowledge:**
- Check git history for recent significant changes (last 20 commits) if this is a git repo
- Look for TODO/FIXME/HACK comments
- Identify hardcoded values that suggest undocumented constraints

Write `./outputs/autopilot/02-discover.md`:

```markdown
# Autopilot: Discovery Report

## Project Profile
- **Type:** <type>
- **Stack:** <stack details>
- **Architecture:** <pattern>

## Documented vs Actual
| Area | Documented? | Accurate? | Notes |
|------|------------|-----------|-------|

## Key Findings
### Architecture
<What was found>

### Configuration
<What was found>

### Patterns & Conventions
<What was found>

### Build & Dev Workflow
<What was found>

### Hidden Knowledge
<TODOs, constraints, undocumented behavior>

## Critical Gaps
1. <Gap> — <Why it matters>

## Recommendations (prioritized)
1. <Most impactful recommendation>
2. <Next recommendation>
```

**Auto-fix documentation gaps:** If `./CLAUDE.md` or `./context/` files are templates or missing critical information that was discovered, update them now. Be additive — don't remove existing content.

Update state with completion.

---

### Phase 3: Scope (Opinionated)

Update state: `"phase": "scope"`

Read `./outputs/autopilot/02-discover.md` for context.

**This is the opinionated phase.** Instead of asking the user questions, make best-judgment decisions based on discovery findings.

**Scoping process:**

1. Analyze what the project needs based on discovery:
   - What are the critical gaps that must be addressed?
   - What high-value improvements would have the biggest impact?
   - What's technically feasible in a single implementation pass?

2. If `--focus <area>` was specified: narrow scope to that area only

3. Prioritize ruthlessly:
   - **Must do:** Critical gaps, broken functionality, security issues
   - **Should do:** Missing tests, incomplete features, documentation gaps
   - **Nice to have:** Refactoring, performance improvements, code quality
   - Autopilot tackles "must do" and "should do" — "nice to have" goes in recommendations

4. Define MVP scope — what can be implemented and hardened in this single run

5. Document reasoning for EVERY scoping decision

Write `./outputs/autopilot/03-scope.md`:

```markdown
# Autopilot: Scope Definition

## Problem Statement
<What needs to be solved, based on discovery>

## Focus Area
<Specific focus if --focus was used, or "Full project" if not>

## MVP Requirements (Must Do)
1. <Requirement> — *Reason: <why this is critical>*
2. <Requirement> — *Reason: <why this is critical>*

## Should Do
1. <Improvement> — *Reason: <why this matters>*

## Out of Scope (for this run)
- <Excluded item> — *Reason: <why it's deferred>*

## Technical Approach
<High-level plan for how to address the scope>

## Scoping Decisions Log
| Decision | Chose | Over | Reasoning |
|----------|-------|------|-----------|
| <What was decided> | <Choice made> | <Alternative rejected> | <Why> |

## Risk Assessment
- **Highest risk:** <What could go wrong>
- **Mitigation:** <How the plan accounts for it>
```

Update state with completion.

---

### Phase 4: Create Plan

Update state: `"phase": "plan"`

Read `./outputs/autopilot/03-scope.md` for context.

Create a full implementation plan following the standard plan format. This plan should be detailed enough that Phase 5 can execute it step by step.

Write the plan to `./plans/autopilot-<YYYY-MM-DD>.md` using the standard plan format:

```markdown
# Plan: Autopilot Implementation — <descriptive title>

**Created:** <YYYY-MM-DD>
**Status:** Draft
**Request:** Autopilot-generated plan based on discovery and scoping
**Generated by:** /autopilot

---

## Overview
<What this plan accomplishes>

## Step-by-Step Tasks

### Step 1: <Task>
<Detailed instructions>
**Files affected:** <list>

### Step 2: <Task>
...

## Validation Checklist
- [ ] <Check>

## Success Criteria
1. <Criterion>
```

Also write a summary to `./outputs/autopilot/04-plan.md` with the plan path and a brief overview of what will be implemented.

Update state with completion and the plan file path.

---

### Phase 5: Implement

Update state: `"phase": "implement"`

Read the plan created in Phase 4.

Execute each step in the plan in order:

1. For each step:
   - Read any files that will be affected
   - Make the changes specified
   - Verify the change is correct before moving on

2. If a step can't be completed as written:
   - Adapt if the intent is clear
   - Document the deviation
   - Do NOT skip steps — attempt every one

3. After all steps: run through the plan's validation checklist

Write `./outputs/autopilot/05-implement.md`:

```markdown
# Autopilot: Implementation Summary

## Steps Completed
1. <Step> — <result>
2. <Step> — <result>

## Files Created
- <path>

## Files Modified
- <path> — <what changed>

## Deviations from Plan
<Any adaptations made, or "None">

## Validation Results
- [x] <Passed check>
- [ ] <Failed check — reason>
```

Update state with completion.

---

### Phase 5b: Frontend Design (only if `--frontend` flag)

**Skip this phase entirely unless `--frontend` was specified in arguments.**

Update state: `"phase": "frontend"`

Read `./outputs/autopilot/05-implement.md` for context.

Follow the frontend-design command pattern:

1. Check for Puppeteer, install if missing
2. Create `screenshot.mjs` and `serve.mjs` if they don't exist
3. Detect CSS approach and framework
4. If a reference image was provided: analyze it and match it
5. If no reference: design from scratch using the design guardrails
6. Start dev server, screenshot, compare, iterate (minimum 2 rounds)

Write results to `./outputs/autopilot/05b-frontend.md`.

Update state with completion.

---

### Phase 6: Harden (Pass 1)

Update state: `"phase": "harden", "hardenPass": 1`

Read `./outputs/autopilot/05-implement.md` for context on what was changed.

Perform a full hardening audit following the harden command pattern:

1. **Understand intended behavior** from the implementation summary and project context
2. **Security audit** — check for injection, auth issues, access control, data exposure, misconfig
3. **Bug hunting** — logic errors, null handling, type issues, resource management
4. **Edge case discovery** — input boundaries, error paths, data edge cases
5. **Performance analysis** — query patterns, resource efficiency, scalability
6. **Data validation** — API inputs, form inputs, database operations

Write `./outputs/autopilot/06-harden-pass-1.md`:

```markdown
# Autopilot: Harden Report (Pass 1)

**Focus:** Full audit of implemented changes

## Findings

### Critical
| # | Category | Finding | Location | Impact | Fix |
|---|----------|---------|----------|--------|-----|

### High
| # | Category | Finding | Location | Impact | Fix |
|---|----------|---------|----------|--------|-----|

### Medium
| # | Category | Finding | Location | Impact | Fix |
|---|----------|---------|----------|--------|-----|

### Low
| # | Category | Finding | Location | Impact | Fix |
|---|----------|---------|----------|--------|-----|

## Statistics
- Critical: <n> | High: <n> | Medium: <n> | Low: <n>
```

Also write to `./outputs/harden-report-<YYYY-MM-DD>.md` for consistency with the standard harden command.

Update state with findings counts.

---

### Phase 7: Fix Loop

**Skip if Phase 6 found zero Critical + High findings.**

Cap at 3 total passes (including the initial Phase 6 audit).

For each fix pass (up to 2 additional passes):

1. Update state: `"hardenPass": <N>`

2. **Create a focused fix plan** for Critical and High findings only:
   - Read the most recent harden report
   - Plan fixes for each Critical and High finding
   - Medium and Low findings are logged but NOT fixed — they go in the final summary for manual review

3. **Implement the fixes:**
   - Execute each fix
   - Document what was changed

4. **Re-harden** (scoped to changed areas only):
   - Audit only the files/areas that were modified by fixes
   - Check if fixes introduced new issues
   - Update findings

5. Write `./outputs/autopilot/07-fix-pass-<N>.md`:

```markdown
# Autopilot: Fix Pass <N>

## Fixes Applied
| Finding | Fix Applied | Files Changed |
|---------|------------|---------------|

## Re-Harden Results
- Previous Critical+High: <n>
- Remaining Critical+High: <n>
- New issues introduced: <n>

## Remaining Issues
<List any Critical+High that persist>
```

6. Check results:
   - If zero Critical + High remain: exit loop, proceed to Phase 8
   - If pass count reaches 3: log remaining issues, proceed to Phase 8
   - Otherwise: repeat

Update state after each pass.

---

### Phase 8: Finalize & Learn

Update state: `"phase": "finalize"`

**Compile final summary:**

Write `./outputs/autopilot/08-summary.md`:

```markdown
# Autopilot Run Summary

**Date:** <YYYY-MM-DD>
**Project:** <project name/path>
**Phases completed:** <list>
**Harden passes:** <N>

## What Was Done

### Discovery
<Key findings summary>

### Scope Decisions
<What was scoped in/out and why>

### Implementation
<What was built/changed>

### Hardening Results
<Final state — findings fixed, findings remaining>

## Files Created
<Full list of new files>

## Files Modified
<Full list of modified files with brief description>

## Remaining Issues (Manual Review Needed)
### Critical/High (unfixed after 3 passes)
<List or "None">

### Medium
<List from harden reports>

### Low
<List from harden reports>

## Opinionated Decisions Made
| Decision | Reasoning | Confidence |
|----------|-----------|------------|
<Every opinionated decision from scope and implementation, with how confident the autopilot was>

## Recommended Next Steps
1. <What the user should review first>
2. <What to run next>
3. <Manual tasks that autopilot couldn't handle>
```

**Update learnings file:**

Read `./outputs/autopilot-learnings.md` if it exists. If it doesn't exist, create it.

Structure:

```markdown
# Autopilot Learnings

> Cumulative methodology improvements from autopilot runs. Read at the start of every run to improve efficiency and quality.

---

## Run History

| Date | Project | Type | Phases | Fix Passes | Key Insight |
|------|---------|------|--------|------------|-------------|

---

## Methodology Insights

### What Worked Well
<Approaches that produced good results — be specific>

### What Didn't Work
<Approaches that wasted time or produced poor results>

### Scope Decision Patterns
<Which heuristics for opinionated scoping were right vs wrong>

### Project-Type Heuristics
<Learnings about how different project types respond to autopilot>

---

## Process Improvements

<Concrete adjustments to apply on future runs>

- <Improvement>
```

If the file already exists, update it:
1. Add a new row to Run History
2. Update Methodology Insights with this run's learnings
3. Add any new Process Improvements discovered
4. Keep it concise — quick reference, not a full log

**Update state:**

```json
{
  "status": "complete",
  "finished": "<YYYY-MM-DD HH:MM>",
  "phase": "complete",
  "summary": "outputs/autopilot/08-summary.md"
}
```

**Present the final summary to the user.** Highlight:
- What was accomplished
- Key decisions that need review
- Remaining issues requiring manual attention
- Recommended next steps
