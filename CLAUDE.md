# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is **Glen's Toolkit** — a two-layer system for working with Claude Code as an agent assistant across sessions and projects.

- **Toolkit layer**: Universal commands installed once at `~/.claude/commands/`, available in every project
- **Project layer**: Per-project scaffolding (context templates, skills, directory structure) installed per repo

Commands provide the logic; each project provides the data. All commands use relative paths (`./context/`, `./CLAUDE.md`, `./plans/`) so they work in any project directory.

**This file (CLAUDE.md) is the foundation.** It is automatically loaded at the start of every session. Keep it current — it is the single source of truth for how Claude should understand and operate within this workspace.

---

## The Claude-User Relationship

Claude operates as an **agent assistant** with access to the workspace folders, context files, commands, and outputs. The relationship is:

- **User**: Defines goals, provides context about their role/function, and directs work through commands
- **Claude**: Reads context, understands the user's objectives, executes commands, produces outputs, and maintains workspace consistency

Claude should always orient itself through `/prime` at session start, then act with full awareness of who the user is, what they're trying to achieve, and how this workspace supports that.

---

## Workspace Structure

```
.
├── CLAUDE.md                  # This file — core context, always loaded
├── .claude/
│   ├── commands/              # Slash commands (toolkit-layer — universal)
│   │   ├── prime.md               # /prime — session initialization
│   │   ├── create-plan.md         # /create-plan — create implementation plans
│   │   ├── implement.md           # /implement — execute plans
│   │   ├── discover.md            # /discover — audit project for hidden context
│   │   ├── scope.md               # /scope — discovery-to-prototype pipeline
│   │   ├── sync-toolkit.md        # /sync-toolkit — sync commands with toolkit repo
│   │   ├── harden.md              # /harden — find bugs, security issues, edge cases
│   │   ├── frontend-design.md     # /frontend-design — screenshot-driven UI development
│   │   ├── site-audit.md          # /site-audit — website SEO, performance, security audits
│   │   ├── deploy-draft.md        # /deploy-draft — deploy static sites to Netlify for review
│   │   ├── autopilot.md           # /autopilot — run full pipeline unattended
│   │   ├── create-tests.md       # /create-tests — auto-generate test suites
│   │   ├── audit-deps.md         # /audit-deps — dependency security and freshness
│   │   ├── prepare-deploy.md     # /prepare-deploy — production readiness and CI/CD
│   │   ├── proposal.md           # /proposal — generate client proposals
│   │   ├── client-report.md      # /client-report — automated client deliverables
│   │   ├── competitive-intel.md  # /competitive-intel — competitor analysis
│   │   ├── setup-hooks.md       # /setup-hooks — configure quality enforcement hooks
│   │   ├── document.md          # /document — auto-generate project documentation
│   │   ├── connect.md           # /connect — MCP server integration setup
│   │   ├── onboard-client.md    # /onboard-client — client onboarding packages
│   │   ├── meeting-actions.md   # /meeting-actions — meeting notes to action items
│   │   ├── sync-docs.md        # /sync-docs — audit and update all documentation
│   │   └── bootstrap.md       # /bootstrap — build prototype from business document
│   ├── agents/                # Custom subagents with persistent memory
│   │   ├── code-reviewer.md       # Code review specialist (project memory)
│   │   ├── security-auditor.md    # Security analysis specialist (user memory)
│   │   └── client-communicator.md # Client message drafting (project memory)
│   ├── settings.local.json    # Project-level permissions
│   └── skills/                # Skills (project-layer — installed per project)
│       ├── mcp-integration/       # MCP server integration guidance
│       ├── site-audit/            # Website audit reference checklists
│       └── skill-creator/         # Skill authoring guidance
├── context/                   # Background context (project-layer)
│   ├── personal-info.md          # Your role and responsibilities
│   ├── business-info.md          # Organization overview
│   ├── strategy.md               # Current priorities and goals
│   └── current-data.md           # Metrics and current state
├── plans/                     # Implementation plans
├── outputs/                   # Work products and deliverables
├── reference/                 # Templates, guides, and patterns
│   ├── getting-started.md           # START HERE — full walkthrough for both paths
│   ├── toolkit-architecture.md      # Two-layer architecture docs
│   ├── command-development-guide.md # How to author new commands
│   └── workspace-setup-guide.md     # Installation details and aliases
├── milestone-templates/        # Milestone template library for new projects
│   ├── universal/                 # Applied to every project (01–05)
│   ├── web-project/               # Web app / client site milestones (06–09)
│   ├── software/                  # Plugin / tool / software milestones (06–08)
│   └── _template.md               # Blank template for authoring new milestones
├── scripts/
│   ├── install-toolkit.sh     # Install commands to ~/.claude/ (one-time)
│   └── install.sh             # Scaffold a project (per-project, two-phase)
└── shell-aliases.md           # Shell alias documentation
```

