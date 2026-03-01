# Getting Started

> The complete walkthrough for using the Claude Workspace Toolkit — from installation to a production-ready project.

Pick your path:

- **[Path A: New Project](#path-a-new-project-build-from-scratch)** — You're starting fresh and want to build something from the ground up.
- **[Path B: Existing Project](#path-b-existing-project-bring-up-to-scratch)** — You have a codebase and want to improve, harden, and iterate it to perfection.

Both paths start with the same one-time setup, then diverge.

---

## One-Time Setup (Both Paths)

### 1. Install the Toolkit

This installs universal commands to `~/.claude/commands/` — available in every project, every session. You only do this once (and again when commands are updated).

```bash
bash /path/to/claude-workspace-template/scripts/install-toolkit.sh
```

It will show you what's being installed and offer to add a `claude-toolkit` alias for easy re-runs.

**What this installs (7 commands):**

| Command | What It Does |
|---------|-------------|
| `/prime` | Loads project context at session start |
| `/discover` | Finds undocumented context in your codebase |
| `/scope` | Guides you from idea to buildable scope |
| `/create-plan` | Creates detailed implementation plans |
| `/implement` | Executes plans step by step |
| `/sync-toolkit` | Syncs command improvements between projects |
| `/harden` | Finds bugs, security issues, edge cases |

### 2. Set Up Shell Aliases (Optional but Recommended)

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
alias cs='claude "/prime"'                    # Quick session start
alias cr='claude --dangerously-skip-permissions "/prime"'  # Auto-approve mode
alias claude-toolkit='bash "/path/to/claude-workspace-template/scripts/install-toolkit.sh"'
alias claude-init='bash "/path/to/claude-workspace-template/scripts/install.sh"'
```

Replace `/path/to/claude-workspace-template` with the actual path to this repo.

---

## Path A: New Project (Build from Scratch)

**You have an idea but no code yet.** This path takes you from an empty directory to a working, hardened project.

### Step 1: Scaffold the Project

```bash
bash /path/to/claude-workspace-template/scripts/install.sh ~/my-new-project
# or with alias: claude-init ~/my-new-project
```

This creates the workspace structure: `CLAUDE.md`, `context/` templates, `plans/`, `outputs/`, and skills.

### Step 2: Fill In Your Context

Open `~/my-new-project/context/` and fill in these files — this is how Claude understands you and your project:

| File | What to Write |
|------|--------------|
| `personal-info.md` | Your role, background, how you work |
| `business-info.md` | What this project is for, who it serves |
| `strategy.md` | Current priorities, what success looks like |
| `current-data.md` | Any starting metrics, constraints, or data |

**Tip:** You don't need to fill everything in perfectly. Write what you know now — Claude will help refine it.

### Step 3: Start a Session

```bash
cd ~/my-new-project
claude
```

Then in Claude:
```
/prime
```

Claude reads your context and confirms it understands who you are and what you're building. This is your starting point for every session.

### Step 4: Define Your Scope

```
/scope
```

This starts a conversation where Claude helps you:
1. Clarify what you're building
2. Define the boundaries (what's in, what's out)
3. Break it into buildable pieces
4. Produce a scope document in `plans/`

**What to expect:** Claude will ask you questions. Answer honestly — vague answers lead to vague scope. The output is a scope document that feeds directly into planning.

### Step 5: Plan the First Implementation

```
/create-plan [describe what to build first]
```

For example:
```
/create-plan build the initial project structure and core API endpoints from the scope document
```

Claude reads your scope, studies the codebase (if any exists yet), and produces a detailed plan in `plans/` with:
- Every file to create or modify
- Step-by-step tasks in execution order
- Design decisions and rationale
- Validation checklist

**Review the plan before proceeding.** This is your chance to steer the direction.

### Step 6: Build It

```
/implement plans/YYYY-MM-DD-your-plan.md
```

Claude executes the plan step by step — creating files, writing code, validating as it goes. When done, it reports what was built and any deviations.

### Step 7: Harden It

Once you have working code:

```
/harden
```

This systematically tries to break your project:
- Security vulnerabilities (OWASP top 10)
- Functional bugs and logic errors
- Edge cases and boundary conditions
- Performance bottlenecks
- Data validation holes

**Output:** A severity-ranked report in `outputs/harden-report-YYYY-MM-DD.md` plus a knowledge base at `outputs/harden-knowledge.md` that makes every future audit smarter.

### Step 8: Fix What's Broken

Review the harden report, then:

```
/create-plan fix critical and high findings from harden report
```

Then:

```
/implement plans/YYYY-MM-DD-fix-plan.md
```

### Step 9: Harden Again

```
/harden
```

The cycle repeats: find issues → plan fixes → implement → verify. Each round should find fewer issues. When the report comes back clean (or only low-severity items remain), your project is production-ready.

### Step 10: Continue Building

For each new feature or change:
1. `/create-plan [what you want to add]`
2. `/implement plans/...`
3. `/harden` to verify nothing broke

---

## Path B: Existing Project (Bring Up to Scratch)

**You have a codebase that needs improvement.** This path discovers what's there, finds what's wrong, and systematically fixes it.

### Step 1: Scaffold the Workspace

```bash
bash /path/to/claude-workspace-template/scripts/install.sh ~/my-existing-project
# or with alias: claude-init ~/my-existing-project
```

This adds the workspace structure alongside your existing code. It won't overwrite files — if `CLAUDE.md` already exists, it will warn you and ask.

### Step 2: Fill In Your Context

Open `~/my-existing-project/context/` and fill in the templates (see [Path A Step 2](#step-2-fill-in-your-context) for details).

**For existing projects, also update `CLAUDE.md`** with what you know about the project: tech stack, architecture decisions, key files, deployment process. The more Claude knows, the better it can audit.

### Step 3: Start a Session and Prime

```bash
cd ~/my-existing-project
claude
```

Then:
```
/prime
```

### Step 4: Discover Hidden Context

This is the critical step that Path A doesn't need. Your codebase has knowledge that isn't documented anywhere — patterns, conventions, config, dependencies. Discover finds it.

```
/discover
```

Claude will:
1. Scan your entire codebase
2. Identify architecture patterns, frameworks, and conventions
3. Find configuration, environment variables, and dependencies
4. Compare what it found vs what's documented
5. Produce a gap analysis
6. Offer to update your docs with the findings

**Accept the doc updates.** This gives Claude (and you) a much better understanding of the project for everything that follows.

### Step 5: Harden — Find Everything Wrong

Now that Claude understands the project, unleash the hardening audit:

```
/harden
```

For a large codebase, you might want to focus on one area first:

```
/harden security        # Security vulnerabilities first
/harden bugs            # Functional bugs
/harden edge-cases      # Boundary conditions and unusual inputs
/harden performance     # Bottlenecks and scalability issues
/harden validation      # Input validation holes
```

**Output:** A comprehensive report in `outputs/harden-report-YYYY-MM-DD.md` ranking every finding by severity (Critical → High → Medium → Low).

**Important:** The report includes a **Functionality Impact Assessment** — fixes that would change how the app currently behaves. These need your explicit approval before proceeding.

### Step 6: Plan the Fixes

Review the report, then plan fixes by priority:

```
/create-plan fix critical and high findings from harden report YYYY-MM-DD
```

Claude reads the harden report and creates a plan that addresses the most important issues first.

### Step 7: Implement the Fixes

```
/implement plans/YYYY-MM-DD-fix-plan.md
```

### Step 8: Verify — Harden Again

```
/harden
```

This time the report will:
- Show which previous findings are now **resolved**
- Flag any **regressions** (new issues introduced by fixes)
- Surface **remaining issues** not yet addressed
- Update the knowledge base with lessons learned

### Step 9: Repeat Until Clean

Continue the loop:

```
/harden → /create-plan → /implement → /harden
```

Each cycle should find fewer issues. The knowledge base (`outputs/harden-knowledge.md`) gets smarter with every run — tracking what works, what doesn't, and what to watch for.

**You're done when:**
- No Critical or High findings remain
- Medium/Low findings are documented and accepted
- The Functionality Impact Assessment is empty or fully approved

### Step 10: Maintain Going Forward

For ongoing development:
1. Start each session with `/prime`
2. Plan changes with `/create-plan`
3. Build with `/implement`
4. Verify with `/harden` after significant changes
5. Use `/discover` periodically to catch undocumented drift

---

## Quick Reference: Which Command When?

| I want to... | Run this |
|--------------|----------|
| Start a session | `/prime` |
| Find hidden context in a codebase | `/discover` |
| Define what to build | `/scope` |
| Plan a change before making it | `/create-plan [description]` |
| Execute a plan | `/implement plans/[file].md` |
| Find bugs, security issues, edge cases | `/harden` |
| Focus on just security issues | `/harden security` |
| Sync improved commands back to toolkit | `/sync-toolkit push` |

---

## The Full Pipeline (Visual)

```
NEW PROJECT:
  /prime → /scope → /create-plan → /implement → /harden
                                                    │
                                        ┌───────────┘
                                        ▼
                                  /create-plan (fixes)
                                        │
                                        ▼
                                   /implement
                                        │
                                        ▼
                                    /harden ──→ clean? ──→ done!
                                        │
                                        └──→ not clean? ──→ loop back


EXISTING PROJECT:
  /prime → /discover → /harden
                          │
              ┌───────────┘
              ▼
        /create-plan (fixes)
              │
              ▼
         /implement
              │
              ▼
          /harden ──→ clean? ──→ done!
              │
              └──→ not clean? ──→ loop back
```

---

## Session Cheat Sheet

**Every session starts the same way:**
```
/prime
```

**Then pick what you need:**
- Building something new? → `/scope` or `/create-plan`
- Auditing an existing project? → `/discover` then `/harden`
- Fixing issues from a harden report? → `/create-plan fix...` then `/implement`
- Verifying fixes worked? → `/harden`

---

## Tips

- **Fill in context files honestly.** Claude calibrates its approach based on what you tell it about yourself and your project. Vague context = vague results.
- **Review plans before implementing.** The `/create-plan` → `/implement` split exists so you can steer before code is written.
- **Run `/harden` after every significant change.** It catches regressions and edge cases you didn't think of.
- **The knowledge base improves over time.** Every `/harden` run makes the next one smarter — don't delete `outputs/harden-knowledge.md`.
- **Use `/discover` on projects you didn't write.** It surfaces patterns and conventions that would take hours to find manually.
- **Start sessions with `/prime`.** It takes seconds and prevents Claude from working with stale context.
