# Toolkit Architecture

The Claude Workspace Toolkit uses a **two-layer architecture** that separates universal commands from project-specific data.

---

## Design Principle

**Commands = Logic. Projects = Data.**

Every command uses relative paths (`./context/`, `./CLAUDE.md`, `./plans/`) so it works in any project directory. The command provides the workflow; the project provides the context.

---

## The Two Layers

### Layer 1: Universal Toolkit (user-level)

**Location:** `~/.claude/commands/` and `~/.claude/skills/`
**Installed by:** `scripts/install-toolkit.sh`
**Scope:** Available in every project, every session

These are the commands and skills that work identically across all projects:

| File | Purpose |
|------|---------|
| `~/.claude/commands/prime.md` | Session initialization — reads project context |
| `~/.claude/commands/create-plan.md` | Create implementation plans |
| `~/.claude/commands/implement.md` | Execute implementation plans |
| `~/.claude/commands/discover.md` | Audit project for undocumented context |
| `~/.claude/commands/scope.md` | Discovery-to-prototype scoping pipeline |
| `~/.claude/commands/sync-toolkit.md` | Sync commands between project and toolkit repo |
| `~/.claude/commands/harden.md` | Find bugs, security issues, edge cases, and performance problems |

**Update story:** Edit commands in the template repo, run `install-toolkit.sh` — all projects get the update immediately.

### Layer 2: Project Scaffolding (per-project)

**Location:** Each project's root directory
**Installed by:** `scripts/install.sh`
**Scope:** Project-specific data and configuration

| File/Directory | Purpose |
|----------------|---------|
| `CLAUDE.md` | Project-specific documentation (user edits this) |
| `context/` | 4 template files — personal, business, strategy, data |
| `.claude/settings.local.json` | Project-level permission settings |
| `.claude/skills/mcp-integration/` | MCP integration skill (7 files) |
| `.claude/skills/skill-creator/` | Skill authoring skill (5 files) |
| `plans/` | Implementation plans (empty) |
| `outputs/` | Work products (empty) |
| `reference/` | Reference materials (empty) |
| `scripts/` | Automation scripts (empty) |

---

## Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│                    TEMPLATE REPO                         │
│  (canonical source — where commands are authored)        │
│                                                         │
│  .claude/commands/*.md  ──── install-toolkit.sh ────┐   │
│  context/, CLAUDE.md    ──── install.sh ─────────┐  │   │
└─────────────────────────────────────────────────┬─┼──┘  │
                                                  │ │     │
                    ┌─────────────────────────────┘ │     │
                    │                               │     │
                    ▼                               ▼     │
          ┌─────────────────┐            ┌──────────────┐ │
          │  PROJECT DIR    │            │  ~/.claude/   │ │
          │  ./context/     │            │  commands/    │◄┘
          │  ./CLAUDE.md    │            │  prime.md     │
          │  ./plans/       │            │  discover.md  │
          │  .claude/skills/│            │  scope.md     │
          │  .claude/       │            │  ...          │
          │    commands/    │            └──────────────┘
          │    (overrides)  │
          └────────┬────────┘
                   │
                   │  /sync-toolkit push
                   │
                   ▼
          ┌─────────────────┐
          │  TEMPLATE REPO  │  (feedback loop)
          └─────────────────┘
```

### The Flow

1. **Author** commands in the template repo (`.claude/commands/`)
2. **Deploy** to user-level with `install-toolkit.sh`
3. **Scaffold** new projects with `install.sh`
4. **Use** commands in any project — they read from `./` using relative paths
5. **Refine** commands through real project use
6. **Promote** improvements back with `/sync-toolkit push`
7. **Redeploy** updated commands with `install-toolkit.sh`

---

## Full Command Pipeline

The toolkit provides a complete project lifecycle pipeline:

```
/prime → /discover → /scope → /create-plan → /implement → /harden
  ↓          ↓          ↓           ↓             ↓           ↓
Orient    Audit      Define      Plan          Build       Test &
          context    scope       steps         it          harden
                                   ↑                        │
                                   └── /create-plan fixes ◄─┘
```

Each command can be used independently or as part of the pipeline. The `/harden` → `/create-plan` → `/implement` → `/harden` loop repeats until clean. All commands use relative paths and work in any project.

### Command Reference

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `/prime` | Initialize session | — | Context summary |
| `/discover [scope]` | Audit for hidden context | `full`, `code`, `config`, `deps` | Discovery report + doc updates |
| `/scope [phase]` | Define what to build | `discover`, `define`, `plan` | Scope document in `./plans/` |
| `/create-plan [request]` | Plan implementation | Description of change | Plan document in `./plans/` |
| `/implement [plan-path]` | Execute a plan | Path to plan file | Completed work + plan status update |
| `/sync-toolkit [action]` | Manage command sync | `status`, `push`, `pull`, `push-all` | Sync report |
| `/harden [focus]` | Find bugs, security issues, edge cases | `full`, `security`, `bugs`, `edge-cases`, `performance`, `validation` | Harden report + knowledge base |

---

## Command Resolution

Claude Code resolves commands in this order:

1. **Project-level:** `./.claude/commands/` (highest priority)
2. **User-level:** `~/.claude/commands/` (fallback)

This means:
- User-level commands are available everywhere without copying
- A project can override any command by placing a modified version in `./.claude/commands/`
- `/sync-toolkit pull` creates project-level overrides for customization

---

## Scripts

### `install-toolkit.sh` — One-time toolkit setup

```bash
bash scripts/install-toolkit.sh           # Interactive install
bash scripts/install-toolkit.sh --force   # Skip prompts
bash scripts/install-toolkit.sh --help    # Usage info
```

Copies all universal commands to `~/.claude/commands/`. Run again to update after editing commands in the template repo.

### `install.sh` — Per-project scaffolding

```bash
bash scripts/install.sh ~/my-project           # Interactive
bash scripts/install.sh --force ~/my-project    # Skip prompts
bash scripts/install.sh --help                  # Usage info
```

Copies project-level files (context templates, skills, CLAUDE.md) and creates empty directories. Does NOT copy commands — those come from the toolkit layer.

---

## Adding New Commands

See `command-development-guide.md` for the full process. Summary:

1. Create `.md` file in template repo's `.claude/commands/`
2. Use relative paths only (`./context/`, `./CLAUDE.md`, `./plans/`)
3. Handle missing files gracefully
4. Test in a real project
5. Add to `install-toolkit.sh` manifest
6. Update `CLAUDE.md` command documentation
7. Deploy with `install-toolkit.sh`

---

## Project Files Installed by `install.sh`

19 files total (no commands):

- `CLAUDE.md` — project documentation skeleton
- `shell-aliases.md` — alias reference
- `.claude/settings.local.json` — permission settings
- `.claude/skills/mcp-integration/` — 7 files (SKILL.md + examples + references)
- `.claude/skills/skill-creator/` — 5 files (SKILL.md + license + scripts)
- `context/business-info.md` — organization template
- `context/current-data.md` — metrics template
- `context/personal-info.md` — role template
- `context/strategy.md` — priorities template
- 4 empty directories: `plans/`, `outputs/`, `reference/`, `scripts/`

---

## Phase 2 Considerations

- **Skills at user-level**: Test whether `~/.claude/skills/` is resolved by Claude Code. If yes, move universal skills there.
- **Command versioning**: Add version metadata to command files for better sync status reporting.
- **Auto-update**: Let `install-toolkit.sh` optionally `git pull` the template repo before installing.
- **Command categories**: As the library grows, organize by category (workflow, utility, analysis).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-28 | Initial two-layer architecture implemented. 6 commands, 2 scripts, full documentation. |
| 2026-02-28 | Added `/harden` command — 7 commands total. Self-improving knowledge base pattern. |