**Key directories:**

| Directory    | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `context/`   | Who the user is, their role, current priorities, strategies. Read by `/prime`.      |
| `plans/`     | Detailed implementation plans. Created by `/create-plan`, executed by `/implement`. |
| `outputs/`   | Deliverables, analyses, reports, and work products.                                 |
| `reference/` | Guides: getting-started, architecture, command development, setup.                  |
| `milestone-templates/` | Reusable milestone roadmaps applied by `install.sh` Phase 2.               |
| `scripts/`   | Install scripts for toolkit and project scaffolding.                                |

---

## Commands

### Workflow Pipeline

The standard workflow follows this pipeline:

```
/prime → /discover → /scope → /create-plan → /implement → /harden
                                                                    ↑                        │
                                                                    └── /create-plan fixes ◄──┘
```

Each command can also be used independently. The `/harden` → `/create-plan` → `/implement` → `/harden` loop repeats until the project is clean.

`/frontend-design`, `/site-audit`, `/deploy-draft`, and `/autopilot` are standalone commands used on-demand — they are not part of the standard pipeline. `/site-audit` can chain to `/create-plan` for fixing findings on agency-built sites.

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run this at the start of every session. Claude will:

1. Read CLAUDE.md and context files
2. Summarize understanding of the user, workspace, and goals
3. Note any active plans and available commands
4. Confirm readiness to assist

### /discover [scope]

**Purpose:** Audit a project for undocumented context — find what's in the code but not in the docs.

Systematically searches the codebase for architecture patterns, dependencies, configuration, conventions, and hidden knowledge, then produces a gap analysis comparing documented vs actual state.

**Scope options:** `full` (default), `code`, `config`, `deps`, or a specific path

Example: `/discover config`

### /scope [phase]

**Purpose:** Guide a project from discovery through scope definition to first prototype plan.

Runs a structured scoping pipeline: context check → scope discovery (conversation with user) → scope definition document → bridge to `/create-plan`.

**Phase options:** `discover`, `define`, `plan`, or omit for full pipeline

Example: `/scope define`

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use when adding new functionality, commands, scripts, or making structural changes. Produces a thorough plan document in `plans/` that captures context, rationale, and step-by-step tasks.

Example: `/create-plan add a competitor analysis command`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step in order, validates the work, and updates the plan status.

Example: `/implement plans/2026-01-28-competitor-analysis-command.md`

### /sync-toolkit [action]

**Purpose:** Sync commands between this project and the GlensToolkit repo.

Manages the feedback loop — promotes battle-tested commands from projects back to the toolkit repo, or pulls toolkit commands into a project for customization.

**Actions:** `status`, `push [command]`, `pull [command]`, `push-all`

Example: `/sync-toolkit status`

### /harden [focus]

**Purpose:** Systematically find bugs, security vulnerabilities, edge cases, and performance issues — then guide fixes.

Understands how the project should work, then tries to break it. Produces a severity-ranked report in `outputs/harden-report-[date].md` and maintains a cumulative knowledge base at `outputs/harden-knowledge.md` that improves every subsequent audit.

