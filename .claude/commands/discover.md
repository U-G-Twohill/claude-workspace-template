# Discover

> Audit this project for undocumented context — find what's in the code but not in the docs, and surface it.

## Variables

scope: $ARGUMENTS (optional — "full", "code", "config", "deps", or a specific path to focus on. Default: "full")

## Instructions

You are performing a context discovery audit on this project. Your goal is to find important information that exists in the codebase but isn't captured in `./CLAUDE.md`, `./context/`, or other documentation.

### Phase 1: Read Existing Documentation

Read these files to understand what's already documented:

- `./CLAUDE.md` (if it exists)
- All files in `./context/` (if the directory exists)
- Any README.md, CONTRIBUTING.md, or docs/ directory

Build a mental model of what the project documentation currently covers.

### Phase 2: Investigate the Codebase

Systematically search the project for context that should be documented but isn't:

**Architecture & Structure:**
- Scan directory structure for patterns (monorepo, microservices, MVC, etc.)
- Identify key entry points (main files, index files, server files)
- Map dependencies from package files (package.json, requirements.txt, Cargo.toml, go.mod, etc.)
- Identify frameworks and major libraries in use

**Configuration & Environment:**
- Check for config files (.env.example, docker-compose.yml, CI configs)
- Identify environment variables referenced in code
- Look for deployment configurations
- Check for database schemas or migrations

**Patterns & Conventions:**
- Identify coding patterns (naming conventions, file organization)
- Check for testing patterns and test structure
- Look for API patterns (REST, GraphQL, RPC)
- Identify error handling patterns

**Build & Development:**
- Check for build scripts, Makefiles, task runners
- Identify development workflow (build, test, lint, deploy commands)
- Look for development dependencies and tooling

**Hidden Knowledge:**
- Check git history for recent significant changes (last 20 commits)
- Look for TODO/FIXME/HACK comments that indicate known issues
- Identify any hardcoded values that suggest undocumented constraints
- Check for feature flags or conditional logic that implies hidden states

### Phase 3: Gap Analysis

Compare what you found (Phase 2) with what's documented (Phase 1). Identify:

1. **Critical gaps** — Important architectural decisions, dependencies, or patterns that are nowhere in docs
2. **Stale documentation** — Things documented that no longer match the code
3. **Missing context files** — context/ files that should exist but don't (or exist but are unfilled templates)

### Phase 4: Report & Recommend

Present findings as a structured report:

```
## Discovery Report: [Project Name]

### Project Profile
- Type: [web app / CLI / library / API / monorepo / etc.]
- Stack: [languages, frameworks, key dependencies]
- Structure: [architectural pattern]

### Documented vs Actual
| Area | Documented? | Accurate? | Notes |
|------|------------|-----------|-------|
| ...  | ...        | ...       | ...   |

### Critical Gaps Found
1. [Gap] — [Why it matters] — [Suggested fix]
2. ...

### Recommendations
- [ ] [Specific action to take]
- [ ] ...
```

### Phase 5: Offer to Fix (Optional)

After presenting the report, ask the user:

> "Would you like me to update your documentation with these findings? I can:
> 1. Update CLAUDE.md with discovered architecture/patterns
> 2. Fill in context/ templates with what I found
> 3. Create missing documentation
> 4. All of the above
>
> Or you can address specific items manually."

If the user approves, make the updates. Be additive — don't remove existing documentation, enhance it.
