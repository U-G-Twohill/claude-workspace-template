# Hub Keys

Look up API keys and credentials from the Project Hub vault. The hub must be running at localhost:7861.

## Instructions

1. Check hub accessibility: `curl -s http://localhost:7861/api/auth/status`
   - Must return `{"unlocked":true}` — if locked, tell user to unlock via the web dashboard.

2. Based on the user's request:

   **List keys for a project:**
   ```bash
   curl -s "http://localhost:7861/api/keys?project={slug}"
   ```

   **List keys for an integration:**
   ```bash
   curl -s "http://localhost:7861/api/keys?integration={name}"
   ```

   **Export as .env:**
   ```bash
   curl -s "http://localhost:7861/api/keys/export/{slug}"
   ```
   This returns ready-to-use .env content.

   **Decrypt a specific key:**
   ```bash
   curl -s "http://localhost:7861/api/keys/{id}/decrypt"
   ```

3. **Auto-detect:** If no arguments, try to detect the current project from the working directory (same method as hub-projects) and list its keys.

4. **Security:** Never log or display decrypted key values in conversation history unless the user explicitly asks to reveal a specific key. Default to showing key names, environments, and integrations only.

5. Present key listings in a clean table format.

## Arguments

Optional: project name/slug, integration name, or `export {slug}` to get .env format.