**Focus options:** `full` (default), `security`, `bugs`, `edge-cases`, `performance`, `validation`, or a specific file/path

**The hardening loop:**
1. `/harden` — find issues, produce report
2. `/create-plan` — plan fixes based on report
3. `/implement` — execute the fix plan
4. `/harden` — verify fixes, find remaining issues
5. Repeat until clean

Behavior-altering fixes are flagged in a Functionality Impact Assessment requiring explicit user approval.

Example: `/harden security`

### /frontend-design [reference-image]

**Purpose:** Build frontend UI with a screenshot-driven comparison workflow.

Provides a reference image and Claude will match it pixel-perfectly, or omit the reference to design from scratch with high craft. Uses Puppeteer to screenshot localhost, then iterates with minimum 2 comparison rounds until the output matches the reference (or passes design quality checks).

**Features:**
- Auto-generates `serve.mjs` and `screenshot.mjs` scripts per-project if missing
- Detects existing dev servers (Vite, Next, etc.) and CSS frameworks
- Uses `brand_assets/` folder contents when available
- Applies anti-generic design guardrails when designing from scratch
- Installs Puppeteer automatically on first use

Example: `/frontend-design ./reference/homepage-mockup.png`

### /site-audit [url] [focus] [export]

**Purpose:** Audit a live website for SEO, performance, accessibility, analytics, and security — produce a client-ready report.

Fetches a live URL and systematically audits it across five dimensions, scoring each category A-F with a client-facing report. Designed for agency use: maintenance plan audits with trend tracking, professional reports for client delivery, and a built-in "Improvement Opportunities" section for upsell.

**Focus options:** `full` (default), `seo`, `performance`, `accessibility`, `analytics`, `security`

**Features:**
- Client-facing reports with A-F grades and business-language findings
- Improvement Opportunities section with estimated hours and ROI (upsell-ready)
- Trend tracking across repeat audits of the same domain (maintenance plans)
- Individual category export with `export` argument
- Lighthouse integration for automated performance/accessibility scoring
- Companion skill with SEO, WCAG, and security header reference checklists
- Knowledge base that improves across audits

**Examples:**
- `/site-audit https://clientsite.com` — full audit
- `/site-audit https://clientsite.com seo` — SEO only
- `/site-audit https://clientsite.com full export` — full audit with individual category reports

### /deploy-draft [action]

**Purpose:** Deploy static sites to Netlify preview URLs for client review.

Handles the full Netlify workflow: prerequisites check, project setup/linking, draft or production deploys, and status checks. Designed for sharing preview URLs with clients.

**Actions:** `draft` (default), `prod`, `status`, `setup`, or pass a custom deploy message

**Features:**
- Auto-detects deploy directory from project structure
- Walks through Netlify setup if the project isn't linked yet
- Adds `.netlify/` to `.gitignore` automatically
- Confirms before production deploys
- Shows shareable preview URLs after draft deploys

**Examples:**
- `/deploy-draft` — deploy a draft preview
- `/deploy-draft prod` — deploy to production (with confirmation)
- `/deploy-draft status` — show current site info
- `/deploy-draft setup` — set up Netlify for the project
- `/deploy-draft "Updated hero section"` — draft deploy with a custom message

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

### /create-tests [target]

**Purpose:** Auto-generate meaningful test suites from code analysis — unit tests, integration tests, and edge cases.

Analyzes the project's code, detects the test framework, and generates tests that catch real bugs. Integrates with `/harden` by converting harden findings into regression tests.

**Options:** a specific file or directory, or omit for project-wide test generation

**Features:**
- Auto-detects test framework (Vitest, Jest, pytest, Go testing, etc.)
- Generates unit, integration, edge case, and regression tests
- Converts harden report findings into regression test cases
- Runs tests to verify they pass before delivering
- Follows existing test patterns and conventions in the project

**Examples:**
- `/create-tests` — generate tests for key modules
- `/create-tests src/auth/` — generate tests for auth module
- `/create-tests utils.ts` — generate tests for a specific file

