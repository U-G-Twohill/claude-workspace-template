// Design Brief document template
// Generates a comprehensive design brief from docs-state parameters and brand config

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getBrandColors, getBrandFonts } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const designDirection = params['design-direction'] || 'Modern, clean, and professional';
  const toneOfVoice = params['tone-of-voice'] || 'Professional, approachable, and clear';
  const audienceDescription = reqs.audience || params['target-audience'] || (ctx.client?.industry ? `Target audience within the ${ctx.client.industry} industry — complete requirements gathering to refine` : '[Target audience — complete requirements gathering to populate]');
  const brandPositioning = params['brand-positioning'] || '[Brand positioning — to be defined]';
  const mobileApproach = params['mobile-approach'] || 'Mobile-first responsive design';
  const wcagLevel = params['wcag-level'] || 'WCAG 2.1 AA';
  const designRounds = params['design-rounds'] || '3';
  const feedbackFormat = params['feedback-format'] || 'Consolidated written feedback via email or shared document';

  const sections = [];

  // 1. Design Vision & Goals
  sections.push(createHeading('Design Vision & Goals', 1));
  sections.push(createParagraph(`This design brief defines the visual direction, user experience goals, and design deliverables for ${projectName}.`));

  const visionItems = [
    `Design Direction: ${designDirection}`,
    `Brand Positioning: ${brandPositioning}`,
  ];
  if (reqs.goals || ctx.goals) {
    visionItems.unshift(`Project Objectives: ${reqs.goals || ctx.goals}`);
  } else if (ctx.description) {
    visionItems.unshift(`Project Objectives: ${ctx.description}`);
  } else {
    visionItems.unshift('Project Objectives: [Define the key objectives this design must achieve]');
  }
  if (ctx.strategy?.priorities && Array.isArray(ctx.strategy.priorities)) {
    visionItems.push(`Strategic Priorities: ${ctx.strategy.priorities.join(', ')}`);
  }
  visionItems.push(
    'Desired User Perception: The design should convey trust, competence, and attention to detail',
    'Visual Differentiation: Stand out from competitors while remaining appropriate for the industry',
  );
  sections.push(...createBulletList(visionItems));

  // 2. Target Audience
  sections.push(createHeading('Target Audience', 1));
  sections.push(createParagraph(audienceDescription));
  sections.push(createHeading('Audience Considerations', 2));
  sections.push(...createBulletList([
    'Primary user personas and their goals',
    'Age range, demographics, and geographic location',
    'Technical proficiency level (novice, intermediate, advanced)',
    'Devices and browsers commonly used by the target audience',
    'Accessibility needs and assistive technology usage',
  ]));

  // 3. Brand Guidelines
  sections.push(createHeading('Brand Guidelines', 1));

  const colors = getBrandColors(brandConfig || {});
  const fonts = getBrandFonts(brandConfig || {});

  sections.push(createHeading('Logo Usage', 2));
  sections.push(...createBulletList([
    'Logo must maintain minimum clear space equal to the height of the logo mark',
    'Do not stretch, rotate, recolour, or apply effects to the logo',
    'Use the light variant on dark backgrounds and the dark variant on light backgrounds',
    'Minimum display size: 120px wide for digital, 30mm for print',
  ]));

  sections.push(createHeading('Colour Palette', 2));
  const colorEntries = Object.entries(colors);
  if (colorEntries.length > 0) {
    const colorRows = colorEntries.map(([name, value]) => [
      name.charAt(0).toUpperCase() + name.slice(1),
      value.hex,
      value.rgb ? `rgb(${value.rgb.r}, ${value.rgb.g}, ${value.rgb.b})` : '',
    ]);
    sections.push(createTable(['Colour Name', 'Hex', 'RGB'], colorRows));
  } else {
    sections.push(createParagraph('[Colour palette — configure brand colours in brand config to populate]'));
  }
  sections.push(createParagraph('Ensure sufficient contrast ratios between text and background colours (minimum 4.5:1 for body text, 3:1 for large text).'));

  sections.push(createHeading('Typography', 2));
  sections.push(createTable(
    ['Usage', 'Font Family', 'Notes'],
    [
      ['Headings', fonts.heading, 'Bold weight for primary headings, semibold for subheadings'],
      ['Body Text', fonts.body, 'Regular weight, minimum 16px for readability'],
      ['UI Elements', fonts.body, 'Medium weight for buttons, labels, and navigation'],
    ]
  ));

  sections.push(createHeading('Tone of Voice', 2));
  sections.push(createParagraph(`The visual design should reflect the following tone: ${toneOfVoice}.`));
  sections.push(...createBulletList([
    'Imagery should feel authentic and relatable, not generic or overly corporate',
    'Iconography should be consistent in style, weight, and visual language',
    'Micro-copy and UI text should align with the overall brand voice',
  ]));

  // 4. Reference & Inspiration
  sections.push(createHeading('Reference & Inspiration', 1));
  sections.push(createParagraph('The following references inform the design direction. These are aspirational — the final design should be original and tailored to the project.'));

  const referenceItems = params['reference-sites']
    ? (Array.isArray(params['reference-sites']) ? params['reference-sites'] : [params['reference-sites']])
    : ['[Add competitor or inspiration URLs during discovery]'];
  sections.push(...createBulletList(referenceItems));

  sections.push(createHeading('Design Preferences', 2));
  const preferences = params['design-preferences'] || {};
  sections.push(...createBulletList([
    `Layout Style: ${preferences.layout || 'Clean, spacious layouts with clear visual hierarchy'}`,
    `Photography Style: ${preferences.photography || 'Authentic, high-quality imagery relevant to the industry'}`,
    `Illustration Style: ${preferences.illustration || 'Minimal, purposeful illustrations where they add clarity'}`,
    `Animation: ${preferences.animation || 'Subtle, performance-conscious transitions and micro-interactions'}`,
  ]));

  // 5. Page Structure
  sections.push(createHeading('Page Structure', 1));
  sections.push(createParagraph('Key pages and screens to design, listed in priority order:'));

  const pages = params['pages'] || reqs.pages;
  if (pages && Array.isArray(pages)) {
    const pageRows = pages.map((page, idx) => [
      String(idx + 1),
      typeof page === 'string' ? page : page.name || page.title || '',
      typeof page === 'object' ? (page.description || page.notes || '') : '',
    ]);
    sections.push(createTable(['Priority', 'Page / Screen', 'Notes'], pageRows));
  } else {
    sections.push(createTable(
      ['Priority', 'Page / Screen', 'Notes'],
      [
        ['1', 'Homepage', 'Primary landing page — first impression, key value proposition'],
        ['2', 'About / Company', 'Brand story, team, values'],
        ['3', 'Services / Products', 'Core offering presentation'],
        ['4', 'Contact', 'Enquiry form, location, contact details'],
        ['5', '[Additional pages]', '[To be defined during discovery]'],
      ]
    ));
  }

  // 6. User Flows
  sections.push(createHeading('User Flows', 1));
  sections.push(createParagraph('Primary user journeys that the design must support effectively:'));

  const userFlows = params['user-flows'] || [
    'First-time visitor: Landing page > Key content > Contact / CTA',
    'Returning visitor: Direct navigation to specific content or service',
    'Mobile user: Streamlined navigation with thumb-friendly interactions',
  ];
  if (flags.needs_payments) {
    userFlows.push('Purchaser: Browse > Product detail > Add to cart > Checkout > Confirmation');
  }
  if (flags.needs_auth) {
    userFlows.push('Account holder: Login > Dashboard > Key actions > Logout');
  }
  sections.push(...createBulletList(Array.isArray(userFlows) ? userFlows : [userFlows]));

  sections.push(createHeading('Key Interactions', 2));
  sections.push(...createBulletList([
    'Navigation: Clear, predictable, accessible on all devices',
    'Forms: Progressive disclosure, inline validation, clear error states',
    'CTAs: Visually prominent, action-oriented language, logical placement',
    'Feedback: Loading states, success confirmations, error recovery paths',
  ]));

  // 7. Component Library
  sections.push(createHeading('Component Library', 1));
  sections.push(createParagraph('The design should establish a reusable component system that ensures consistency across all pages and simplifies future development.'));

  sections.push(createHeading('Core Components', 2));
  sections.push(...createBulletList([
    'Navigation: Header, footer, mobile menu, breadcrumbs',
    'Typography: Heading hierarchy (H1-H4), body text, captions, labels',
    'Buttons: Primary, secondary, tertiary, disabled, loading states',
    'Forms: Text inputs, textareas, selects, checkboxes, radio buttons, toggles',
    'Cards: Content cards, feature cards, testimonial cards',
    'Media: Image containers, video embeds, galleries, lightboxes',
    'Feedback: Alerts, toasts, modals, tooltips, empty states',
    'Layout: Containers, grids, spacers, dividers, section patterns',
  ]));

  sections.push(createHeading('Component States', 2));
  sections.push(...createBulletList([
    'Default, hover, focus, active, disabled states for all interactive elements',
    'Loading and skeleton states for dynamic content',
    'Empty states with helpful guidance for content-dependent sections',
    'Error states with clear recovery instructions',
  ]));

  // 8. Responsive Strategy
  sections.push(createHeading('Responsive Strategy', 1));
  sections.push(createParagraph(`Approach: ${mobileApproach}.`));

  sections.push(createTable(
    ['Breakpoint', 'Width', 'Target Devices'],
    [
      ['Mobile', '< 640px', 'Smartphones (portrait)'],
      ['Tablet', '640px - 1024px', 'Tablets, smartphones (landscape)'],
      ['Desktop', '1024px - 1440px', 'Laptops, desktop monitors'],
      ['Wide', '> 1440px', 'Large monitors, ultrawide displays'],
    ]
  ));

  sections.push(createHeading('Responsive Considerations', 2));
  sections.push(...createBulletList([
    'Touch targets: Minimum 44x44px for all interactive elements on mobile',
    'Navigation: Collapse to hamburger or bottom nav on mobile, full horizontal on desktop',
    'Images: Serve appropriately sized images per breakpoint, use modern formats (WebP, AVIF)',
    'Typography: Scale font sizes fluidly between breakpoints using clamp() or fluid type scales',
    'Layout: Stack columns vertically on mobile, use grid layouts on larger screens',
    'Content priority: Ensure the most important content is visible without scrolling on all devices',
  ]));

  // 9. Content Requirements
  sections.push(createHeading('Content Requirements', 1));

  sections.push(createHeading('Copy Guidelines', 2));
  sections.push(...createBulletList([
    'Headings: Clear, benefit-driven, scannable — avoid jargon unless audience-appropriate',
    'Body copy: Concise paragraphs, active voice, reading level appropriate for the audience',
    'CTAs: Action-oriented, specific, consistent in tone across the site',
    'Microcopy: Helpful, human, consistent with brand voice (form labels, tooltips, error messages)',
  ]));

  sections.push(createHeading('Imagery Specifications', 2));
  sections.push(...createBulletList([
    'Hero images: Minimum 1920px wide, 16:9 or custom aspect ratio per design',
    'Content images: Consistent aspect ratios within each section, optimised for web delivery',
    'Icons: SVG format, single consistent icon set, accessible with appropriate labels',
    'Placeholder approach: Use realistic placeholder content during design — avoid lorem ipsum for key pages',
  ]));

  // 10. E-commerce Design (conditional)
  if (flags.needs_payments) {
    sections.push(createHeading('E-commerce Design', 1));
    sections.push(createParagraph('The design must support a complete e-commerce experience with the following considerations:'));

    sections.push(createHeading('Product Pages', 2));
    sections.push(...createBulletList([
      'High-quality product imagery with zoom and gallery functionality',
      'Clear pricing, availability, and variant selection (size, colour, etc.)',
      'Product descriptions with scannable feature lists',
      'Related products and cross-sell recommendations',
      'Customer reviews and social proof elements',
    ]));

    sections.push(createHeading('Cart & Checkout', 2));
    sections.push(...createBulletList([
      'Persistent cart indicator with item count and subtotal',
      'Cart page with quantity adjustment, item removal, and order summary',
      'Streamlined checkout flow: shipping > payment > confirmation',
      'Guest checkout option alongside account creation',
      'Trust signals: secure payment badges, return policy, support contact',
      'Order confirmation page and email receipt design',
    ]));
  }

  // 11. CMS Content Design (conditional)
  if (flags.needs_cms) {
    sections.push(createHeading('CMS Content Design', 1));
    sections.push(createParagraph('The design must account for content management workflows and editorial interfaces:'));

    sections.push(createHeading('Editorial UI', 2));
    sections.push(...createBulletList([
      'Content editor interface: WYSIWYG or structured fields as appropriate',
      'Media library: Upload, organise, search, and select media assets',
      'Content preview: Accurate front-end preview before publishing',
      'Publishing workflow: Draft, review, scheduled, and published states',
    ]));

    sections.push(createHeading('Content Preview', 2));
    sections.push(...createBulletList([
      'Live preview of content changes across breakpoints',
      'Visual difference between draft and published content',
      'Preview shareable links for stakeholder review',
    ]));

    sections.push(createHeading('Admin Views', 2));
    sections.push(...createBulletList([
      'Dashboard with recent activity, quick actions, and content status overview',
      'Content listing with search, filter, sort, and bulk actions',
      'Settings and configuration screens consistent with front-end design language',
    ]));
  }

  // 12. Multi-user Views (conditional)
  if (flags.needs_auth) {
    sections.push(createHeading('Multi-user Views', 1));
    sections.push(createParagraph('The design must include authenticated user interfaces:'));

    sections.push(createHeading('Authentication Screens', 2));
    sections.push(...createBulletList([
      'Login: Email/password, social login options, forgot password link',
      'Registration: Progressive form, clear password requirements, terms acceptance',
      'Password Reset: Email entry, confirmation message, new password form',
      'Email Verification: Clear instructions, resend option, success confirmation',
    ]));

    sections.push(createHeading('User Profile', 2));
    sections.push(...createBulletList([
      'Profile overview with avatar, name, and account details',
      'Editable profile fields with inline or modal editing',
      'Account settings: email, password, notification preferences',
      'Account deletion flow with clear consequences and confirmation',
    ]));

    sections.push(createHeading('User Dashboard', 2));
    sections.push(...createBulletList([
      'Personalised welcome and overview of relevant activity',
      'Quick-access navigation to key user actions',
      'Activity history or recent items',
      'Role-based UI variations if applicable (admin, editor, viewer)',
    ]));
  }

  // 13. Accessibility Standards
  sections.push(createHeading('Accessibility Standards', 1));
  sections.push(createParagraph(`This project targets ${wcagLevel} compliance as a minimum. Accessibility is a design requirement, not an afterthought.`));

  sections.push(createHeading('Requirements', 2));
  sections.push(...createBulletList([
    'Colour Contrast: Minimum 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+)',
    'Keyboard Navigation: All interactive elements reachable and operable via keyboard alone',
    'Focus Indicators: Visible, high-contrast focus rings on all focusable elements',
    'Screen Readers: Semantic HTML, ARIA labels where needed, logical reading order',
    'Motion: Respect prefers-reduced-motion, no auto-playing animations without user control',
    'Text Resizing: Content remains usable at 200% browser zoom',
    'Touch Targets: Minimum 44x44px for all interactive elements',
    'Alt Text: Descriptive alt text for informative images, empty alt for decorative images',
    'Form Labels: Every input associated with a visible label, clear error identification',
  ]));

  // 14. Success Metrics
  sections.push(createHeading('Success Metrics', 1));
  sections.push(createParagraph('Design decisions should support the following measurable outcomes:'));

  const metricsRows = [
    ['Conversion Rate', params['target-conversion'] || 'Improve over current baseline', 'Primary CTAs, form completions'],
    ['Engagement', params['target-engagement'] || 'Increase time on site and pages per session', 'Content layout, navigation clarity'],
    ['Page Load Time', params['target-load-time'] || '< 3 seconds on 4G mobile', 'Image optimisation, asset strategy'],
    ['Bounce Rate', params['target-bounce-rate'] || 'Reduce below industry average', 'Above-the-fold content, clear value proposition'],
    ['Accessibility Score', `${wcagLevel} compliance`, 'Automated and manual testing'],
    ['Mobile Usability', 'Zero mobile usability errors', 'Responsive design, touch targets'],
  ];
  sections.push(createTable(['Metric', 'Target', 'Design Impact'], metricsRows));

  // 15. Review Process
  sections.push(createHeading('Review Process', 1));
  sections.push(createParagraph('The design process follows a structured review cycle to ensure alignment and efficient iteration.'));

  sections.push(createHeading('Design Rounds', 2));
  sections.push(createParagraph(`This project includes ${designRounds} rounds of design revisions.`));
  sections.push(...createBulletList([
    'Round 1: Initial concepts based on this brief — presented as high-fidelity mockups for key pages',
    'Round 2: Refinements based on consolidated feedback from Round 1',
    `Round ${designRounds}: Final polish and sign-off — pixel-level adjustments and asset preparation`,
  ]));

  sections.push(createHeading('Feedback Format', 2));
  sections.push(createParagraph(feedbackFormat));
  sections.push(...createBulletList([
    'Feedback should be consolidated from all stakeholders before submission',
    'Reference specific pages, sections, or elements when providing comments',
    'Distinguish between subjective preferences and functional requirements',
    'Feedback turnaround: 5 business days per round to maintain project momentum',
  ]));

  sections.push(createHeading('Approval Workflow', 2));
  sections.push(...createBulletList([
    'Design concepts presented via interactive prototype or annotated mockups',
    'Stakeholder review period with structured feedback collection',
    'Revisions applied and re-presented for confirmation',
    'Final written sign-off required before development begins',
    'Post-sign-off changes treated as change requests with scope and timeline impact',
  ]));

  return createDocument({
    title: 'Design Brief',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
