# Audit Deps

> Scan project dependencies for security vulnerabilities, outdated packages, and upgrade opportunities.

## Variables

focus: $ARGUMENTS (optional — "security", "outdated", "upgrade", "full", or a specific package name. Default: "full")

## Instructions

You are auditing this project's dependencies for security risks, staleness, and upgrade opportunities. This extends `/harden` by focusing specifically on the supply chain.

**Important:** This command analyzes and reports. It does NOT modify dependency files. Changes go through `/create-plan` → `/implement` with user approval.

---

### Phase 1: Detect Package Ecosystem

1. **Identify package managers and lock files:**

   | Ecosystem | Package File | Lock File |
   |-----------|-------------|-----------|
   | Node.js | `package.json` | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb` |
   | Python | `requirements.txt`, `pyproject.toml`, `Pipfile` | `requirements.txt` (pinned), `Pipfile.lock`, `poetry.lock` |
   | Go | `go.mod` | `go.sum` |
   | Rust | `Cargo.toml` | `Cargo.lock` |
   | Ruby | `Gemfile` | `Gemfile.lock` |
   | PHP | `composer.json` | `composer.lock` |
   | .NET | `*.csproj`, `packages.config` | `packages.lock.json` |

2. **Read the dependency files** — build a complete picture of direct and dev dependencies

3. **Read `./CLAUDE.md` and `./context/`** for project context — understand what the project does and what dependencies are critical vs. peripheral

Summarize: "This project uses [ecosystem] with [N] direct dependencies and [N] dev dependencies."

---

### Phase 2: Security Vulnerability Scan

**Skip if focus is `outdated` or `upgrade` only.**

1. **Run the ecosystem's native audit tool:**

   | Ecosystem | Command |
   |-----------|---------|
   | Node.js (npm) | `npm audit --json` |
   | Node.js (yarn) | `yarn audit --json` |
   | Node.js (pnpm) | `pnpm audit --json` |
   | Python (pip) | `pip audit --format json` (if pip-audit installed) |
   | Python (pipenv) | `pipenv check` |
   | Go | `govulncheck ./...` (if installed) |
   | Rust | `cargo audit` (if installed) |
   | Ruby | `bundle audit check` (if installed) |

   If the audit tool isn't installed, note this and proceed with manual analysis.

2. **If no native tool is available or for deeper analysis:**
   - Check dependency versions against known CVE databases
   - Look for packages with known security advisories
   - Check for packages that have been deprecated or abandoned
   - Identify dependencies that pull in large transitive dependency trees (increased attack surface)

3. **Classify each vulnerability:**

   | Severity | Criteria |
   |----------|----------|
   | Critical | Remote code execution, authentication bypass, data exfiltration |
   | High | XSS, SQL injection, privilege escalation, SSRF |
   | Medium | DoS potential, information disclosure, insecure defaults |
   | Low | Minor issues, theoretical attack vectors, best practice violations |

---

### Phase 3: Outdated Package Analysis

**Skip if focus is `security` only.**

1. **Check for outdated packages:**

   | Ecosystem | Command |
   |-----------|---------|
   | Node.js (npm) | `npm outdated --json` |
   | Node.js (yarn) | `yarn outdated --json` |
   | Node.js (pnpm) | `pnpm outdated --json` |
   | Python | `pip list --outdated --format json` |
   | Go | `go list -m -u all` |
   | Rust | `cargo outdated` (if installed) |
   | Ruby | `bundle outdated` |

2. **Categorize updates:**
   - **Patch updates** (x.x.PATCH): Usually safe, bug fixes and security patches
   - **Minor updates** (x.MINOR.x): New features, should be backward compatible
   - **Major updates** (MAJOR.x.x): Breaking changes, require migration effort

3. **Identify abandoned or risky packages:**
   - Last published > 2 years ago
   - No longer maintained (check for archived repos, deprecation notices)
   - Very low download counts (potential typosquat risk)
   - Single maintainer with no recent activity

---

### Phase 4: Upgrade Impact Analysis

**Skip if focus is `security` or `outdated` only.**

For packages that need upgrading (especially major versions):

1. **Check changelogs and migration guides:**
   - Look for CHANGELOG.md, MIGRATION.md, or release notes
   - Identify breaking changes that affect this project
   - Estimate migration effort (trivial / moderate / significant)

2. **Identify upgrade dependencies:**
   - Does upgrading package A require upgrading package B?
   - Are there peer dependency conflicts?
   - Will this require Node.js/Python/etc. version changes?

3. **Prioritize upgrades:**
   - **Urgent:** Security vulnerabilities with available patches
   - **Important:** Major versions behind with breaking changes accumulating
   - **Routine:** Minor/patch updates that should be applied regularly
   - **Defer:** Stable, working versions with no security issues — upgrade optional

---

### Phase 5: Compile Report

Save to `./outputs/audit-deps-[YYYY-MM-DD].md`:

```markdown
# Dependency Audit Report

