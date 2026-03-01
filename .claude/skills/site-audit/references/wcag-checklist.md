# WCAG 2.1 Level AA Accessibility Checklist

> Reference checklist for the `/site-audit` accessibility phase. Organised by WCAG principle. Notes which checks Lighthouse covers automatically vs which need manual inspection.

---

## 1. Perceivable

Content must be presentable in ways users can perceive.

### 1.1 Text Alternatives

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Images have alt text | 1.1.1 | Yes | All `<img>` tags have `alt` attribute | Check all `<img>` elements |
| Alt text is meaningful | 1.1.1 | No | Alt describes image content, not "image.jpg" or "photo" or empty string on content images | Manual review of alt text values |
| Decorative images use empty alt | 1.1.1 | No | Decorative images use `alt=""` or CSS background, not absent alt | Check decorative images specifically |
| Icon buttons have accessible names | 1.1.1 | Yes | Icon-only buttons have `aria-label` or visually-hidden text | Check `<button>` and `<a>` with only icon children |
| Form inputs have labels | 1.1.1 | Yes | Every `<input>`, `<select>`, `<textarea>` has associated `<label>` or `aria-label` | Check form elements |
| SVGs have accessible names | 1.1.1 | Partial | SVGs have `<title>`, `aria-label`, or `role="img" aria-label="..."` | Check inline `<svg>` elements |

### 1.3 Adaptable

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Heading hierarchy is logical | 1.3.1 | Yes | H1 → H2 → H3 without skipping levels | Parse heading tags |
| Lists use proper markup | 1.3.1 | No | Lists use `<ul>`, `<ol>`, `<dl>` — not styled `<div>`s | Check list-like visual patterns |
| Tables have headers | 1.3.1 | Yes | Data tables use `<th>` with `scope` attribute | Check `<table>` elements |
| Landmark regions used | 1.3.1 | Yes | Page uses `<main>`, `<nav>`, `<header>`, `<footer>`, or ARIA landmarks | Check for landmark elements |
| Form fields grouped logically | 1.3.1 | No | Related form fields wrapped in `<fieldset>` with `<legend>` | Check complex forms |

### 1.4 Distinguishable

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Text colour contrast (normal text) | 1.4.3 | Yes | Minimum 4.5:1 contrast ratio for normal text (<18px or <14px bold) | Lighthouse or computed style analysis |
| Text colour contrast (large text) | 1.4.3 | Yes | Minimum 3:1 contrast ratio for large text (>=18px or >=14px bold) | Lighthouse or computed style analysis |
| UI component contrast | 1.4.11 | Partial | Interactive components and borders have minimum 3:1 contrast against background | Check buttons, inputs, links |
| Text resize up to 200% | 1.4.4 | No | Content readable and functional at 200% browser zoom, no horizontal scroll | Puppeteer screenshot at 200% zoom |
| Images of text avoided | 1.4.5 | No | Real text used instead of images of text (except logos) | Manual review |
| Reflow at 320px width | 1.4.10 | No | Content reflows without horizontal scrolling at 320px CSS width (1280px at 400%) | Puppeteer screenshot at 320px viewport |
| Text spacing adjustable | 1.4.12 | No | Content remains readable with increased line-height (1.5x), letter spacing (0.12em), word spacing (0.16em) | Manual or Puppeteer test with custom styles |

---

## 2. Operable

UI components and navigation must be operable.

### 2.1 Keyboard Accessible

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| All interactive elements keyboard accessible | 2.1.1 | Partial | Every link, button, input, and custom control reachable via Tab and activatable via Enter/Space | Puppeteer tab-through or manual check |
| No keyboard traps | 2.1.2 | No | Focus can move away from every element using standard keys (Tab, Shift+Tab, Escape) | Manual check — especially modals and dropdowns |
| Skip navigation link | 2.4.1 | Yes | "Skip to main content" link as first focusable element | Check first interactive element on page |
| Custom keyboard shortcuts documented | 2.1.4 | No | If custom shortcuts exist, they can be turned off or remapped | Check for keydown event listeners |

