# Plan: Create `/autopilot` Command

**Created:** 2026-03-01
**Status:** Implemented
**Request:** Create a state-machine orchestrator command that runs the full toolkit pipeline unattended, with self-improving methodology and resumable state.

---

## Overview

### What This Plan Accomplishes

Creates an `/autopilot` command that chains the full toolkit pipeline (prime, discover, scope, create-plan, implement, harden, fix loop) into a single unattended run. It uses a state file to track progress and resume if interrupted, reads only the previous phase's written output to keep context lean, and maintains a learning file that improves its methodology over time.

### Why This Matters

Currently, running the full pipeline requires the user to invoke each command manually, make decisions at each stage, and stay present throughout. This command lets the user kick off the pipeline and walk away, getting substantial progress on a repository while they're out. It makes the toolkit practical for "fire and forget" use on new or existing projects.

---

## Current State

### Relevant Existing Structure

- `.claude/commands/` — 10 existing commands following the same markdown pattern
- Existing pipeline: `/prime` -> `/discover` -> `/scope` -> `/create-plan` -> `/implement` -> `/harden` (with fix loop)
- `scripts/install-toolkit.sh` — installs commands to `~/.claude/commands/`, has explicit COMMANDS array
- `CLAUDE.md` — documents all commands, workspace structure, and workflow pipeline
- `reference/command-development-guide.md` — command authoring conventions

### Gaps or Problems Being Addressed

- No way to run the full pipeline unattended — every command must be invoked manually
- `/scope` requires interactive conversation — no "opinionated" mode exists
- No mechanism for the toolkit to learn from its own runs and improve over time
- If a session dies mid-pipeline, there's no way to resume from where it left off

---

## Proposed Changes

### Summary of Changes

- Create `.claude/commands/autopilot.md` — the orchestrator command
- Update `CLAUDE.md` — add to workspace structure tree and commands section
- Update `scripts/install-toolkit.sh` — add to COMMANDS array and help text

### New Files to Create

| File Path | Purpose |
| --- | --- |
| `.claude/commands/autopilot.md` | State-machine orchestrator that runs the full pipeline unattended |

### Files to Modify

| File Path | Changes |
| --- | --- |
| `CLAUDE.md` | Add `autopilot.md` to workspace structure tree, add standalone command note, add full command documentation section |
| `scripts/install-toolkit.sh` | Add `autopilot.md` to COMMANDS array and help text |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Lives in this repository as a standard toolkit command**: Same pattern as all other commands — single `.md` file in `.claude/commands/`, installed via `install-toolkit.sh`. No separate repo needed. The orchestrator is just another command that happens to follow the same patterns as the commands it orchestrates (rather than calling them).

2. **State file at `./outputs/autopilot-state.json`**: Persists progress so the command can resume if interrupted. Uses `outputs/` because that's where all generated artifacts go. JSON format for easy reading/writing by Claude.

3. **Each phase follows the existing command's patterns inline rather than "calling" other commands**: Claude Code commands can't invoke each other programmatically. Instead, autopilot embeds the key logic from each phase (read context, discover patterns, scope features, create plan, implement, harden) following the same patterns. The original commands remain untouched and independent.

4. **Opinionated scope phase**: Instead of the conversational approach in `/scope`, autopilot makes best-judgment decisions based on what `/discover` found. It documents its reasoning so the user can review. This is the key enabler for unattended operation.

5. **Harden loop capped at 3 passes, Critical/High only**: Prevents infinite loops. After 3 passes, it reports remaining issues and stops. Only fixes Critical and High severity findings — Medium and Low are logged for manual review.

6. **Self-improving learning file at `./outputs/autopilot-learnings.md`**: Read at the start of every run. Updated at the end. Captures what worked, what didn't, timing insights, common patterns in this project. This is distinct from `/harden`'s knowledge base — it's about the *process* of running autopilot, not about security findings.

7. **No agent swarms**: After analysis, parallel subagents don't provide meaningful benefit here. Each phase depends on the previous phase's output (sequential by nature). Discovery *could* be parallelized across dimensions (code, config, deps), but the overhead of coordinating agents and merging results exceeds the time saved — discovery is fast as a single pass. The complexity cost isn't justified.

