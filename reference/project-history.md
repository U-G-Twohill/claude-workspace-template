# Glen's Toolkit — Project History & Evolution

> This document captures the full development history of Glen's Toolkit (formerly "claude-workspace-template") to preserve context across conversations and repo renames. It should be updated as the project evolves.

**Last updated:** 2026-03-06

---

## Origin & Purpose

Glen's Toolkit started as a personal workspace template for working with Claude Code across multiple projects. The core idea: define your context once, then use structured commands to get consistent, high-quality results from Claude in every project.

The system is designed for Glen's agency/consulting workflow — client projects, site audits, proposals, competitive analysis, and development work. It grew from a simple set of context files into a full command toolkit.

---

## Timeline of Major Changes

### Session 1: Initial Commit (2026-02-28)

**Commit:** `34206e8` — "Initial commit: Claude Workspace Toolkit with full command suite"

Started with the basic structure:
- `CLAUDE.md` as the core project documentation
- `context/` directory with templates for personal info, business info, strategy, and current data
- `.claude/commands/` with initial commands: `/prime`, `/create-plan`, `/implement`, `/setup-workspace`
- `.claude/skills/` with MCP integration and skill creator skills
- `scripts/install.sh` — a single install script that copied everything into target projects
- `shell-aliases.md` with `cs` (Claude Safe) and `cr` (Claude Run) aliases

### Session 2: Two-Layer Architecture (2026-02-28)

**Plan:** `plans/2026-02-28-toolkit-architecture.md`
**Commit:** `39a9d44` — follows the architecture plan

The biggest architectural change. The "copy everything" model was breaking down — commands went stale across projects, every project got bloated, and improvements in one project didn't propagate.

**Solution: Two-layer hybrid architecture**

1. **Toolkit layer** (universal) — Commands installed once at `~/.claude/commands/`, available in every project
2. **Project layer** (per-project) — Context templates, skills, CLAUDE.md, and directory structure scaffolded per repo

**Key changes:**
- Created `scripts/install-toolkit.sh` — installs commands to `~/.claude/commands/` (run once)
- Modified `scripts/install.sh` — reduced to project scaffolding only (no commands)
- Created `/discover` command — audits a project for undocumented context
- Created `/scope` command — guides discovery-to-prototype scoping pipeline
- Created `/sync-toolkit` command — promotes battle-tested commands from projects back to the toolkit repo
- Deleted `/setup-workspace` — replaced by the two shell scripts
- Created `reference/toolkit-architecture.md` — documents the two-layer design
- Created `reference/command-development-guide.md` — how to author new commands
- Created `reference/getting-started.md` — complete walkthrough for new users
- Rewrote `reference/workspace-setup-guide.md` for two-step setup

**Design decisions documented in the plan:**
- Two scripts (not one) because they have different targets, lifecycles, and update frequencies
- All commands use relative paths only (`./context/`, `./CLAUDE.md`, `./plans/`)
- `/sync-toolkit` is a Claude command (not a shell script) because sync benefits from Claude's judgement for diffs and confirmations
- No symlinks — they break on Windows/Git Bash and cause git confusion
- Skills stay project-level for now (Phase 2 consideration: move to `~/.claude/skills/` if Claude Code resolves them there)

### Session 3: Sprint — 12 New Commands + 3 Subagents (2026-02-28 to 2026-03-01)

**Commit:** `39a9d44` — "Add 12 new commands and 3 custom subagents across 4 sprints"

Massive expansion of the command library across 4 sprint phases:

**Sprint 1 — Quality & Testing:**
- `/harden` — Find bugs, security vulnerabilities, edge cases, performance issues. Self-improving knowledge base pattern.
- `/create-tests` — Auto-generate test suites from code analysis
- `/audit-deps` — Dependency security and freshness auditing
- `/prepare-deploy` — Production readiness validation and CI/CD generation

