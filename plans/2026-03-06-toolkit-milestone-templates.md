# Plan: Milestone Templates + Two-Phase claude-init
**Date:** 2026-03-06  
**Status:** In Progress  
**Source:** Strategic planning session on Claude.ai  
**Priority:** Medium (after hub Phase 1 is stable)

---

## Overview

Two related additions to the toolkit. First, a `milestone-templates/` library that encodes standard project workflows as reusable starting-point milestone sets. Second, an extension to `claude-init` (the `install.sh` script) that asks a few questions at scaffold time and applies the right templates automatically. Together these mean every new project starts with a sensible roadmap, not a blank kanban board.

---

## Current State

- `install.sh` scaffolds structure and files but creates empty `plans/` directory
- No milestone templates exist anywhere in the toolkit
- Project Hub kanban starts blank for every new project
- `KNOWN_PROJECTS` in the hub hardcodes category/stack — this plan's templates should eventually replace that inference too
- 11 projects have full scaffold; ~30 do not

---

## Proposed Changes

### 1. Milestone Template Library

Create a `milestone-templates/` directory in the toolkit root with the following structure:

```
GlensToolkit/
└── milestone-templates/
    ├── universal/                    ← applied to every project regardless of type
    │   ├── 01-setup.md
    │   ├── 02-dependencies.md
    │   ├── 03-core-build.md
    │   ├── 04-testing.md
    │   └── 05-deployment.md
    ├── web-project/                  ← applied when type = web app or client site
    │   ├── 06-database.md            (if database = yes)
    │   ├── 07-auth.md                (if auth = yes)
    │   ├── 08-frontend-polish.md
    │   └── 09-client-handoff.md      (if client-facing = yes)
    ├── software/                     ← applied when type = plugin, tool, software
    │   ├── 06-api-design.md
    │   ├── 07-packaging.md
    │   └── 08-documentation.md
    └── _template.md                  ← blank template for authoring new milestone files
```

