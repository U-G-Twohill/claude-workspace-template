# Plan: Architect the Claude Workspace Toolkit (Hybrid Two-Layer System)

**Created:** 2026-02-28
**Status:** Implemented
**Request:** Transform the workspace template from a "copy everything" model into a two-layer toolkit that separates universal commands/skills (user-level, available everywhere) from per-project scaffolding, with a feedback loop for promoting battle-tested commands back to the toolkit.

---

## Overview

### What This Plan Accomplishes

Redesigns the claude-workspace-template into a proper toolkit with two distinct layers: a **universal toolkit** installed once at `~/.claude/` that provides commands and skills to every project, and a **project scaffolding** layer that bootstraps individual projects with just the data files they need (context templates, directory structure, CLAUDE.md skeleton). Includes a sync mechanism to promote refined commands from projects back to the toolkit without manual copy-paste.

### Why This Matters

As the command library grows (discovery pipeline, context-audit, scoping, etc.), the current "copy everything" model breaks down — commands go stale across projects, every project gets bloated with every command, and improvements made in one project don't propagate. This architecture solves the update problem, the bloat problem, and the merge problem in one design, while maximizing capability and quality across every project.

---

## Current State

### Relevant Existing Structure

**Template repo (`D:\Repos\claude-workspace-template\`):**
```
.claude/commands/prime.md            # Session init — reads CLAUDE.md + context/
.claude/commands/create-plan.md      # Planning workflow
.claude/commands/implement.md        # Plan execution
.claude/commands/setup-workspace.md  # Claude-driven workspace setup
.claude/settings.local.json          # Local permissions
.claude/skills/mcp-integration/     # 7 files — MCP integration skill
.claude/skills/skill-creator/       # 5 files — skill authoring skill
context/                            # 4 template files (unfilled)
scripts/install.sh                  # Portable install script (just created)
shell-aliases.md                    # Shell alias documentation
reference/workspace-setup-guide.md  # Setup guide
CLAUDE.md                           # Master documentation
```

**User-level (`~/.claude/`):**
```
~/.claude/commands/setup-workspace.md  # Already installed as global command
~/.claude/settings.json                # User settings
```
No `~/.claude/skills/` directory exists yet.

### Gaps or Problems Being Addressed

1. **No separation of concerns** — universal commands and project-specific data are bundled together and copied as one unit
2. **No update mechanism** — improving a command requires re-installing or manually patching every project
3. **No feedback loop** — commands refined in real project use can't be promoted back to the toolkit without manual copy-paste
4. **Commands use hardcoded assumptions** — some commands reference template-specific paths rather than relative project paths
5. **No discovery/audit capability** — no command exists to find undocumented context in a project
6. **No scoping pipeline** — the discovery-to-prototype workflow hasn't been built yet
7. **`install.sh` copies everything** — including commands that should live at user-level

---

## Proposed Changes

### Summary of Changes

- **Split the repo into two installable layers**: toolkit (user-level) and scaffolding (project-level)
- **Create `scripts/install-toolkit.sh`** — installs/updates commands and skills to `~/.claude/`
- **Modify `scripts/install.sh`** — reduce to only install project-level scaffolding (context templates, directories, CLAUDE.md skeleton)
- **Create `/sync-toolkit` command** — promotes commands/skills from a project back to the toolkit repo
- **Create `/discover` command** — audits a project for undocumented context and updates docs
- **Create `/scope` command** — runs the discovery-to-prototype scoping pipeline
- **Refactor all existing commands** to be project-agnostic (relative paths only)
- **Create a command development workflow** — document how to author, test, and deploy commands
- **Restructure the template repo** to clearly separate toolkit-layer vs project-layer files
- **Update all documentation** — CLAUDE.md, workspace-setup-guide.md, shell-aliases.md

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `scripts/install-toolkit.sh` | Installs/updates universal commands and skills to `~/.claude/` |
| `.claude/commands/discover.md` | Audits project for hidden context not represented in documentation |
| `.claude/commands/scope.md` | Discovery/scope-building pipeline into first prototype |
| `.claude/commands/sync-toolkit.md` | Promotes project-level commands/skills back to the toolkit repo |
| `reference/toolkit-architecture.md` | Documents the two-layer architecture, development workflow, and design decisions |
| `reference/command-development-guide.md` | How to author, test, and deploy new commands |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `scripts/install.sh` | Reduce to project-scaffolding only — remove command/skill copying, add call-out to run `install-toolkit.sh` |
| `.claude/commands/prime.md` | Ensure fully project-agnostic with relative paths; enhance to detect available commands |
| `.claude/commands/create-plan.md` | Verify project-agnostic (already looks good, minor relative path audit) |
| `.claude/commands/implement.md` | Verify project-agnostic (already looks good) |
| `CLAUDE.md` | Major update — document two-layer architecture, new commands, new workflow |
| `shell-aliases.md` | Add `claude-toolkit` alias for install-toolkit.sh |
| `reference/workspace-setup-guide.md` | Rewrite to reflect two-step setup (toolkit + project) |

### Files to Delete

| File Path | Reason |
| --------- | ------ |
| `.claude/commands/setup-workspace.md` | Superseded by `install.sh` (project scaffolding) and `install-toolkit.sh` (toolkit). The Claude-driven copy approach is replaced by reliable shell scripts. |

---

## Design Decisions

### Key Decisions Made

1. **Two shell scripts, not one**: `install-toolkit.sh` and `install.sh` are separate because they have different targets (`~/.claude/` vs project dir), different lifecycles (run once vs run per project), and different update frequencies. Combining them would force users to think about both layers every time.

2. **Commands use relative paths only**: Every command references `./context/`, `./CLAUDE.md`, `./plans/`, etc. The commands are the logic; the project provides the data. This is the foundational pattern that makes user-level commands work across all projects.

3. **`/sync-toolkit` is a Claude command, not a shell script**: Because the sync operation benefits from Claude's judgement — it can diff the files, explain what changed, ask for confirmation, and handle edge cases (e.g., a project command that diverged significantly from the toolkit version). A dumb `cp` would overwrite without context.

4. **`/discover` and `/scope` live at user-level**: These are universal productivity commands that work on any project. They read from `./` and `./context/` via relative paths. Project-specific customization happens through the project's `CLAUDE.md` and context files, not through command variants.

5. **The template repo is the canonical source, `~/.claude/` is the deployment target**: Development happens in the template repo. `install-toolkit.sh` deploys to `~/.claude/`. `/sync-toolkit` brings battle-tested changes back from projects to the template repo. This creates a clean development → deploy → feedback cycle.

6. **`/setup-workspace` is removed**: It was a Claude-driven copy mechanism that is now fully replaced by the two shell scripts. Shell scripts are more reliable, faster, and don't consume API tokens for file copying.

7. **Skills stay at project-level in `install.sh` for now**: Skills like `mcp-integration` and `skill-creator` are large and reference-heavy. Claude Code's skill resolution at `~/.claude/skills/` needs verification. For Phase 1, skills remain project-installed. Phase 2 can migrate them to user-level once tested.

8. **No symlinks**: While symlinks would provide true single-source-of-truth, they break on Windows (Git Bash), cause git confusion, and add complexity. The copy-and-sync model is simpler and more portable.

### Alternatives Considered

1. **Symlink architecture (Option C)**: Rejected — breaks on Windows/Git Bash, causes git tracking issues, confusing for users
2. **Single install script**: Rejected — conflates two different concerns (global toolkit vs project scaffolding) and forces unnecessary decisions
3. **Git submodules for shared commands**: Rejected — adds git complexity, confusing for non-technical users, overkill for this use case
4. **NPM/package manager distribution**: Rejected — wrong tool for the job, adds dependency management overhead for what's essentially markdown files

### Open Questions

1. **Skills at user-level**: Does Claude Code resolve skills from `~/.claude/skills/`? If yes, Phase 2 should move universal skills there. Needs testing. *(Non-blocking — skills stay project-level in Phase 1.)*
2. **`/scope` command depth**: The full discovery → scope → prototype pipeline involves significant domain-specific logic being developed in the Ghost Media project. Should we build a minimal `/scope` skeleton now and flesh it out once battle-tested there, or wait? *(Recommendation: build the skeleton now with clear extension points.)*

---

## Step-by-Step Tasks

### Step 1: Restructure the Template Repo Directory Layout

Before building anything, reorganize the repo to clearly separate what's toolkit-level from what's project-level. This is a conceptual reorganization — the actual file locations stay the same, but we add a manifest file that makes the split explicit.

**Actions:**

- Create `reference/toolkit-architecture.md` documenting the two-layer design:
  - **Toolkit layer** (deployed to `~/.claude/` via `install-toolkit.sh`):
    - `.claude/commands/prime.md`
    - `.claude/commands/create-plan.md`
    - `.claude/commands/implement.md`
    - `.claude/commands/discover.md` (new)
    - `.claude/commands/scope.md` (new)
    - `.claude/commands/sync-toolkit.md` (new)
  - **Project layer** (deployed to target project via `install.sh`):
    - `CLAUDE.md`
    - `context/` (4 template files)
    - `shell-aliases.md`
    - `.claude/settings.local.json`
    - `.claude/skills/mcp-integration/` (7 files)
    - `.claude/skills/skill-creator/` (5 files)
    - Empty directories: `plans/`, `outputs/`, `reference/`, `scripts/`
  - Document the development → deploy → feedback cycle
  - Document the design principles (relative paths, commands = logic / project = data)

**Files affected:**

- `reference/toolkit-architecture.md` (create)

---

### Step 2: Refactor Existing Commands to be Project-Agnostic

Audit and update all existing commands to ensure they use only relative paths (`./context/`, `./CLAUDE.md`, `./plans/`) and contain no template-repo-specific assumptions.

**Actions:**

- **`prime.md`**: Already reads `CLAUDE.md` and `./context` — this is good. Enhance it to:
  - List available commands by checking `./` context (it already does `find . -type f -name "*.md"`)
  - Add a step: "Check for `./plans/` to mention any active plans"
  - Remove any assumption that specific context files exist (gracefully handle missing files)

- **`create-plan.md`**: Already uses `plans/` directory with relative paths. Verify:
  - All file paths in the Research Phase section use `./` relative paths ✓
  - No hardcoded template paths ✓
  - Minor: confirm the Research Phase reads `./context/` not a hardcoded path ✓

- **`implement.md`**: Already operates on a `$ARGUMENTS` plan path. Verify:
  - No hardcoded paths ✓
  - Plan path comes from user argument ✓

- No code changes needed for `create-plan.md` or `implement.md` — they're already project-agnostic.

**Files affected:**

- `.claude/commands/prime.md` (modify — minor enhancement)

---

### Step 3: Create `/discover` Command

Build the context-discovery/audit command that searches a project for hidden context not represented in documentation and updates accordingly.

**Actions:**

- Create `.claude/commands/discover.md` with the following behavior:

```markdown
# Discover

> Audit this project for undocumented context — find what's in the code but not in the docs, and surface it.

## Variables

scope: $ARGUMENTS (optional — "full", "code", "config", "deps", or a specific path to focus on. Default: "full")

## Instructions

You are performing a context discovery audit on this project. Your goal is to find important information that exists in the codebase but isn't captured in `./CLAUDE.md`, `./context/`, or other documentation.

### Phase 1: Read Existing Documentation

Read these files to understand what's already documented:

- `./CLAUDE.md` (if it exists)
- All files in `./context/` (if the directory exists)
- Any README.md, CONTRIBUTING.md, or docs/ directory

Build a mental model of what the project documentation currently covers.

### Phase 2: Investigate the Codebase

Systematically search the project for context that should be documented but isn't:

**Architecture & Structure:**
- Scan directory structure for patterns (monorepo, microservices, MVC, etc.)
- Identify key entry points (main files, index files, server files)
- Map dependencies from package files (package.json, requirements.txt, Cargo.toml, go.mod, etc.)
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
- Look for development dependencies and tooling

**Hidden Knowledge:**
- Check git history for recent significant changes (last 20 commits)
- Look for TODO/FIXME/HACK comments that indicate known issues
- Identify any hardcoded values that suggest undocumented constraints
- Check for feature flags or conditional logic that implies hidden states

### Phase 3: Gap Analysis

Compare what you found (Phase 2) with what's documented (Phase 1). Identify:

1. **Critical gaps** — Important architectural decisions, dependencies, or patterns that are nowhere in docs
2. **Stale documentation** — Things documented that no longer match the code
3. **Missing context files** — context/ files that should exist but don't (or exist but are unfilled templates)

### Phase 4: Report & Recommend

Present findings as a structured report:

```
## Discovery Report: [Project Name]

### Project Profile
- Type: [web app / CLI / library / API / monorepo / etc.]
- Stack: [languages, frameworks, key dependencies]
- Structure: [architectural pattern]

### Documented vs Actual
| Area | Documented? | Accurate? | Notes |
|------|------------|-----------|-------|
| ...  | ...        | ...       | ...   |

### Critical Gaps Found
1. [Gap] — [Why it matters] — [Suggested fix]
2. ...

### Recommendations
- [ ] [Specific action to take]
- [ ] ...
```

### Phase 5: Offer to Fix (Optional)

After presenting the report, ask the user:

> "Would you like me to update your documentation with these findings? I can:
> 1. Update CLAUDE.md with discovered architecture/patterns
> 2. Fill in context/ templates with what I found
> 3. Create missing documentation
> 4. All of the above
>
> Or you can address specific items manually."

If the user approves, make the updates. Be additive — don't remove existing documentation, enhance it.
```

**Files affected:**

- `.claude/commands/discover.md` (create)

---

### Step 4: Create `/scope` Command

Build a minimal scoping pipeline skeleton that guides from discovery through to first prototype planning. This is a skeleton — the full pipeline will be refined through real use in projects like Ghost Media.

**Actions:**

- Create `.claude/commands/scope.md`:

```markdown
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
```

**Files affected:**

- `.claude/commands/scope.md` (create)

---

### Step 5: Create `/sync-toolkit` Command

Build the feedback loop command that promotes battle-tested commands from a project back to the toolkit repo.

**Actions:**

- Create `.claude/commands/sync-toolkit.md`:

```markdown
# Sync Toolkit

> Sync commands or skills between this project and the Claude Workspace Toolkit repo.

## Variables

action: $ARGUMENTS (required — "push [command-name]", "pull [command-name]", "status", or "push-all")

## Instructions

You manage the synchronization between project-level commands/skills and the Claude Workspace Toolkit repo.

### Setup

The toolkit repo location must be known. Check for it in this order:
1. Environment variable: `$CLAUDE_TOOLKIT_REPO`
2. Common locations: `~/Repos/claude-workspace-template`, `~/claude-workspace-template`, `D:/Repos/claude-workspace-template`
3. If not found, ask the user for the path

### Actions

#### `status`

Compare commands in this project vs the toolkit repo:

1. List all commands in `~/.claude/commands/` (user-level / deployed)
2. List all commands in the toolkit repo's `.claude/commands/` (source)
3. List any project-local commands in `./.claude/commands/` that don't exist in the toolkit
4. For each command that exists in both locations, check if they differ (use diff)
5. Report:

```
## Toolkit Sync Status

### Toolkit Repo: [path]
### User Commands (~/.claude/commands/): [count] commands
### Toolkit Source: [count] commands

### Differences:
| Command | Status |
|---------|--------|
| prime.md | In sync ✓ |
| discover.md | Modified locally — project version differs |
| my-custom.md | Project-only — not in toolkit |

### Recommendations:
- [Specific actions to take]
```

#### `push [command-name]`

Promote a command from this project or `~/.claude/commands/` to the toolkit repo:

1. Find the command file (check `./.claude/commands/` first, then `~/.claude/commands/`)
2. Check if it already exists in the toolkit repo
3. If it exists, show a diff and ask the user to confirm the overwrite
4. If it doesn't exist, show the file contents and confirm it should be added
5. Copy the file to the toolkit repo's `.claude/commands/`
6. Remind the user to run `install-toolkit.sh` to deploy the updated toolkit, or offer to do it

#### `pull [command-name]`

Pull a command from the toolkit repo to this project's local commands:

1. Find the command in the toolkit repo's `.claude/commands/`
2. Copy it to `./.claude/commands/` (project-local)
3. Note: this is for project-specific customization. The user-level version in `~/.claude/commands/` is unchanged.

#### `push-all`

Push all modified or new project-local commands to the toolkit repo:

1. Run the `status` check
2. For each command that differs or is project-only, show the diff/contents
3. Ask the user to confirm each one (or use batch confirmation)
4. Copy confirmed files to the toolkit repo

### Safety

- Always show diffs before overwriting
- Never delete commands from any location
- Always confirm before writing to the toolkit repo
- Log what was synced for reference
```

**Files affected:**

- `.claude/commands/sync-toolkit.md` (create)

---

### Step 6: Create `scripts/install-toolkit.sh`

Build the toolkit installer that deploys universal commands and (optionally) skills to `~/.claude/`.

**Actions:**

- Create `scripts/install-toolkit.sh` with the following behavior:
  - Same portable patterns as `install.sh` (no rsync, no readlink -f, printf for colors)
  - Auto-detect source from `BASH_SOURCE[0]`
  - Guard against running from wrong directory
  - Copy commands from `.claude/commands/` to `~/.claude/commands/`:
    - `prime.md`
    - `create-plan.md`
    - `implement.md`
    - `discover.md`
    - `scope.md`
    - `sync-toolkit.md`
  - Do NOT copy `setup-workspace.md` (deprecated)
  - Show what will be installed and what will be updated (diff detection)
  - `--force` flag to skip prompts
  - `--help` flag
  - Print success summary with count of installed/updated commands
  - Offer to add `claude-toolkit` alias

**Files affected:**

- `scripts/install-toolkit.sh` (create)

---

### Step 7: Modify `scripts/install.sh` to Project-Scaffolding Only

Reduce the existing install script to only handle project-level files.

**Actions:**

- Remove from the file manifest:
  - `.claude/commands/prime.md`
  - `.claude/commands/create-plan.md`
  - `.claude/commands/implement.md`
  - (Any other commands — they're now toolkit-level)
- Keep in the manifest:
  - `CLAUDE.md`
  - `shell-aliases.md`
  - `.claude/settings.local.json`
  - `.claude/skills/mcp-integration/` (7 files)
  - `.claude/skills/skill-creator/` (5 files)
  - `context/` (4 template files)
- Keep creating empty directories: `plans/`, `outputs/`, `reference/`, `scripts/`
- Update the success message to mention: "Run `install-toolkit.sh` to install universal commands (if not already done)"
- Update file count in output (was 22, will be reduced)
- Add a check: if `~/.claude/commands/prime.md` doesn't exist, print a prominent reminder to install the toolkit

**Files affected:**

- `scripts/install.sh` (modify)

---

### Step 8: Delete `/setup-workspace` Command

Remove the Claude-driven setup command, now fully replaced by shell scripts.

**Actions:**

- Delete `.claude/commands/setup-workspace.md` from the template repo
- Note: The copy at `~/.claude/commands/setup-workspace.md` should also be removed — `install-toolkit.sh` won't include it, and we can add a cleanup step

**Files affected:**

- `.claude/commands/setup-workspace.md` (delete)

---

### Step 9: Create Command Development Guide

Document how to author, test, and deploy new commands for the toolkit.

**Actions:**

- Create `reference/command-development-guide.md` covering:
  - **Design principles**: Commands = logic, project = data; always use relative paths
  - **File structure**: What goes in a command `.md` file
  - **Development workflow**:
    1. Author the command in the template repo's `.claude/commands/`
    2. Run `install-toolkit.sh` to deploy to `~/.claude/commands/`
    3. Test in a real project
    4. Iterate: edit in template repo → redeploy → test
    5. Or: edit in project, test, then `/sync-toolkit push` back to template repo
  - **Testing checklist**:
    - [ ] Command works with no `./context/` files (graceful degradation)
    - [ ] Command works with filled `./context/` files
    - [ ] No hardcoded paths — only `./` relative references
    - [ ] Command works from any project directory
    - [ ] Variables (`$ARGUMENTS`) are documented and handled when empty
  - **Naming conventions**: Verb-first, kebab-case, descriptive
  - **When to make a command vs a skill**: Commands for workflows/pipelines, skills for domain knowledge and specialized tools

**Files affected:**

- `reference/command-development-guide.md` (create)

---

### Step 10: Update CLAUDE.md

Major update to reflect the new architecture.

**Actions:**

- Update the **"What This Is"** section to mention the two-layer toolkit concept
- Rewrite the **"Workspace Structure"** tree to show the clear separation:
  - Add comments indicating toolkit-layer vs project-layer files
  - Add the new command files
  - Add the new reference files
- Update the **"Commands"** section:
  - Add `/discover` with purpose and usage
  - Add `/scope` with purpose and usage
  - Add `/sync-toolkit` with purpose and usage
  - Remove `/setup-workspace` (replaced by shell scripts)
  - Update the Install / Bootstrap section to document both scripts
- Update **"For Users Downloading This Template"** to describe the two-step setup:
  1. Run `install-toolkit.sh` to install universal commands
  2. Run `install.sh [target]` per project for scaffolding
- Update **"Session Workflow"** to include `/discover` and `/scope` in the pipeline
- Add a new **"Development Workflow"** section explaining how to create and deploy new commands

**Files affected:**

- `CLAUDE.md` (modify)

---

### Step 11: Update shell-aliases.md

Add the toolkit installer alias.

**Actions:**

- Add `claude-toolkit` alias to the Setup block:
  ```bash
  alias claude-toolkit='bash "/path/to/claude-workspace-template/scripts/install-toolkit.sh"'
  ```
- Add a `### claude-toolkit — Install/Update Toolkit` section documenting usage

**Files affected:**

- `shell-aliases.md` (modify)

---

### Step 12: Update workspace-setup-guide.md

Rewrite to reflect the two-step setup process.

**Actions:**

- Replace the "Quick Start" section with two-step instructions:
  1. **Install the toolkit** (one-time): `bash scripts/install-toolkit.sh`
  2. **Bootstrap a project**: `bash scripts/install.sh ~/my-project`
- Update the "Option 2: Manual Setup" section
- Remove references to `/setup-workspace` command
- Add a section on updating the toolkit
- Add a section on the feedback loop (`/sync-toolkit`)

**Files affected:**

- `reference/workspace-setup-guide.md` (modify)

---

### Step 13: Verification and Testing

Test the complete system end-to-end.

**Actions:**

1. Run `bash scripts/install-toolkit.sh --force` and verify:
   - All 6 commands installed to `~/.claude/commands/`
   - `setup-workspace.md` NOT installed
   - Success message accurate

2. Run `bash scripts/install.sh --force --no-alias /tmp/test-project` and verify:
   - Only project-level files copied (no commands)
   - Skills, context templates, settings copied
   - Empty directories created
   - Reminder to install toolkit shown if not installed
   - File count is accurate

3. Verify command accessibility:
   - `cd /tmp/test-project && claude "/prime"` — should work using user-level command
   - Commands from `~/.claude/commands/` should be available in the project

4. Test conflict scenarios:
   - Run both scripts again on same targets — verify warnings appear
   - Run with `--force` — verify prompts skipped

5. Test `/discover` and `/scope`:
   - Run in a real project with existing code
   - Verify they use relative paths correctly
   - Verify they work with empty and filled context files

**Files affected:**

- No files modified — testing only

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` — documents all commands and structure (must be updated)
- `shell-aliases.md` — documents shell aliases (must be updated)
- `reference/workspace-setup-guide.md` — documents setup process (must be updated)
- `scripts/install.sh` — currently copies everything (must be modified)
- `~/.claude/commands/setup-workspace.md` — user-level copy of deprecated command (should be removed by install-toolkit.sh)

### Updates Needed for Consistency

- All references to `/setup-workspace` throughout docs must be removed or replaced
- The `install.sh` success message must reference `install-toolkit.sh`
- `CLAUDE.md` must accurately reflect all new commands and the new architecture
- `shell-aliases.md` must include the new aliases

### Impact on Existing Workflows

- **`/prime` still works** — it already reads `./CLAUDE.md` and `./context/` with relative paths
- **`/create-plan` still works** — already project-agnostic
- **`/implement` still works** — already project-agnostic
- **`/setup-workspace` is removed** — users should use `install.sh` and `install-toolkit.sh` instead
- **Existing projects** that were set up with the old `install.sh` will still work — they already have commands copied locally. They can optionally run `install-toolkit.sh` to get user-level commands and then remove their local copies.

---

## Validation Checklist

How to verify the implementation is complete and correct:

- [ ] `install-toolkit.sh --help` shows usage information
- [ ] `install-toolkit.sh --force` installs 6 commands to `~/.claude/commands/`
- [ ] `install-toolkit.sh` does NOT install `setup-workspace.md`
- [ ] `install.sh --force --no-alias /tmp/test` installs only project-level files (no commands)
- [ ] `install.sh` shows reminder about toolkit if `~/.claude/commands/prime.md` is missing
- [ ] `/prime` works from a project set up with the new `install.sh` (using user-level commands)
- [ ] `/discover` runs and produces a context audit report
- [ ] `/scope` runs and guides through the scoping pipeline
- [ ] `/sync-toolkit status` shows comparison between project and toolkit
- [ ] All commands use relative paths only — no hardcoded template repo paths
- [ ] `CLAUDE.md` accurately documents all commands, both scripts, and the architecture
- [ ] `shell-aliases.md` includes `claude-toolkit` alias
- [ ] `reference/toolkit-architecture.md` documents the two-layer design
- [ ] `reference/command-development-guide.md` documents how to author commands
- [ ] `reference/workspace-setup-guide.md` reflects the two-step setup
- [ ] `.claude/commands/setup-workspace.md` is deleted from the template repo

---

## Success Criteria

The implementation is complete when:

1. A user can run `install-toolkit.sh` once to get all universal commands, then `install.sh` per project to scaffold — and commands work correctly in every project via user-level resolution
2. The `/discover` command successfully audits a real project and surfaces undocumented context
3. The `/scope` command guides a user through the discovery-to-prototype pipeline
4. The `/sync-toolkit` command can show status and push updated commands back to the toolkit repo
5. All documentation accurately reflects the new architecture and workflow
6. No command contains hardcoded paths — everything uses relative `./` references

---

## Notes

### Phase 2 Considerations (Future)

- **Skills at user-level**: Test whether Claude Code resolves skills from `~/.claude/skills/`. If yes, move `mcp-integration` and `skill-creator` to the toolkit layer and remove them from `install.sh`.
- **Command versioning**: Consider adding a version comment to command files so `sync-toolkit status` can show version info, not just diffs.
- **Auto-update**: Consider a mechanism where `install-toolkit.sh` can check the template repo for updates (git pull) before installing. Only if the template repo is a git repo.
- **Command categories**: As the command library grows, consider organizing commands into categories (workflow, utility, analysis) with a manifest file.

### Battle-Testing Pipeline

The feedback from the Ghost Media session identified these as candidates for promotion to the universal toolkit once battle-tested:
- Context file templates (already in project-layer ✓)
- Scope-meeting-guide generation logic (to be incorporated into `/scope`)
- The `/prime` → `/discover` → `/scope` → `/create-plan` → `/implement` pipeline
- Process documentation patterns

### Portability Notes

- Both scripts use `#!/usr/bin/env bash`, `cd && pwd` for path resolution, `printf` for colors
- No `rsync`, no `readlink -f`, no GNU-specific flags
- Tested pattern: works on Linux, macOS, Git Bash on Windows

---

## Implementation Notes

**Implemented:** 2026-02-28

### Summary

All 13 steps executed in order. The workspace template has been transformed from a "copy everything" model into a two-layer hybrid toolkit:

- **Toolkit layer**: 6 commands installed to `~/.claude/commands/` via `install-toolkit.sh`
- **Project layer**: 19 files scaffolded per project via `install.sh`
- **Feedback loop**: `/sync-toolkit` command for promoting commands back to the toolkit repo
- **New commands**: `/discover` (context audit), `/scope` (scoping pipeline), `/sync-toolkit` (sync feedback)
- **Deprecated**: `/setup-workspace` command removed (replaced by shell scripts)
- **Documentation**: Full rewrite of CLAUDE.md, shell-aliases.md, workspace-setup-guide.md; new toolkit-architecture.md and command-development-guide.md

### Deviations from Plan

None — all steps executed as specified.

### Issues Encountered

None