**Sprint 2 — Client & Business:**
- `/proposal` — Generate client proposals from briefs/RFPs
- `/client-report` — Professional client-facing reports (progress, audit, monthly, handoff)
- `/competitive-intel` — Competitor analysis and intelligence reports
- `/frontend-design` — Screenshot-driven UI development with Puppeteer
- `/site-audit` — Website SEO, performance, accessibility, analytics, security audits (with companion skill)
- `/deploy-draft` — Deploy static sites to Netlify for client review

**Sprint 3 — Automation & Integration:**
- `/setup-hooks` — Configure Claude Code hooks for quality enforcement
- `/document` — Auto-generate project documentation
- `/connect` — MCP server integration setup wizard
- `/autopilot` — Full pipeline orchestrator (state machine, resumable, self-improving)

**Sprint 4 — Client Workflow:**
- `/onboard-client` — Client onboarding package generation
- `/meeting-actions` — Meeting notes to action items, decisions, and follow-up emails

**Custom Subagents (3):**
- `code-reviewer` — Code review specialist with project-level memory
- `security-auditor` — Security analysis specialist with user-level memory (shared across projects)
- `client-communicator` — Client message drafting with project-level memory

### Session 4: Comprehensive README (2026-03-01)

**Commit:** `cc7c982` — "Add comprehensive README with all commands and usage examples"

Created a full README.md documenting all 22 commands with usage examples, the 3 subagents, typical workflows, installation instructions, and project structure.

### Session 5: Rename & Alias Setup (2026-03-06)

**Changes made:**
- Renamed project from "claude-workspace-template" / "Claude Workspace Toolkit" to **"Glen's Toolkit"** / **"GlensToolkit"**
- Updated all references across 12 files (CLAUDE.md, README.md, all reference docs, all scripts, sync-toolkit command, plans)
- Added `claude-init` and `claude-toolkit` aliases to `~/.bashrc` pointing to `/d/Repos/GlensToolkit/scripts/`
- Folder renamed from `D:\Repos\claude-workspace-template` to `D:\Repos\GlensToolkit`

**Motivation:** The generic "claude-workspace-template" name didn't reflect that this is a personal toolkit. Renaming makes it clearer and avoids confusion.

**Impact check before rename:**
- No existing shell aliases referenced the old path (none were set up yet)
- Already-scaffolded projects have their own copies — no links back to the toolkit repo
- `sync-toolkit.md` had the old path as a search hint (updated)
- `~/.claude/` metadata uses old path in filenames but Claude Code regenerates those

### Session 6: Milestone Templates & Two-Phase claude-init (2026-03-06)

**Plan:** `plans/2026-03-06-toolkit-milestone-templates.md`
**Commit:** `4c6cd31` — "Add milestone templates and two-phase claude-init"

Part of a larger strategic planning session on Claude.ai designing a three-layer system (Claude Code + Project Hub + Claude.ai). This session focused on the toolkit's contribution: ensuring every new project starts with a sensible milestone roadmap instead of a blank `plans/` directory.

**Milestone template library** — 13 files in `milestone-templates/`:
- `universal/` (5 files): Setup, Dependencies, Core Build, Testing, Deployment — applied to every project
- `web-project/` (4 files): Database, Auth, Frontend Polish, Client Handoff — conditionally applied
- `software/` (3 files): API Design, Packaging, Documentation — applied for tools/plugins
- `_template.md`: Blank template for authoring new milestone files

All templates use `## Heading` + `- [ ]` format so the Project Hub's `project-scanner.js` auto-imports them into kanban on first scan.

**Two-phase install.sh** — Extended `scripts/install.sh` with an interactive Phase 2:
- Phase 1 (unchanged): Scaffold project files
- Phase 2 (new): Asks project type (web/software/experiment/skip), then conditionally asks about database, auth, and client-facing needs. Copies the appropriate templates into `plans/`.
- `--force` mode skips Phase 2 entirely (no interactive input)
- Choice 4 (skip) exits cleanly with no templates

