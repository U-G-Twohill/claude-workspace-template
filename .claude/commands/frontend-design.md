# Frontend Design

> Build frontend UI from reference images or from scratch with high design craft, using screenshot-driven comparison to match references pixel-perfectly.

## Variables

reference: $ARGUMENTS (optional — path to a reference image to match, or omit to design from scratch)

## Instructions

You are building frontend UI with a screenshot-driven workflow. If a reference image is provided, your goal is to match it exactly. If no reference is provided, design from scratch with high craft. Either way, you will screenshot your output and compare iteratively.

**Important:** This command builds and iterates. It does NOT modify existing application logic — only frontend UI code.

---

### Phase 1: Setup Check

Before building anything, verify the tooling is in place.

**1a. Puppeteer**

Check if Puppeteer is available:

```bash
node -e "require('puppeteer')" 2>/dev/null && echo "OK" || echo "MISSING"
```

If missing, install it:

```bash
npm install puppeteer
```

If there's no `package.json` in the project root, run `npm init -y` first.

**1b. Screenshot script**

Check if `screenshot.mjs` exists in the project root. If not, create it with this content:

```javascript
import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir = './screenshots';

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const existing = readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const next = existing.length + 1;
const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
await page.screenshot({ path: join(dir, filename), fullPage: true });
await browser.close();

console.log(`Saved: ${join(dir, filename)}`);
```

**1c. Dev server**

Determine how to serve the project locally:

1. Check for existing dev server scripts in `package.json` (look for `dev`, `start`, `serve` scripts that use vite, next, webpack, etc.)
2. If an existing dev server is found, use that — note the command and port
3. If no dev server exists, check if `serve.mjs` exists in the project root. If not, create it:

```javascript
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const PORT = 3000;
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

createServer((req, res) => {
  let filePath = join('.', req.url === '/' ? 'index.html' : req.url);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(PORT, () => console.log(`Serving at http://localhost:${PORT}`));
```

**1d. Brand assets**

Check if a `brand_assets/` folder exists in the project root. If it does, read its contents — logos, colour guides, style guides, images. These must be used where applicable (no placeholders where real assets exist).

**1e. Screenshots directory**

Ensure `./screenshots/` directory exists. Create if not.

---

### Phase 2: Project Detection

Understand the project's frontend conventions before writing code.

1. **CSS approach:** Check for Tailwind config, CSS modules, SCSS files, styled-components, CSS-in-JS, or vanilla CSS. Match whatever the project uses. If no existing CSS approach (brand new project), use Tailwind via CDN as default.
2. **Framework:** Check for React, Vue, Svelte, Next.js, Nuxt, Astro, plain HTML, etc. Match the project's framework.
3. **Component patterns:** Look at existing components for naming conventions, file structure, and style patterns. Follow them.
4. **Output format:** If the project has existing pages, match the file structure. If it's a fresh project with no framework, default to a single `index.html` with inline styles.

Summarise: "This project uses [framework] with [CSS approach]. Output will follow [pattern]."

---

### Phase 3: Reference Analysis

**If a reference image was provided:**

Read the reference image and analyse it thoroughly:

- **Layout:** Grid structure, column count, section arrangement, content hierarchy
- **Spacing:** Padding, margins, gaps between elements (estimate in px)
- **Typography:** Font sizes, weights, line-heights, letter-spacing, font families (serif vs sans vs monospace)
- **Colours:** Extract exact hex values for backgrounds, text, accents, borders
- **Components:** Identify cards, buttons, nav elements, forms, heroes, footers, etc.
- **Interactive elements:** Buttons, links, inputs — note their styling
- **Images:** Sizes, aspect ratios, treatments (rounded, shadowed, overlaid)
- **Responsive hints:** Any clues about how it adapts to different widths

Produce a brief breakdown: "The reference shows [layout description] with [key components]. Primary colour is [hex], typography appears to be [font details]."

**If no reference was provided:**

Note that you're designing from scratch. Ask the user what they want to build if not already clear from prior conversation. The Design Guardrails in Phase 4 apply fully.

---

### Phase 4: Build

Implement the frontend code matching the project's conventions (from Phase 2).

**If matching a reference:**
- Reproduce the layout, spacing, typography, and colours as precisely as possible
- Swap in placeholder content where needed — images via `https://placehold.co/WIDTHxHEIGHT`, generic copy
- Do NOT add sections, features, or content not in the reference
- Do NOT "improve" the reference design — match it

