# Harden Report: install.sh

**Date:** 2026-03-06
**Focus:** scripts/install.sh (full audit of Phase 1 + Phase 2)
**Iteration:** 1st audit
**Previous reports:** None — first audit

---

## Executive Summary

The script is well-structured and handles the happy path cleanly. The main issue is that Phase 2's web-project template copying uses hardcoded `cp` commands without existence checks — if any template file is missing, `set -e` kills the script mid-run, leaving the project in a partial state. There are also minor robustness issues around input validation and re-run behavior. 3 findings total, all fixable in a few lines each.

## Project Profile

- **Type:** Bash install script (no runtime, no server)
- **Stack:** Pure bash, `set -euo pipefail`, no external dependencies
- **Key flows audited:** Argument parsing, path resolution, self-install guard, file copying, Phase 2 interactive flow, template copying, alias setup

---

## Findings

### Critical (must fix before production)

*None*

### High (should fix soon)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| H1 | Bug | Hardcoded `cp` commands for web-project templates crash the script if any template file is missing. The universal and software sections use glob + `if [ -f ]` checks, but the web-project section (lines 310, 315, 321, 327) does raw `cp` with no existence guard. With `set -e`, a missing file kills the script mid-run, leaving the project partially scaffolded. | `scripts/install.sh:310,315,321,327` | Script crashes mid-Phase 2, user gets partial scaffold with no clear error message. Confirmed by removing `08-frontend-polish.md` and running — script dies with `cp: cannot stat` error. | Wrap each hardcoded `cp` in an existence check: `if [ -f "$SOURCE_DIR/milestone-templates/web-project/08-frontend-polish.md" ]; then cp ...; else warn "Template missing: 08-frontend-polish.md"; fi` |

### Medium (fix when able)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| M1 | Edge Case | Invalid project type input (anything other than 1-4, e.g. "5", "abc", or "hello") silently falls through all conditionals and behaves like type 3 (experiment — universal templates only). The user gets no feedback that their input wasn't recognized. | `scripts/install.sh:282-340` | User confusion — they typed something unexpected, got templates they didn't ask for, and weren't told anything was wrong. | Add an `else` clause after the type 2 check: `else warn "Unrecognised choice '$PROJECT_TYPE' — applying universal templates only."` |
| M2 | Edge Case | Re-running `claude-init` on an already-scaffolded project silently overwrites milestone templates in `plans/` without warning. Phase 1 has conflict detection for CLAUDE.md and .claude/ (lines 140-161), but Phase 2 doesn't check if templates already exist in `plans/`. If the user has customized their milestone files, they're silently lost. | `scripts/install.sh:298-339` | User loses customized milestone templates on re-scaffold. Existing plans (dated `YYYY-MM-DD-*.md` files) are unaffected since template filenames are different, but the milestone files themselves get overwritten. | Before copying each template, check if it exists in target and skip with a message: `if [ -f "$TARGET_DIR/plans/$(basename "$f")" ]; then warn "Skipping existing: plans/$(basename "$f")"; else cp ...; fi` Or add a blanket check at the start of Phase 2: detect if any milestone templates exist in plans/ and ask before overwriting. |

### Low (nice to have)

*None*

---

## Functionality Impact Assessment

**The following fixes would alter existing behavior:**

| Finding | Current Behavior | Proposed Change | Why It's Necessary |
|---------|-----------------|-----------------|-------------------|
| M2 | Re-running Phase 2 silently overwrites milestone templates | Skip existing templates (or ask before overwriting) | Prevents data loss of user-customized milestones |

**These require explicit user approval before proceeding.**

---

## Statistics

- **Total findings:** 3
- **Critical:** 0 | **High:** 1 | **Medium:** 2 | **Low:** 0
- **By category:** Security: 0 | Bugs: 1 | Edge Cases: 2 | Performance: 0 | Validation: 0

---

## Audit Process Notes

### What Was Checked
- Full read of install.sh (398 lines) and install-toolkit.sh (286 lines) for comparison
- Argument parsing and path resolution logic
- Self-install guard bypass attempts
- File copying error handling
- Phase 2 interactive flow with all input combinations
- Missing file scenarios (confirmed by temporarily removing a template file)
- Invalid input scenarios (confirmed by piping "5" as project type)
- Re-run scenarios (confirmed by running install.sh twice on same target)
- Glob behavior with `set -euo pipefail` (nullglob not set — verified `if [ -f ]` catches literal patterns)

### Stack-Specific Checks Applied
- Bash `set -e` interaction with `cp`, `read`, and glob failures
- `set -u` interaction with unset variables in conditionals
- Portable bash (no bashisms beyond arrays, which are used in install-toolkit.sh but not install.sh)

### Areas Not Fully Covered
- Symlink edge cases (e.g., target is a symlink to source) — low risk given the self-install guard
- Windows-specific path edge cases (spaces in paths, drive letters) — the script uses quoting consistently so this should be fine

---

## Recommended Next Steps

1. Review the 3 findings above
2. Run `/create-plan fix high and medium findings from harden report` to plan fixes
3. After fixes are implemented, run `/harden` again to verify
