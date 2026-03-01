# Setup Hooks

> Configure Claude Code hooks for continuous quality enforcement — auto-formatting, safety guards, and quality gates.

## Variables

preset: $ARGUMENTS (optional — "quality", "safety", "format", "full", or "status". Default: interactive selection)

## Instructions

You are configuring Claude Code hooks for this project. Hooks run automatically at specific lifecycle events — they enforce standards without manual intervention.

**Important:** Hooks are configured in `.claude/settings.local.json` (project-level, not committed) or `.claude/settings.json` (project-level, committed and shared with team). This command helps the user choose and configure the right hooks.

---

### Phase 1: Assess Current State

1. **Check for existing hook configuration:**
   - Read `.claude/settings.local.json` if it exists — check for existing hooks
   - Read `.claude/settings.json` if it exists
   - Read `~/.claude/settings.json` for user-level hooks

2. **Detect project tooling:**
   - Check for formatters: Prettier, Black, gofmt, rustfmt, etc.
   - Check for linters: ESLint, Pylint, Clippy, golangci-lint, etc.
   - Check for test runners: Jest, Vitest, pytest, go test, cargo test, etc.
   - Check for type checkers: TypeScript, mypy, etc.
   - Note the commands for each tool found

3. **Determine the preset:**
   - If `$ARGUMENTS` specifies a preset: use it
   - If `status`: show current hooks and exit
   - If no preset: ask the user which hooks they want:
     - **Quality:** Auto-format + lint after edits, test verification before stopping
     - **Safety:** Block dangerous operations, protect sensitive files
     - **Format:** Auto-format only
     - **Full:** All of the above

Summarize: "Found [tools]. Current hooks: [count existing]. Applying [preset] preset."

---

### Phase 2: Configure Hooks

Based on the preset, configure the appropriate hooks:

**Format Preset:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "<format-command>"
          }
        ]
      }
    ]
  }
}
```

Where `<format-command>` is determined by detected tooling:
- Prettier: `npx prettier --write "$CLAUDE_FILE_PATH" 2>/dev/null || true`
- Black: `black "$CLAUDE_FILE_PATH" 2>/dev/null || true`
- gofmt: `gofmt -w "$CLAUDE_FILE_PATH" 2>/dev/null || true`
- rustfmt: `rustfmt "$CLAUDE_FILE_PATH" 2>/dev/null || true`

**Safety Preset:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if this command is destructive (rm -rf, git push --force, git reset --hard, DROP TABLE, etc.) or modifies sensitive files (.env, credentials, secrets). If destructive or touches sensitive files, respond {\"decision\": \"block\", \"reason\": \"Destructive or sensitive operation — requires explicit user approval\"}. Otherwise respond {\"decision\": \"approve\"}."
          }
        ]
      }
    ]
  }
}
```

**Quality Preset:**

Combines format hooks with:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "<test-command> 2>&1 | tail -20"
          }
        ]
      }
    ]
  }
}
```

Where `<test-command>` is:
- npm: `npm test --if-present`
- Python: `python -m pytest --tb=short -q`
- Go: `go test ./...`
- Rust: `cargo test --quiet`

**Full Preset:** All of the above combined.

---

### Phase 3: Apply Configuration

1. **Ask where to save:**
   - `.claude/settings.local.json` — local only, not committed (recommended for personal preferences)
   - `.claude/settings.json` — committed, shared with team (recommended for team standards)

2. **Merge with existing configuration:**
   - If the settings file already exists: read it and merge hooks (don't overwrite other settings)
   - If it doesn't exist: create it with just the hooks section

3. **Write the configuration file**

4. **Verify the hooks work:**
   - If format hooks were added: create a test edit to verify the formatter runs
   - If safety hooks were added: explain how to test (the hook will trigger on the next potentially dangerous command)
   - If quality hooks were added: explain that tests will run before Claude stops

---

### Phase 4: Present

> "Hooks configured in `[settings file]`.
>
> **Active hooks:**
> - [list each hook with what it does]
>
> **How it works:**
> - [Brief explanation of when each hook fires]
>
> **To modify:** Edit `[settings file]` directly, or run `/setup-hooks` again.
> **To disable:** Remove the hooks section from `[settings file]`."

---

## Hard Rules

- Never overwrite existing settings — always merge
- Always use error suppression (|| true, 2>/dev/null) on format commands — a formatter failure should not block work
- Default to `.claude/settings.local.json` unless the user explicitly wants team-shared hooks
- Detect actual project tooling — don't configure Prettier hooks in a Python project
- Keep hooks fast — slow hooks degrade the experience
- Explain what each hook does before applying — no surprise behavior