### /audit-deps [focus]

**Purpose:** Scan project dependencies for security vulnerabilities, outdated packages, and upgrade opportunities.

Extends `/harden` by focusing specifically on the supply chain. Runs native audit tools, classifies vulnerabilities by severity, and produces a prioritized upgrade plan.

**Focus options:** `full` (default), `security`, `outdated`, `upgrade`, or a specific package name

**Features:**
- Uses native audit tools (npm audit, pip audit, cargo audit, etc.)
- Classifies vulnerabilities by severity with CVE references
- Identifies abandoned/unmaintained packages
- Produces a phased upgrade plan (urgent security → major upgrades → routine updates)
- Bridges to `/create-plan` for fix implementation

**Examples:**
- `/audit-deps` — full audit
- `/audit-deps security` — security vulnerabilities only
- `/audit-deps upgrade` — upgrade impact analysis
- `/audit-deps lodash` — audit a specific package

### /prepare-deploy [focus]

**Purpose:** Validate production readiness and generate deployment configuration — CI/CD, Docker, environment config, and pre-launch checklist.

Analyzes the project, generates deployment infrastructure (CI pipeline, Dockerfile, environment config), and produces a readiness checklist. Does not deploy — makes deployment safe and possible.

**Focus options:** `full` (default), `ci`, `docker`, `checklist`, `env`, or a platform name (`vercel`, `railway`, `fly`)

**Features:**
- Audits environment variables and creates `.env.example`
- Generates CI/CD pipelines (GitHub Actions, GitLab CI)
- Creates multi-stage Dockerfiles with security best practices
- Platform-specific config (Vercel, Netlify, Railway, Fly.io, Render)
- Comprehensive pre-launch checklist with readiness scoring
- Flags unresolved harden findings as deployment blockers

**Examples:**
- `/prepare-deploy` — full production readiness check
- `/prepare-deploy ci` — CI/CD pipeline only
- `/prepare-deploy docker` — Dockerfile and docker-compose only
- `/prepare-deploy vercel` — Vercel-specific deployment config
- `/prepare-deploy checklist` — readiness checklist only

### /proposal [input]

**Purpose:** Generate client proposals from a brief, RFP, or conversation.

Pulls from your context files, case studies, and pricing references to produce a near-complete proposal. Supports project, retainer, audit, and phased engagement types.

**Input:** path to an RFP/brief document, a client name, a description, or omit for conversational intake

**Examples:**
- `/proposal` — interactive proposal creation
- `/proposal ./reference/rfp-acme-corp.pdf` — generate from an RFP document
- `/proposal "Acme Corp needs a website redesign, budget ~$30k, 3-month timeline"`

### /client-report [type]

**Purpose:** Generate professional client-facing reports from project data — progress updates, audit summaries, monthly reports, and handoff documentation.

Transforms technical outputs (harden reports, site audits, implementation summaries) into client-friendly language. Automatically detects report type from available data.

**Types:** `progress`, `audit`, `monthly`, `handoff`, or omit for auto-detection

**Examples:**
- `/client-report` — auto-detect and generate from available data
- `/client-report progress` — project progress update
- `/client-report audit` — audit findings in client language
- `/client-report monthly` — monthly maintenance report
- `/client-report handoff` — project handoff documentation

### /competitive-intel [target]

**Purpose:** Research competitors and produce an actionable intelligence report — positioning, features, pricing, tech stack, and opportunities.

Gathers publicly available information, compares against your positioning, and identifies opportunities and threats. Supports single-competitor deep dives and multi-competitor landscape analysis.

**Target:** competitor URL, company name, or `landscape` for multi-competitor overview

**Examples:**
- `/competitive-intel https://competitor.com` — deep analysis of one competitor
- `/competitive-intel "Acme Agency"` — research by company name
- `/competitive-intel landscape` — comparative analysis of multiple competitors

### /setup-hooks [preset]

**Purpose:** Configure Claude Code hooks for continuous quality enforcement — auto-formatting, safety guards, and quality gates.

