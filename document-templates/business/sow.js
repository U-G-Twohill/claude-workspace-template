// Statement of Work document template

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const projectValue = params['project-value'] || '[To be quoted]';
  const paymentTerms = params['payment-terms'] || '50% upfront, 50% on completion';
  const milestoneDates = params['key-milestone-dates'] || {};
  const company = brandConfig?.companyName || 'ICU Media Design';

  // Context-aware enrichment from project harvester
  const ctx = docsState.projectContext || {};
  const ctxClientName = resolveContext(docsState, 'client.name', '');
  const ctxClientIndustry = resolveContext(docsState, 'client.industry', '');
  const ctxDescription = resolveContext(docsState, 'description', '');

  const sections = [];

  // 1. Parties
  sections.push(createHeading('Parties', 1));
  sections.push(createParagraph(`Provider: ${company}`));
  const displayClient = ctxClientName || clientName;
  sections.push(createParagraph(`Client: ${displayClient}${ctxClientIndustry ? ` (${ctxClientIndustry})` : ''}`));

  // 2. Project Description
  sections.push(createHeading('Project Description', 1));
  sections.push(createParagraph(ctxDescription || params['scope-summary'] || reqs.goals || `Development of ${projectName} as described in the accepted proposal.`));

  // 3. Deliverables
  sections.push(createHeading('Deliverables', 1));
  const deliverables = [
    ['Project setup and infrastructure', 'Functional development environment', 'Discovery & Planning'],
  ];
  if (flags.needs_design) {
    deliverables.push(['Design deliverables', 'Approved design mockups for all key pages', 'Design']);
  }
  deliverables.push(
    ['Core application/site', 'Functional, tested implementation of all agreed features', 'Development'],
  );
  if (flags.needs_database) deliverables.push(['Database', 'Designed, migrated, and documented database', 'Development']);
  if (flags.needs_api) deliverables.push(['API', 'Documented and tested API endpoints', 'Development']);
  if (flags.needs_auth) deliverables.push(['Authentication', 'Secure login, registration, and access control', 'Development']);
  if (flags.needs_payments) deliverables.push(['Payment integration', 'Working payment flows with test verification', 'Development']);
  deliverables.push(
    ['Quality assurance', 'Test results and bug-free release', 'QA'],
    ['Deployment', 'Live production deployment', 'Launch'],
    ['Documentation and handover', 'Technical docs, user guide, training', 'Handover'],
  );

  sections.push(createTable(['Deliverable', 'Acceptance Criteria', 'Milestone'], deliverables));

  // 3b. Technology
  const depCategories = ctx.dependencies || {};
  const depEntries = Object.entries(depCategories).filter(([, deps]) => deps.length > 0);
  if (depEntries.length > 0) {
    sections.push(createHeading('Technology', 1));
    sections.push(createParagraph('The following technologies and dependencies form the project stack:'));
    sections.push(createTable(
      ['Category', 'Dependencies'],
      depEntries.map(([cat, deps]) => [cat.charAt(0).toUpperCase() + cat.slice(1), deps.join(', ')])
    ));
  }

  // 4. Timeline
  sections.push(createHeading('Timeline', 1));
  const timeline = [
    ['Discovery & Planning', milestoneDates['design-start'] || 'TBC'],
    ['Design', milestoneDates['design-start'] || 'TBC'],
    ['Development', milestoneDates['development-start'] || 'TBC'],
    ['QA & Testing', milestoneDates['qa-start'] || 'TBC'],
    ['Launch', milestoneDates['launch-target'] || 'TBC'],
    ['Handover', 'Post-launch'],
  ];
  sections.push(createTable(['Milestone', 'Target Date'], timeline));

  // 5. Payment Schedule
  sections.push(createHeading('Payment Schedule', 1));
  sections.push(createParagraph(`Total Project Value: ${typeof projectValue === 'number' ? `$${projectValue.toLocaleString()}` : projectValue}`));
  sections.push(createParagraph(`Payment Terms: ${paymentTerms}`));

  const paymentSchedule = [
    ['Project commencement', '50%', 'Due on signing'],
    ['Project completion', '50%', 'Due on launch'],
  ];
  sections.push(createTable(['Milestone', 'Percentage', 'Due'], paymentSchedule));

  // 6. Change Management
  sections.push(createHeading('Change Management', 1));
  sections.push(createParagraph('Any changes to the agreed scope must be submitted via a Change Request Form. Changes will be assessed for impact on timeline and cost before approval.'));
  sections.push(...createBulletList([
    'Changes must be requested in writing',
    'Impact assessment provided within 2 business days',
    'Changes only proceed after written approval from both parties',
    'Approved changes are documented and appended to this SoW',
  ]));

  // 7. Acceptance Process
  sections.push(createHeading('Acceptance Process', 1));
  sections.push(createParagraph('Each deliverable will be presented for review and acceptance. The Client has 5 business days to review each deliverable. Feedback must be consolidated and provided in writing. Deliverables not rejected within the review period are deemed accepted.'));

  // 8. Assumptions & Exclusions
  sections.push(createHeading('Assumptions & Exclusions', 1));
  sections.push(createHeading('Assumptions', 2));
  sections.push(...createBulletList([
    'Client provides all content (text, images, logos) by agreed dates',
    'Client designates a single point of contact for decisions',
    'Feedback is consolidated and provided within agreed timeframes',
    'Third-party services (hosting, domains) are the Client\'s responsibility unless agreed otherwise',
  ]));
  sections.push(createHeading('Exclusions', 2));
  sections.push(...createBulletList([
    'Ongoing maintenance beyond the handover period (available as a separate agreement)',
    'Content creation or copywriting (unless specifically included)',
    'Third-party service costs (hosting, domains, API subscriptions)',
    'Features not described in this document',
  ]));

  // 9. Signatures
  sections.push(createHeading('Signatures', 1));
  sections.push(createParagraph('By signing below, both parties agree to the terms outlined in this Statement of Work.'));
  sections.push(...createSignatureBlock([
    { role: 'Provider', name: company },
    { role: 'Client', name: clientName },
  ]));

  return createDocument({
    title: 'Statement of Work',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
