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
7. **Read the hardening knowledge base** at `./outputs/harden-knowledge.md` if it exists — this contains patterns, lessons learned, and common findings from previous audits of this project. Use it to prioritize checks and avoid blind spots.

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
**Iteration:** [1st audit / 2nd pass / etc.]
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

## Audit Process Notes

### What Was Checked
[Brief description of the phases run and areas examined]

### Stack-Specific Checks Applied
[Which checks were relevant to this project's stack and which were skipped]

### Areas Not Fully Covered
[Any areas that couldn't be fully audited and why — e.g., "no access to production config", "database schema not available locally"]

### Time and Approach
[How the audit was conducted — what was read first, what patterns were followed, what was most productive]

---

## Recommended Next Steps

1. Review Critical and High findings
2. Approve or reject any behavior-altering fixes in the Functionality Impact Assessment
3. Run: `/create-plan fix [critical/high] findings from harden report [date]`
4. Run: `/implement plans/[resulting-plan].md`
5. Re-run: `/harden` to verify fixes and find remaining issues
```

---

### Phase 8: Update Knowledge Base

**This phase runs every time, regardless of focus mode.**

After compiling the report, update (or create) `./outputs/harden-knowledge.md` — a persistent, cumulative knowledge base that makes every future audit faster and more thorough.

This file is read by Phase 1 on subsequent runs. It is the command's memory.

**If the file doesn't exist, create it with this structure:**

```
# Hardening Knowledge Base

> Cumulative learnings from all hardening audits of this project. Read by `/harden` at the start of every run to improve efficiency and coverage.

---

## Project-Specific Patterns

### Known Vulnerability Patterns
[Patterns specific to this project that tend to recur or require special attention]

### Architecture Weak Points
[Areas of the codebase that are structurally prone to issues]

### Stack-Specific Gotchas
[Framework or library-specific issues discovered in this project]

---

## Audit History

| Date | Focus | Findings | Critical | High | Medium | Low | Key Insight |
|------|-------|----------|----------|------|--------|-----|-------------|

---

## Lessons Learned

### What Worked Well
[Audit approaches that were most productive for this project]

### Common False Positives
[Things that looked like issues but weren't — avoid wasting time on these next run]

### Missed on First Pass
[Issues that were missed initially but caught later — add these to the checklist for future runs]

---

## Custom Checklist Additions

Items to check on future audits that aren't in the standard checklist but are relevant to this project:

- [ ] [Project-specific check]
- [ ] [Project-specific check]

---

## Fix Effectiveness Tracker

| Finding | Fix Applied | Date Fixed | Verified Fixed? | Regression? | Notes |
|---------|------------ |------------|-----------------|-------------|-------|
```

**If the file already exists, update it by:**

1. Adding a new row to the **Audit History** table with this run's stats and key insight
2. Adding any new **Lessons Learned** entries:
   - What approaches were most effective this run?
   - Were there any false positives to note for next time?
   - Were there issues missed on previous runs that were caught this time?
3. Adding any new **Custom Checklist** items based on project-specific patterns discovered
4. Updating the **Fix Effectiveness Tracker** — for any findings from previous reports, note whether they're now fixed or if fixes regressed
5. Updating **Project-Specific Patterns** with any new vulnerability patterns, architecture weak points, or stack-specific gotchas discovered
6. Keeping the file concise — summarize, don't duplicate the full report. The knowledge base should be a quick reference, not a copy of every report.

---

### Phase 9: Bridge to Fixes

After presenting the report and updating the knowledge base, ask the user:

> "Harden report saved to `./outputs/harden-report-[date].md`.
> Knowledge base updated at `./outputs/harden-knowledge.md`.
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