Detects project tooling (formatters, linters, test runners) and configures hooks that run automatically during Claude Code sessions.

**Presets:** `quality` (format + lint + test gates), `safety` (block dangerous operations), `format` (auto-format only), `full` (all), `status` (show current hooks)

**Examples:**
- `/setup-hooks` — interactive preset selection
- `/setup-hooks full` — configure all hooks
- `/setup-hooks safety` — safety guards only
- `/setup-hooks status` — show current hook configuration

### /document [focus]

**Purpose:** Auto-generate and maintain project documentation — API docs, architecture decisions, deployment guides, and troubleshooting runbooks.

Analyzes the codebase and generates accurate documentation. Enhances existing docs rather than duplicating.

**Focus options:** `full` (default), `api`, `architecture`, `deploy`, `runbook`, `readme`, or a specific file/module

**Examples:**
- `/document` — generate all applicable documentation
- `/document api` — API endpoint documentation
- `/document architecture` — architecture and design decisions
- `/document readme` — create or enhance README.md

### /connect [service]

**Purpose:** Set up MCP server integrations to connect Claude Code with external services — databases, APIs, design tools, and communication platforms.

Walks through MCP server setup for popular services. Handles credentials, scope selection, and verification.

**Services:** `slack`, `figma`, `github`, `postgres`, `notion`, `stripe`, `sentry`, `list` (show all), or omit for interactive selection

**Examples:**
- `/connect list` — show all available integrations
- `/connect postgres` — set up PostgreSQL database access
- `/connect figma` — connect to Figma design files
- `/connect slack` — set up Slack messaging

### /onboard-client [input]

**Purpose:** Generate a complete client onboarding package — welcome email, project timeline, kickoff agenda, and access request forms.

Pulls from proposals and context files to create a ready-to-send onboarding package for new client engagements.

**Input:** client name, project description, or path to a signed proposal/contract

**Examples:**
- `/onboard-client "Acme Corp"` — generate onboarding package
- `/onboard-client ./outputs/proposal-acme-2026-03-01.md` — generate from signed proposal

### /meeting-actions [input]

**Purpose:** Extract action items, decisions, and follow-ups from meeting notes — create tasks, draft emails, and update project docs.

Parses meeting notes or transcripts and produces a structured output with decisions, action items (with owners), open questions, and draft follow-up emails.

**Input:** path to a meeting notes file, or paste notes inline

**Examples:**
- `/meeting-actions ./notes/kickoff-call.md` — process meeting notes from file
- `/meeting-actions "Client wants to launch by April. John to handle DNS. Need brand assets by next week."` — process inline notes

### /bootstrap <document-path> [options]

**Purpose:** Build a full prototype from a business document unattended — scaffold, extract context, and execute multiple build passes to maximize working functionality.

Reads a business document (plan, spec, PRD), extracts all features and context, scaffolds the project, organizes features into build passes, and executes multiple plan→implement cycles. Includes frontend design by default. Designed for "start it and walk away" prototyping.

**Options:** `--no-frontend` (skip UI polish), `--frontend-ref <image>` (match a design mockup), `--skip-to <phase>`, `status`

**Examples:**
- `/bootstrap ./docs/business-plan.pdf` — build prototype from business plan
- `/bootstrap ./docs/spec.md --no-frontend` — backend/API only
- `/bootstrap ./docs/plan.pdf --frontend-ref ./mockup.png` — match a design
- `/bootstrap status` — check current run state

### /sync-docs [action]

**Purpose:** Audit all toolkit documentation for accuracy, update anything out of date, then optionally commit and push.

Compares the actual state of commands, aliases, scripts, and workspace structure against what each documentation file claims. Fixes discrepancies and can commit/push in one step.

**Actions:** `check` (audit only), `fix` (default — audit and update), `push` (audit, update, commit, and push)

**Examples:**
- `/sync-docs` — audit and fix stale docs
- `/sync-docs check` — report what's out of date without changing anything
- `/sync-docs push` — fix everything, commit, and push to GitHub

