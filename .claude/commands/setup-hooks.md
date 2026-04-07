# Setup Hooks

> Configure Claude Code hooks for continuous quality enforcement — auto-formatting, safety guards, quality gates, and environment monitoring.

## Variables

preset: $ARGUMENTS (optional — "quality", "safety", "format", "monitor", "full", or "status". Default: interactive selection)

## Instructions

You are configuring Claude Code hooks for this project. Hooks run automatically at specific lifecycle events — they enforce standards without manual intervention.

**Important:** Hooks are configured in `.claude/settings.local.json` (project-level, not committed) or `.claude/settings.json` (project-level, committed and shared with team). This command helps the user choose and configure the right hooks.

---

### Available Hook Events

Claude Code supports **9 hook events**. Understanding when each fires helps you configure the right hooks:

| Event | Fires When | Common Use |
|---|---|---|
| `PreToolUse` | Before a tool executes | Block dangerous operations, validate inputs |
| `PostToolUse` | After a tool completes | Auto-format edited files, run linters |
| `Stop` | Before Claude stops responding | Run tests, final quality checks |
| `Notification` | When Claude sends a notification | Custom notification routing |
| `CwdChanged` | Working directory changes | Auto-switch context, reload config |
| `FileChanged` | External file change detected | Trigger rebuilds, refresh state |
| `PermissionDenied` | Auto-mode permission denied | Log denials, optionally retry |
| `InstructionsLoaded` | CLAUDE.md or rules loaded | Validate context files are current |
| `TaskCreated` | TaskCreate tool used | Log task creation, trigger notifications |

### Hook Conditional Filtering (`if` field)

Hooks support an `if` field that uses permission-rule syntax to filter when a hook fires. This prevents hooks from running on every tool use — they only fire for matching patterns.

**Example — only run safety check on git commands:**
```json
{
  "matcher": "Bash",
  "if": "Bash(git *)",
  "hooks": [{ "type": "prompt", "prompt": "..." }]
}
```

**Common `if` patterns:**
- `"Bash(rm *)"` — destructive file operations
- `"Bash(git push *)"` — git push operations
- `"Bash(npm publish *)"` — package publishing
- `"Write(*.env*)"` — writing to env files
- `"Edit(*.env*)"` — editing env files
- `"Bash(rm -rf *) || Bash(git push --force *)"` — combine with OR

Without an `if` field, the hook fires for every tool use matching the `matcher`.

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
     - **Safety:** Block dangerous operations with targeted `if` filtering, protect sensitive files
     - **Format:** Auto-format only
     - **Monitor:** Directory and file change notifications
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
        "if": "Bash(rm -rf *) || Bash(git push --force *) || Bash(git reset --hard *) || Bash(git clean -f*) || Bash(drop table *) || Bash(DROP TABLE *)",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "This command may be destructive. Respond {\"decision\": \"block\", \"reason\": \"Destructive operation — requires explicit user approval\"} unless the user explicitly requested this action, in which case respond {\"decision\": \"approve\"}."
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "if": "Write(*.env*) || Edit(*.env*) || Write(*credentials*) || Edit(*credentials*) || Write(*secret*) || Edit(*secret*)",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "This modifies a sensitive file. Respond {\"decision\": \"block\", \"reason\": \"Sensitive file modification — requires explicit user approval\"} unless the user explicitly requested this change, in which case respond {\"decision\": \"approve\"}."
          }
        ]
      }
    ]
  }
}
```

The `if` field ensures these hooks only fire for matching patterns, not on every Bash/Write/Edit call.

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

**Monitor Preset:**

```json
{
  "hooks": {
    "CwdChanged": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[hook] Working directory changed'"
          }
        ]
      }
    ],
    "FileChanged": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[hook] External file change detected'"
          }
        ]
      }
    ]
  }
}
```

**Full Preset:** All of the above combined (format + safety + quality + monitor).

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
   - If monitor hooks were added: explain that notifications will appear on directory/file changes

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
- Use the `if` field for targeted filtering in safety hooks — don't rely solely on LLM prompts to detect patterns