**Cross-repo wiring** (blocked on hub Phase 1):
- Hub scanner parsing verification deferred
- `KNOWN_PROJECTS` replacement deferred
- Template-based category inference deferred

---

## Architecture Overview

```
GlensToolkit/                     (canonical source — where commands are authored)
    .claude/commands/*.md    ──── install-toolkit.sh ────> ~/.claude/commands/
    context/, CLAUDE.md      ──── install.sh ────────────> target project/

~/.claude/commands/               (universal — available in every project)
    prime.md, discover.md, scope.md, create-plan.md, implement.md,
    harden.md, create-tests.md, audit-deps.md, prepare-deploy.md,
    proposal.md, client-report.md, competitive-intel.md, ...

Any Project/                      (project-specific data)
    CLAUDE.md                     (project docs — user edits this)
    context/                      (personal, business, strategy, data)
    plans/                        (implementation plans)
    outputs/                      (reports, deliverables)
    .claude/commands/             (project-local overrides — highest priority)
    .claude/skills/               (domain knowledge)
```

**Command resolution order:**
1. Project-level: `./.claude/commands/` (overrides)
2. User-level: `~/.claude/commands/` (universal)

**Development cycle:**
1. Author commands in GlensToolkit repo
2. Deploy with `install-toolkit.sh` (or `claude-toolkit` alias)
3. Test in real projects
4. Refine through use
5. `/sync-toolkit push` to promote improvements back
6. Redeploy — all projects benefit

---

## Standard Workflow Pipeline

```
/prime -> /discover -> /scope -> /create-plan -> /implement -> /harden
                                                                  |
                                                      +-----------+
                                                      v
                                                /create-plan (fixes)
                                                      |
                                                      v
                                                 /implement
                                                      |
                                                      v
                                                  /harden --> clean? --> done!
                                                      |
                                                      +--> not clean? --> loop back
```

**Standalone commands** (not part of pipeline):
- `/frontend-design`, `/site-audit`, `/deploy-draft`, `/autopilot`
- `/proposal`, `/client-report`, `/competitive-intel`, `/onboard-client`, `/meeting-actions`
- `/create-tests`, `/audit-deps`, `/prepare-deploy`
- `/setup-hooks`, `/document`, `/connect`

---

## Shell Aliases

```bash
cs                  # claude "/prime" — start session with context
cr                  # claude --dangerously-skip-permissions "/prime" — auto-approve mode
claude-init         # Scaffold current directory with GlensToolkit project files
claude-toolkit      # Install/update universal commands to ~/.claude/commands/
```

---

## Known Issues & Future Considerations

### From the architecture plan (Phase 2):
- **Skills at user-level**: Test whether `~/.claude/skills/` is resolved by Claude Code. If yes, move universal skills there.
- **Command versioning**: Add version metadata to command files for better sync status reporting.
- **Auto-update**: Let `install-toolkit.sh` optionally `git pull` the template repo before installing.
- **Command categories**: As the library grows, organize by category.

### From conversations:
- The `install.sh` script guards against being run inside the toolkit repo itself (line 119). When scaffolding a project, you must either pass the target path or run `claude-init` from the target directory.
- Windows folder locks prevent renaming a repo while Claude Code is running inside it.
- Conversation history is keyed to directory path — renaming the repo loses access to previous conversations (hence this document).

---

## Projects Scaffolded

Projects that have been set up with this toolkit (for reference):
- `D:\Repos\WillitsProto` — scaffolded 2026-03-06
- Various other projects visible in `~/.claude/projects/` (Quoting-Tools, Site-Audits, Ghost-Medias, ICUMD-Clone, InfoFocus, Permissible-Audio, ag-prototyping)

---

## How to Update This Document

When significant changes are made to the toolkit, add a new session entry under the Timeline section with:
- Date and what changed
- Why it changed
- Any design decisions made
- Commit hash if applicable

This document serves as the institutional memory for the project. Keep it current.
