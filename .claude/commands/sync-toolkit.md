# Sync Toolkit

> Sync commands or skills between this project and the GlensToolkit repo.

## Variables

action: $ARGUMENTS (required — "push [command-name]", "pull [command-name]", "status", or "push-all")

## Instructions

You manage the synchronization between project-level commands/skills and the GlensToolkit repo.

### Setup

The toolkit repo location must be known. Check for it in this order:
1. Environment variable: `$CLAUDE_TOOLKIT_REPO`
2. Common locations: `~/Repos/GlensToolkit`, `~/GlensToolkit`, `D:/Repos/GlensToolkit`
3. If not found, ask the user for the path

### Actions

#### `status`

Compare commands in this project vs the toolkit repo:

1. List all commands in `~/.claude/commands/` (user-level / deployed)
2. List all commands in the toolkit repo's `.claude/commands/` (source)
3. List any project-local commands in `./.claude/commands/` that don't exist in the toolkit
4. For each command that exists in both locations, check if they differ (use diff)
5. Report:

```
## Toolkit Sync Status

### Toolkit Repo: [path]
### User Commands (~/.claude/commands/): [count] commands
### Toolkit Source: [count] commands

### Differences:
| Command | Status |
|---------|--------|
| prime.md | In sync |
| discover.md | Modified locally — project version differs |
| my-custom.md | Project-only — not in toolkit |

### Recommendations:
- [Specific actions to take]
```

#### `push [command-name]`

Promote a command from this project or `~/.claude/commands/` to the toolkit repo:

1. Find the command file (check `./.claude/commands/` first, then `~/.claude/commands/`)
2. Check if it already exists in the toolkit repo
3. If it exists, show a diff and ask the user to confirm the overwrite
4. If it doesn't exist, show the file contents and confirm it should be added
5. Copy the file to the toolkit repo's `.claude/commands/`
6. Remind the user to run `install-toolkit.sh` to deploy the updated toolkit, or offer to do it

#### `pull [command-name]`

Pull a command from the toolkit repo to this project's local commands:

1. Find the command in the toolkit repo's `.claude/commands/`
2. Copy it to `./.claude/commands/` (project-local)
3. Note: this is for project-specific customization. The user-level version in `~/.claude/commands/` is unchanged.

#### `push-all`

Push all modified or new project-local commands to the toolkit repo:

1. Run the `status` check
2. For each command that differs or is project-only, show the diff/contents
3. Ask the user to confirm each one (or use batch confirmation)
4. Copy confirmed files to the toolkit repo

### Safety

- Always show diffs before overwriting
- Never delete commands from any location
- Always confirm before writing to the toolkit repo
- Log what was synced for reference
