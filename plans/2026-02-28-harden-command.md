# Plan: Create /harden Command — Automated Vulnerability Discovery and Hardening Loop

**Created:** 2026-02-28
**Status:** Implemented
**Request:** Create a unified `/harden` command that systematically finds bugs, security vulnerabilities, edge cases, and performance issues in any project, documents them, feeds them into `/create-plan` for fixes, then repeats until the project is tight.

---

## Overview

### What This Plan Accomplishes

Adds a `/harden` command to the toolkit that takes any project with a working codebase, understands how it should operate, then systematically tries to break it across multiple dimensions — functional bugs, security vulnerabilities (OWASP top 10), UI/UX edge cases, error handling gaps, performance bottlenecks, and data validation holes. Findings are documented in a structured report in `./outputs/`, which feeds directly into `/create-plan` for fixes. The loop repeats (`/harden` → report → `/create-plan` → `/implement` → `/harden` again) until the project passes clean.

### Why This Matters

Building fast is only half the equation — shipping broken or insecure software destroys trust and costs more to fix later. This command embeds quality assurance directly into the workflow pipeline, making it as easy to harden a project as it is to build one. It closes the gap between "it works" and "it's production-ready" with a repeatable, systematic process that catches what manual review misses.

---

## Current State

### Relevant Existing Structure

**Existing commands that `/harden` integrates with:**
- `.claude/commands/discover.md` — audits for undocumented context (reads the codebase to understand it)
- `.claude/commands/create-plan.md` — creates implementation plans from findings
- `.claude/commands/implement.md` — executes plans
- `.claude/commands/prime.md` — loads project context

**Existing workflow pipeline:**
```
/prime → /discover → /scope → /create-plan → /implement
```

**Output location:** `./outputs/` — exists in project scaffolding, currently empty

**Toolkit infrastructure:**
- `scripts/install-toolkit.sh` — manifest needs `harden.md` added
- `reference/toolkit-architecture.md` — command reference table needs updating
- `CLAUDE.md` — command documentation needs updating

### Gaps or Problems Being Addressed

1. **No quality assurance step** — the pipeline goes from build to done, with no systematic testing phase
2. **No security audit capability** — no way to check for OWASP top 10, auth flaws, injection, etc.
3. **No edge-case discovery** — unusual inputs, boundary conditions, and error paths go untested
4. **No hardening loop** — no mechanism to iteratively find and fix issues until clean
5. **No structured vulnerability reporting** — findings have nowhere standard to go
6. **Fixes that alter core functionality can slip through** — no approval gate for breaking changes

---

## Proposed Changes

### Summary of Changes

- **Create `.claude/commands/harden.md`** — the core command with focus modes and the full hardening workflow
- **Add `harden.md` to `install-toolkit.sh` manifest** — so it deploys to `~/.claude/commands/`
- **Update `CLAUDE.md`** — add `/harden` to the commands section and workflow pipeline
- **Update `reference/toolkit-architecture.md`** — add to command reference table and pipeline diagram
- **Update `reference/command-development-guide.md`** — no changes needed (pattern is already documented)

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `.claude/commands/harden.md` | Unified hardening command — bug finding, security audit, edge-case discovery, performance analysis |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `scripts/install-toolkit.sh` | Add `"harden.md"` to the COMMANDS array |
| `CLAUDE.md` | Add `/harden` to commands section, update pipeline diagram, update session workflow |
| `reference/toolkit-architecture.md` | Add to command reference table, update pipeline diagram, update changelog |

### Files to Delete

None.

---

## Design Decisions

### Key Decisions Made

1. **One command with focus modes, not separate commands**: The find → document → plan → fix loop is identical regardless of what you're looking for. Security vulnerabilities, functional bugs, and edge cases overlap significantly (e.g., a SQL injection is both a security hole and a bug). One command with `security`, `bugs`, `edge-cases`, `performance`, `validation` focus modes avoids redundant workflows while allowing targeted sweeps. Default is `full` — run everything.

2. **Report goes to `./outputs/harden-report-YYYY-MM-DD.md`**: Using `./outputs/` follows the existing workspace convention for deliverables. Dated filenames create a history trail showing improvement over iterations. Previous reports are referenced to avoid re-finding already-known issues.

3. **Severity classification (Critical / High / Medium / Low)**: Every finding gets a severity level to enable triage. Critical and High issues that require fixes altering core functionality are explicitly flagged for user approval with a clear explanation of what changes and why. The user decides before any code is touched.

