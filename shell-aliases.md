# Shell Aliases for Claude Code

Shell aliases streamline working with GlensToolkit.

## Setup

### Bash / Git Bash (Linux, Mac, Windows Git Bash)

Add these lines to your `~/.bashrc` (or `~/.zshrc`):

```bash
alias cs='claude "/prime"'
alias cr='claude --dangerously-skip-permissions "/prime"'
alias crr='claude --resume --dangerously-skip-permissions'
alias claude-init='bash "/path/to/GlensToolkit/scripts/install.sh"'
alias claude-toolkit='bash "/path/to/GlensToolkit/scripts/install-toolkit.sh"'
```

> Replace `/path/to/GlensToolkit` with the actual path to your toolkit repo. Both install scripts offer to set up their aliases automatically during first run.

Then reload your shell: `source ~/.bashrc`

### PowerShell (Windows)

Add these to your PowerShell profile (run `echo $PROFILE` to find the path):

```powershell
# Glen's Toolkit aliases
function claude-init { & "C:\Program Files\Git\bin\bash.exe" "/path/to/GlensToolkit/scripts/install.sh" $args }
function claude-toolkit { & "C:\Program Files\Git\bin\bash.exe" "/path/to/GlensToolkit/scripts/install-toolkit.sh" $args }
function cs { claude "/prime" }
function cr { claude --dangerously-skip-permissions "/prime" }
function crr { claude --resume --dangerously-skip-permissions }
```

> Replace `/path/to/GlensToolkit` and the Git bash path with your actual paths.

Then reload: `. $PROFILE`

## The Aliases

### `cs` — Claude Safe

```bash
alias cs='claude "/prime"'
```

Launches Claude Code and immediately runs `/prime` to load workspace context. Claude will ask for permission before executing commands, reading sensitive files, or making changes.

**Use when:** Starting a new session where you want to review and approve each action.

### `cr` — Claude Run

```bash
alias cr='claude --dangerously-skip-permissions "/prime"'
```

Launches Claude Code with permission prompts disabled, then runs `/prime`. Claude can execute commands and make changes without asking for approval.

**Use when:** You trust the task, want faster iteration, or are doing routine work where constant approvals slow you down.

### `crr` — Claude Resume Run

```bash
alias crr='claude --resume --dangerously-skip-permissions'
```

Resumes the last Claude Code session with permission prompts disabled. Picks up exactly where you left off without re-running `/prime` (your context is already loaded from the previous session).

**Use when:** You closed a session and want to continue where you left off, without permission prompts.

### `claude-toolkit` — Install/Update Toolkit

```bash
alias claude-toolkit='bash "/path/to/GlensToolkit/scripts/install-toolkit.sh"'
```

Installs or updates all 28 universal commands to `~/.claude/commands/`. These commands become available in every project.

```bash
claude-toolkit              # Interactive install/update
claude-toolkit --force      # Skip prompts
claude-toolkit --help       # Show usage info
```

**Run once** to set up, then again whenever you update commands in the toolkit repo.

### `claude-init` — Scaffold a Project

```bash
alias claude-init='bash "/path/to/GlensToolkit/scripts/install.sh"'
```

Scaffolds a project in two phases. Does not install commands — those come from the toolkit layer via `claude-toolkit`.

**Phase 1:** Copies CLAUDE.md, context templates, skills, and directory structure.
**Phase 2:** Interactive milestone setup — asks project type (web/software/experiment/skip), then conditionally asks about database, auth, and client-facing needs. Copies the appropriate milestone templates from `milestone-templates/` into `plans/`. The Project Hub auto-imports these into kanban on first scan.

```bash
claude-init                     # Scaffold current directory (both phases)
claude-init ~/my-project        # Scaffold a specific directory
claude-init --force /tmp/test   # Phase 1 only (skips Phase 2 and all prompts)
claude-init --help              # Show usage info
```

**Options (both scripts):**
- `--force` — Skip all confirmation prompts and Phase 2 (useful for scripting)
- `--no-alias` — Skip the alias setup offer at the end
- `--help` — Show usage information

## Why `cs`, `cr`, and `crr`?

- **`cs`** gives you oversight — good for unfamiliar tasks, sensitive operations, or when you want to learn what Claude is doing
- **`cr`** gives you speed — good for familiar workflows where you trust Claude to operate autonomously
- **`crr`** gives you continuity — resume a previous session at full speed

Both `cs` and `cr` run `/prime` automatically so Claude starts every session fully oriented to your workspace, goals, and context. `crr` skips `/prime` because the previous session's context is already loaded.

## First-Time Setup

1. Run `claude-toolkit` to install universal commands (one-time)
2. Run `claude-init ~/my-project` to scaffold each project
3. Fill in `context/` files in each project
4. Start sessions with `cs` or `cr`
5. Resume sessions with `crr`