**Date:** [YYYY-MM-DD]
**Project:** [project name]
**Ecosystem:** [Node.js / Python / Go / etc.]
**Focus:** [full / security / outdated / upgrade]

---

## Executive Summary

[2-3 sentences: overall dependency health, most critical findings, recommendation]

## Dependency Profile

- **Direct dependencies:** [count]
- **Dev dependencies:** [count]
- **Total (including transitive):** [count if available]
- **Package manager:** [npm / yarn / pip / etc.]
- **Lock file:** [present / missing — if missing, flag as issue]

---

## Security Vulnerabilities

| # | Severity | Package | Installed | Patched In | CVE | Description |
|---|----------|---------|-----------|------------|-----|-------------|
| S1 | Critical | [pkg] | [ver] | [ver] | [CVE-ID] | [description] |

**Total:** [count] (Critical: [n] | High: [n] | Medium: [n] | Low: [n])

---

## Outdated Packages

### Major Updates Available (Breaking Changes)

| Package | Current | Latest | Age Behind | Migration Effort | Notes |
|---------|---------|--------|------------|-----------------|-------|

### Minor/Patch Updates Available

| Package | Current | Latest | Type |
|---------|---------|--------|------|

---

## Risk Assessment

### Abandoned/Unmaintained Packages

| Package | Last Updated | Status | Suggested Replacement |
|---------|-------------|--------|----------------------|

### High-Risk Dependencies

[Packages with large attack surface, single maintainers, or known issues]

---

## Recommended Upgrade Plan

### Phase 1: Security Patches (Do Immediately)
1. [Package] [current] → [patched version] — fixes [CVE]

### Phase 2: Major Upgrades (Plan and Execute)
1. [Package] [current] → [latest] — [migration notes]

### Phase 3: Routine Updates (Batch Monthly)
1. [Package] [current] → [latest]

---

## Statistics

- Vulnerabilities: [count by severity]
- Outdated packages: [count by update type]
- Abandoned packages: [count]
- Estimated upgrade effort: [low / moderate / significant]
```

---

### Phase 6: Bridge to Fixes

After presenting the report:

> "Dependency audit saved to `./outputs/audit-deps-[date].md`.
>
> **[N] security vulnerabilities** and **[N] outdated packages** found.
>
> Next steps:
> 1. Review the report, especially Critical/High security vulnerabilities
> 2. Run `/create-plan fix security vulnerabilities from dependency audit` for urgent patches
> 3. Schedule major upgrades for a dedicated session
>
> Would you like to create a fix plan for the security patches now?"

---

## Hard Rules

- Never modify package files directly — report and recommend
- Always run the native audit tool when available — don't rely solely on manual analysis
- Distinguish between security issues (urgent) and staleness (routine)
- Check for lock file presence — a missing lock file is itself a security finding
- Note when audit tools aren't installed rather than failing silently
