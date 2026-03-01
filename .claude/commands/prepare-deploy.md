# Prepare Deploy

> Validate production readiness and generate deployment configuration — CI/CD, Docker, environment config, and pre-launch checklist.

## Variables

focus: $ARGUMENTS (optional — "full", "ci", "docker", "checklist", "env", or a specific platform like "vercel", "railway", "fly". Default: "full")

## Instructions

You are preparing this project for production deployment. Your goal is to create the deployment infrastructure and validate readiness — not to deploy, but to make deployment possible and safe.

**Important:** This command creates configuration files and produces a readiness report. It does NOT deploy anything or modify application code. Application fixes go through `/create-plan` → `/implement`.

---

### Phase 1: Project Analysis

1. **Read project context:**
   - Read `./CLAUDE.md` and `./context/` for project understanding
   - Read harden reports in `./outputs/` — unfixed Critical/High findings block production readiness
   - Read dependency audit reports in `./outputs/` if they exist

2. **Detect project type and stack:**
   - Check package files for language, framework, and dependencies
   - Identify the application type:
     - **Static site:** HTML/CSS/JS, built with Vite/Next.js/Astro/etc.
     - **Web app:** Express, Next.js, Django, Flask, Rails, etc.
     - **API:** REST or GraphQL backend
     - **CLI:** Command-line tool
     - **Library:** Published package
   - Check for existing deployment config (Dockerfile, docker-compose.yml, CI configs, Procfile, vercel.json, fly.toml, etc.)
   - Check for existing environment variable usage

