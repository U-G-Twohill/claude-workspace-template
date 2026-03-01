# Deploy Draft

> Deploy static sites to Netlify preview URLs for client review.

## Variables

action: $ARGUMENTS (optional — "draft" (default), "prod", "status", "setup", or a custom deploy message. Default: "draft")

## Instructions

You are deploying a static site to Netlify. Follow the phases below in order, adapting to the current project state.

**Important:** Always confirm destructive or public-facing actions (like production deploys) with the user before proceeding.

---

### Phase 1: Parse Arguments

Parse `$ARGUMENTS` to determine the action and optional message:

- No arguments → action is `draft`
- `prod` → action is `prod`
- `status` → action is `status`
- `setup` → action is `setup`
- Anything else → action is `draft`, use the argument as the deploy message

---

### Phase 2: Prerequisites Check

1. **Check if `netlify-cli` is available:**
   - Run: `npx netlify-cli --version`
   - If it fails: install it with `npm install -g netlify-cli`, then verify again
   - If npm is not available: stop and tell the user to install Node.js

2. **Check if the user is logged in:**
   - Run: `npx netlify-cli status`
   - If not logged in: tell the user to run `npx netlify-cli login` in their terminal (this requires a browser interaction that cannot be done inside Claude Code), then retry

---

### Phase 3: Project Detection

1. **Check if the project is already linked to a Netlify site:**
   - Check if `.netlify/state.json` exists
   - If it exists, read it to get the site ID — the project is linked
   - If not linked and action is NOT `setup`: proceed to Phase 4 (Setup Flow)
   - If not linked and action is `status`: tell the user no site is linked and suggest running `/deploy-draft setup`

2. **Detect the deploy directory:**
   - Check `package.json` for a `build` script
   - If build script exists: the deploy dir is likely `dist/` or `build/` — check which exists, or ask the user
   - If no build script: the deploy dir is `.` (current directory)
   - Ask the user to confirm the deploy directory

3. **If a build script exists:** ask the user if they want to run the build first before deploying

---

### Phase 4: Setup Flow

**Runs if the project is not linked to a Netlify site, or if the action is `setup`.**

1. Ask the user for a site name (suggest a default based on the directory name, lowercase with hyphens)

2. Create the site:
   ```
   npx netlify-cli api createSite --data '{"body": {"name": "<site-name>"}}'
   ```

3. Extract the site ID from the response

4. Link the project to the site:
   ```
   npx netlify-cli link --id <site-id>
   ```

5. Add `.netlify/` to `.gitignore` if not already present:
   - Check if `.gitignore` exists and contains `.netlify`
   - If not: append `.netlify/` to `.gitignore`

6. Confirm the setup is complete, then continue to deploy if the original action was `draft` or `prod`

---

### Phase 5: Deploy

**Skip if action is `status` or `setup` (and setup just completed without a pending deploy).**

Determine the deploy message:
- If the user provided a custom message in the arguments: use that
- If no message: use "Draft deploy from Claude Code" for drafts, or "Production deploy from Claude Code" for prod

Execute the deploy:

- **Draft deploy** (action is `draft`):
  ```
  npx netlify-cli deploy --dir=<deploy-dir> --message="<message>"
  ```

- **Production deploy** (action is `prod`):
  - Confirm with the user: "This will deploy to the live production URL. Proceed?"
  - If confirmed:
  ```
  npx netlify-cli deploy --dir=<deploy-dir> --prod --message="<message>"
  ```

- **Status check** (action is `status`):
  ```
  npx netlify-cli status
  ```
  Display the site name, URL, and admin URL.

---

### Phase 6: Output

After a successful deploy, present the results clearly:

**For draft deploys:**
```
Deploy complete!

  Preview URL:  <draft-url>
  Site:         <site-name>

Share this preview URL with your client for review.
Draft URLs persist for ~90 days.
```

**For production deploys:**
```
Deploy complete!

  Live URL:     <production-url>
  Site:         <site-name>

Site is live at the URL above.
```

**For status checks:**
```
Site: <site-name>
URL:  <production-url>
Admin: <admin-url>
```

If the deploy fails, show the error output and suggest common fixes (wrong deploy directory, not logged in, site name taken).