**Milestone file format** (consistent with how the hub's project-scanner reads `plans/*.md`):

```markdown
# Milestone: [Title]
> Type: milestone-template
> Category: universal | web-project | software
> Order: [number]
> Optional: true | false

## Goal
[One sentence — what does completing this milestone mean?]

## Tasks
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

## Subtasks
<!-- Subtasks are nested under their parent task using indentation -->
- [ ] [Task with subtasks]
  - [ ] [Subtask 1]
  - [ ] [Subtask 2]

## Notes
[Any conventions, gotchas, or links relevant to this milestone]
```

The `- [ ]` / `- [x]` format is already parsed by `src/db/project-scanner.js` in the hub, grouped by `## Heading`. This means scaffolded milestone templates will be **automatically imported into the hub's kanban** on first scan — no extra integration work needed.

**Universal milestone contents (suggested starting points — customise per project):**

`01-setup.md` — Repo init, README, .gitignore, folder structure, CLAUDE.md, claude-init scaffold  
`02-dependencies.md` — Install and audit all dependencies, lock versions, document in README  
`03-core-build.md` — Core feature implementation (project-specific, left mostly blank)  
`04-testing.md` — Unit tests, integration tests, edge cases, /harden pass, fix all criticals  
`05-deployment.md` — Environment config, CI/CD, staging deploy, production deploy, verify  

**Web project milestone contents:**

`06-database.md` — Schema design, migrations, seed data, backup strategy  
`07-auth.md` — Auth provider setup, session management, role/permission model  
`08-frontend-polish.md` — Responsive design, accessibility (WCAG), cross-browser, performance  
`09-client-handoff.md` — Credentials handoff, documentation, training, sign-off  

**Software milestone contents:**

`06-api-design.md` — Interface design, input/output contracts, error handling  
`07-packaging.md` — Build output, versioning, distribution (npm/pip/zip), release notes  
`08-documentation.md` — README, API docs, usage examples, changelog  

---

### 2. Two-Phase `claude-init` (extend `install.sh`)

Extend the existing `install.sh` script with an interactive Phase 2 that runs after the structural scaffold.

**Phase 1** (unchanged): Copy CLAUDE.md, context/, .claude/, shell-aliases.md into target directory.

**Phase 2** (new): Interactive milestone setup.

```bash
echo ""
echo "=== Phase 2: Milestone Setup ==="
echo ""

# Q1: Project type
echo "Project type?"
echo "  1) Web app / client site"
echo "  2) Plugin / software / tool"  
echo "  3) Experiment / personal"
echo "  4) Skip milestone setup"
read -p "Choice [1-4]: " PROJECT_TYPE

if [ "$PROJECT_TYPE" = "4" ]; then
  echo "Skipping milestone setup."
  exit 0
fi

# Q2: Database
read -p "Does this project use a database? [y/n]: " HAS_DB

# Q3: Auth
read -p "Does this project require authentication? [y/n]: " HAS_AUTH

# Q4: Client-facing
read -p "Is this a client-facing project? [y/n]: " IS_CLIENT

# Apply universal templates to plans/ (always)
cp "$TOOLKIT_DIR/milestone-templates/universal/"*.md "$TARGET/plans/"

# Apply type-specific templates
if [ "$PROJECT_TYPE" = "1" ]; then
  cp "$TOOLKIT_DIR/milestone-templates/web-project/08-frontend-polish.md" "$TARGET/plans/"
  [ "$HAS_DB" = "y" ] && cp "$TOOLKIT_DIR/milestone-templates/web-project/06-database.md" "$TARGET/plans/"
  [ "$HAS_AUTH" = "y" ] && cp "$TOOLKIT_DIR/milestone-templates/web-project/07-auth.md" "$TARGET/plans/"
  [ "$IS_CLIENT" = "y" ] && cp "$TOOLKIT_DIR/milestone-templates/web-project/09-client-handoff.md" "$TARGET/plans/"
elif [ "$PROJECT_TYPE" = "2" ]; then
  cp "$TOOLKIT_DIR/milestone-templates/software/"*.md "$TARGET/plans/"
fi

echo ""
echo "Milestone templates copied to $TARGET/plans/"
echo "Review and customise them before running /prime."
echo "The Project Hub will import them automatically on next scan."
```

**Important behaviour:**
- Templates land in `plans/` as markdown files
- User is told to review and customise before committing
- No template is locked — they're starting points, not contracts
- If the user types `4` (skip), Phase 2 exits cleanly — no templates, no changes
- The hub's project-scanner already reads `plans/*.md` so templates flow into kanban automatically

---

## Step-by-Step Tasks

### Milestone Template Library
- [x] Create `milestone-templates/` directory in toolkit root
- [x] Create `universal/` subdirectory with 5 milestone files (01–05)
- [x] Create `web-project/` subdirectory with 4 milestone files (06–09)
- [x] Create `software/` subdirectory with 3 milestone files (06–08)
- [x] Create `_template.md` blank authoring template
- [x] Verify file format matches `## Heading` + `- [ ]` syntax that hub scanner expects
- [ ] Test: scaffold a project, scan it in hub, verify milestones appear in kanban

### Two-Phase install.sh
- [x] Add Phase 2 block to `install.sh` after existing scaffold logic
- [x] Implement 4-question interactive flow
- [x] Implement conditional template copying logic
- [x] Add graceful skip option (choice 4)
- [x] Test: run `claude-init` on a test directory, answer each combination of questions, verify correct templates land in `plans/`
- [x] Test: answer "skip" — verify no templates copied, script exits cleanly
- [x] Update CLAUDE.md in toolkit to document the new two-phase behaviour
- [x] Update `shell-aliases.md` template to mention Phase 2

### Cross-repo wiring (do after hub Phase 1 is complete)
- [ ] Verify hub's `project-scanner.js` correctly parses the template file format
- [ ] If `> Type: milestone-template` frontmatter causes parsing issues, strip it during scan
- [ ] Once `claude-init` Phase 2 is working, remove `KNOWN_PROJECTS` category defaults from hub scanner and let the template presence infer category instead

---

## Validation Checklist

- [ ] `claude-init` on a new web app project with DB + auth + client → correct 9 milestone files in `plans/`
- [ ] `claude-init` on a new software project → correct 8 milestone files in `plans/`
- [ ] `claude-init` with skip → empty `plans/` directory (unchanged from current behaviour)
- [ ] Hub scan on a freshly scaffolded project imports milestones into kanban correctly
- [ ] Milestone tasks appear as `todo` status in kanban after scan
- [ ] Existing projects unaffected (templates only applied at init time, not retroactively)

---

## Success Criteria

1. Every new project scaffolded with `claude-init` gets a relevant milestone roadmap in `plans/` within the same terminal session
2. The Project Hub automatically imports those milestones into the kanban on first scan — no manual entry
3. Templates are clearly marked as starting points and invite customisation
4. The skip option means zero friction for projects where templates don't apply
