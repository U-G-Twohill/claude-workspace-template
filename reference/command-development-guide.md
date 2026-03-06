# Command Development Guide

How to author, test, and deploy new commands for the Glen's Toolkit.

---

## Design Principles

### Commands = Logic, Projects = Data

Every command must work in any project directory. Commands provide the workflow; the project provides the context.

**Do:**
- Use `./CLAUDE.md`, `./context/`, `./plans/` — always relative paths
- Gracefully handle missing files (not every project has `./context/strategy.md`)
- Read from the project's current directory, never from a hardcoded path

**Don't:**
- Reference `D:\Repos\...` or any absolute path
- Assume specific project structure beyond the workspace conventions
- Hardcode file names that may not exist

### Progressive Complexity

Commands should be useful immediately with minimal setup, and more powerful as the project fills in context files. A `/prime` in a project with only a `CLAUDE.md` should still work — it just won't be as rich.

---

## Command File Structure

Commands are markdown files in `.claude/commands/` with this pattern:

```markdown
# Command Name

> One-line description of what this command does.

## Variables

variable_name: $ARGUMENTS (description of expected input and defaults)

## Instructions

[Detailed instructions for Claude to follow when this command is invoked]

### Phase/Step 1: [Name]

[What to do in this phase]

### Phase/Step 2: [Name]

[What to do in this phase]
```

### Key Elements

- **Title** (`# Name`): Becomes the slash command name (e.g., `# Discover` → `/discover`)
- **Description** (`> ...`): Shown in command listings
- **Variables**: Map to `$ARGUMENTS` passed by the user
- **Instructions**: The actual workflow Claude executes

---

## Development Workflow

### Path A: Template Repo First (recommended)

1. Author the command in `GlensToolkit/.claude/commands/`
2. Run `install-toolkit.sh` to deploy to `~/.claude/commands/`
3. Test in a real project: `cd ~/my-project && claude "/my-command"`
4. Iterate: edit in template repo → redeploy → test
5. Commit to template repo when stable

### Path B: Project First, Sync Back

1. Create command directly in a project: `./.claude/commands/my-command.md`
2. Test and refine through real use
3. When stable, promote to toolkit: `/sync-toolkit push my-command.md`
4. Run `install-toolkit.sh` to deploy everywhere
5. Optionally remove the project-local copy (user-level takes over)

### Path C: Quick Experiment

1. Create command in `~/.claude/commands/` directly
2. Test across projects
3. When stable, `/sync-toolkit push` to preserve in the template repo

---

## Testing Checklist

Before deploying a command to the toolkit, verify:

- [ ] Works with no `./context/` files (graceful degradation)
- [ ] Works with filled `./context/` files (enhanced behavior)
- [ ] Works with no `./CLAUDE.md` present
- [ ] No hardcoded paths — only `./` relative references
- [ ] Works from any project directory
- [ ] `$ARGUMENTS` is documented and handled when empty
- [ ] Output format is clear and actionable
- [ ] Does not modify files without user confirmation (where appropriate)

---

## Naming Conventions

- **File name**: Kebab-case, descriptive — `discover.md`, `sync-toolkit.md`, `create-plan.md`
- **Command title**: Natural name — `# Discover`, `# Sync Toolkit`, `# Create Plan`
- **Verb-first** when possible — discover, create, implement, sync, scope

---

## Commands vs Skills

| Aspect | Commands | Skills |
|--------|----------|--------|
| Purpose | Workflows and pipelines | Domain knowledge and specialized tools |
| Triggered by | User invokes `/command-name` | Claude auto-detects from context |
| Location | `.claude/commands/` | `.claude/skills/` |
| Structure | Single markdown file | Folder with SKILL.md + resources |
| Use for | Multi-step processes, user-driven workflows | Reference material, scripts, specialized guidance |

**Rules of thumb:**
- If the user says "do X" → command
- If Claude needs to know how to do X → skill
- If it's a pipeline with phases → command
- If it's a knowledge base with scripts → skill

---

## Command Resolution Order

Claude Code looks for commands in this order:

1. **Project-level**: `./.claude/commands/` (highest priority — overrides)
2. **User-level**: `~/.claude/commands/` (universal — available everywhere)

This means a project can override any toolkit command by placing a modified version in its own `.claude/commands/`. This is useful for project-specific customization without affecting other projects.

---

## Example: Minimal Command

```markdown
# Greet

> Say hello and summarize the project.

## Variables

name: $ARGUMENTS (optional — name to greet. Default: read from ./context/personal-info.md)

## Instructions

1. Read `./CLAUDE.md` if it exists
2. Read `./context/personal-info.md` if it exists
3. Greet the user by name (from argument or context file)
4. Provide a one-paragraph summary of the project based on what you read
```

This command:
- Uses relative paths only
- Handles missing files gracefully
- Accepts optional arguments
- Works in any project