3. **Detect current deployment state:**
   - Any existing CI/CD? (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`)
   - Any existing containerization? (Dockerfile, docker-compose.yml)
   - Any platform config? (vercel.json, fly.toml, railway.json, netlify.toml)
   - What's missing?

Summarize: "This is a [type] built with [stack]. Current deployment state: [what exists]. Missing: [what's needed]."

---

### Phase 2: Environment Configuration

**Skip if focus is `ci` or `docker` only.**

1. **Audit environment variables:**
   - Search the codebase for `process.env`, `os.environ`, `env::var`, `ENV[]`, etc.
   - List every environment variable referenced
   - Classify each:
     - **Required:** App won't start without it
     - **Optional:** Has a default fallback
     - **Secret:** API keys, database credentials, tokens
     - **Config:** Feature flags, URLs, ports

2. **Create `.env.example`** if it doesn't exist:
   - List all environment variables with placeholder values
   - Comment each with its purpose
   - Mark secrets clearly: `# SECRET — do not commit actual value`
   - Never include actual secret values

3. **Verify `.env` is in `.gitignore`:**
   - If `.gitignore` exists: check for `.env` entry, add if missing
   - If `.gitignore` doesn't exist: create with standard entries including `.env`

4. **Check for hardcoded secrets in source code:**
   - Search for patterns: API keys, connection strings, passwords, tokens
   - Flag any found as Critical findings

---

### Phase 3: CI/CD Pipeline

**Skip if focus is `docker`, `checklist`, or `env` only.**

1. **Determine the target CI platform:**
   - If existing CI config: match it
   - If `.github/` directory exists: GitHub Actions
   - If on GitLab: GitLab CI
   - Otherwise: default to GitHub Actions (most common)
   - If user specified a platform in arguments: use that

2. **Generate CI/CD configuration:**

   Create a workflow that covers:
   - **Install dependencies**
   - **Lint** (if linter is configured)
   - **Type check** (if TypeScript/typed language)
   - **Run tests** (if test suite exists)
   - **Build** (if build step exists)
   - **Security audit** (dependency vulnerability check)

   For GitHub Actions, create `.github/workflows/ci.yml`:
   - Trigger on push to main and pull requests
   - Use appropriate language version matrix
   - Cache dependencies for speed
   - Run steps in logical order

3. **If tests don't exist:** note this as a gap and recommend running `/create-tests` first

---

### Phase 4: Containerization

**Skip if focus is `ci`, `checklist`, or `env` only.**

**Skip entirely for static sites and libraries — they don't need Docker.**

1. **Generate Dockerfile** if one doesn't exist:
   - Use multi-stage build for smaller images
   - Use appropriate base image (node:alpine, python:slim, golang:alpine, etc.)
   - Copy only necessary files (respect .dockerignore)
   - Run as non-root user
   - Set proper health checks
   - Expose the correct port

2. **Generate `.dockerignore`** if it doesn't exist:
   - Exclude: node_modules, .git, .env, tests, docs, IDE files
   - Include: only what's needed to run

3. **Generate `docker-compose.yml`** if the app has dependencies (database, cache, etc.):
   - Define services for the app and its dependencies
   - Use environment variables from `.env`
   - Set up proper networking
   - Include volume mounts for data persistence

---

### Phase 5: Platform-Specific Config

**Only if the user specified a platform or one is detected.**

Generate platform-specific configuration:

| Platform | Config File | Key Settings |
|----------|------------|-------------|
| Vercel | `vercel.json` | Build command, output dir, rewrites, env vars |
| Netlify | `netlify.toml` | Build command, publish dir, redirects, headers |
| Railway | `railway.json` | Build command, start command, health check |
| Fly.io | `fly.toml` | App name, region, services, health checks |
| Render | `render.yaml` | Service type, build/start commands, env groups |
| AWS (ECS) | `task-definition.json` | Container config, CPU/memory, port mappings |

Only generate what's relevant to this project type and the detected/specified platform.

---

### Phase 6: Pre-Launch Checklist

Generate a comprehensive readiness checklist. Save to `./outputs/deploy-readiness-[YYYY-MM-DD].md`:

```markdown
# Deployment Readiness Report

**Date:** [YYYY-MM-DD]
**Project:** [project name]
**Type:** [static site / web app / API / CLI / library]
**Stack:** [languages, frameworks]
**Target:** [platform if specified]

---

## Readiness Score: [X/Y checks passed]

### Security
- [ ] No hardcoded secrets in source code
- [ ] All secrets in environment variables
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` present with all variables documented
- [ ] No Critical/High harden findings unresolved
- [ ] Dependencies audited for vulnerabilities
- [ ] HTTPS enforced (if web)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS properly configured (if API)

### Build & Test
- [ ] Build succeeds without errors
- [ ] Tests pass (or no tests — recommend `/create-tests`)
- [ ] Linter passes (if configured)
- [ ] Type checks pass (if TypeScript/typed)
- [ ] No build warnings for deprecated features

### Configuration
- [ ] Environment variables documented in `.env.example`
- [ ] Production vs development config properly separated
- [ ] Database migration strategy defined (if applicable)
- [ ] Error reporting/logging configured for production
- [ ] Health check endpoint available (if API/web app)

### Infrastructure
- [ ] CI/CD pipeline configured
- [ ] Deployment config present
- [ ] Docker config present (if containerized)
- [ ] Resource limits defined (memory, CPU)
- [ ] Scaling strategy considered

### Operations
- [ ] README has deployment instructions
- [ ] Rollback procedure documented
- [ ] Monitoring/alerting plan (recommend `/monitor-plan` when available)
- [ ] Backup strategy for data (if applicable)

---

## Deployment Configuration Created

| File | Status | Notes |
|------|--------|-------|
| `.env.example` | [Created / Updated / Already existed] | [notes] |
| `.github/workflows/ci.yml` | [Created / Skipped] | [notes] |
| `Dockerfile` | [Created / Skipped / N/A] | [notes] |
| `.dockerignore` | [Created / Skipped / N/A] | [notes] |
| `docker-compose.yml` | [Created / Skipped / N/A] | [notes] |
| `[platform config]` | [Created / Skipped / N/A] | [notes] |

---

## Blockers

[List any Critical issues that MUST be resolved before deploying]

## Warnings

[List any High/Medium issues that SHOULD be resolved]

## Recommended Next Steps

1. [Most important action]
2. [Next action]
3. [Additional recommendation]
```

---

### Phase 7: Present Results

After completing the analysis and generating configuration:

> "Deployment readiness report saved to `./outputs/deploy-readiness-[date].md`.
>
> **Readiness: [X/Y] checks passed.**
>
> **Created:**
> - [list of files created]
>
> **Blockers:** [count, or "None — ready to deploy"]
>
> [If blockers exist:]
> Run `/create-plan fix deployment blockers from readiness report` to address them.
>
> [If no blockers:]
> The project is ready for deployment. Review the configuration files, set your environment variables, and deploy."

---

## Hard Rules

- Never include actual secret values in any generated file
- Never modify application code — only create deployment configuration
- Flag unresolved Critical/High harden findings as deployment blockers
- Don't generate Docker config for static sites or libraries
- Don't generate CI config that runs tests if no tests exist — flag this as a gap instead
- Always create `.env.example` even if `.env` handling seems fine — it's documentation
- Use multi-stage Docker builds to minimize image size
- Run containers as non-root users
