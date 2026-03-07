# Harden Report: install.sh (Pass 2)

**Date:** 2026-03-06
**Focus:** scripts/install.sh (verification pass after fixes)
**Iteration:** 2nd pass
**Previous reports:** `outputs/harden-report-2026-03-06.md` (3 findings: H1, M1, M2 — all fixed)

---

## Executive Summary

All three findings from the first pass (H1, M1, M2) are confirmed fixed with no regressions. The `copy_template` helper handles missing files, existing files, and the script survives even when the entire `milestone-templates/` directory is missing. One new Low-severity cosmetic issue found: the "Phase 2 complete" message is misleading when zero templates are copied on re-run.

## Project Profile

- **Type:** Bash install script (no runtime, no server)
- **Stack:** Pure bash, `set -euo pipefail`, no external dependencies
- **Key flows audited:** All Phase 2 paths, fix verification, edge cases (special chars, spaces in paths, missing directories)

---

## Findings

### Critical (must fix before production)

*None*

### High (should fix soon)

*None*

### Medium (fix when able)

*None*

### Low (nice to have)

| # | Category | Finding | Location | Impact | Suggested Fix |
|---|----------|---------|----------|--------|---------------|
| L1 | Edge Case | When re-running on a scaffolded project where all templates already exist, the output shows "Phase 2 complete — 0 milestone templates copied." followed by "Review and customise them..." and "The Project Hub will import them automatically on next scan." This is misleading — nothing was copied, so there's nothing new to review or import. Same issue when the entire `milestone-templates/` directory is missing. | `scripts/install.sh:352-356` | Cosmetic confusion only — no data loss or functional impact. User sees "review your templates" when no templates were actually added. | Wrap the success message in a conditional: only show "Review and customise" and "Hub will import" when `TEMPLATES_COPIED > 0`. When 0, show something like "No new templates copied (all already exist)." |

---

## Resolved from Previous Report

| # | Finding | Status |
|---|---------|--------|
| H1 | Hardcoded `cp` crash on missing template | **Fixed** — `copy_template` warns and continues |
| M1 | Invalid input silent fallthrough | **Fixed** — warns user, copies universal only |
| M2 | Silent overwrite on re-run | **Fixed** — skips existing with warning |

All three verified by re-running the original test scenarios:
- Missing file: warns, continues, exits 0
- Invalid input ("'"): warns with the literal character, no crash
- Re-run: all 9 templates skipped with warnings
- Partial re-run (some deleted): copies only missing ones

## Additional Tests Run (no issues found)

- **Spaces in target path**: Works correctly (`"/tmp/test space dir"`)
- **Special characters in input**: Single quote handled safely
- **Entire milestone-templates/ directory missing**: Universal glob finds nothing (no crash), web-project templates warn individually, script completes with 0 templates
- **`--force` mode**: Phase 2 skipped entirely (unchanged, correct)
- **Skip (choice 4)**: Clean exit, no templates (unchanged, correct)

---

## Functionality Impact Assessment

*No behavior-altering fixes proposed.*

---

## Statistics

- **Total findings:** 1
- **Critical:** 0 | **High:** 0 | **Medium:** 0 | **Low:** 1
- **By category:** Security: 0 | Bugs: 0 | Edge Cases: 1 | Performance: 0 | Validation: 0
- **Resolved since previous report:** 3 (H1, M1, M2)

---

## Audit Process Notes

### What Was Checked
- All previous findings re-tested with original reproduction steps
- Custom checklist items from knowledge base verified
- New edge cases: special characters in input, spaces in paths, missing milestone-templates directory entirely
- Phase 2 messaging across all scenarios

### Areas Not Fully Covered
- `install-toolkit.sh` sync with actual commands (separate scope)
- Phase 1 `copy_file` overwrite behavior on re-run (pre-existing, not introduced by this session's changes)

---

## Recommended Next Steps

L1 is cosmetic and optional. The script is solid for production use. If you want to fix it, it's a 3-line conditional change — no plan needed.
