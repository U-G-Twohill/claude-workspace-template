# Plan: Fix Harden Findings in install.sh

**Created:** 2026-03-06
**Status:** Implemented
**Request:** Fix 1 High and 2 Medium findings from harden report 2026-03-06 for scripts/install.sh

---

## Overview

### What This Plan Accomplishes

Fixes three robustness issues in the Phase 2 milestone setup added to `install.sh` this session: a crash-on-missing-file bug, silent invalid input handling, and silent overwrite of customized templates on re-run.

### Why This Matters

`install.sh` is the first thing users run on a new project. A crash mid-scaffold or silent data loss on re-run erodes trust in the toolkit. These are small fixes that make the script production-solid.

---

## Current State

### Relevant Existing Structure

- `scripts/install.sh` — the script being fixed (398 lines)
- `outputs/harden-report-2026-03-06.md` — findings H1, M1, M2
- `outputs/harden-knowledge.md` — knowledge base to update after fixes

### Gaps or Problems Being Addressed

| Finding | Problem |
|---------|---------|
| H1 | Web-project template copying (lines 310, 315, 321, 327) uses raw `cp` without existence checks. If a template file is missing, `set -e` kills the script, leaving a partial scaffold. |
| M1 | Invalid project type input (e.g. "5", "abc") silently falls through and behaves like type 3. No user feedback. |
| M2 | Re-running `claude-init` on a scaffolded project overwrites customized milestone templates in `plans/` without warning. |

---

## Proposed Changes

### Summary of Changes

- Add existence checks to all hardcoded `cp` commands in the web-project section
- Add an `else` clause for unrecognized project type input
- Add a helper function that skips copying if the target file already exists
- Update the harden knowledge base fix tracker

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `scripts/install.sh` | Fix H1, M1, M2 — see steps below |
| `outputs/harden-knowledge.md` | Update fix effectiveness tracker |

---

## Design Decisions

### Key Decisions Made

1. **Use a `copy_template` helper function for all Phase 2 copies**: Rather than adding inline `if [ -f ]` checks to each of the 4 hardcoded `cp` lines, create a small helper that handles existence check on source, skip-if-exists on target, and counter increment. This is the same pattern as the existing `copy_file` function in Phase 1 (line 185). Keeps the web-project section clean.
2. **Warn on invalid input, don't reject it**: Invalid project type input should warn and proceed with universal-only templates (type 3 behavior), not loop or abort. The script should be forgiving — a user who types "5" probably just wants to move forward.
3. **Skip-with-warning on re-run, don't ask**: For M2, if a template file already exists in the target, skip it and print a warning. Don't prompt — the user already confirmed overwrite in Phase 1's conflict detection. This avoids over-prompting while preventing silent data loss.

### Alternatives Considered

- **Reject invalid input and re-prompt**: Would be more correct but adds loop complexity and annoyance. Not worth it for a scaffolding script.
- **Blanket "milestone templates exist, skip Phase 2?" prompt**: Simpler but too coarse — user might want to add templates they missed the first time.

---

## Step-by-Step Tasks

### Step 1: Add `copy_template` helper function

Add a helper function just before the Phase 2 section (after line 263) that:
- Takes a source path and destination directory
- Checks source exists (warns and returns if not)
- Checks destination doesn't already have the file (warns and returns if it does)
- Copies and prints success
- Increments `TEMPLATES_COPIED`

**Actions:**

- Insert the `copy_template` function between the Phase 1 success summary and the Phase 2 block

**Function definition:**

```bash
copy_template() {
    local src="$1"
    local dst_dir="$2"
    local name
    name="$(basename "$src")"

    if [ ! -f "$src" ]; then
        warn "Template missing: $name (skipping)"
        return
    fi

    if [ -f "$dst_dir/$name" ]; then
        warn "Already exists: plans/$name (skipping — remove manually to replace)"
        return
    fi

    cp "$src" "$dst_dir/"
    ok "  plans/$name"
    TEMPLATES_COPIED=$((TEMPLATES_COPIED + 1))
}
```