4. **The command audits but does NOT auto-fix**: `/harden` produces a report and offers to bridge to `/create-plan`. It never modifies project code directly. This ensures the user reviews everything, especially when fixes might alter fundamental behavior. The separation also means the report is useful standalone — even without fixing, you know where your vulnerabilities are.

5. **"Intended behavior" understanding comes first**: Before trying to break anything, the command must understand how the project is supposed to work — by reading `./CLAUDE.md`, `./context/`, tests, documentation, and the codebase itself. You can't find bugs without knowing what correct behavior looks like.

6. **Iterative loop is manual, not automatic**: The command runs one pass, produces a report, and suggests next steps. The user decides whether to fix and re-run. Automatic fix-and-rerun loops are dangerous — a bad fix could introduce more issues. The human stays in the loop.

7. **Stack-adaptive analysis**: The command detects the project's tech stack (from package files, file extensions, frameworks) and adapts its security/bug checklist accordingly. A React app gets XSS checks; a Python API gets injection checks; a CLI tool gets input validation checks. Generic checklists waste time on irrelevant items.

### Alternatives Considered

1. **Separate commands (`/audit-security`, `/find-bugs`, `/test-edges`)**: Rejected — same loop logic duplicated three times, and the categories overlap too much. A single SQL injection finding would appear in both security and bugs, causing confusion.

2. **Auto-fix mode**: Rejected — too dangerous. Fixes that alter behavior need human review. The report → plan → implement pipeline already exists and provides the review gate.

3. **Running existing test suites only**: Rejected — this command's value is finding what tests DON'T cover. It complements test suites, not replaces them. It will note test coverage gaps as findings.

4. **Report in `./plans/` instead of `./outputs/`**: Rejected — the report is a deliverable/analysis, not an implementation plan. It feeds INTO `/create-plan`, which then creates the plan. Following workspace conventions.

### Open Questions

None — the design is self-contained and follows established patterns.

---

## Step-by-Step Tasks

### Step 1: Create the `/harden` Command

Create `.claude/commands/harden.md` with the full hardening workflow.

**Actions:**

- Create the command file with the following structure and content:

```markdown
# Harden

> Systematically find bugs, security vulnerabilities, edge cases, and performance issues — then guide fixes.

## Variables

focus: $ARGUMENTS (optional — "full", "security", "bugs", "edge-cases", "performance", "validation", or a specific file/path. Default: "full")

## Instructions

You are performing a hardening audit on this project. Your goal is to understand how the project should work, then systematically try to break it. Document every vulnerability, bug, and edge case found.

**Important:** This command analyzes and reports. It does NOT modify project code. Fixes go through `/create-plan` → `/implement` with user approval.

---

### Phase 1: Understand Intended Behavior

Before you can find bugs, you must understand what "correct" looks like.

1. Read `./CLAUDE.md` and `./context/` for project context
2. Read README.md and any docs/ directory
3. Identify the tech stack:
   - Check package files (package.json, requirements.txt, Cargo.toml, go.mod, Gemfile, etc.)
   - Note frameworks, languages, and key dependencies
   - Identify the project type (web app, API, CLI, library, mobile, etc.)
4. Read test files to understand expected behavior and current coverage
5. Map the application flow:
   - Entry points (main files, route handlers, API endpoints)
   - Data flow (user input → processing → storage → output)
   - Authentication/authorization flows (if any)
   - External integrations (APIs, databases, file systems)
6. Check for previous harden reports in `./outputs/harden-report-*.md` — don't re-report known issues unless they're still unfixed

Produce a brief summary: "This is a [type] built with [stack]. It does [purpose]. Key flows are [flows]."

---

### Phase 2: Security Audit

**Skip if focus is `bugs`, `edge-cases`, `performance`, or `validation` only.**

Systematically check for security vulnerabilities, adapted to the detected stack:

**Injection (OWASP A03):**
- SQL injection: raw queries with string concatenation, unsanitized parameters
- NoSQL injection: unvalidated query objects
- Command injection: shell exec with user input, unsanitized system calls
- XSS (stored, reflected, DOM): unescaped user content in HTML/templates, innerHTML, dangerouslySetInnerHTML
- Template injection: user input in server-side templates
- Path traversal: user-controlled file paths without sanitization

**Broken Authentication (OWASP A07):**
- Hardcoded credentials, API keys, or secrets in source code
- Weak password policies or missing rate limiting on auth endpoints
- Session management flaws (predictable tokens, no expiration, no invalidation)
- Missing or weak CSRF protection
- JWT issues (no signature verification, algorithm confusion, no expiration)

**Broken Access Control (OWASP A01):**
- Missing authorization checks on endpoints/functions
- IDOR (Insecure Direct Object References) — can user A access user B's data?
- Privilege escalation paths — can a regular user perform admin actions?
- Missing function-level access control

**Data Exposure (OWASP A02):**
- Sensitive data in logs (passwords, tokens, PII)
- Secrets in version control (.env files, API keys committed)
- Excessive data in API responses (returning full objects when subset needed)
- Missing encryption for sensitive data at rest or in transit
- Error messages leaking internal details (stack traces, DB schemas)

**Security Misconfiguration (OWASP A05):**
- CORS misconfiguration (wildcard origins, credentials with wildcard)
- Missing security headers (CSP, X-Frame-Options, HSTS, etc.)
- Debug mode enabled in production config
- Default credentials or configurations
- Unnecessary features/endpoints enabled

**Dependency Vulnerabilities:**
- Check for known vulnerable dependency versions
- Identify outdated packages with security patches available
- Look for dependencies with known CVEs

---

### Phase 3: Bug Hunting

**Skip if focus is `security`, `performance`, or `validation` only.**

Look for functional bugs and logic errors:

**Logic Errors:**
- Off-by-one errors in loops, pagination, array indexing
- Race conditions in async code (promises, callbacks, goroutines, threads)
- Incorrect boolean logic (inverted conditions, missing negation)
- State management bugs (stale state, inconsistent state, missing cleanup)
- Error swallowing (empty catch blocks, ignored error returns)

**Null/Undefined Handling:**
- Unguarded property access on potentially null/undefined values
- Missing null checks before method calls
- Optional chaining needed but absent
- Uninitialized variables used in critical paths

**Type Issues:**
- Implicit type coercion bugs (especially in JavaScript)
- Incorrect type assertions or casts
- Generic type misuse
- Enum/constant value mismatches

**Resource Management:**
- Unclosed file handles, database connections, streams
- Memory leaks (event listener accumulation, unbounded caches)
- Missing cleanup in error paths (finally blocks, defer statements)
- Timeout handling — operations that can hang forever

**Concurrency:**
- Shared mutable state without synchronization
- Deadlock potential
- Race conditions in read-modify-write patterns
- Missing atomic operations

---

### Phase 4: Edge Case Discovery

**Skip if focus is `security`, `performance`, or `bugs` only.**

Test boundary conditions and unusual inputs:

**Input Edge Cases:**
- Empty strings, null, undefined, NaN, Infinity
- Extremely long strings (10K+ characters)
- Unicode edge cases (emoji, RTL text, zero-width characters, homoglyphs)
- Special characters in user input (quotes, backslashes, angle brackets, null bytes)
- Boundary values (0, -1, MAX_INT, MIN_INT, 0.1 + 0.2)
- Array edge cases (empty arrays, single element, very large arrays)
- Date edge cases (leap years, timezone boundaries, epoch, far future dates)

**UI/UX Edge Cases (if applicable):**
- Responsive layout breakpoints — what breaks on narrow/wide screens?
- Long content overflow — what happens with a 500-character username?
- Rapid repeated actions (double-click submit, spam button mashing)
- Network failure during operations — what's the user experience?
- Back/forward button behavior in SPAs
- Empty states — what does the UI show with zero data?
- Loading states — what shows during slow operations?

**Error Path Edge Cases:**
- What happens when external APIs are down?
- What happens when the database is unreachable?
- What happens when disk is full?
- What happens when rate limits are hit?
- Partial failure scenarios (3 of 5 operations succeed)

**Data Edge Cases:**
- Concurrent modifications to the same resource
- Orphaned references (foreign keys to deleted records)
- Data migration edge cases
- Character encoding mismatches

---

### Phase 5: Performance Analysis

**Skip if focus is `security`, `bugs`, `edge-cases`, or `validation` only.**

Identify performance bottlenecks and scalability issues:

**Query Performance:**
- N+1 query patterns (loading related records in loops)
- Missing database indexes on frequently queried columns
- Unbounded queries (SELECT * without LIMIT)
- Expensive operations inside loops

**Resource Efficiency:**
- Unnecessary re-renders in frontend frameworks
- Missing memoization/caching for expensive computations
- Redundant API calls (fetching same data multiple times)
- Large bundle sizes (if web frontend)
- Missing pagination on list endpoints

**Scalability Concerns:**
- In-memory data structures that grow without bounds
- Synchronous blocking operations that should be async
- Missing connection pooling
- Single points of failure

---

### Phase 6: Data Validation Audit

**Skip if focus is `security`, `bugs`, `edge-cases`, or `performance` only.**

Check input validation at system boundaries:

**API Endpoints:**
- Missing request body validation
- Missing query parameter validation
- Missing path parameter validation
- Inconsistent validation between client and server
- Missing content-type checking

**Form Inputs (if applicable):**
- Client-side validation without server-side mirror
- Missing length limits
- Missing format validation (email, phone, URL)
- File upload validation (type, size, content)

**Database Operations:**
- Missing schema constraints (NOT NULL, UNIQUE, CHECK)
- Inconsistent data types between application and database
- Missing foreign key constraints
- Truncation risk (string data longer than column allows)

**External Data:**
- Missing validation on API responses from third parties
- Missing validation on webhook/callback payloads
- Environment variable validation at startup

---

### Phase 7: Compile Report

Compile all findings into a structured report. Save to `./outputs/harden-report-[YYYY-MM-DD].md`.

If a previous report exists, note which issues are new, which are recurring (still unfixed), and which have been resolved.

```
# Harden Report: [Project Name]

