# Hardening Knowledge Base

> Cumulative learnings from all hardening audits of this project. Read by `/harden` at the start of every run to improve efficiency and coverage.

---

## Project-Specific Patterns

### Known Vulnerability Patterns
- ~~Phase 2 web-project template copying uses hardcoded `cp` without existence checks~~ — FIXED: all copying now uses `copy_template` helper.

### Architecture Weak Points
- Phase 1 has conflict detection (CLAUDE.md, .claude/); Phase 2 does not. Any new phase or file copying section should include existence checks for overwrite safety.
- `set -euo pipefail` means any unchecked `cp` failure kills the script. All `cp` calls in interactive/conditional sections must be guarded.

### Stack-Specific Gotchas
- Bash glob with `set -e`: when no files match a glob pattern and `nullglob` is not set, the literal pattern string is iterated. The `if [ -f "$f" ]` guard catches this correctly in the universal/software sections.
- `read -p` returns non-zero on EOF, which with `set -e` exits the script. This is acceptable for interactive scripts but means piped input must provide all expected lines.

---

## Audit History

| Date | Focus | Findings | Critical | High | Medium | Low | Key Insight |
|------|-------|----------|----------|------|--------|-----|-------------|
| 2026-03-06 | install.sh | 3 | 0 | 1 | 2 | 0 | Inconsistent error handling between Phase 2 sections — hardcoded cp vs guarded glob |
| 2026-03-06 | install.sh (pass 2) | 1 | 0 | 0 | 0 | 1 | All 3 previous findings fixed. Only cosmetic messaging issue remains. |

---

## Lessons Learned

### What Worked Well
- Testing with missing files (renaming a template temporarily) immediately confirmed H1
- Piping different input combinations caught the invalid input edge case

### Common False Positives
- The COPIED counter appearing inaccurate (increments regardless of copy_file success) — while technically imprecise, it's cosmetic and the actual files are what matter. Not worth reporting.

### Missed on First Pass
- L1 (cosmetic): "Phase 2 complete — 0 templates copied" message is misleading on re-run. Not a bug, but confusing UX.

---

## Custom Checklist Additions

Items to check on future audits:

- [ ] Any new `cp` commands in Phase 2 have existence checks
- [ ] Re-run behavior doesn't silently overwrite user-customized files
- [ ] New interactive prompts handle invalid input gracefully
- [ ] install-toolkit.sh command manifest stays in sync with actual .claude/commands/ contents

---

## Fix Effectiveness Tracker

| Finding | Fix Applied | Date Fixed | Verified Fixed? | Regression? | Notes |
|---------|------------ |------------|-----------------|-------------|-------|
| H1 | `copy_template` helper with source existence check | 2026-03-06 | Yes | No | Missing file now warns and continues |
| M1 | `else` clause with warning for unrecognised input | 2026-03-06 | Yes | No | Type 3 does not trigger false warning |
| M2 | `copy_template` helper with target existence check | 2026-03-06 | Yes | No | Re-run skips existing, copies only missing |