**If designing from scratch, apply these Design Guardrails:**

- **Colours:** Never use default framework palette colours (e.g., Tailwind's indigo-500, blue-600). Pick a custom brand colour and derive a palette from it. If brand assets define colours, use those exact values.
- **Shadows:** Never use flat single-layer shadows. Use layered, colour-tinted shadows with low opacity for depth.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans-serif. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body text.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth where appropriate.
- **Animations:** Only animate `transform` and `opacity`. Never use `transition-all`. Use spring-style easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Interactive states:** Every clickable element needs `hover`, `focus-visible`, and `active` states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and consider a colour treatment layer with `mix-blend-multiply` where appropriate.
- **Spacing:** Use intentional, consistent spacing tokens — not random values. Establish a scale and stick to it.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

**Always:**
- Mobile-first responsive design
- Semantic HTML
- Accessible markup (alt text, aria labels, keyboard navigable)
- Placeholder images via `https://placehold.co/WIDTHxHEIGHT` unless real assets are available in `brand_assets/`

---

### Phase 5: Screenshot & Compare

**5a. Start the dev server**

Start the dev server in the background (use the existing project dev server or `serve.mjs`):

```bash
node serve.mjs &
```

If the server is already running, do not start a second instance. Check first:

```bash
curl -s http://localhost:3000 > /dev/null 2>&1 && echo "RUNNING" || echo "NOT RUNNING"
```

Adjust the port if the project uses a different one.

**5b. Take a screenshot**

```bash
node screenshot.mjs http://localhost:3000
```

Optional label: `node screenshot.mjs http://localhost:3000 initial`

**5c. Read and compare**

Read the saved screenshot PNG from `./screenshots/` using the Read tool — you can see and analyse the image directly.

**If matching a reference:**

Compare your output against the reference image. Be specific about every mismatch:
- "Heading appears to be ~32px but reference shows ~24px"
- "Card gap is ~16px but should be ~24px"
- "Background colour is #f5f5f5 but reference shows #fafafa"
- "Border radius on buttons is 4px but reference shows 8px"
- "Logo is missing from the header"

Check all of these:
- Spacing and padding
- Font size, weight, line-height
- Colours (exact hex match)
- Alignment and positioning
- Border radius
- Shadows
- Image sizing and aspect ratios
- Overall layout proportions

**If designing from scratch:**

Evaluate against the Design Guardrails. Check for:
- Generic/default-looking elements that need more craft
- Inconsistent spacing
- Missing interactive states
- Flat depth (everything on same plane)
- Default framework colours that slipped through

---

### Phase 6: Iterate

**Minimum 2 comparison rounds required.** Do not stop after the first screenshot.

1. Fix every mismatch identified in Phase 5
2. Take a new screenshot with a descriptive label:
   ```bash
   node screenshot.mjs http://localhost:3000 round-2
   ```
3. Read the new screenshot and compare again
4. Repeat until:
   - **Reference matching:** No visible differences remain between output and reference
   - **From scratch:** Design passes all guardrail checks
   - **Or:** User says to stop

After each round, summarise what was fixed and what remains.

When satisfied (or after user approval), present the final state:

> "Final screenshot saved to `./screenshots/screenshot-[N].png`.
> [N] comparison rounds completed.
> [Summary of what was built and any notes about the implementation.]"

---

## Hard Rules

- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it exactly
- Do not stop after one screenshot pass — minimum 2 rounds
- Do not use `transition-all` — only animate `transform` and `opacity`
- Do not use default framework colours (Tailwind blue/indigo, Bootstrap primary, etc.) as primary colour when designing from scratch
- Always serve on localhost — never screenshot a `file:///` URL
- Always use real brand assets from `brand_assets/` when available — don't use placeholders where real assets exist