### 2.4 Navigable

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Page has descriptive title | 2.4.2 | Yes | `<title>` describes page content and purpose | Check `<title>` tag |
| Focus order is logical | 2.4.3 | No | Tab order follows visual reading order (left-to-right, top-to-bottom) | Tab through page, verify order matches visual layout |
| Link purpose clear from text | 2.4.4 | Yes | Link text describes destination — not "click here", "read more", "link" | Check `<a>` text content |
| Multiple ways to find pages | 2.4.5 | No | Site provides at least 2 of: navigation, search, sitemap | Check for nav, search input, sitemap link |
| Headings are descriptive | 2.4.6 | No | Headings describe the content that follows | Manual review of heading text |
| Focus visible | 2.4.7 | No | Focused elements have a visible focus indicator (outline, ring, etc.) | Tab through page, check for visible focus styles |
| Focus indicator contrast | 2.4.11 | No | Focus indicator has minimum 3:1 contrast, at least 2px thick | Inspect focus styles via computed styles |

### 2.5 Input Modalities

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Target size minimum 24x24px | 2.5.8 | No | Interactive targets at least 24x24 CSS pixels (44x44 recommended) | Check button/link computed sizes |
| No motion-activated functions without alternative | 2.5.4 | No | If shake/tilt triggers actions, a UI control alternative exists | Manual check |

---

## 3. Understandable

Content and UI must be understandable.

### 3.1 Readable

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Page language declared | 3.1.1 | Yes | `<html lang="en">` (or correct language code) present | Check `<html>` element |
| Language of parts | 3.1.2 | No | Content in a different language uses `lang` attribute on containing element | Check for multilingual content |

### 3.2 Predictable

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| No unexpected context changes on focus | 3.2.1 | No | Focusing an element doesn't automatically navigate, submit, or open popups | Manual check |
| No unexpected context changes on input | 3.2.2 | No | Changing a form value doesn't automatically submit or navigate | Manual check of select/radio/checkbox elements |
| Consistent navigation | 3.2.3 | No | Navigation appears in same order across pages | Compare navigation across multiple pages |

### 3.3 Input Assistance

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Error identification | 3.3.1 | No | Form errors identified in text (not just colour) and describe what's wrong | Test form submission with invalid data |
| Labels or instructions for inputs | 3.3.2 | Yes | Inputs have visible labels or instructions | Check form fields |
| Error suggestions | 3.3.3 | No | When errors are detected, suggest corrections if possible | Test form validation messages |
| Error prevention on important submissions | 3.3.4 | No | Submissions of legal/financial data are reversible, verified, or confirmed | Check checkout/payment/legal forms |

---

## 4. Robust

Content must be robust enough for assistive technologies.

### 4.1 Compatible

| Check | WCAG Ref | Lighthouse? | Pass Criteria | Method |
|-------|----------|-------------|--------------|--------|
| Valid HTML | 4.1.1 | Partial | No duplicate IDs, proper nesting, elements properly closed | HTML validation |
| ARIA roles used correctly | 4.1.2 | Yes | ARIA roles match element purpose, required ARIA attributes present | Lighthouse ARIA audit |
| Custom components have accessible names | 4.1.2 | Yes | Custom interactive components have `aria-label`, `aria-labelledby`, or visible label | Check custom components |
| Status messages announced | 4.1.3 | No | Dynamic status messages use `role="status"`, `role="alert"`, or `aria-live` | Check toast notifications, loading indicators, form feedback |

---

## Scoring Guide

Map findings to the A-F grading system:

| Grade | Criteria |
|-------|---------|
| **A** (90-100) | All automated Lighthouse checks pass, focus visible, keyboard navigable, no contrast issues, proper landmarks and headings |
| **B** (75-89) | Minor issues — some missing ARIA labels, a few contrast near-misses, minor heading hierarchy gaps |
| **C** (60-74) | Notable issues — missing form labels, several contrast failures, no skip link, some keyboard traps |
| **D** (40-59) | Significant issues — many images without alt, major contrast failures, forms unusable by keyboard |
| **F** (0-39) | Fundamental failures — no lang attribute, no heading structure, custom controls not keyboard accessible, site largely unusable with assistive tech |

---

## Legal Context (for client reports)

- **UK:** Equality Act 2010 — public sector websites must meet WCAG 2.1 AA; private sector expected to make "reasonable adjustments"
- **EU:** European Accessibility Act (2025) — applies to private sector e-commerce and digital services
- **US:** ADA Title III — courts increasingly interpret to include websites; WCAG 2.1 AA as de facto standard
- **Client framing:** "Accessibility compliance reduces legal risk and expands your potential audience by ~15-20% (users with disabilities)"