**Date:** [YYYY-MM-DD]
**Focus:** [full / security / bugs / edge-cases / performance / validation]
**Previous reports:** [list any prior reports, or "None — first audit"]

---

## Executive Summary

[2-3 sentences: overall health assessment, most critical findings, recommendation]

## Project Profile

- **Type:** [web app / API / CLI / library / etc.]
- **Stack:** [languages, frameworks, key deps]
- **Key flows audited:** [list the main flows examined]

---

## Findings

### Critical (must fix before production)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| C1 | Security | [description] | [file:line] | [what could go wrong] | [how to fix] |

### High (should fix soon)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| H1 | Bug | [description] | [file:line] | [what could go wrong] | [how to fix] |

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Edge Case | [description] | [file:line] | [what could go wrong] | [how to fix] |

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Performance | [description] | [file:line] | [what could go wrong] | [how to fix] |

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| [ref] | [what happens now] | [what would change] | [why the change is needed] |

**These require explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** [count]
- **Critical:** [count] | **High:** [count] | **Medium:** [count] | **Low:** [count]
- **By category:** Security: [n] | Bugs: [n] | Edge Cases: [n] | Performance: [n] | Validation: [n]
- **Recurring from previous report:** [count, if applicable]
- **Resolved since previous report:** [count, if applicable]

---

## Recommended Next Steps

1. Review Critical and High findings
2. Approve or reject any behavior-altering fixes in the Functionality Impact Assessment
3. Run: `/create-plan fix [critical/high] findings from harden report [date]`
4. Run: `/implement plans/[resulting-plan].md`
5. Re-run: `/harden` to verify fixes and find remaining issues
```

---

### Phase 8: Bridge to Fixes

After presenting the report, ask the user:

> "Harden report saved to `./outputs/harden-report-[date].md`.
>
> **[X] Critical and [Y] High findings** require attention.
>
> [If behavior-altering fixes exist:]
> **[N] fixes would alter existing functionality** — these are flagged in the Functionality Impact Assessment and need your approval.
>
> Next steps:
> 1. Review the report, especially the Functionality Impact Assessment
> 2. Run `/create-plan fix critical and high findings from harden report` to plan fixes
> 3. After fixes are implemented, run `/harden` again to verify
>
> Would you like to proceed with creating a fix plan now?"

If the user approves, help construct the `/create-plan` invocation with the right context from the report.
```

**Files affected:**

- `.claude/commands/harden.md` (create)

---

### Step 2: Add `/harden` to `install-toolkit.sh` Manifest

Add `harden.md` to the COMMANDS array in the install script so it deploys with the rest of the toolkit.

**Actions:**

- In `scripts/install-toolkit.sh`, find the COMMANDS array (around line 98) and add `"harden.md"` to the list
- The array should become:

```bash
COMMANDS=(
    "prime.md"
    "create-plan.md"
    "implement.md"
    "discover.md"
    "scope.md"
    "sync-toolkit.md"
    "harden.md"
)
```

- Update the `usage()` help text to include harden.md in the commands list:
  ```
  Commands installed:
    ...
    harden.md         Find bugs, security issues, and edge cases
  ```

**Files affected:**

- `scripts/install-toolkit.sh` (modify)

---

### Step 3: Update CLAUDE.md

Add `/harden` to the command documentation and update the workflow pipeline.

**Actions:**

- Update the **Workspace Structure** tree to include `harden.md` in the commands list:
  ```
  │   │   ├── harden.md              # /harden — find bugs, security issues, edge cases
  ```

- Update the **Workflow Pipeline** section. The pipeline becomes:
  ```
  /prime → /discover → /scope → /create-plan → /implement → /harden
  ```
  With a loop arrow from `/harden` back to `/create-plan`.

- Add a new command entry after `/sync-toolkit`:

  ```markdown
  ### /harden [focus]

  **Purpose:** Systematically find bugs, security vulnerabilities, edge cases, and performance issues — then guide fixes.

  Understands how the project should work, then tries to break it. Produces a severity-classified report in `./outputs/` that feeds into `/create-plan` for fixes. Re-run after fixes to verify and find remaining issues.

  **Focus options:** `full` (default), `security`, `bugs`, `edge-cases`, `performance`, `validation`, or a specific path

  Example: `/harden security`
  ```

- Update the **Session Workflow** section to include the hardening step:
  ```
  6. **Harden**: Run `/harden` to find vulnerabilities and edge cases
  7. **Fix loop**: `/create-plan` fixes → `/implement` → `/harden` again until clean
  ```

**Files affected:**

- `CLAUDE.md` (modify)

---

### Step 4: Update `reference/toolkit-architecture.md`

Add `/harden` to the architecture documentation.

**Actions:**

- Add to the **Command Reference** table:

  ```
  | `/harden [focus]` | Find bugs, security issues, edge cases | `full`, `security`, `bugs`, `edge-cases`, `performance`, `validation` | Harden report in `./outputs/` |
  ```

- Update the **Full Command Pipeline** diagram to include the hardening loop:

  ```
  /prime → /discover → /scope → /create-plan → /implement → /harden
    ↓          ↓          ↓           ↓             ↓           ↓
  Orient    Audit      Define      Plan          Build      Break it
            context    scope       steps         it         ──→ fix loop
  ```

- Add to the **Layer 1** commands table:
  ```
  | `~/.claude/commands/harden.md` | Find bugs, security issues, and edge cases |
  ```

- Add to the **Changelog**:
  ```
  | 2026-02-28 | Added /harden command for automated vulnerability discovery and hardening loop. |
  ```

**Files affected:**

- `reference/toolkit-architecture.md` (modify)

---

### Step 5: Deploy and Verify

Test the new command and verify integration.

**Actions:**

1. Run `bash scripts/install-toolkit.sh --force --no-alias` and verify:
   - `harden.md` appears as NEW and is installed
   - Total installed commands is now 7
   - Help text lists harden.md

2. Verify the command file exists at `~/.claude/commands/harden.md`

3. Verify `install-toolkit.sh --help` lists harden.md

4. Verify all cross-references:
   - `CLAUDE.md` mentions `/harden` in commands section
   - `CLAUDE.md` pipeline diagram includes `/harden`
   - `reference/toolkit-architecture.md` command table includes `/harden`
   - `reference/toolkit-architecture.md` pipeline diagram includes `/harden`

**Files affected:**

- No files modified — testing only

---

## Connections & Dependencies

### Files That Reference This Area

- `CLAUDE.md` — documents all commands (must be updated)
- `reference/toolkit-architecture.md` — command reference table and pipeline (must be updated)
- `scripts/install-toolkit.sh` — command manifest (must be updated)

### Updates Needed for Consistency

- Pipeline diagram in `CLAUDE.md` must show `/harden` as the post-build quality step
- Pipeline diagram in `reference/toolkit-architecture.md` must match
- Session workflow in `CLAUDE.md` must include the hardening step
- `install-toolkit.sh` help text must list `harden.md`

### Impact on Existing Workflows

