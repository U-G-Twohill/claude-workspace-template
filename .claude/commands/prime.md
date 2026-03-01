# Prime

> Execute the following sections to understand the workspace then summarize your understanding.

## Run

ls -la
find . -type f -name "*.md" -not -path "./.git/*" | head -30
ls ./plans/ 2>/dev/null | head -10

## Read

CLAUDE.md
./context

## Summary

After reading, provide:

1. A brief summary of who I am, what this workspace is for and what your role is
2. Your understanding of the workspace structure and the purpose of each section/file
3. What commands are available (check both `./.claude/commands/` and note that user-level commands from `~/.claude/commands/` are also available)
4. A summary of my/our current strategies and priorities
5. Any active plans in `./plans/` worth noting
6. Confirmation you're ready to help me with pursuing these goals through use of this workspace

If any context files are missing or unfilled (still contain template placeholders), note this and suggest running `/discover` to audit the project for undocumented context.