### Custom Subagents

Three persistent subagents are available in every project. They learn from each use and improve over time.

- **code-reviewer** — Reviews code changes for bugs, security, and quality. Has project-level memory.
- **security-auditor** — Specialized security analysis with vulnerability detection. Has user-level memory (shared across projects).
- **client-communicator** — Drafts client-facing messages and emails in your tone. Has project-level memory.

Claude will use these automatically when relevant, or you can invoke them directly: "Have the code reviewer check my changes."

### Install Scripts

#### `scripts/install-toolkit.sh` — Install Universal Commands

```bash
bash scripts/install-toolkit.sh          # Interactive
bash scripts/install-toolkit.sh --force  # Skip prompts
```

Installs all commands to `~/.claude/commands/` — available in every project. Run once, then again whenever commands are updated.

#### `scripts/install.sh` — Scaffold a Project (Two-Phase)

```bash
bash scripts/install.sh ~/my-project            # Interactive (both phases)
bash scripts/install.sh --force ~/my-project     # Phase 1 only (skip prompts)
```

**Phase 1:** Scaffolds a project with context templates, skills, CLAUDE.md, and directory structure. Does NOT install commands — those come from the toolkit layer.

**Phase 2:** Interactive milestone setup. Asks 1–4 questions (project type, database, auth, client-facing) and copies the appropriate milestone templates from `milestone-templates/` into the project's `plans/` directory. Templates use `## Heading` + `- [ ]` format so the Project Hub auto-imports them into kanban on first scan. Choice 4 skips Phase 2 cleanly.

**Options for both:** `--force` (skip prompts), `--no-alias` (skip alias offer), `--help` (usage info)

See `shell-aliases.md` for alias setup instructions.

---

## Development Workflow

To create and deploy new commands:

1. **Author** the command in this repo's `.claude/commands/`
2. **Deploy** with `install-toolkit.sh` to push to `~/.claude/commands/`
3. **Test** in a real project
4. **Refine** through use — or refine in a project and `/sync-toolkit push` back

See `reference/command-development-guide.md` for the full guide and `reference/toolkit-architecture.md` for architecture details.

---

## Critical Instruction: Maintain This File

**Whenever Claude makes changes to the workspace, Claude MUST consider whether CLAUDE.md needs updating.**

After any change — adding commands, scripts, workflows, or modifying structure — ask:

1. Does this change add new functionality users need to know about?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need new files to capture this?

If yes to any, update the relevant sections. This file must always reflect the current state of the workspace so future sessions have accurate context.

**Examples of changes requiring CLAUDE.md updates:**

- Adding a new slash command → add to Commands section
- Creating a new output type → document in Workspace Structure or create a section
- Adding a script → document its purpose and usage
- Changing workflow patterns → update relevant documentation

---

## For Users Downloading This Template

**Start here: `reference/getting-started.md`** — a complete walkthrough with two paths:

- **Path A: New Project** — Build from scratch: scaffold → context → scope → plan → build → harden
- **Path B: Existing Project** — Bring up to scratch: scaffold → discover → harden → fix → repeat

Quick version:

1. **Install the toolkit** (one-time): `bash scripts/install-toolkit.sh`
2. **Scaffold a project** (per-project): `bash scripts/install.sh /path/to/your-project`
3. **Start a session**: `cd your-project && claude` then `/prime`

See `shell-aliases.md` for shortcut aliases.

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Discover**: Run `/discover` to audit for undocumented context (new projects)
3. **Scope**: Run `/scope` to define what to build (new features)
4. **Plan**: Use `/create-plan` before significant additions
5. **Execute**: Use `/implement` to execute plans
6. **Harden**: Run `/harden` to find bugs, security issues, and edge cases
7. **Fix loop**: `/create-plan` fixes → `/implement` → `/harden` again until clean
8. **Sync**: Use `/sync-toolkit push` to promote refined commands back to the toolkit
9. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse
- Commands use relative paths only — see `reference/command-development-guide.md`
