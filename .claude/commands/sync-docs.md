# Sync Docs

> Audit all toolkit documentation for accuracy, update anything out of date, then optionally commit and push.

## Variables

action: $ARGUMENTS (optional — "check", "fix", or "push". Default: "fix")

## Instructions

You maintain documentation consistency across the GlensToolkit repo. Run this at the end of a session to catch anything that's drifted.

---

### Phase 1: Inventory

Read the current state of everything that documentation references:

1. **Commands:** List all `.md` files in `./.claude/commands/` — these are the actual commands
2. **Agents:** List all `.md` files in `./.claude/agents/`
3. **Skills:** List all directories in `./.claude/skills/`
4. **Scripts:** List all files in `./scripts/`
5. **Shell aliases:** Read the PowerShell profile at `~/OneDrive/Documents/WindowsPowerShell/Microsoft.PowerShell_profile.ps1` and `~/.bashrc` for actual alias definitions
6. **Install script manifests:** Read `./scripts/install-toolkit.sh` and `./scripts/install.sh` for the explicit file lists they install
7. **Workspace structure:** Run `find` or `ls` to get the actual directory tree

---

### Phase 2: Audit Each Document

Compare reality (Phase 1) against what each document claims. Check these files in order:

#### `README.md`
- [ ] All commands listed match actual files in `.claude/commands/`
- [ ] No commands missing from the reference
- [ ] All shell aliases match what's actually in the PowerShell profile and `.bashrc`
- [ ] Installation steps are accurate
- [ ] Project structure diagram matches reality
- [ ] Workflow examples reference valid commands
- [ ] Subagents section matches actual agents
- [ ] Troubleshooting section is current

#### `CLAUDE.md`
- [ ] Workspace structure diagram matches reality
- [ ] All commands listed with correct descriptions
- [ ] Install script documentation matches actual script behaviour
- [ ] Session workflow is accurate
- [ ] All file paths referenced actually exist

#### `shell-aliases.md`
- [ ] All aliases match what's in the PowerShell profile and `.bashrc`
- [ ] No aliases missing
- [ ] Usage examples are accurate
- [ ] Setup instructions work for both Bash and PowerShell

#### `reference/getting-started.md`
- [ ] Command count and list matches reality
- [ ] Installation steps match current scripts
- [ ] Workflow pipelines use valid commands
- [ ] Quick reference table is complete

#### `reference/toolkit-architecture.md`
- [ ] Architecture description matches current structure
- [ ] Command counts are accurate

#### `reference/command-development-guide.md`
- [ ] Any referenced patterns still apply

#### `reference/workspace-setup-guide.md`
- [ ] Setup steps are current

#### `scripts/install-toolkit.sh`
- [ ] Command manifest (`COMMANDS` array) matches actual files in `.claude/commands/`
- [ ] Usage text lists all commands
- [ ] No commands in the directory are missing from the manifest

#### `scripts/install.sh`
- [ ] File manifest matches actual project-layer files to install
- [ ] No files referenced that don't exist

---

### Phase 3: Report

If action is `check`, stop here and report:

```
## Documentation Audit

### In Sync:
- [files that are accurate]

### Out of Date:
- [file]: [what's wrong]
  - [specific discrepancy]

### Missing Documentation:
- [anything that exists but isn't documented anywhere]
```

---

### Phase 4: Fix

If action is `fix` (default) or `push`:

1. For each discrepancy found, update the document to match reality
2. Be precise — only change what's actually wrong, don't rewrite entire files
3. After all fixes, re-read each changed file to verify consistency
4. Report what was changed:

```
## Documentation Updated

### Changes Made:
- [file]: [what was updated]

### Verified Accurate (no changes needed):
- [files]
```

---

### Phase 5: Push

If action is `push`:

1. Run `git status` to see all changes
2. Show the user a summary of what will be committed
3. Stage only documentation files (`.md` files, install scripts)
4. Commit with message: "docs: sync documentation with current toolkit state"
5. Push to origin
6. Report the commit hash and confirm push succeeded

If action is `fix`, ask the user if they'd like to commit and push the changes.

---

## Hard Rules

- Never modify command files (`.claude/commands/*.md`) — this command only updates documentation about commands, not the commands themselves
- Never modify application code or scripts logic — only update documentation sections within scripts (usage text, manifests, comments)
- When updating install script manifests, flag the change to the user before writing — a missing command in the manifest means it won't get installed
- Always show diffs or summaries before committing
- If a document references something that doesn't exist AND you can't determine what it should be, flag it for the user rather than guessing
- Match the existing style and formatting of each document — don't impose a different structure
