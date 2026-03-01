# Document

> Auto-generate and maintain project documentation — API docs, architecture decisions, deployment guides, and troubleshooting runbooks.

## Variables

focus: $ARGUMENTS (optional — "api", "architecture", "deploy", "runbook", "readme", "full", or a specific file/module. Default: "full")

## Instructions

You are generating project documentation from the codebase. Your goal is to produce accurate, maintainable documentation that stays useful — not walls of text that go stale immediately.

**Important:** This command creates documentation files. It does NOT modify application code.

---

### Phase 1: Project Analysis

1. **Read existing documentation:**
   - Read `./CLAUDE.md`, `./README.md`, and any `docs/` directory
   - Read `./context/` files for project context
   - Identify what's already documented and what's missing

2. **Analyze the codebase:**
   - Detect language, framework, and architecture
   - Identify entry points, main modules, and key abstractions
   - Map the dependency graph (what calls what)
   - Find existing inline documentation (JSDoc, docstrings, comments)

3. **Determine what to generate:**
   - If focus specified: generate that type only
   - If "full": generate all applicable types for this project
   - Skip types that don't apply (e.g., API docs for a CLI tool without an API)

---

### Phase 2: Generate Documentation

**For each documentation type, generate only if applicable to the project:**

#### API Documentation (focus: "api")

If the project has HTTP endpoints (Express, FastAPI, Django, Rails, etc.):

1. Find all route definitions
2. For each endpoint, document:
   - Method and path
   - Request parameters (query, path, body) with types
   - Response format with example
   - Authentication requirements
   - Error responses

Save to `./docs/api.md` or update existing API docs.

If the project uses OpenAPI/Swagger: validate and enhance the existing spec rather than creating competing docs.

#### Architecture Documentation (focus: "architecture")

1. Map the high-level architecture:
   - System components and their responsibilities
   - Data flow between components
   - External dependencies and integrations
   - Key design patterns used

2. Document architectural decisions:
   - Why this framework/library was chosen
   - Why this architecture pattern was used
   - Key trade-offs made

Save to `./docs/architecture.md`.

#### Deployment Guide (focus: "deploy")

Pull from existing deployment config (Dockerfile, CI/CD, platform configs) and document:

1. Prerequisites (runtime versions, environment setup)
2. Environment variables (from `.env.example` or code analysis)
3. Build steps
4. Deployment steps for each environment
5. Rollback procedure
6. Health check verification

Save to `./docs/deployment.md`.

#### Troubleshooting Runbook (focus: "runbook")

Based on error handling patterns in the code:

1. Common errors and their solutions
2. Debugging procedures
3. Log locations and what to look for
4. Emergency procedures (restart, rollback, data recovery)
5. Escalation paths

Save to `./docs/runbook.md`.

#### README Enhancement (focus: "readme")

If `README.md` exists, enhance it. If not, create it:

1. Project description (from CLAUDE.md/context)
2. Quick start (setup and run in < 5 steps)
3. Prerequisites
4. Installation
5. Usage examples
6. Configuration
7. Contributing (if relevant)
8. License

Save to `./README.md`.

---

### Phase 3: Cross-Reference

After generating documentation:

1. Ensure documents reference each other where relevant
2. Verify no conflicting information between docs
3. Check that code examples in docs match actual code
4. Add a docs index if multiple files were created

---

### Phase 4: Present

> "Documentation generated:
>
> **Created/Updated:**
> - [list of files with brief description]
>
> **Documentation covers:**
> - [list of areas documented]
>
> **Not generated (not applicable):**
> - [list of types skipped and why]
>
> Keep docs current by re-running `/document` after significant changes."

---

## Hard Rules

- Generate from actual code, not assumptions — read the source before documenting
- Don't duplicate information that's already well-documented — enhance, don't repeat
- Keep docs concise — a short accurate doc beats a long stale one
- Use the project's existing documentation conventions if any exist
- Include code examples that actually work — test them mentally against the source
- Don't document trivial things — focus on what's non-obvious or essential for onboarding
- Place docs in `./docs/` unless the project has an existing convention
