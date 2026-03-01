# Claude Workspace Toolkit

A two-layer system for working with Claude Code as an agent assistant across sessions and projects. Commands provide the logic; each project provides the data.

- **Toolkit layer**: 22 universal commands installed once at `~/.claude/commands/`, available in every project
- **Project layer**: Per-project scaffolding (context templates, skills, directory structure) installed per repo

---

## Quick Start

```bash
# 1. Install the toolkit (one-time)
bash scripts/install-toolkit.sh

# 2. Scaffold a project (per-project)
bash scripts/install.sh /path/to/your-project

# 3. Start a session
cd your-project && claude
/prime
```

See `reference/getting-started.md` for a full walkthrough.

---

## Commands

### Starting a Session

#### `/prime`

Run this at the start of every session. Reads your CLAUDE.md and context files, summarizes your project, goals, and available commands. Orients Claude so it knows who you are and what you're working on.

```
/prime
```

---

### Understanding a Project

#### `/discover [scope]`

Use when working with a new or unfamiliar codebase, or when you suspect there's undocumented context hiding in the code. Scans the codebase for architecture patterns, config, dependencies, conventions, and hidden knowledge. Produces a gap analysis comparing what's documented vs. what's actually in the code.

**Scope options:** `full` (default), `code`, `config`, `deps`, or a specific path

```
/discover
/discover config
```

#### `/scope [phase]`

Use when you know what project you're working on but need to define what to build. Interactive conversation that walks through vision, users, constraints, and priorities. Produces a scope definition document that bridges to `/create-plan`.

**Phase options:** `discover`, `define`, `plan`, or omit for full pipeline

```
/scope
/scope define
```

---

### Planning & Building

#### `/create-plan [request]`

Use before making any significant changes — new features, structural changes, refactors. Researches the workspace, then produces a detailed implementation plan in `plans/` with step-by-step tasks, rationale, and validation criteria.

```
/create-plan add user authentication with JWT
/create-plan refactor the API layer to use middleware
```

#### `/implement [plan-path]`

Use after `/create-plan` produces a plan you've approved. Reads the plan and executes every step in order — creating files, modifying code, updating docs. Validates the work against the plan's checklist.

```
/implement plans/2026-03-01-add-authentication.md
```

#### `/autopilot [options]`

Use when you want the full pipeline to run unattended while you're away. State-machine orchestrator that runs discover, scope, plan, implement, and harden — making opinionated decisions where commands would normally ask you. Resumes if interrupted. Learns from each run.

**Options:** `--frontend [image]`, `--skip-to <phase>`, `--focus <area>`, `status`

```
/autopilot
/autopilot --focus authentication
/autopilot --frontend ./reference/homepage.png
/autopilot status
```

---

### Quality & Security

#### `/harden [focus]`

Use after building something, before deploying, or periodically on any project. Tries to break your code — checks for security vulnerabilities (OWASP top 10), logic bugs, edge cases, performance issues, and validation gaps. Produces a severity-ranked report. Maintains a knowledge base that improves across audits.

**Focus options:** `full` (default), `security`, `bugs`, `edge-cases`, `performance`, `validation`, or a specific path

```
/harden
/harden security
/harden src/api/
```

#### `/create-tests [target]`

Use after building features, or when a project has no tests. Analyzes your code and generates real test suites — unit, integration, and edge case tests. Converts harden findings into regression tests so fixed bugs stay fixed.

```
/create-tests
/create-tests src/auth/
/create-tests utils.ts
```

#### `/audit-deps [focus]`

Use periodically on any project, or before deploying. Runs native audit tools (npm audit, pip audit, etc.), identifies outdated and abandoned packages, and produces a prioritized upgrade plan.

**Focus options:** `full` (default), `security`, `outdated`, `upgrade`, or a specific package name

```
/audit-deps
/audit-deps security
/audit-deps lodash
```

#### `/setup-hooks [preset]`

Use when setting up a project for continuous quality enforcement. Detects your project's formatters, linters, and test runners, then configures Claude Code hooks that auto-format after edits, block dangerous operations, and verify tests pass.

**Presets:** `quality`, `safety`, `format`, `full`, `status`

```
/setup-hooks full
/setup-hooks safety
/setup-hooks status
```

---

### Frontend & Design

#### `/frontend-design [reference-image]`

Use when building UI — either matching a design mockup pixel-perfectly, or designing from scratch with high craft. Screenshot-driven workflow using Puppeteer: builds the UI, screenshots it, compares against the reference, and iterates. Minimum 2 comparison rounds.

```
/frontend-design ./reference/homepage-mockup.png
/frontend-design
```

---

### Deployment

#### `/prepare-deploy [focus]`

Use before deploying a project for the first time, or to validate production readiness. Creates deployment infrastructure — CI/CD pipelines (GitHub Actions), Dockerfiles, `.env.example`, and platform-specific config. Produces a readiness checklist and flags unresolved harden findings as blockers.

**Focus options:** `full` (default), `ci`, `docker`, `checklist`, `env`, or a platform name (`vercel`, `railway`, `fly`)

```
/prepare-deploy
/prepare-deploy vercel
/prepare-deploy docker
/prepare-deploy checklist
```

#### `/deploy-draft [action]`

Use when you have a static site ready to share with a client for review. Handles the full Netlify workflow — setup, site creation, linking, and deploying. Draft deploys give you a preview URL; prod deploys go live.

**Actions:** `draft` (default), `prod`, `status`, `setup`