- **Extends the pipeline** — adds a quality assurance step after `/implement`
- **Creates a new loop** — `/harden` → `/create-plan` → `/implement` → `/harden` for iterative hardening
- **Uses existing report location** — `./outputs/` already exists in project scaffolding
- **No changes to existing commands** — purely additive
- **Bridges to existing commands** — report feeds into `/create-plan`, which is already established

---

## Validation Checklist

How to verify the implementation is complete and correct:

- [ ] `.claude/commands/harden.md` exists with complete command content
- [ ] `harden.md` is in the `install-toolkit.sh` COMMANDS array
- [ ] `install-toolkit.sh --help` lists `harden.md` in the commands section
- [ ] `install-toolkit.sh --force` installs 7 commands (including harden.md)
- [ ] `~/.claude/commands/harden.md` exists after toolkit install
- [ ] `CLAUDE.md` documents `/harden` in the commands section
- [ ] `CLAUDE.md` pipeline diagram includes `/harden`
- [ ] `CLAUDE.md` session workflow includes hardening step
- [ ] `CLAUDE.md` workspace structure tree includes `harden.md`
- [ ] `reference/toolkit-architecture.md` command table includes `/harden`
- [ ] `reference/toolkit-architecture.md` pipeline diagram includes `/harden`
- [ ] All relative paths in `harden.md` use `./` notation
- [ ] No hardcoded project paths in the command

---

## Success Criteria

The implementation is complete when:

1. Running `/harden` in any project with code produces a structured vulnerability report in `./outputs/`
2. The report classifies findings by severity (Critical/High/Medium/Low) and category (Security/Bugs/Edge Cases/Performance/Validation)
3. Behavior-altering fixes are explicitly flagged in a Functionality Impact Assessment section requiring user approval
4. Focus modes (`/harden security`, `/harden bugs`, etc.) correctly scope the analysis to the requested area
5. The command bridges cleanly to `/create-plan` for fix implementation
6. All toolkit documentation accurately reflects the new command and updated pipeline
7. `install-toolkit.sh` installs `harden.md` alongside all other toolkit commands

---

## Notes

### The Hardening Loop

The intended user workflow is:

```
/harden                          → produces report
/create-plan fix critical issues → plans fixes from report
/implement plans/...             → applies fixes
/harden                          → re-audits, finds remaining issues
  ↓
(repeat until clean)
```

Each iteration should be faster as issues are resolved. The report tracks recurring vs new vs resolved findings across iterations.

### Stack-Specific Behavior

The command adapts its checks to the detected tech stack. Not every check applies to every project:

| Stack | Key Checks |
|-------|-----------|
| React/Next.js | XSS, state management, rendering bugs, bundle size |
| Express/Fastify | Injection, auth, middleware ordering, error handling |
| Python/Django | CSRF, ORM injection, template injection, settings exposure |
| Python/FastAPI | Pydantic validation, async bugs, dependency injection |
| Go | Goroutine leaks, nil pointer deref, error handling, race conditions |
| Rust | Unsafe blocks, error handling, lifetime issues |
| CLI tools | Input validation, path traversal, command injection |
| Libraries | API surface validation, type safety, backwards compatibility |

### Future Enhancements

- **Integration with existing test suites**: Run `npm test`, `pytest`, etc. as part of the audit and report failures alongside code review findings
- **CI integration**: Generate machine-readable output (JSON) for CI pipeline integration
- **Severity thresholds**: `--fail-on critical` flag for CI gates
- **Historical tracking**: Trend analysis across multiple harden reports

---

## Implementation Notes

**Implemented:** 2026-02-28

### Summary

All 5 steps completed successfully. The `/harden` command is installed and all documentation updated.

### Deviations from Plan

1. **Added Phase 8: Update Knowledge Base** — Per user request, added a self-improving knowledge base phase that creates/updates `./outputs/harden-knowledge.md`. This cumulative file is read by Phase 1 on subsequent runs, making every audit faster and more thorough. Contains: project-specific patterns, audit history table, lessons learned, common false positives, custom checklist additions, and a fix effectiveness tracker.

2. **Added Phase 9: Bridge to Fixes** — The original plan's Phase 8 (Bridge to Fixes) became Phase 9. The bridge message now also references the knowledge base update.

3. **Added Iteration tracking** — The report template includes an "Iteration" field and "Previous reports" reference for tracking audit progression over time.

### Issues Encountered

None — all steps completed without errors. All 7 commands installed successfully via `install-toolkit.sh`.
