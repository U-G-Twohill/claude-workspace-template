# Hub Projects

Query the Project Hub for project information. The hub must be running at localhost:7861.

## Instructions

1. First check if the hub is accessible by running: `curl -s http://localhost:7861/api/auth/status`
   - If it returns `{"unlocked":false}` or fails, tell the user to start the hub (`cd project-hub && npm start`) and unlock it.

2. Based on the user's request, query the appropriate endpoint:

   **List/search projects:**
   ```bash
   curl -s "http://localhost:7861/api/projects?status=active" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const p=JSON.parse(d.join(''));p.forEach(r=>console.log(r.name.padEnd(30),r.status.padEnd(10),r.category.padEnd(15),(r.client||'-').padEnd(20),r.stack||''));console.log('\n'+p.length+' project(s)')})"
   ```
   Supported query params: `status`, `category`, `client`, `integration`, `search`

   **Project detail:**
   ```bash
   curl -s "http://localhost:7861/api/projects/{slug}"
   ```
   Parse the JSON and present: name, status, category, client, stack, description, integrations, task summary (by status), milestones, and recent history.

   **Daily report:**
   ```bash
   curl -s "http://localhost:7861/api/reports/daily"
   ```
   Present a formatted daily briefing with active projects, stalled projects, tasks needing attention, and recent completions.

   **Health scores:**
   ```bash
   curl -s "http://localhost:7861/api/reports/health"
   ```
   Present as a ranked table with project name, score, status, and key concerns.

3. **Auto-detect current project:** Check if the current working directory matches any project's `path` field. Run:
   ```bash
   curl -s "http://localhost:7861/api/projects" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const cwd=process.cwd().replace(/\\\\/g,'/');const p=JSON.parse(d.join('')).find(r=>{const rp=(r.resolved_path||r.path||'').replace(/\\\\/g,'/');return rp&&cwd.startsWith(rp)});if(p)console.log(JSON.stringify(p));else console.log('NO_MATCH')})"
   ```
   If a match is found, show that project's details automatically.

4. Present information in clean, readable format using markdown tables where appropriate.

## Arguments

If no arguments provided, auto-detect current project. Otherwise treat the argument as a project name/slug to look up, or one of: `list`, `active`, `stalled`, `report`, `health`.
