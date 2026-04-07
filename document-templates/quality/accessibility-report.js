// Accessibility Report document template
// Generates a WCAG 2.1 AA compliance report from site audit data or placeholder structure

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const a11yData = options.siteAuditReport || null;

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const siteUrl = params['site-url'] || a11yData?.url || '[SITE URL]';
  const targetLevel = params['target-level'] || 'AA';
  const company = getCompanyInfo(brandConfig || {});

  const totalIssues = a11yData?.totalIssues ?? '[TOTAL]';
  const criticalCount = a11yData?.critical ?? '[COUNT]';
  const majorCount = a11yData?.major ?? '[COUNT]';
  const minorCount = a11yData?.minor ?? '[COUNT]';
  const complianceLevel = a11yData?.complianceLevel || params['compliance-level'] || '[PENDING ASSESSMENT]';

  const sections = [];

  // --- 1. Executive Summary ---
  sections.push(createHeading('Executive Summary', 1));
  sections.push(createParagraph(
    `This report presents the findings of a Web Content Accessibility Guidelines (WCAG) 2.1 Level ${targetLevel} compliance assessment conducted for ${projectName} (${siteUrl}), prepared for ${clientName}.`
  ));

  if (a11yData) {
    sections.push(createParagraph(
      `The assessment identified ${totalIssues} accessibility issues: ${criticalCount} critical, ${majorCount} major, and ${minorCount} minor. The current compliance level is ${complianceLevel}.`
    ));
  } else {
    sections.push(createParagraph(
      `The assessment identified ${totalIssues} accessibility issues across the site. The current compliance level against WCAG 2.1 Level ${targetLevel} is ${complianceLevel}. Detailed findings and prioritised remediation steps are provided in the sections below.`
    ));
  }

  sections.push(createParagraph(
    'Accessibility is both a legal requirement under the New Zealand Human Rights Act 1993 and a best practice that improves usability for all users, including those relying on assistive technologies such as screen readers, keyboard navigation, and voice control.'
  ));

  sections.push(createTable(
    ['Metric', 'Value'],
    [
      ['Target Standard', `WCAG 2.1 Level ${targetLevel}`],
      ['Site URL', siteUrl],
      ['Assessment Date', new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Total Issues Found', String(totalIssues)],
      ['Critical Issues', String(criticalCount)],
      ['Major Issues', String(majorCount)],
      ['Minor Issues', String(minorCount)],
      ['Overall Compliance', complianceLevel],
    ]
  ));

  // --- 2. Methodology ---
  sections.push(createHeading('Methodology', 1));
  sections.push(createParagraph(
    'This assessment used a combination of automated scanning tools and manual testing techniques to evaluate conformance against WCAG 2.1 Level ' + targetLevel + ' success criteria. Automated tools alone cannot detect all accessibility barriers — manual evaluation is essential for criteria that require human judgement.'
  ));

  sections.push(createHeading('Automated Testing', 2));
  const automatedTools = a11yData?.tools || [
    'axe-core — automated accessibility rule engine (Deque Systems)',
    'Google Lighthouse — performance and accessibility scoring',
    'WAVE — web accessibility evaluation tool (WebAIM)',
  ];
  sections.push(createParagraph('The following automated tools were used:'));
  sections.push(...createBulletList(automatedTools));

  sections.push(createHeading('Manual Testing', 2));
  sections.push(createParagraph('Manual testing covered the following techniques:'));
  sections.push(...createBulletList([
    'Keyboard-only navigation — all interactive elements tested for keyboard accessibility and logical focus order',
    'Screen reader testing — content structure, announcements, and interaction patterns verified with NVDA and/or VoiceOver',
    'Browser zoom testing — layout verified at 200% and 400% zoom levels',
    'High contrast mode — content tested with Windows High Contrast Mode and forced colours',
    'Reduced motion — animations and transitions tested with prefers-reduced-motion enabled',
    'Touch target evaluation — interactive elements assessed for minimum 44x44 CSS pixel target size',
  ]));

  if (ctx.framework) {
    sections.push(createHeading('Framework-Specific Considerations', 2));
    const fw = ctx.framework.toLowerCase();
    const a11yHints = [];
    if (fw.includes('react') || fw.includes('next')) a11yHints.push('React/Next.js: Verify correct use of aria-live regions for dynamic content updates, check that client-side routing announces page changes to screen readers');
    if (fw.includes('vue') || fw.includes('nuxt')) a11yHints.push('Vue/Nuxt: Ensure vue-router announces navigation, verify v-if/v-show does not hide content from assistive tech unexpectedly');
    if (fw.includes('astro')) a11yHints.push('Astro: Verify island components handle focus correctly during hydration, ensure interactive islands are keyboard accessible');
    if (fw.includes('svelte')) a11yHints.push('Svelte: Leverage built-in a11y warnings from the compiler, ensure transitions do not break focus management');
    if (a11yHints.length > 0) {
      sections.push(createParagraph(`This project uses ${ctx.framework}. The following framework-specific accessibility areas require attention:`));
      sections.push(...createBulletList(a11yHints));
    } else {
      sections.push(createParagraph(`This project uses ${ctx.framework}. Framework-specific accessibility patterns should be validated alongside standard WCAG criteria.`));
    }
  }

  sections.push(createHeading('Scope', 2));
  const pagesAudited = a11yData?.pagesAudited || params['pages-audited'] || '[LIST OF PAGES/TEMPLATES AUDITED]';
  sections.push(createParagraph(
    `The assessment covered the following pages and templates: ${Array.isArray(pagesAudited) ? pagesAudited.join(', ') : pagesAudited}. Representative templates were selected to maximise coverage of unique components and interaction patterns.`
  ));

  // --- 3. Compliance Summary ---
  sections.push(createHeading('Compliance Summary', 1));
  sections.push(createParagraph(
    'WCAG 2.1 organises success criteria under four principles: Perceivable, Operable, Understandable, and Robust (POUR). The table below summarises compliance status for each principle.'
  ));

  const principleData = a11yData?.principles || {};
  const perceivableStatus = principleData.perceivable || '[PENDING]';
  const operableStatus = principleData.operable || '[PENDING]';
  const understandableStatus = principleData.understandable || '[PENDING]';
  const robustStatus = principleData.robust || '[PENDING]';

  sections.push(createTable(
    ['Principle', 'Description', 'Status', 'Issues Found'],
    [
      ['Perceivable', 'Information and UI components must be presentable in ways users can perceive', perceivableStatus, String(principleData.perceivableIssues ?? '[COUNT]')],
      ['Operable', 'UI components and navigation must be operable by all users', operableStatus, String(principleData.operableIssues ?? '[COUNT]')],
      ['Understandable', 'Information and UI operation must be understandable', understandableStatus, String(principleData.understandableIssues ?? '[COUNT]')],
      ['Robust', 'Content must be robust enough for assistive technologies to interpret', robustStatus, String(principleData.robustIssues ?? '[COUNT]')],
    ]
  ));

  sections.push(createParagraph('Status key: Pass = all criteria met, Partial = some criteria met with non-critical failures, Fail = one or more critical criteria not met.', { italic: true }));

  // --- 4. Findings by Category ---
  sections.push(createHeading('Findings by Category', 1));

  // 4.1 Images & Media
  sections.push(createHeading('Images & Media', 2));
  sections.push(createParagraph('Covers WCAG criteria related to non-text content, including alternative text for images, captions for video/audio, and text alternatives for complex media.'));

  const imageFindings = a11yData?.categories?.imagesMedia || null;
  if (imageFindings) {
    sections.push(createParagraph(`${imageFindings.issueCount} issues identified in this category.`));
    if (imageFindings.items?.length) {
      sections.push(...createBulletList(imageFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '1.1.1 Non-text Content (Level A) — all images have meaningful alt text or are marked as decorative',
      '1.2.1 Audio-only and Video-only (Level A) — transcripts or audio descriptions provided',
      '1.2.2 Captions (Level A) — synchronised captions available for all video with audio',
      '1.2.3 Audio Description or Media Alternative (Level A) — audio descriptions for video content',
      '1.2.5 Audio Description (Level AA) — audio descriptions for prerecorded video',
      '1.4.5 Images of Text (Level AA) — actual text used instead of images of text where possible',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // 4.2 Forms & Input
  sections.push(createHeading('Forms & Input', 2));
  sections.push(createParagraph('Covers form labels, input instructions, error identification, error suggestion, and focus management within forms.'));

  const formFindings = a11yData?.categories?.formsInput || null;
  if (formFindings) {
    sections.push(createParagraph(`${formFindings.issueCount} issues identified in this category.`));
    if (formFindings.items?.length) {
      sections.push(...createBulletList(formFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '1.3.1 Info and Relationships (Level A) — form labels programmatically associated with inputs',
      '2.4.7 Focus Visible (Level AA) — visible focus indicator on all form controls',
      '3.2.2 On Input (Level A) — no unexpected context changes on input',
      '3.3.1 Error Identification (Level A) — errors detected and described in text',
      '3.3.2 Labels or Instructions (Level A) — labels or instructions provided for user input',
      '3.3.3 Error Suggestion (Level AA) — error messages include suggestions for correction',
      '3.3.4 Error Prevention (Level AA) — reversible, checked, or confirmed submissions for legal/financial data',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // 4.3 Navigation
  sections.push(createHeading('Navigation', 2));
  sections.push(createParagraph('Covers keyboard accessibility, skip navigation links, focus order, and consistent navigation patterns.'));

  const navFindings = a11yData?.categories?.navigation || null;
  if (navFindings) {
    sections.push(createParagraph(`${navFindings.issueCount} issues identified in this category.`));
    if (navFindings.items?.length) {
      sections.push(...createBulletList(navFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '2.1.1 Keyboard (Level A) — all functionality operable via keyboard',
      '2.1.2 No Keyboard Trap (Level A) — focus can always be moved away from any component',
      '2.4.1 Bypass Blocks (Level A) — skip navigation link provided to bypass repeated content',
      '2.4.3 Focus Order (Level A) — focus order preserves meaning and operability',
      '2.4.5 Multiple Ways (Level AA) — multiple ways to locate pages within a site',
      '2.4.7 Focus Visible (Level AA) — visible focus indicator on all interactive elements',
      '3.2.3 Consistent Navigation (Level AA) — navigation mechanisms consistent across pages',
      '3.2.4 Consistent Identification (Level AA) — components with same functionality identified consistently',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // 4.4 Color & Contrast
  sections.push(createHeading('Color & Contrast', 2));
  sections.push(createParagraph('Covers colour contrast ratios, use of colour as the sole means of conveying information, and visual presentation requirements.'));

  const colorFindings = a11yData?.categories?.colorContrast || null;
  if (colorFindings) {
    sections.push(createParagraph(`${colorFindings.issueCount} issues identified in this category.`));
    if (colorFindings.items?.length) {
      sections.push(...createBulletList(colorFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '1.4.1 Use of Color (Level A) — colour is not the only visual means of conveying information',
      '1.4.3 Contrast (Minimum) (Level AA) — text has a contrast ratio of at least 4.5:1 (3:1 for large text)',
      '1.4.11 Non-text Contrast (Level AA) — UI components and graphical objects have at least 3:1 contrast ratio',
      '1.4.4 Resize Text (Level AA) — text can be resized up to 200% without loss of content or functionality',
      '1.4.10 Reflow (Level AA) — content reflows at 320px width without horizontal scrolling',
      '1.4.12 Text Spacing (Level AA) — no loss of content when text spacing is overridden',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // 4.5 Content Structure
  sections.push(createHeading('Content Structure', 2));
  sections.push(createParagraph('Covers heading hierarchy, landmark regions, ARIA usage, page titles, and semantic HTML structure.'));

  const structureFindings = a11yData?.categories?.contentStructure || null;
  if (structureFindings) {
    sections.push(createParagraph(`${structureFindings.issueCount} issues identified in this category.`));
    if (structureFindings.items?.length) {
      sections.push(...createBulletList(structureFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '1.3.1 Info and Relationships (Level A) — heading hierarchy is logical and sequential (no skipped levels)',
      '1.3.2 Meaningful Sequence (Level A) — reading order matches visual presentation order',
      '2.4.2 Page Titled (Level A) — pages have descriptive, unique titles',
      '2.4.6 Headings and Labels (Level AA) — headings and labels describe topic or purpose',
      '4.1.1 Parsing (Level A) — HTML is well-formed with no duplicate IDs',
      '4.1.2 Name, Role, Value (Level A) — custom components expose correct name, role, and state via ARIA',
      'Landmark regions (banner, navigation, main, contentinfo) present and correctly applied',
      'ARIA attributes used correctly — no invalid roles, states, or properties',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // 4.6 Dynamic Content
  sections.push(createHeading('Dynamic Content', 2));
  sections.push(createParagraph('Covers live regions, dynamic state changes, modal dialogs, notifications, and single-page application routing.'));

  const dynamicFindings = a11yData?.categories?.dynamicContent || null;
  if (dynamicFindings) {
    sections.push(createParagraph(`${dynamicFindings.issueCount} issues identified in this category.`));
    if (dynamicFindings.items?.length) {
      sections.push(...createBulletList(dynamicFindings.items));
    }
  } else {
    sections.push(createParagraph('Key criteria assessed:'));
    sections.push(...createBulletList([
      '4.1.3 Status Messages (Level AA) — status messages announced by screen readers without receiving focus',
      'ARIA live regions used for dynamic content updates (aria-live="polite" or "assertive" as appropriate)',
      'Modal dialogs trap focus correctly and return focus on close',
      'Loading states and progress indicators announced to assistive technologies',
      'Single-page application route changes announce the new page title to screen readers',
      'Expandable/collapsible content uses aria-expanded and aria-controls correctly',
      'Toast notifications and alerts use role="alert" or aria-live="assertive"',
      'Auto-updating content can be paused, stopped, or hidden (WCAG 2.2.2)',
    ]));
    sections.push(createParagraph('[FINDINGS TO BE COMPLETED AFTER ASSESSMENT]', { italic: true }));
  }

  // --- 5. Per-Finding Detail ---
  sections.push(createHeading('Detailed Findings', 1));
  sections.push(createParagraph(
    'The table below lists all individual findings with their WCAG success criterion, severity, location, and recommended remediation.'
  ));

  const findings = a11yData?.findings || [];
  if (findings.length) {
    const findingRows = findings.map(f => [
      f.criterion || '-',
      f.severity || '-',
      f.description || '-',
      f.location || '-',
      f.remediation || '-',
    ]);
    sections.push(createTable(
      ['WCAG Criterion', 'Severity', 'Description', 'Location', 'Remediation'],
      findingRows
    ));
  } else {
    sections.push(createTable(
      ['WCAG Criterion', 'Severity', 'Description', 'Location', 'Remediation'],
      [
        ['1.1.1 Non-text Content', 'Critical', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
        ['1.4.3 Contrast (Minimum)', 'Major', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
        ['2.1.1 Keyboard', 'Major', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
        ['2.4.1 Bypass Blocks', 'Major', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
        ['2.4.7 Focus Visible', 'Major', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
        ['4.1.2 Name, Role, Value', 'Critical', '[DESCRIPTION]', '[PAGE/ELEMENT]', '[FIX DESCRIPTION]'],
      ]
    ));
    sections.push(createParagraph('[COMPLETE THIS TABLE WITH ACTUAL FINDINGS]', { italic: true }));
  }

  sections.push(createParagraph('Severity levels: Critical = blocks access for some users, Major = significant barrier to access, Minor = causes difficulty but workaround exists, Advisory = best practice improvement.', { italic: true }));

  // --- 6. Automated Results ---
  sections.push(createHeading('Automated Test Results', 1));
  sections.push(createParagraph(
    'Automated tools provide efficient detection of common accessibility violations but cannot catch all issues. Approximately 30-40% of WCAG success criteria can be fully evaluated by automated tools — the remainder require manual testing and human judgement.'
  ));

  const axeResults = a11yData?.automatedResults?.axe || null;
  const lighthouseResults = a11yData?.automatedResults?.lighthouse || null;

  sections.push(createHeading('axe-core Results', 2));
  if (axeResults) {
    sections.push(createTable(
      ['Metric', 'Value'],
      [
        ['Total Rules Evaluated', String(axeResults.rulesEvaluated ?? '-')],
        ['Violations', String(axeResults.violations ?? '-')],
        ['Passes', String(axeResults.passes ?? '-')],
        ['Incomplete (Needs Review)', String(axeResults.incomplete ?? '-')],
        ['Inapplicable', String(axeResults.inapplicable ?? '-')],
      ]
    ));
    if (axeResults.topViolations?.length) {
      sections.push(createParagraph('Top violations by impact:'));
      sections.push(...createBulletList(axeResults.topViolations));
    }
  } else {
    sections.push(createTable(
      ['Metric', 'Value'],
      [
        ['Total Rules Evaluated', '[COUNT]'],
        ['Violations', '[COUNT]'],
        ['Passes', '[COUNT]'],
        ['Incomplete (Needs Review)', '[COUNT]'],
        ['Inapplicable', '[COUNT]'],
      ]
    ));
    sections.push(createParagraph('[POPULATE WITH AXE-CORE SCAN RESULTS]', { italic: true }));
  }

  sections.push(createHeading('Lighthouse Accessibility Score', 2));
  if (lighthouseResults) {
    sections.push(createParagraph(`Lighthouse accessibility score: ${lighthouseResults.score}/100.`));
    if (lighthouseResults.failedAudits?.length) {
      sections.push(createParagraph('Failed audits:'));
      sections.push(...createBulletList(lighthouseResults.failedAudits));
    }
  } else {
    sections.push(createTable(
      ['Metric', 'Value'],
      [
        ['Accessibility Score', '[SCORE]/100'],
        ['Passed Audits', '[COUNT]'],
        ['Failed Audits', '[COUNT]'],
        ['Not Applicable', '[COUNT]'],
      ]
    ));
    sections.push(createParagraph('[POPULATE WITH LIGHTHOUSE AUDIT RESULTS]', { italic: true }));
  }

  // --- 7. Manual Testing ---
  sections.push(createHeading('Manual Testing Results', 1));
  sections.push(createParagraph(
    'Manual testing evaluates aspects of accessibility that automated tools cannot detect, including logical reading order, meaningful alternative text quality, keyboard interaction patterns, and screen reader experience.'
  ));

  sections.push(createHeading('Keyboard Navigation', 2));
  const keyboardResults = a11yData?.manualTests?.keyboard || null;
  if (keyboardResults) {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      keyboardResults.map(r => [r.test || '-', r.result || '-', r.notes || '-'])
    ));
  } else {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      [
        ['All interactive elements reachable via Tab', '[PASS/FAIL]', '[NOTES]'],
        ['Focus order matches visual layout', '[PASS/FAIL]', '[NOTES]'],
        ['No keyboard traps', '[PASS/FAIL]', '[NOTES]'],
        ['Skip navigation link present and functional', '[PASS/FAIL]', '[NOTES]'],
        ['Dropdown menus operable with arrow keys', '[PASS/FAIL]', '[NOTES]'],
        ['Modal dialogs trap focus and Escape closes', '[PASS/FAIL]', '[NOTES]'],
        ['Custom components respond to expected key commands', '[PASS/FAIL]', '[NOTES]'],
        ['Focus returned to trigger element after dialog close', '[PASS/FAIL]', '[NOTES]'],
      ]
    ));
  }

  sections.push(createHeading('Screen Reader Testing', 2));
  const screenReaderResults = a11yData?.manualTests?.screenReader || null;
  if (screenReaderResults) {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      screenReaderResults.map(r => [r.test || '-', r.result || '-', r.notes || '-'])
    ));
  } else {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      [
        ['Page title announced on load', '[PASS/FAIL]', '[NOTES]'],
        ['Headings hierarchy navigable', '[PASS/FAIL]', '[NOTES]'],
        ['Landmark regions identified correctly', '[PASS/FAIL]', '[NOTES]'],
        ['Images have meaningful alt text', '[PASS/FAIL]', '[NOTES]'],
        ['Form labels announced with inputs', '[PASS/FAIL]', '[NOTES]'],
        ['Error messages announced on form submission', '[PASS/FAIL]', '[NOTES]'],
        ['Dynamic content changes announced', '[PASS/FAIL]', '[NOTES]'],
        ['Links and buttons have descriptive text', '[PASS/FAIL]', '[NOTES]'],
        ['Tables have headers and are navigable', '[PASS/FAIL]', '[NOTES]'],
      ]
    ));
  }

  sections.push(createHeading('Zoom and Reflow Testing', 2));
  const zoomResults = a11yData?.manualTests?.zoom || null;
  if (zoomResults) {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      zoomResults.map(r => [r.test || '-', r.result || '-', r.notes || '-'])
    ));
  } else {
    sections.push(createTable(
      ['Test', 'Result', 'Notes'],
      [
        ['Content readable at 200% zoom', '[PASS/FAIL]', '[NOTES]'],
        ['Content readable at 400% zoom', '[PASS/FAIL]', '[NOTES]'],
        ['No horizontal scrolling at 320px viewport width', '[PASS/FAIL]', '[NOTES]'],
        ['Text spacing override causes no content loss', '[PASS/FAIL]', '[NOTES]'],
        ['Touch targets at least 44x44 CSS pixels', '[PASS/FAIL]', '[NOTES]'],
      ]
    ));
  }

  // --- 8. Recommendations ---
  sections.push(createHeading('Recommendations', 1));
  sections.push(createParagraph(
    'The following remediation actions are prioritised by severity and effort. Critical and major issues should be addressed before launch or as soon as practicable. Minor and advisory items should be included in the ongoing maintenance backlog.'
  ));

  const recommendations = a11yData?.recommendations || null;
  if (recommendations?.length) {
    const recRows = recommendations.map(r => [
      r.priority || '-',
      r.description || '-',
      r.effort || '-',
      r.impact || '-',
      r.criterion || '-',
    ]);
    sections.push(createTable(
      ['Priority', 'Recommendation', 'Estimated Effort', 'Impact', 'WCAG Criterion'],
      recRows
    ));
  } else {
    sections.push(createHeading('Critical Priority', 2));
    sections.push(createParagraph('These issues block access for some users and must be resolved immediately:'));
    sections.push(createTable(
      ['Recommendation', 'Estimated Effort', 'Impact', 'WCAG Criterion'],
      [
        ['Add meaningful alt text to all content images', '2-4 hours', 'Screen reader users can understand image content', '1.1.1'],
        ['Ensure all custom controls expose correct ARIA roles and states', '4-8 hours', 'Assistive technologies can interact with custom components', '4.1.2'],
      ]
    ));

    sections.push(createHeading('Major Priority', 2));
    sections.push(createParagraph('These issues create significant barriers and should be resolved before launch:'));
    sections.push(createTable(
      ['Recommendation', 'Estimated Effort', 'Impact', 'WCAG Criterion'],
      [
        ['Fix colour contrast ratios below 4.5:1 for normal text', '2-4 hours', 'Low-vision users can read all text content', '1.4.3'],
        ['Add visible focus indicators to all interactive elements', '2-3 hours', 'Keyboard users can track their position on the page', '2.4.7'],
        ['Add skip navigation link to bypass repeated header content', '1 hour', 'Keyboard and screen reader users can skip to main content', '2.4.1'],
        ['Associate all form inputs with visible labels', '2-4 hours', 'Screen readers announce the purpose of each form field', '1.3.1, 3.3.2'],
        ['Provide accessible error messages that identify the field and suggest correction', '3-5 hours', 'Users understand what went wrong and how to fix it', '3.3.1, 3.3.3'],
      ]
    ));

    sections.push(createHeading('Minor Priority', 2));
    sections.push(createParagraph('These issues cause difficulty but workarounds exist. Address in ongoing maintenance:'));
    sections.push(createTable(
      ['Recommendation', 'Estimated Effort', 'Impact', 'WCAG Criterion'],
      [
        ['Ensure heading hierarchy has no skipped levels', '1-2 hours', 'Screen reader users can navigate content structure predictably', '1.3.1'],
        ['Add aria-live regions for dynamic content updates', '2-4 hours', 'Screen reader users are informed of content changes', '4.1.3'],
        ['Ensure content reflows without horizontal scroll at 320px', '3-6 hours', 'Mobile and zoom users can read content without scrolling horizontally', '1.4.10'],
      ]
    ));

    sections.push(createHeading('Advisory', 2));
    sections.push(createParagraph('Best practice improvements that go beyond minimum compliance:'));
    sections.push(...createBulletList([
      'Add prefers-reduced-motion support to all CSS animations and transitions',
      'Implement a site-wide accessibility statement page with contact information for reporting barriers',
      'Add language attributes to content in languages other than the page default',
      'Consider providing a dark mode or high contrast theme toggle',
      'Conduct usability testing with users who rely on assistive technologies',
    ]));
  }

  // --- 9. Compliance Statement ---
  sections.push(createHeading('Compliance Statement', 1));

  if (a11yData?.complianceStatement) {
    sections.push(createParagraph(a11yData.complianceStatement));
  } else {
    sections.push(createParagraph(
      `Based on this assessment, ${projectName} [DOES / DOES NOT] conform to WCAG 2.1 Level ${targetLevel}. The findings in this report identify specific areas where the site does not meet the required success criteria.`
    ));
  }

  sections.push(createParagraph(
    'This assessment reflects the state of the site at the time of evaluation. Changes to content, templates, or functionality after the assessment date may affect compliance status. Periodic re-assessment is recommended, particularly after significant updates.'
  ));

  sections.push(createHeading('Scope of Conformance', 2));
  sections.push(...createBulletList([
    `Standard: WCAG 2.1 Level ${targetLevel}`,
    `Pages assessed: ${Array.isArray(pagesAudited) ? pagesAudited.length + ' pages/templates' : pagesAudited}`,
    'Technologies relied upon: HTML, CSS, JavaScript, WAI-ARIA',
    `Assessment performed by: ${company.name || '[ASSESSOR]'}`,
    `Assessment date: ${new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  ]));

  sections.push(createHeading('Disclaimer', 2));
  sections.push(createParagraph(
    'This report represents a professional evaluation of accessibility at the time of assessment. It does not constitute a legal guarantee of compliance. Accessibility is an ongoing practice — new content, features, and third-party integrations may introduce new barriers. Regular auditing and user testing are recommended to maintain and improve accessibility over time.'
  ));

  sections.push(createHeading('Next Steps', 2));
  sections.push(...createBulletList([
    'Address all critical and major findings as documented in the Recommendations section',
    'Re-test remediated issues to confirm resolution',
    'Schedule a follow-up assessment after remediation is complete',
    'Establish an accessibility review process for new content and feature development',
    'Consider adding automated accessibility checks to the CI/CD pipeline (axe-core, pa11y)',
    'Publish an accessibility statement on the site with a mechanism for users to report barriers',
  ]));

  return createDocument({
    title: 'Accessibility Report',
    subtitle: `WCAG 2.1 Level ${targetLevel} Assessment — ${projectName}`,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