**Files affected:**

- `scripts/install.sh`

---

### Step 2: Replace hardcoded `cp` commands in web-project section (H1 + M2)

Replace the 4 raw `cp` calls (lines 310, 315, 321, 327) with `copy_template` calls. This fixes both H1 (missing file crash) and M2 (silent overwrite) for the web-project section.

**Before (line 310):**
```bash
cp "$SOURCE_DIR/milestone-templates/web-project/08-frontend-polish.md" "$TARGET_DIR/plans/"
ok "  plans/08-frontend-polish.md"
TEMPLATES_COPIED=$((TEMPLATES_COPIED + 1))
```

**After:**
```bash
copy_template "$SOURCE_DIR/milestone-templates/web-project/08-frontend-polish.md" "$TARGET_DIR/plans"
```

Repeat for lines 315-317 (06-database.md), 321-323 (07-auth.md), and 327-329 (09-client-handoff.md).

**Files affected:**

- `scripts/install.sh`

---

### Step 3: Update universal and software loops to use `copy_template` (M2)

The universal (lines 299-305) and software (lines 333-339) sections already have `if [ -f ]` source checks, but they don't check for existing files in the target. Replace the inline copy logic with `copy_template` calls.

**Before (universal, lines 299-305):**
```bash
for f in "$SOURCE_DIR/milestone-templates/universal/"*.md; do
    if [ -f "$f" ]; then
        cp "$f" "$TARGET_DIR/plans/"
        ok "  plans/$(basename "$f")"
        TEMPLATES_COPIED=$((TEMPLATES_COPIED + 1))
    fi
done
```

**After:**
```bash
for f in "$SOURCE_DIR/milestone-templates/universal/"*.md; do
    [ -f "$f" ] && copy_template "$f" "$TARGET_DIR/plans"
done
```

Same change for the software loop (lines 333-339).

**Files affected:**

- `scripts/install.sh`

---

### Step 4: Add invalid input warning (M1)

After the `elif [ "$PROJECT_TYPE" = "2" ]` block (line 340), add an `else` clause that warns the user.

**Before (line 340-341):**
```bash
        fi
        # Type 3 (experiment/personal) — universal templates only, already copied
```

**After:**
```bash
        else
            # Unrecognised input — universal templates already copied, just inform the user
            if [ "$PROJECT_TYPE" != "3" ]; then
                warn "Unrecognised choice '$PROJECT_TYPE' — applying universal templates only."
            fi
        fi
```

**Files affected:**

- `scripts/install.sh`

---

### Step 5: Update harden knowledge base

Update `outputs/harden-knowledge.md` fix effectiveness tracker with all three fixes.

**Files affected:**

- `outputs/harden-knowledge.md`

---

## Validation Checklist

- [ ] Web project with all yes: 9 templates copied (same as before)
- [ ] Web project with missing template file: warns and continues (no crash)
- [ ] Invalid project type input ("5"): warns, copies universal only
- [ ] Valid type 3 input: no spurious warning
- [ ] Re-run on scaffolded project: skips existing templates with warning
- [ ] Re-run with some templates deleted: copies only the missing ones
- [ ] Skip (choice 4): no templates, clean exit (unchanged)
- [ ] `--force` mode: skips Phase 2 entirely (unchanged)

---

## Success Criteria

1. `install.sh` never crashes mid-Phase 2 regardless of missing template files
2. Invalid input produces a visible warning instead of silent fallthrough
3. Re-running on a scaffolded project preserves customized milestone templates
4. All existing test scenarios still produce correct results

---

## Implementation Notes

**Implemented:** 2026-03-06

### Summary

Added `copy_template` helper function and replaced all raw `cp` calls in Phase 2 with it. Added `else` clause for unrecognized project type input. All 8 validation scenarios confirmed passing.

### Deviations from Plan

None

### Issues Encountered

None
