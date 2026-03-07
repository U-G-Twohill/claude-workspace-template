# Workspace Setup Guide

How to set up the Glen's Toolkit for your projects.

> **Looking for a complete walkthrough?** See **`getting-started.md`** — it walks you through the entire process for both new and existing projects, from installation to a hardened, production-ready codebase.

---

## What the Toolkit Provides

The Glen's Toolkit is a two-layer system:

**Toolkit Layer** (universal — installed once, available everywhere):
28 commands including `/prime`, `/discover`, `/scope`, `/create-plan`, `/implement`, `/harden`, `/sync-toolkit`, `/sync-docs`, `/autopilot`, `/bootstrap`, `/frontend-design`, `/site-audit`, `/deploy-draft`, `/create-tests`, `/audit-deps`, `/prepare-deploy`, `/proposal`, `/client-report`, `/competitive-intel`, `/setup-hooks`, `/document`, `/connect`, `/onboard-client`, `/meeting-actions`, `/hub-projects`, `/hub-keys`, `/hub-report`, and `/hub-export`. See the README for full details on each command.

**Project Layer** (per-project — scaffolded for each repo):
- **Context files** — Templates for personal info, business info, strategy, and current data.
- **Skills** — MCP integration and skill creator guidance.
- **Directory structure** — `plans/`, `outputs/`, `reference/`, `scripts/`
- **CLAUDE.md** — Project-specific documentation skeleton.

---

## Quick Start

### Step 1: Install the Toolkit (one-time)

```bash
bash /path/to/GlensToolkit/scripts/install-toolkit.sh
```

This installs all universal commands to `~/.claude/commands/`. They become available in every project, every session.

### Step 2: Scaffold a Project

```bash
bash /path/to/GlensToolkit/scripts/install.sh ~/my-project
```

This creates the project-level files: context templates, skills, CLAUDE.md, and empty directories.

### Step 3: Fill In Context

Edit the files in `~/my-project/context/`:
- `personal-info.md` — your role, responsibilities, how this workspace helps you
- `business-info.md` — what you do, who you serve, key context
- `strategy.md` — current focus, what success looks like
- `current-data.md` — metrics, project status, concrete numbers

### Step 4: Start a Session

```bash
cd ~/my-project
claude "/prime"
```

Or use the `cs` alias (see Shell Aliases below).

---

## Manual Setup (Alternative)

If you prefer not to use the install scripts:

1. Copy all 23 command files from the toolkit repo's `.claude/commands/` to `~/.claude/commands/`.

2. Create directories in your project:
   ```
   .claude/
   context/
   plans/
   ```

3. Copy context templates from `context/` in the template repo.

4. Fill in the context files with your information.

---

## Updating the Toolkit

When commands are improved in the template repo, update your installation:

```bash
bash /path/to/GlensToolkit/scripts/install-toolkit.sh
```

Or with the alias: `claude-toolkit`

This updates all commands in `~/.claude/commands/` — every project gets the improvements immediately.

---

## The Feedback Loop

Commands improve through real use. The `/sync-toolkit` command manages this:

```bash
# Check what's different between project and toolkit
/sync-toolkit status

# Promote a refined command back to the toolkit repo
/sync-toolkit push my-command.md

# Pull a toolkit command for project-specific customization
/sync-toolkit pull prime.md
```

**Workflow:** Use commands in projects → refine them → push improvements back → redeploy with `install-toolkit.sh` → all projects benefit.

---

## Shell Aliases

For faster setup and sessions, add aliases to your shell profile.

### Bash / Zsh

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias cs='claude "/prime"'
alias cr='claude --dangerously-skip-permissions "/prime"'
alias crr='claude --resume --dangerously-skip-permissions'
alias claude-init='bash "/path/to/GlensToolkit/scripts/install.sh"'
alias claude-toolkit='bash "/path/to/GlensToolkit/scripts/install-toolkit.sh"'
```

### PowerShell

Add to your PowerShell profile (`$PROFILE`):

```powershell
function cs { claude "/prime" }
function cr { claude --dangerously-skip-permissions "/prime" }
function crr { claude --resume --dangerously-skip-permissions }
```

---

## .gitignore Considerations

`.claude/` is typically gitignored — the workspace setup is local per machine. This means:

- Commands live at user-level (`~/.claude/commands/`), not in the repo
- Skills and settings in `.claude/` won't be committed
- Your CLAUDE.md _is_ committed and shared (it's in the repo root, not `.claude/`)

For `context/` and `plans/`, decide based on your needs:
- **Gitignore them** if they contain sensitive/personal information
- **Commit them** if you want them shared across machines or with collaborators

---

## Session Workflow

Every session follows this pattern:

1. **Start**: Run `/prime` (or use the `cs` alias) to load context
2. **Discover**: Run `/discover` to audit for undocumented context (new projects)
3. **Scope**: Run `/scope` to define what to build (new features)
4. **Plan**: Run `/create-plan` before significant additions
5. **Execute**: Run `/implement plans/...` to execute plans
6. **Harden**: Run `/harden` to find bugs, security issues, and edge cases
7. **Fix loop**: `/create-plan` fixes → `/implement` → `/harden` again until clean
8. **Sync**: Run `/sync-toolkit push` to promote refined commands
9. **Maintain**: Claude updates CLAUDE.md and context files as the workspace evolves

---

## Tips

- **Keep context files current.** Stale context is worse than no context — it leads Claude in the wrong direction.
- **Use `/discover` on new projects.** It finds undocumented patterns, dependencies, and conventions that make Claude more effective.
- **Use `/create-plan` for non-trivial changes.** The planning step catches issues before implementation.
- **Run `/prime` at every session start.** It only takes a moment and ensures Claude is fully oriented.
- **Update CLAUDE.md when structure changes.** Future sessions depend on it being accurate.
- **Promote useful commands** with `/sync-toolkit push` — don't let improvements stay siloed in one project.
