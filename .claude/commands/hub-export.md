# Hub Export

Export the Project Hub portfolio context as MASTER_CONTEXT.md to OneDrive/ClaudeSync/ for upload to Claude.ai Projects.

## Instructions

1. Run the sync command from the project-hub directory:
   ```bash
   cd "D:/Repos/Integrations and Project Management/project-hub" && node src/cli.js export-context --no-open
   ```

2. If the user specifies a custom output path:
   ```bash
   cd "D:/Repos/Integrations and Project Management/project-hub" && node src/cli.js export-context --no-open --output <path>
   ```

3. To include projects with unknown status:
   ```bash
   cd "D:/Repos/Integrations and Project Management/project-hub" && node src/cli.js export-context --no-open --include-unknown
   ```

4. After export, confirm:
   - The file was written to OneDrive/ClaudeSync/MASTER_CONTEXT.md
   - A local copy was also written to project-hub/MASTER_CONTEXT.md
   - How many projects were included
   - Remind the user to upload it to their Claude.ai Project for remote planning context

Note: `--no-open` is used because the browser auto-open is meant for the CLI workflow (`npm run sync`), not for Claude Code sessions.

## Arguments

Optional: a file path for the output. Defaults to OneDrive/ClaudeSync/MASTER_CONTEXT.md + local copy.
