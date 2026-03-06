# Glen's Toolkit

A command system for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that turns it into a persistent agent assistant across sessions and projects. You install commands once, scaffold any project, and get a full workflow — from scoping through building to hardening — in every repo.

**Two layers:**

- **Toolkit layer**: 23 universal slash commands installed to `~/.claude/commands/`, available in every project
- **Project layer**: Per-project scaffolding (context templates, skills, directory structure) installed per repo

Commands provide the logic; each project provides the data.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Step 1: Clone the Repo](#step-1-clone-the-repo)
  - [Step 2: Install the Toolkit (one-time)](#step-2-install-the-toolkit-one-time)
  - [Step 3: Set Up Shell Aliases](#step-3-set-up-shell-aliases)
- [Scaffolding a Project](#scaffolding-a-project)
- [Starting a Session](#starting-a-session)
- [Shell Aliases Reference](#shell-aliases-reference)
- [Commands Reference](#commands-reference)
  - [Session & Discovery](#session--discovery)
  - [Planning & Building](#planning--building)
  - [Quality & Security](#quality--security)
  - [Frontend & Design](#frontend--design)
  - [Deployment](#deployment)
  - [Documentation](#documentation)
  - [Client & Business](#client--business)
  - [Integration & Tooling](#integration--tooling)
- [Custom Subagents](#custom-subagents)
- [Workflows & Best Practices](#workflows--best-practices)
- [Project Structure](#project-structure)
- [Updating the Toolkit](#updating-the-toolkit)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated (`claude` command works in your terminal)
- Bash shell (Git Bash on Windows, or native bash on Mac/Linux)

---

## Installation

### Step 1: Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/GlensToolkit.git ~/GlensToolkit
```

Pick any location — the scripts will reference it by absolute path.

### Step 2: Install the Toolkit (one-time)

This copies all 23 slash commands to `~/.claude/commands/` so they're available in every project:

```bash
bash ~/GlensToolkit/scripts/install-toolkit.sh
```

The script shows you exactly what it's installing and asks for confirmation. Use `--force` to skip prompts.

### Step 3: Set Up Shell Aliases

Add these to your `~/.bashrc` (Linux/Git Bash) or `~/.zshrc` (Mac):

```bash
# Scaffold any project with toolkit structure
alias claude-init='bash ~/GlensToolkit/scripts/install.sh'

# Update toolkit commands (re-run after pulling new versions)
alias claude-toolkit='bash ~/GlensToolkit/scripts/install-toolkit.sh'

# Start Claude with context — safe mode (asks permission for each action)
alias cs='claude "/prime"'

# Start Claude with context — run mode (no permission prompts, faster)
alias cr='claude --dangerously-skip-permissions "/prime"'

# Resume last session in run mode (no permission prompts)
alias crr='claude --resume --dangerously-skip-permissions'
```

> Replace `~/GlensToolkit` with wherever you cloned the repo.

Reload your shell:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

**Note:** Both install scripts offer to set up their aliases automatically during first run, so you can skip manually adding them if you prefer.

---

## Scaffolding a Project

Before using the toolkit in a project, you need to scaffold it — this adds the context templates, skills, CLAUDE.md, and directory structure that commands depend on.

```bash
claude-init ~/my-project
# or: claude-init .              (scaffold current directory)
# or: claude-init --force ~/my-project  (skip prompts)
```

**What this creates:**

```
my-project/
├── CLAUDE.md                    # Core context file — Claude reads this every session
├── .claude/
│   ├── settings.local.json      # Project-level permissions
│   └── skills/                  # Domain knowledge for specialized commands
│       ├── mcp-integration/     # MCP server integration guidance
│       ├── site-audit/          # Website audit checklists
│       └── skill-creator/       # Skill authoring guidance
├── context/                     # YOUR info — fill these in (see below)
│   ├── personal-info.md         # Your role and responsibilities
│   ├── business-info.md         # Your org/business overview
│   ├── strategy.md              # Current priorities and goals
│   └── current-data.md          # Metrics and current state
├── plans/                       # Implementation plans (created by /create-plan)
├── outputs/                     # Reports, deliverables, work products
├── reference/                   # Guides and templates
└── scripts/                     # Project-specific scripts
```

### Fill in Your Context (Important)

After scaffolding, open `context/` and fill in the four template files. This is how Claude understands who you are and what you're working on. The more you provide, the better Claude performs.

| File | What to Write |
|------|--------------|
| `personal-info.md` | Your role, what you're responsible for, how this workspace helps you |
| `business-info.md` | What your org does, who it serves, products/services |
| `strategy.md` | Current priorities (2-5), what success looks like, open decisions |
| `current-data.md` | Key metrics, project status, constraints |

You don't need to fill everything perfectly — write what you know and refine over time.

---

## Starting a Session

### Safe mode (recommended for learning or sensitive work)

```bash
cd ~/my-project
cs
```

This launches Claude Code and immediately runs `/prime` to load all your context. Claude will **ask permission** before executing commands, reading sensitive files, or making changes. You review and approve each action.

### Run mode (for trusted, routine work)

```bash
cd ~/my-project
cr
```

Same as `cs` but with `--dangerously-skip-permissions` — Claude executes commands and makes changes **without asking for approval**. Much faster for familiar workflows.

**When to use which:**

| Mode | Alias | Use when... |
|------|-------|------------|
| Safe | `cs` | Learning the toolkit, working on sensitive code, unfamiliar tasks, you want to review each action |
| Run | `cr` | Routine work, trusted tasks, you want speed over oversight, running `/autopilot` |

### Starting without an alias

If you haven't set up aliases:

```bash
cd ~/my-project
claude          # then type /prime once Claude starts
```

### Recommended first-session workflow

After scaffolding a new project:

```bash
claude-init ~/my-project     # scaffold
cd ~/my-project
# fill in context/ files
cr                           # or cs if you prefer safe mode
```

Claude will run `/prime`, read your context, and confirm it understands your project. From there, pick a command based on what you need.

---

## Shell Aliases Reference

| Alias | What It Does | When to Use |
|-------|-------------|-------------|
| `claude-init` | Scaffolds a project with toolkit structure | Once per project, before first session |
| `claude-toolkit` | Installs/updates commands to `~/.claude/commands/` | Once initially, then after pulling toolkit updates |
| `cs` | Starts Claude + `/prime` in safe mode (permissions on) | Learning, sensitive work, reviewing actions |
| `cr` | Starts Claude + `/prime` in run mode (permissions off) | Trusted work, speed, autopilot |
| `crr` | Resumes last session in run mode (permissions off) | Picking up where you left off, fast |

**Flags for `claude-init` and `claude-toolkit`:**

| Flag | Effect |
|------|--------|
| `--force` | Skip all confirmation prompts |
| `--no-alias` | Skip the alias setup offer at the end |
| `--help` | Show usage information |

---

## Commands Reference

All commands are typed inside a Claude Code session (after running `cs` or `cr`). They start with `/`.

### Session & Discovery

#### `/prime`

**Run this at the start of every session.** Reads CLAUDE.md and context files, summarizes your project, goals, and available commands. Orients Claude so it knows who you are and what you're working on.

```
/prime
```

**Best practice:** Always start with `/prime`. Both `cs` and `cr` do this automatically, but if you start Claude manually (`claude`), run `/prime` first.

---

#### `/discover [scope]`

Audits a codebase for undocumented context — architecture patterns, config, dependencies, conventions, and hidden knowledge. Produces a gap analysis comparing what's documented vs. what's actually in the code.

**Scope options:** `full` (default), `code`, `config`, `deps`, or a specific path

```
/discover                  # Full audit
/discover config           # Configuration files only
/discover src/api/         # Specific directory
```

**When to use:**
- First time working with an existing/unfamiliar codebase
- You suspect undocumented patterns hiding in the code
- After joining a project someone else built
- Periodically to catch documentation drift

**Best practice:** Accept the doc updates it suggests — this makes every subsequent command smarter about your project.

---

#### `/scope [phase]`

Interactive conversation that helps define what to build. Walks through vision, users, constraints, and priorities. Produces a scope definition document that feeds directly into `/create-plan`.

**Phase options:** `discover`, `define`, `plan`, or omit for full pipeline

```
/scope                     # Full scoping pipeline
/scope define              # Jump to scope definition
```

**When to use:**
- Starting a new feature or project
- You know what you want but need to define boundaries
- Before `/create-plan` for anything non-trivial

**Best practice:** Answer Claude's questions honestly — vague answers lead to vague scope. The output is a document in `plans/` that keeps planning grounded.

---

### Planning & Building

#### `/create-plan [request]`

Creates a detailed implementation plan in `plans/` before any code is written. Researches the workspace, then produces step-by-step tasks with rationale, file lists, and validation criteria.

```
/create-plan add user authentication with JWT
/create-plan refactor the API layer to use middleware
/create-plan fix critical and high findings from harden report
```

**When to use:**
- Before any significant change (new features, refactors, structural changes)
- After `/harden` finds issues that need fixing
- When you want to review the approach before committing to it

**Best practice:** Always review the plan before running `/implement`. This is your chance to steer direction, catch misunderstandings, and adjust scope. The plan-then-implement split is intentional — it prevents runaway changes.

---

#### `/implement [plan-path]`

Executes a plan created by `/create-plan`. Reads each step and executes in order — creating files, writing code, updating docs. Validates work against the plan's checklist.

```
/implement plans/2026-03-01-add-authentication.md
```

**When to use:** After `/create-plan` produces a plan you've reviewed and approved.

**Best practice:** Don't skip the review step. If something in the plan looks wrong, tell Claude before running `/implement` — it's much easier to fix a plan than to undo implemented code.

---

#### `/autopilot [options]`

Runs the full pipeline unattended — discover, scope, plan, implement, and harden in one session. Makes opinionated decisions where commands would normally ask you. Resumes if interrupted. Learns from each run.

**Options:** `--frontend [image]`, `--skip-to <phase>`, `--focus <area>`, `status`

```
/autopilot                              # Full unattended pipeline
/autopilot --focus authentication       # Narrow to one area
/autopilot --frontend ./reference/homepage.png  # Include frontend design
/autopilot --skip-to harden             # Resume from a specific phase
/autopilot status                       # Check current run state
```

**When to use:**
- You want the full pipeline while you step away
- Routine work where you trust Claude's decisions
- Prototyping where speed matters more than precision

**Best practice:** Use `cr` (run mode) with `/autopilot` — it needs to execute without permission prompts. Review the artifacts in `outputs/autopilot/` afterward. The harden loop is capped at 3 passes to prevent runaway.

---

### Quality & Security

#### `/harden [focus]`

Systematically tries to break your code. Checks for security vulnerabilities (OWASP top 10), logic bugs, edge cases, performance bottlenecks, and validation gaps. Produces a severity-ranked report. Maintains a knowledge base that gets smarter with every audit.

**Focus options:** `full` (default), `security`, `bugs`, `edge-cases`, `performance`, `validation`, or a specific path

```
/harden                    # Full audit
/harden security           # Security vulnerabilities only
/harden bugs               # Functional bugs only
/harden src/api/           # Specific directory
```

**When to use:**
- After building anything (features, fixes, refactors)
- Before deploying
- Periodically on any project as a health check
- After `/implement` completes

**Best practice:** Run `/harden` after every significant change. The knowledge base at `outputs/harden-knowledge.md` improves with each run — don't delete it. The standard loop is:

```
/harden → /create-plan fixes → /implement → /harden (repeat until clean)
```

---

#### `/create-tests [target]`

Analyzes code and generates real test suites — unit, integration, and edge case tests. Auto-detects your test framework. Converts harden findings into regression tests so fixed bugs stay fixed.

```
/create-tests                  # Key modules across the project
/create-tests src/auth/        # Specific directory
/create-tests utils.ts         # Specific file
```

**When to use:**
- After building features
- When a project has no tests
- After fixing harden findings (generates regression tests)

**Best practice:** Run tests after generation to verify they pass. Claude does this automatically, but check the output.

---

#### `/audit-deps [focus]`

Scans dependencies for security vulnerabilities, outdated packages, and upgrade opportunities. Uses native audit tools (npm audit, pip audit, cargo audit, etc.).

**Focus options:** `full` (default), `security`, `outdated`, `upgrade`, or a specific package name

```
/audit-deps                    # Full audit
/audit-deps security           # Security vulnerabilities only
/audit-deps outdated           # Outdated packages
/audit-deps lodash             # Specific package
```

**When to use:**
- Before deploying
- Periodically as maintenance
- When you suspect a dependency has known vulnerabilities

**Best practice:** Run this alongside `/harden` — they complement each other. `/harden` checks your code; `/audit-deps` checks your supply chain.

---

#### `/setup-hooks [preset]`

Configures Claude Code hooks for continuous quality enforcement. Detects your project's formatters, linters, and test runners, then sets up auto-formatting, safety guards, and test gates.

**Presets:** `quality`, `safety`, `format`, `full`, `status`

```
/setup-hooks full              # All hooks
/setup-hooks safety            # Block dangerous operations only
/setup-hooks quality           # Format + lint + test gates
/setup-hooks status            # Show current configuration
```

**When to use:**
- When setting up a new project for the first time
- When you want Claude to auto-format code after edits
- When you want guardrails against destructive operations

---

### Frontend & Design

#### `/frontend-design [reference-image]`

Screenshot-driven UI development. Provide a design mockup and Claude matches it pixel-perfectly, or omit the reference to design from scratch. Uses Puppeteer to screenshot localhost, compare against the reference, and iterate (minimum 2 comparison rounds).

```
/frontend-design ./reference/homepage-mockup.png   # Match a design
/frontend-design                                    # Design from scratch
```

**When to use:**
- Translating a design mockup to code
- Building UI from scratch with high craft
- Iterating on frontend appearance

**Best practice:** Put reference images in `reference/` or `brand_assets/`. Claude auto-detects existing dev servers (Vite, Next, etc.) and CSS frameworks.

---

### Deployment

#### `/prepare-deploy [focus]`

Validates production readiness and generates deployment infrastructure — CI/CD pipelines, Dockerfiles, `.env.example`, and platform-specific config. Does not deploy — makes deployment safe and possible.

**Focus options:** `full` (default), `ci`, `docker`, `checklist`, `env`, or a platform name (`vercel`, `railway`, `fly`)

```
/prepare-deploy                # Full production readiness check
/prepare-deploy vercel         # Vercel-specific config
/prepare-deploy docker         # Dockerfile and docker-compose
/prepare-deploy ci             # CI/CD pipeline only
/prepare-deploy checklist      # Readiness checklist only
```

**When to use:**
- Before deploying a project for the first time
- Setting up CI/CD
- Validating production readiness

**Best practice:** Run `/harden` first — `/prepare-deploy` flags unresolved harden findings as deployment blockers.

---

#### `/deploy-draft [action]`

Deploys static sites to Netlify preview URLs for client review. Handles setup, site creation, linking, and deploying.

**Actions:** `draft` (default), `prod`, `status`, `setup`, or a custom deploy message

```
/deploy-draft                          # Deploy a draft preview
/deploy-draft prod                     # Deploy to production (confirms first)
/deploy-draft status                   # Show current site info
/deploy-draft setup                    # Set up Netlify for the project
/deploy-draft "Updated hero section"   # Draft with a custom message
```

**When to use:**
- Sharing a preview URL with a client for review
- Quick deploys during development

---

### Documentation

#### `/document [focus]`

Analyzes the codebase and generates accurate documentation. Enhances existing docs rather than duplicating.

**Focus options:** `full` (default), `api`, `architecture`, `deploy`, `runbook`, `readme`, or a specific file/module

```
/document                  # Generate all applicable docs
/document api              # API endpoint documentation
/document architecture     # Architecture and design decisions
/document readme           # Create or enhance README
```

**When to use:**
- Project needs documentation
- Docs have gone stale
- Onboarding new team members

---

### Client & Business

#### `/proposal [input]`

Generates client proposals from a brief, RFP, or conversation. Pulls from context files, case studies, and pricing references.

```
/proposal                                              # Interactive creation
/proposal "Acme Corp needs a website redesign, ~$30k"  # From description
/proposal ./reference/rfp-acme.pdf                     # From RFP document
```

---

#### `/client-report [type]`

Transforms technical outputs (harden reports, site audits, implementation summaries) into client-friendly reports with no jargon.

**Types:** `progress`, `audit`, `monthly`, `handoff`, or omit for auto-detection

```
/client-report                 # Auto-detect from available data
/client-report monthly         # Monthly maintenance report
/client-report handoff         # Project handoff documentation
```

---

#### `/onboard-client [input]`

Generates a complete client onboarding package — welcome email, project timeline, access request forms, and kickoff agenda.

```
/onboard-client "Acme Corp"
/onboard-client ./outputs/proposal-acme-2026-03-01.md
```

---

#### `/competitive-intel [target]`

Researches competitors using publicly available information. Produces positioning analysis, feature comparison, and opportunity identification.

```
/competitive-intel https://competitor.com      # Deep analysis
/competitive-intel "Acme Agency"               # By company name
/competitive-intel landscape                   # Multi-competitor overview
```

---

#### `/site-audit [url] [focus] [export]`

Audits a live website across SEO, performance, accessibility, analytics, and security. Scores each category A-F with a client-ready report.

**Focus options:** `full` (default), `seo`, `performance`, `accessibility`, `analytics`, `security`

```
/site-audit https://clientsite.com                 # Full audit
/site-audit https://clientsite.com seo             # SEO only
/site-audit https://clientsite.com full export     # Full with individual reports
```

---

#### `/meeting-actions [input]`

Extracts decisions, action items with owners, open questions, and follow-ups from meeting notes. Drafts follow-up emails.

```
/meeting-actions ./notes/kickoff.md
/meeting-actions "Client wants April launch. John handles DNS. Need assets by Friday."
```

---

### Integration & Tooling

#### `/connect [service]`

Sets up MCP (Model Context Protocol) server integrations to connect Claude with external services — databases, APIs, Slack, Figma, and more.

```
/connect list              # Show all available integrations
/connect postgres          # Set up PostgreSQL access
/connect figma             # Connect to Figma
/connect slack             # Set up Slack messaging
```

---

#### `/sync-toolkit [action]`

Syncs commands between a project and the toolkit repo. Use when you've refined a command in a project and want to push it back, or pull updates.

**Actions:** `status`, `push [command]`, `pull [command]`, `push-all`

```
/sync-toolkit status                   # Compare project vs toolkit
/sync-toolkit push proposal.md         # Push a refined command back
/sync-toolkit pull harden.md           # Pull latest from toolkit
```

---

#### `/sync-docs [action]`

Audits all toolkit documentation for accuracy and updates anything out of date. Run at the end of a session to catch documentation drift, then optionally commit and push.

**Actions:** `check` (audit only), `fix` (default — audit and update), `push` (audit, update, commit, and push)

```
/sync-docs                     # Audit and fix stale docs
/sync-docs check               # Report what's out of date without changing anything
/sync-docs push                # Fix everything, commit, and push to GitHub
```

**When to use:**
- End of any session where you've made changes to the toolkit
- After adding, removing, or renaming commands
- After changing aliases or install scripts

---

## Custom Subagents

Three persistent subagents are available in every project. They learn from each use and improve over time. Claude uses them automatically when relevant, or you can invoke them directly.

| Agent | What It Does | Memory Scope |
|-------|-------------|-------------|
| **code-reviewer** | Reviews code changes for bugs, security, and quality | Project (learns this codebase's patterns) |
| **security-auditor** | Specialized security analysis and vulnerability detection | User (shared across all your projects) |
| **client-communicator** | Drafts client-facing messages and emails in your tone | Project (learns client-specific preferences) |

**How to invoke:**

```
"Have the code reviewer check my changes"
"Run the security auditor on src/api/"
"Draft an email to the client about the timeline change"
```

---

## Workflows & Best Practices

### Common Workflows

**New project (from scratch):**

```
claude-init ~/my-project → fill in context/ → cr
/prime → /scope → /create-plan → /implement → /create-tests → /harden → /prepare-deploy
```

**Existing project (bring up to scratch):**

```
claude-init ~/existing-project → fill in context/ → cr
/prime → /discover → /harden → /create-plan fixes → /implement → /harden (repeat)
```

**Winning new work:**

```
/competitive-intel → /proposal → (client signs) → /onboard-client
```

**Routine maintenance:**

```
/prime → /audit-deps → /harden → /create-plan fixes → /implement → /client-report monthly
```

**Unattended full pipeline:**

```
cr → /autopilot
```

**The hardening loop (repeat until clean):**

```
/harden → /create-plan fixes → /implement → /harden
```

### Best Practices

1. **Always start with `/prime`.** Both `cs` and `cr` do this automatically. If you start Claude manually, run `/prime` first. It takes seconds and prevents Claude from working with stale context.

2. **Fill in context files.** Claude calibrates its approach based on what you tell it. Vague context = vague results. You don't need to be exhaustive — just honest and specific.

3. **Plan before building.** The `/create-plan` → `/implement` split exists so you can review the approach before code is written. Always read the plan before running `/implement`.

4. **Harden after every significant change.** `/harden` catches regressions and edge cases you didn't think of. The knowledge base (`outputs/harden-knowledge.md`) improves with every run — don't delete it.

5. **Use `/discover` on unfamiliar codebases.** It surfaces patterns and conventions that would take hours to find manually.

6. **Use `cr` for speed, `cs` for oversight.** When learning the toolkit or doing sensitive work, use `cs` so you can see what Claude is doing. Switch to `cr` once you're comfortable.

7. **Don't delete `outputs/`.** Harden knowledge bases, audit reports, and autopilot learnings accumulate intelligence over time. Each run builds on the last.

8. **Keep CLAUDE.md current.** This file is loaded every session. If you make significant changes to your project (new commands, new structure, new conventions), update CLAUDE.md so future sessions have accurate context.

---

## Project Structure

After scaffolding, a project looks like this:

```
.
├── CLAUDE.md                  # Core context — loaded by Claude every session
├── .claude/
│   ├── commands/              # 23 slash commands (toolkit layer, at ~/.claude/commands/)
│   ├── agents/                # 3 custom subagents with persistent memory
│   ├── skills/                # Domain knowledge (project layer)
│   └── settings.local.json    # Project-level permissions
├── context/                   # Who you are, your org, your goals
│   ├── personal-info.md
│   ├── business-info.md
│   ├── strategy.md
│   └── current-data.md
├── plans/                     # Implementation plans (created by /create-plan)
├── outputs/                   # Reports, deliverables, work products
├── reference/                 # Guides and templates
└── scripts/                   # Project-specific scripts
```

**Key directories:**

| Directory | Purpose |
|-----------|---------|
| `context/` | Your info — read by `/prime` to orient Claude |
| `plans/` | Implementation plans — created by `/create-plan`, executed by `/implement` |
| `outputs/` | Reports, audits, deliverables — accumulates intelligence over time |
| `reference/` | Guides, templates, and reference material |

---

## Updating the Toolkit

When commands are updated in the GlensToolkit repo:

```bash
cd ~/GlensToolkit
git pull                       # Get latest changes
claude-toolkit                 # Re-install commands to ~/.claude/commands/
```

The installer shows you exactly what's new, updated, or unchanged before copying anything.

To update a single project's scaffolding (skills, settings):

```bash
claude-init --force ~/my-project
```

> **Note:** This overwrites project-level files (CLAUDE.md, skills, settings). If you've customized these, back them up first or use `/sync-toolkit` to manage changes.

---

## Troubleshooting

**Commands not showing up after install:**
- Verify they're in `~/.claude/commands/`: `ls ~/.claude/commands/`
- Re-run `claude-toolkit` to reinstall
- Restart Claude Code (commands are loaded at startup)

**`claude-init` or `claude-toolkit` not found:**
- Add the aliases to your shell profile (see [Step 3](#step-3-set-up-shell-aliases))
- Run `source ~/.bashrc` (or `~/.zshrc`) to reload
- On Windows with Git Bash, ensure you're editing `~/.bashrc`

**`cs` or `cr` not found:**
- Same as above — add to shell profile and reload

**Permission denied errors with `cr`:**
- `cr` uses `--dangerously-skip-permissions` which bypasses Claude's safety prompts
- If you're getting OS-level permission errors, check file permissions on the target project

**Context files still have placeholders:**
- Open `context/` in your project and fill in the templates
- Claude works without them, but results are much better with real context

**`/prime` shows stale information:**
- Update CLAUDE.md and context files to reflect current state
- Claude reads these files fresh each session

---

## License

MIT