8. **Frontend-design is opt-in via `--frontend` flag**: Requires a reference image or design direction that can't be inferred. Only runs if explicitly requested in the arguments.

9. **Phase artifacts written to `outputs/autopilot/`**: Each phase writes its output to a subdirectory (`outputs/autopilot/01-prime.md`, `02-discover.md`, etc.). This keeps autopilot artifacts organized and provides the "read previous phase output only" mechanism that keeps context lean.

10. **Deploy-draft is excluded from the pipeline**: Deploying is a separate concern that requires Netlify setup and user intent. Not appropriate for unattended execution.

### Alternatives Considered

1. **Separate repository for autopilot**: Rejected — adds installation complexity for no benefit. It's a command like any other, just longer. Keeping it in the toolkit maintains the single-install workflow.

2. **Agent swarms for parallel discovery**: Rejected — the phases are inherently sequential (discover informs scope, scope informs plan, etc.). Parallelizing within discovery (code vs config vs deps) adds coordination overhead that exceeds time savings for a single-pass audit.

3. **Calling existing commands via some mechanism**: Rejected — Claude Code commands can't programmatically invoke each other. The orchestrator follows the same patterns but in a streamlined, opinionated way. This also avoids the problem of accumulated context from multiple command invocations.

4. **Multi-session approach with external orchestrator script**: Rejected — would require a bash script that launches multiple Claude sessions, which adds tooling complexity and is fragile. The single-session state-machine approach with context compression is simpler and more reliable.

### Open Questions

None — the design is fully specified. The user can provide feedback during review.

---

## Step-by-Step Tasks

### Step 1: Create the autopilot command file

Create `.claude/commands/autopilot.md` with the full command definition.

**Structure overview:**

```
# Autopilot

> Run the full toolkit pipeline unattended — discover, scope, plan, implement, and harden in one session.

## Variables

options: $ARGUMENTS (optional flags and parameters)

## Instructions

### Phase 0: Initialize
### Phase 1: Prime
### Phase 2: Discover
### Phase 3: Scope (Opinionated)
### Phase 4: Create Plan
### Phase 5: Implement
### Phase 6: Harden
### Phase 7: Fix Loop
### Phase 8: Finalize & Learn
```

**Full content specification for each phase:**

**Variables section:**
- `$ARGUMENTS` accepts: `--frontend [reference-image]` (opt-in to frontend design phase), `--skip-to <phase>` (resume from a specific phase), `--focus <area>` (narrow the scope to a specific area/feature), or no arguments for a full run. Also accepts `status` to show current autopilot state.

**Phase 0: Initialize**
- Read `./outputs/autopilot-learnings.md` if it exists — apply learnings to this run
- Read `./outputs/autopilot-state.json` if it exists — check for an interrupted run
- If interrupted run found: ask user "A previous run was interrupted at phase [X]. Resume from there, or start fresh?" (This is the ONE user interaction — after this, it runs unattended)
- If no interrupted run: create state file with `{"status": "running", "phase": "prime", "started": "<timestamp>", "phases": {}}`
- Create `./outputs/autopilot/` directory if it doesn't exist
- Parse `$ARGUMENTS` for flags

**Phase 1: Prime**
- Update state: `{"phase": "prime"}`
- Read `./CLAUDE.md` and all files in `./context/`
- Scan project structure: directory tree, key files, package files
- Write summary to `./outputs/autopilot/01-prime.md` covering: project type, stack, structure, existing context quality, available commands
- Update state: `{"phases": {"prime": {"status": "complete", "artifact": "outputs/autopilot/01-prime.md"}}}`

