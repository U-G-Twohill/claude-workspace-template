// Proposal document template
// Generates a professional, client-ready project proposal enriched with requirements data
// This is the root of the document chain — quality here cascades to all downstream documents

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, formatCurrency } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};
  const ctx = docsState.projectContext || {};
  const chain = docsState.chainContext || {};

  // Core data
  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const techStack = params['tech-stack'] || ctx.projectStack || '[Tech stack TBC]';
  const projectValue = params['project-value'] || '';
  const paymentTerms = params['payment-terms'] || '50% upfront, 50% on completion';
  const budgetBand = reqs['budget-band'] || '';
  const projectType = meta['project-type'] || 'web-app';

  // Parse structured data from requirements
  let pages = [];
  try { pages = reqs.pages ? JSON.parse(reqs.pages) : []; } catch { pages = []; }
  let futureFeatures = [];
  try { futureFeatures = reqs.features ? JSON.parse(reqs.features) : []; } catch { futureFeatures = []; }

  // Integrations
  const integrations = Object.keys(docsState.integrationClauses || {}).filter(k => docsState.integrationClauses[k] === 'active');

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  const validUntilStr = validUntil.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const sections = [];

  // --- 1. EXECUTIVE SUMMARY ---
  sections.push(createHeading('Executive Summary', 1));

  if (reqs.goals) {
    // Use the actual goals from requirements — project-specific context
    sections.push(createParagraph(reqs.goals));
  } else {
    sections.push(createParagraph(`This proposal outlines the scope, approach, timeline, and investment for ${projectName} on behalf of ${clientName}.`));
  }

  // Add scope overview with page count if available
  if (pages.length > 0) {
    sections.push(createParagraph(
      `This proposal covers the design, development, and deployment of a ${pages.length}-page website` +
      (techStack !== '[Tech stack TBC]' ? ` built on ${techStack}` : '') +
      (flags.needs_cms ? ', with a content management system for self-managed updates' : '') +
      (flags.needs_payments ? ', including payment processing' : '') +
      '.'
    ));
  }

  if (reqs.timeline) {
    sections.push(createParagraph(`Timeline: ${reqs.timeline}`));
  }

  // --- 2. UNDERSTANDING YOUR NEEDS ---
  sections.push(createHeading('Understanding Your Needs', 1));

  // Business context from requirements
  const audience = reqs.audience;
  if (audience) {
    sections.push(createParagraph(`Target audience: ${audience}`));
  }

  // Key challenges — derive from constraints and requirements
  if (reqs.constraints) {
    sections.push(createHeading('Key Requirements', 2));
    const constraintLines = reqs.constraints.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (constraintLines.length > 0) {
      sections.push(...createBulletList(constraintLines.map(l => l.replace(/^[-*]\s*\*\*([^*]+)\*\*\s*[—–-]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim())));
    } else {
      sections.push(createParagraph(reqs.constraints.slice(0, 500)));
    }
  }

  // Design direction if available
  if (reqs['design-direction']) {
    sections.push(createHeading('Design Direction', 2));
    const designLines = reqs['design-direction'].split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
    if (designLines.length > 0) {
      sections.push(...createBulletList(designLines.map(l => l.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim())));
    } else {
      sections.push(createParagraph(reqs['design-direction'].slice(0, 500)));
    }
  }

  // --- 3. PROPOSED APPROACH ---
  sections.push(createHeading('Proposed Approach', 1));

  // Phase 1: Design
  if (flags.needs_design) {
    sections.push(createHeading('Phase 1: Design & Branding', 2));
    sections.push(createParagraph('Establish the visual identity and site structure.'));
    const designDeliverables = [
      'Brand direction: colour palette, typography, visual tone',
      'Site wireframes for all pages',
      'Design mockups for key pages',
      'Review round with feedback and refinement',
    ];
    sections.push(createParagraph('Deliverables:'));
    sections.push(...createBulletList(designDeliverables));
  }

  // Phase 2: Development
  sections.push(createHeading(flags.needs_design ? 'Phase 2: Development' : 'Phase 1: Development', 2));
  sections.push(createParagraph(`Built on ${techStack}${flags.needs_cms ? ' with a CMS/admin panel for content management' : ''}.`));

  // List actual pages if available
  if (pages.length > 0) {
    sections.push(createParagraph('Pages and features:'));
    sections.push(...createBulletList(pages.map(p => `${p.name}${p.description ? ' — ' + p.description : ''}`)));
  }

  // Development deliverables
  const devDeliverables = [];
  if (pages.length > 0) devDeliverables.push(`${pages.length}-page website with all pages functional`);
  if (flags.needs_cms) devDeliverables.push('CMS/admin panel for self-managed content');
  if (flags.needs_auth) devDeliverables.push('User authentication and access control');
  if (flags.needs_database) devDeliverables.push('Database design and implementation');
  if (flags.needs_api) devDeliverables.push('API design and development');
  if (flags.needs_payments) devDeliverables.push('Payment processing integration');
  devDeliverables.push('Responsive design (mobile, tablet, desktop)');
  if (integrations.length > 0) {
    devDeliverables.push(`Integrations: ${integrations.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}`);
  }

  if (devDeliverables.length > 0) {
    sections.push(createParagraph('Deliverables:'));
    sections.push(...createBulletList(devDeliverables));
  }

  // Phase 3: Polish & Handover
  const handoverPhase = flags.needs_design ? 'Phase 3' : 'Phase 2';
  sections.push(createHeading(`${handoverPhase}: Polish & Handover`, 2));
  sections.push(createParagraph('Testing, refinement, deployment, and training.'));
  const handoverDeliverables = [
    'Cross-browser and device testing',
    'Performance and SEO basics (meta tags, sitemap, page speed)',
  ];
  if (flags.needs_privacy_policy || flags.needs_tos) {
    handoverDeliverables.push('Privacy policy and terms of service');
  }
  if (flags.needs_cookie_policy) {
    handoverDeliverables.push('Cookie policy');
  }
  handoverDeliverables.push('Deployment to hosting');
  if (flags.needs_training_docs || flags.needs_user_manual) {
    handoverDeliverables.push('Written documentation and training materials');
  }
  if (reqs['handover-expectations']) {
    const handoverBullets = reqs['handover-expectations'].split('\n').filter(l => l.trim().startsWith('-'));
    for (const line of handoverBullets) {
      const cleaned = line.replace(/^[-*]\s*\*\*([^*]+)\*\*[:：]?\s*/, '$1: ').replace(/^[-*]\s+/, '').trim();
      if (cleaned && !handoverDeliverables.some(d => d.toLowerCase().includes(cleaned.toLowerCase().slice(0, 20)))) {
        handoverDeliverables.push(cleaned);
      }
    }
  }
  sections.push(createParagraph('Deliverables:'));
  sections.push(...createBulletList(handoverDeliverables));

  // --- 4. DELIVERABLES TABLE ---
  sections.push(createHeading('Deliverables', 1));

  const deliverableRows = [];
  if (flags.needs_design) {
    deliverableRows.push(['Brand direction', 'Colour palette, typography, visual tone', 'Design']);
    deliverableRows.push(['Wireframes & mockups', 'All pages wireframed, key pages designed', 'Design']);
  }
  if (pages.length > 0) {
    deliverableRows.push([`${pages.length}-page website`, `Full site with all pages`, 'Development']);
  }
  if (flags.needs_cms) {
    deliverableRows.push(['CMS/admin panel', 'Self-service content management', 'Development']);
  }
  if (flags.needs_payments) {
    deliverableRows.push(['Payment processing', 'Checkout flow and payment gateway', 'Development']);
  }
  if (flags.needs_auth) {
    deliverableRows.push(['Authentication', 'User login and access control', 'Development']);
  }
  deliverableRows.push(['Responsive design', 'Mobile, tablet, and desktop', 'Development']);
  if (flags.needs_privacy_policy || flags.needs_tos) {
    deliverableRows.push(['Legal pages', 'Privacy policy, terms of service', 'Handover']);
  }
  deliverableRows.push(['Deployment', 'Live site on hosting platform', 'Handover']);
  if (flags.needs_training_docs || flags.needs_user_manual) {
    deliverableRows.push(['Documentation', 'Training materials and guides', 'Handover']);
  }

  sections.push(createTable(['Deliverable', 'Description', 'Phase'], deliverableRows));

  // --- 5. INVESTMENT ---
  sections.push(createHeading('Investment', 1));

  if (projectValue) {
    const formattedValue = typeof projectValue === 'number' ? formatCurrency(projectValue) : projectValue;
    sections.push(createParagraph(`Total: ${formattedValue}`));
  } else if (budgetBand) {
    sections.push(createParagraph(`Budget range: ${budgetBand}`));
  } else {
    sections.push(createParagraph('[Investment — to be confirmed based on final scope]'));
  }

  sections.push(createParagraph(`Payment terms: ${paymentTerms}`));

  // Future features / What's Not Included
  if (futureFeatures.length > 0) {
    sections.push(createHeading("What's Not Included (Future Phases)", 2));
    sections.push(createParagraph('These can be quoted separately when you are ready:'));
    sections.push(...createBulletList(futureFeatures.map(f => `${f.name}${f.description ? ' — ' + f.description : ''}`)));
  }

  // --- 6. TIMELINE ---
  sections.push(createHeading('Timeline', 1));

  if (reqs.timeline) {
    sections.push(createParagraph(reqs.timeline));
  }

  const milestoneRows = [];
  if (flags.needs_design) {
    milestoneRows.push(['Design & branding', 'Upon agreement', '1-2 weeks']);
  }
  milestoneRows.push(['Development', flags.needs_design ? 'After design approval' : 'Upon agreement', '2-4 weeks']);
  milestoneRows.push(['Testing & deployment', 'After development', '1 week']);
  milestoneRows.push(['Training & handover', 'After deployment', '1 week']);

  sections.push(createTable(['Milestone', 'Start', 'Duration'], milestoneRows));

  // --- 7. WHY ICU MEDIA DESIGN ---
  sections.push(createHeading('Why ICU Media Design', 1));
  sections.push(createParagraph('ICU Media Design is a Nelson-based web agency — local, same timezone, same cultural context. That matters for projects where clear communication and understanding are essential.'));
  sections.push(...createBulletList([
    'Direct communication with the developer — no layers of management',
    `Experienced with ${techStack !== '[Tech stack TBC]' ? techStack : 'modern web technologies'} and the proposed stack`,
    'Transparent project management and progress tracking via Project Hub',
    'Ongoing support and maintenance options available',
  ]));

  // --- 8. NEXT STEPS ---
  sections.push(createHeading('Next Steps', 1));
  sections.push(createParagraph('To proceed with this project:'));
  sections.push(...createBulletList([
    'Review this proposal and let us know any questions or adjustments',
    'Confirm acceptance (verbal or written)',
    'We will issue a formal contract for signing',
    'Upon signing and initial payment, the project will commence per the timeline above',
  ]));

  // --- 9. TERMS & CONDITIONS ---
  sections.push(createHeading('Terms & Conditions', 1));
  sections.push(...createBulletList([
    `This proposal is valid for 30 days (until ${validUntilStr})`,
    `Work begins upon signed agreement and receipt of initial payment`,
    'The quoted scope covers the deliverables listed above — additional features will be quoted separately',
    'Up to 2 rounds of design revisions are included; additional rounds at standard hourly rate',
    'Content: placeholder content is included; final content is the client\'s responsibility',
    'Either party may terminate with 7 days written notice; work completed to that point will be invoiced proportionally',
  ]));

  // Add legal-specific terms if relevant
  if (reqs['legal-requirements']) {
    sections.push(createParagraph('Legal and compliance requirements as discussed will be addressed as part of the project scope.'));
  }

  return createDocument({
    title: 'Project Proposal',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
    version: options.version ? `v${options.version}` : undefined,
  });
}
