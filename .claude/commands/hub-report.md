# Hub Report

Generate a daily planning report from the Project Hub. The hub must be running at localhost:7861.

## Instructions

1. Check hub accessibility and auth status.

2. Fetch the daily report:
   ```bash
   curl -s "http://localhost:7861/api/reports/daily"
   ```

3. Fetch health scores:
   ```bash
   curl -s "http://localhost:7861/api/reports/health"
   ```

4. Present a formatted daily briefing:

   ### Daily Briefing — {date}

   **Portfolio Health**
   - Show top-line stats: X active projects, Y total tasks, Z% average completion

   **Needs Attention**
   - Projects with health score below 40
   - Projects with blocked tasks
   - Stalled projects (active but no recent work)

   **Active Work**
   - Projects sorted by health score, showing: name, score, in-progress tasks, blocked tasks

   **Recent Completions**
   - Tasks completed in the last 7 days

   **Suggested Focus**
   - Based on the data, suggest 2-3 projects to focus on today with reasoning (lowest health score, most blocked tasks, closest deadlines)

5. Keep the report concise but actionable. Use the health score breakdown to identify specific issues.

## Arguments

None required. Optionally `focus` to get just the suggested focus section.