**Phase 2: Discover**
- Update state: `{"phase": "discover"}`
- Read only `./outputs/autopilot/01-prime.md` for context (NOT the full prime conversation)
- Follow the discover command's Phase 2-4 pattern: investigate codebase architecture, config, patterns, build/dev workflow, hidden knowledge; produce gap analysis
- Write discovery report to `./outputs/autopilot/02-discover.md`
- If critical gaps found in `./CLAUDE.md` or `./context/`: update them (additive only, following discover's Phase 5 pattern — but do it automatically instead of asking)
- Update state with completion

**Phase 3: Scope (Opinionated)**
- Update state: `{"phase": "scope"}`
- Read only `./outputs/autopilot/02-discover.md` for context
- Instead of conversational scoping, make opinionated decisions:
  - Analyze what the project needs based on discovery findings
  - Prioritize: critical gaps first, then high-value improvements, then nice-to-haves
  - If `--focus <area>` was specified, narrow scope to that area
  - Define MVP requirements based on what would make the biggest impact
  - Document reasoning for every scoping decision ("Chose X because discovery found Y")
- Write scope document to `./outputs/autopilot/03-scope.md` using the same format as `/scope` Stage 3
- Update state with completion

**Phase 4: Create Plan**
- Update state: `{"phase": "plan"}`
- Read only `./outputs/autopilot/03-scope.md` for context
- Follow the create-plan command's pattern: produce a full implementation plan
- Write plan to `./plans/autopilot-<YYYY-MM-DD>.md` (standard plans/ location so `/implement` could also use it)
- Also write a copy/summary to `./outputs/autopilot/04-plan.md`
- Update state with completion and plan path

**Phase 5: Implement**
- Update state: `{"phase": "implement"}`
- Read the plan from Phase 4
- Follow the implement command's Phase 2 pattern: execute each step in order
- Write implementation summary to `./outputs/autopilot/05-implement.md` listing all files created/modified
- Update state with completion

**Phase 6: Harden (Pass 1)**
- Update state: `{"phase": "harden", "pass": 1}`
- Read only `./outputs/autopilot/05-implement.md` for what was changed
- Follow the harden command's Phase 1-7 pattern (full audit)
- Write harden report to `./outputs/autopilot/06-harden-pass-1.md`
- Also write to standard location `./outputs/harden-report-<date>.md` for consistency
- Update state with findings count by severity

**Phase 7: Fix Loop (max 3 passes)**
- Check harden results: count Critical + High findings
- If zero Critical + High: skip to Phase 8
- If Critical + High findings exist and pass count < 3:
  - Create a focused fix plan for Critical + High issues only
  - Implement the fixes
  - Re-run harden (limited to areas that were changed)
  - Write results to `./outputs/autopilot/07-fix-pass-<N>.md`
  - Increment pass counter
  - Repeat check
- If pass count reaches 3 and issues remain: log remaining issues and proceed to Phase 8
- Update state after each sub-pass

**Phase 8: Finalize & Learn**
- Update state: `{"phase": "finalize", "status": "complete"}`
- Compile a final summary to `./outputs/autopilot/08-summary.md`:
  ```
  # Autopilot Run Summary

  **Date:** <YYYY-MM-DD>
  **Project:** <project name/path>
  **Duration:** <phases completed>

  ## What Was Done
  - [Summary of discoveries]
  - [Summary of scope decisions]
  - [Summary of implementations]
  - [Summary of hardening results]

  ## Files Created/Modified
  [Full list]

  ## Remaining Issues
  [Any Medium/Low findings from harden, or Critical/High that persisted after 3 fix passes]

  ## Decisions Made
  [Key opinionated decisions with reasoning — for user review]

  ## Recommended Next Steps
  [What the user should review, approve, or continue manually]
  ```

- Update (or create) `./outputs/autopilot-learnings.md`:
  ```
  # Autopilot Learnings

  > Cumulative methodology improvements from autopilot runs. Read at the start of every run.

  ## Run History

  | Date | Project | Phases | Fix Passes | Key Insight |
  |------|---------|--------|------------|-------------|

  ## Methodology Insights

  ### What Worked Well
  [Approaches that produced good results]

  ### What Didn't Work
  [Approaches that wasted time or produced poor results]

  ### Scope Decision Patterns
  [Patterns in how opinionated scoping decisions turned out — which heuristics were right vs wrong]

  ### Project-Type Heuristics
  [Learnings about how different project types (web app, CLI, library, etc.) respond to autopilot]

  ## Process Improvements
  [Concrete adjustments to make on future runs based on experience]
  ```

  If the file already exists, update it by:
  1. Adding a new row to Run History
  2. Updating Methodology Insights with what worked/didn't this run
  3. Adding any new Process Improvements discovered
  4. Keeping it concise — this is a quick reference, not a full log

- Present the final summary to the user

**If `--frontend` flag was set:**
- Insert a Phase 5b after implement: follow the frontend-design command's pattern
- Requires a reference image path in the arguments, or design from scratch
- Write results to `./outputs/autopilot/05b-frontend.md`

**If `status` is the argument:**
- Read `./outputs/autopilot-state.json`
- Display current state: which phase, when it started, what's complete
- Do not run any phases

**Actions:**

- Create the file at `.claude/commands/autopilot.md` with the full content following the patterns above

**Files affected:**

- `.claude/commands/autopilot.md` (new)

---

### Step 2: Update CLAUDE.md — workspace structure tree

Add `autopilot.md` to the workspace structure tree in the commands listing.

**Actions:**

- In the workspace structure tree, after the `deploy-draft.md` line, add:
  ```
  │   │   └── autopilot.md          # /autopilot — run full pipeline unattended
  ```
- Change the `deploy-draft.md` line's `└──` to `├──` since it's no longer the last item

**Files affected:**

- `CLAUDE.md`

---

### Step 3: Update CLAUDE.md — standalone commands note

Update the standalone commands note to include `/autopilot`.

**Actions:**

- Change the line that reads:
  ```
  `/frontend-design`, `/site-audit`, and `/deploy-draft` are standalone commands...
  ```
  to:
  ```
  `/frontend-design`, `/site-audit`, `/deploy-draft`, and `/autopilot` are standalone commands...
  ```

**Files affected:**

- `CLAUDE.md`

---

### Step 4: Update CLAUDE.md — command documentation section

Add the `/autopilot` command documentation section. Place it after the `/deploy-draft` section and before the `### Install Scripts` section.

**Actions:**

- Add the following documentation block:

```markdown
### /autopilot [options]

**Purpose:** Run the full toolkit pipeline unattended — discover, scope, plan, implement, and harden in one session.

A state-machine orchestrator that runs the complete workflow without manual intervention. Makes opinionated decisions where commands would normally ask for user input. Maintains a learning file that improves its methodology across runs. Can resume from interruptions.

**Options:** no arguments (full run), `--frontend [reference-image]` (include frontend design phase), `--skip-to <phase>` (resume from a specific phase), `--focus <area>` (narrow scope), `status` (show current run state)

**Pipeline:**
```
prime → discover → scope (opinionated) → create-plan → implement → harden
                                                                      ↓
                                                          fix loop (max 3 passes, Critical/High only)
```

**Features:**
- Resumable state machine — picks up where it left off if interrupted
- Each phase reads only the previous phase's written output (keeps context lean)
- Opinionated scope decisions with documented reasoning
- Self-improving — maintains `outputs/autopilot-learnings.md` across runs
- Harden loop capped at 3 passes to prevent runaway
- All artifacts saved to `outputs/autopilot/` for review

**Examples:**
- `/autopilot` — full unattended pipeline
- `/autopilot --focus authentication` — scope to a specific area
- `/autopilot --frontend ./reference/homepage.png` — include frontend design
- `/autopilot --skip-to harden` — resume from harden phase
- `/autopilot status` — check current run state
```

**Files affected:**

- `CLAUDE.md`

---

### Step 5: Update install-toolkit.sh — COMMANDS array

Add `autopilot.md` to the COMMANDS array.

**Actions:**

- Add `"autopilot.md"` to the end of the COMMANDS array, after `"deploy-draft.md"`

**Files affected:**

- `scripts/install-toolkit.sh`

---

### Step 6: Update install-toolkit.sh — help text

Add autopilot to the help text listing.

**Actions:**

- Add the following line after the `deploy-draft.md` help line:
  ```
  autopilot.md          Run full toolkit pipeline unattended
  ```

**Files affected:**

- `scripts/install-toolkit.sh`

---

### Step 7: Validate

Run through all validation checks to confirm everything is consistent.

**Actions:**

- Verify `.claude/commands/autopilot.md` exists and follows the command pattern (title, description, variables, instructions with phases)
- Verify `CLAUDE.md` workspace structure tree includes `autopilot.md`
- Verify `CLAUDE.md` commands section includes `/autopilot` documentation
- Verify `CLAUDE.md` standalone commands note includes `/autopilot`
- Verify `scripts/install-toolkit.sh` COMMANDS array includes `autopilot.md`
- Verify `scripts/install-toolkit.sh` help text includes autopilot
- Run `bash scripts/install-toolkit.sh --force` to install and verify it deploys

**Files affected:**

- All modified files (read-only verification)

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` — documents all commands and workspace structure
- `scripts/install-toolkit.sh` — installs all commands to `~/.claude/commands/`
- `reference/getting-started.md` — references the workflow pipeline (may want to mention autopilot as an alternative, but not required for this plan)

### Updates Needed for Consistency

- `CLAUDE.md` workspace structure tree
- `CLAUDE.md` standalone commands note
- `CLAUDE.md` commands documentation section
- `scripts/install-toolkit.sh` COMMANDS array and help text

### Impact on Existing Workflows

- **No impact on existing commands**: All existing commands remain unchanged and independent. Autopilot follows their patterns but doesn't modify or depend on them.
- **New artifacts in `outputs/`**: Autopilot creates `outputs/autopilot/` subdirectory and `outputs/autopilot-state.json` and `outputs/autopilot-learnings.md`. These are additive.
- **Plans directory**: Autopilot creates plans in `plans/` using the standard naming convention, so they're compatible with manual `/implement` if needed.

---

## Validation Checklist

- [ ] `.claude/commands/autopilot.md` exists and follows command patterns (title, description, variables, phased instructions)
- [ ] Command handles all argument variants: no args, `--frontend`, `--skip-to`, `--focus`, `status`
- [ ] State file design supports resume from any phase
- [ ] Each phase reads only the previous phase's artifact (not accumulated conversation)
- [ ] Harden loop is capped at 3 passes
- [ ] Learning file structure is defined and update logic is specified
- [ ] `CLAUDE.md` workspace structure tree updated
- [ ] `CLAUDE.md` standalone commands note updated
- [ ] `CLAUDE.md` command documentation section added
- [ ] `scripts/install-toolkit.sh` COMMANDS array updated
- [ ] `scripts/install-toolkit.sh` help text updated
- [ ] `install-toolkit.sh --force` runs successfully and installs autopilot

---

## Success Criteria

The implementation is complete when:

1. `/autopilot` is available as a command after running `install-toolkit.sh`
2. The command file contains complete phase instructions that can execute the full pipeline unattended
3. State file design enables resume from any phase
4. Learning file design enables methodology improvement across runs
5. All documentation (`CLAUDE.md`, install script) is updated and consistent
6. Existing commands remain completely unchanged

---

## Notes

- The learning file (`autopilot-learnings.md`) is the most novel aspect. After several runs across different projects, it should develop project-type-specific heuristics (e.g., "Next.js projects benefit from focusing harden on API routes first" or "Scope decisions for libraries should prioritize API surface over internals"). This gives the command genuine improvement over time.
- The `--skip-to` flag combined with the state file makes the command resilient to context window limits. If a session runs long and gets compressed, the user can start a new session and `/autopilot --skip-to <next-phase>` to continue with fresh context.
- Future enhancement: a `--dry-run` flag that runs through the pipeline but writes plans without implementing. This would let users preview what autopilot would do before committing.
- The opinionated scope phase is the highest-risk design decision. If it makes poor choices, the rest of the pipeline builds on a bad foundation. The learning file is the mitigation — over time, scope heuristics improve based on which decisions turned out well.

---

## Implementation Notes

**Implemented:** 2026-03-01

### Summary

Created the `/autopilot` command as a state-machine orchestrator with 9 phases (0-8), self-improving learnings file, resumable state via JSON, and all supporting documentation and install script updates. The command is installed and available in all projects.

### Deviations from Plan

None — all steps executed as specified.

### Issues Encountered

None.
