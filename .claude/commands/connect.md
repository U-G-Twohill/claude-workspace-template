# Connect

> Set up MCP server integrations to connect Claude Code with external services — databases, APIs, design tools, and communication platforms.

## Variables

service: $ARGUMENTS (optional — a specific service name like "slack", "figma", "github", "postgres", or "list" to see available integrations. Default: interactive selection)

## Instructions

You are helping the user connect Claude Code to external services via MCP (Model Context Protocol) servers. This enables Claude to interact directly with databases, design tools, communication platforms, and other services during sessions.

---

### Phase 1: Current State

1. **Check existing MCP configuration:**
   - Run `claude mcp list` to see currently configured MCP servers
   - Check for `.mcp.json` in the project root (project-level MCP config)
   - Check `~/.claude/settings.json` for user-level MCP servers

2. **If argument is "list":** Display available integrations and exit (see Phase 2)

3. **If a specific service is named:** Jump to Phase 3 for that service

4. **If no arguments:** Ask the user what they want to connect to

---

### Phase 2: Available Integrations

Present the user with available MCP integrations organized by category:

**Communication & Collaboration:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| Slack | Search channels, send messages, manage threads | Medium (OAuth) |
| Gmail | Read/draft emails, manage inbox | Medium (OAuth) |
| Notion | Query/update pages and databases | Low (API key) |

**Design & Creative:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| Figma | Read design files, extract tokens and styles | Low (API key) |

**Development & DevOps:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| GitHub | PRs, issues, repo data (beyond basic git) | Low (OAuth) |
| Sentry | Error monitoring, stack trace analysis | Low (API key) |
| Linear | Issue tracking, project management | Low (API key) |

**Databases:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| PostgreSQL | Query databases, explore schemas | Low (connection string) |
| SQLite | Query local databases | Low (file path) |
| Supabase | Full backend access | Low (API key) |

**Business Tools:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| Stripe | Billing data, subscription management | Low (API key) |
| Google Sheets | Read/write spreadsheet data | Medium (OAuth) |

**Meta-Connectors:**
| Service | What It Enables | Setup Complexity |
|---------|----------------|-----------------|
| Composio | Connect to 100+ services with managed auth | Low (API key) |

---

### Phase 3: Setup Guide

For the requested service, walk through the setup:

**General pattern:**

1. **Get credentials:**
   - API key: direct the user to the service's settings page
   - OAuth: explain the browser-based auth flow
   - Connection string: help construct it from their details

2. **Determine scope:**
   - Ask if this should be project-level (`.mcp.json`, shared with team) or user-level (`~/.claude/settings.json`, personal)
   - Project-level is better for team tools (GitHub, Sentry)
   - User-level is better for personal tools (Gmail, Slack)

3. **Install the MCP server:**

   For npm-based MCP servers:
   ```bash
   claude mcp add --transport stdio <name> -- npx <package> [args]
   ```

   For HTTP-based MCP servers:
   ```bash
   claude mcp add --transport http <name> <url>
   ```

   For servers requiring OAuth:
   ```bash
   claude mcp add --transport http <name> <url>
   # Then use /mcp in Claude Code to complete the OAuth flow
   ```

4. **Verify the connection:**
   ```bash
   claude mcp list
   ```
   Confirm the server appears and test with a simple query.

**Service-Specific Instructions:**

**PostgreSQL:**
```bash
claude mcp add --transport stdio postgres -- npx @modelcontextprotocol/server-postgres "postgresql://user:pass@host:5432/dbname"
```
Note: Consider using a read-only user for safety.

**GitHub:**
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```
Then run `/mcp` to complete OAuth.

**Figma:**
```bash
claude mcp add --transport http figma https://figma.com/mcp/
```
Requires a Figma API key in environment.

**Slack:**
Requires creating a Slack app with appropriate scopes. Walk the user through:
1. Create app at api.slack.com
2. Add required OAuth scopes
3. Install to workspace
4. Add the MCP server with the bot token

---

### Phase 4: Verify & Document

1. **Test the connection** with a simple operation
2. **Document the integration** — add a note to `./CLAUDE.md` or `./context/` about what MCP servers are available in this project
3. **Security reminder:** Never commit API keys or connection strings to git. Use environment variables.

> "MCP server `[name]` configured at [scope] level.
>
> **Connected to:** [service]
> **Scope:** [project / user]
> **What you can now do:** [brief capability description]
>
> Try it: [example prompt that uses the new integration]"

---

## Hard Rules

- Never store credentials in configuration files — use environment variables
- Always suggest read-only access for databases unless the user specifically needs write access
- Warn about rate limits for services that have them
- Recommend project-level config for team tools, user-level for personal tools
- Test the connection before declaring success
- Document new integrations in the project's CLAUDE.md
