# Shell Aliases for Claude Code

Shell aliases streamline working with the Claude Workspace Toolkit.

## Setup

Add these lines to your `~/.zshrc` (or `~/.bashrc`):

```bash
alias cs='claude "/prime"'
alias cr='claude --dangerously-skip-permissions "/prime"'
alias claude-init='bash "/path/to/claude-workspace-template/scripts/install.sh"'
alias claude-toolkit='bash "/path/to/claude-workspace-template/scripts/install-toolkit.sh"'
```

> Replace `/path/to/claude-workspace-template` with the actual path to your template repo. Both install scripts offer to set up their aliases automatically during first run.

Then reload your shell: `source ~/.zshrc`

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

### `claude-toolkit` — Install/Update Toolkit

```bash
alias claude-toolkit='bash "/path/to/claude-workspace-template/scripts/install-toolkit.sh"'
```

Installs or updates universal commands to `~/.claude/commands/`. These commands (`/prime`, `/discover`, `/scope`, `/create-plan`, `/implement`, `/sync-toolkit`) become available in every project.

```bash
claude-toolkit              # Interactive install/update
claude-toolkit --force      # Skip prompts
claude-toolkit --help       # Show usage info
```

**Run once** to set up, then again whenever you update commands in the template repo.

### `claude-init` — Scaffold a Project

```bash
alias claude-init='bash "/path/to/claude-workspace-template/scripts/install.sh"'
```

Scaffolds a project with context templates, skills, CLAUDE.md, and directory structure. Does not install commands — those come from the toolkit layer via `claude-toolkit`.

```bash
claude-init                     # Scaffold current directory
claude-init ~/my-project        # Scaffold a specific directory
claude-init --force /tmp/test   # Skip all prompts
claude-init --help              # Show usage info
```

**Options (both scripts):**
- `--force` — Skip all confirmation prompts (useful for scripting)
- `--no-alias` — Skip the alias setup offer at the end
- `--help` — Show usage information

## Why `cs` and `cr`?

- **`cs`** gives you oversight — good for unfamiliar tasks, sensitive operations, or when you want to learn what Claude is doing
- **`cr`** gives you speed — good for familiar workflows where you trust Claude to operate autonomously

Both run `/prime` automatically so Claude starts every session fully oriented to your workspace, goals, and context.

## First-Time Setup

1. Run `claude-toolkit` to install universal commands (one-time)
2. Run `claude-init ~/my-project` to scaffold each project
3. Fill in `context/` files in each project
4. Start sessions with `cs` or `cr`