```
/deploy-draft
/deploy-draft prod
/deploy-draft status
/deploy-draft "Updated hero section"
```

---

### Documentation

#### `/document [focus]`

Use when a project needs documentation or docs have gone stale. Analyzes the codebase and generates accurate docs — API documentation, architecture decisions, deployment guides, troubleshooting runbooks, or README enhancements.

**Focus options:** `full` (default), `api`, `architecture`, `deploy`, `runbook`, `readme`

```
/document
/document api
/document readme
```

---

### Client & Business

#### `/proposal [input]`

Use when a potential client sends an RFP or you need to write a proposal. Pulls from your context files, case studies, and pricing references to generate a near-complete proposal with executive summary, approach, deliverables, timeline, and pricing structure.

```
/proposal
/proposal "Acme Corp needs a website redesign, budget ~$30k"
/proposal ./reference/rfp-acme.pdf
```

#### `/client-report [type]`

Use when you need to send a client a progress update, audit summary, monthly report, or handoff document. Transforms technical outputs (harden reports, site audits, implementation summaries) into client-friendly language with no jargon.

**Types:** `progress`, `audit`, `monthly`, `handoff`, or omit for auto-detection

```
/client-report
/client-report monthly
/client-report audit
/client-report handoff
```

#### `/onboard-client [input]`

Use when a client signs and you need to kick off the engagement. Generates a complete onboarding package: welcome email, project timeline, access request form, and kickoff meeting agenda.

```
/onboard-client "Acme Corp"
/onboard-client ./outputs/proposal-acme-2026-03-01.md
```

#### `/competitive-intel [target]`

Use when you want to understand a competitor's positioning, offerings, and weaknesses. Researches publicly available information and produces an actionable intelligence report with opportunities, threats, and change tracking across repeat analyses.

```
/competitive-intel https://competitor.com
/competitive-intel "Acme Agency"
/competitive-intel landscape
```

#### `/site-audit [url] [focus]`

Use when auditing a live website. Fetches the URL and audits across SEO, performance, accessibility, analytics, and security. Scores each category A-F with a client-ready report.

**Focus options:** `full` (default), `seo`, `performance`, `accessibility`, `analytics`, `security`

```
/site-audit https://clientsite.com
/site-audit https://clientsite.com seo
/site-audit https://clientsite.com full export
```

#### `/meeting-actions [input]`

Use after any meeting. Extracts decisions, action items with owners, open questions, and key information. Drafts follow-up emails including a meeting summary.

```
/meeting-actions ./notes/kickoff.md
/meeting-actions "Client wants to launch by April. John handles DNS. Need brand assets by Friday."
```

---

### Integration & Tooling

#### `/connect [service]`

Use when you want Claude to interact directly with external services via MCP — databases, Slack, Figma, GitHub, Stripe, and more. Walks through setup, credentials, and verification.

```
/connect list
/connect postgres
/connect figma
/connect slack
```

#### `/sync-toolkit [action]`

Use when you've refined a command in a project and want to push it back to the toolkit repo, or pull updates from the toolkit.

**Actions:** `status`, `push [command]`, `pull [command]`, `push-all`

```
/sync-toolkit status
/sync-toolkit push proposal.md
```

---

## Custom Subagents

Three persistent subagents are available in every project. They learn from each use and improve over time. Claude uses them automatically when relevant, or you can invoke them directly.

| Agent | What It Does | Memory Scope |
|-------|-------------|-------------|
| **code-reviewer** | Reviews code changes for bugs, security, and quality | Project (learns this codebase's patterns) |
| **security-auditor** | Specialized security analysis and vulnerability detection | User (learns across all your projects) |
| **client-communicator** | Drafts client-facing messages and emails in your tone | Project (learns client-specific preferences) |

```
"Have the code reviewer check my changes"
"Run the security auditor on src/api/"
"Draft an email to the client about the timeline change"
```

---

## Typical Workflows

**New client project:**
```
/prime → /scope → /create-plan → /implement → /create-tests → /harden → /prepare-deploy → /deploy-draft
```

**Existing project maintenance:**
```
/prime → /audit-deps → /harden → /create-plan fixes → /implement → /client-report monthly
```

**Winning new work:**
```
/competitive-intel → /proposal → (client signs) → /onboard-client
```

**Unattended full pipeline:**
```
/autopilot
```

**Hardening loop (repeat until clean):**
```
/harden → /create-plan fixes → /implement → /harden
```

---

## Installation

### Install Commands (one-time)

```bash
bash scripts/install-toolkit.sh          # Interactive
bash scripts/install-toolkit.sh --force  # Skip prompts
```

Installs all commands to `~/.claude/commands/` — available in every project.

### Scaffold a Project (per-project)

```bash
bash scripts/install.sh ~/my-project            # Interactive
bash scripts/install.sh --force ~/my-project     # Skip prompts
```

Creates `context/`, `plans/`, `outputs/`, `reference/`, and a project `CLAUDE.md`.

---

## Project Structure

```
.
├── CLAUDE.md                  # Core context — always loaded by Claude
├── .claude/
│   ├── commands/              # 22 slash commands (toolkit layer)
│   ├── agents/                # 3 custom subagents with persistent memory
│   ├── skills/                # Domain knowledge (project layer)
│   └── settings.local.json    # Project-level permissions
├── context/                   # Who you are, your org, your goals
├── plans/                     # Implementation plans
├── outputs/                   # Reports, deliverables, work products
├── reference/                 # Guides and templates
└── scripts/                   # Install scripts
```

---

## License

MIT
