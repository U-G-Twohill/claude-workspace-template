// Client Services Agreement / Master Services Agreement template
// Generates a professional contract under NZ law (Contract and Commercial Law Act 2017)

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { liability, ip, confidentiality, termination, dispute, forceMajeure, dataProtection, indemnity, warranties, payment, amendments, entireAgreement } from './clauses/index.js';

const MODULE_DELIVERABLES = {
  needs_design: 'Custom design, visual identity, and responsive layout implementation',
  needs_database: 'Database architecture, design, migration, and documentation',
  needs_auth: 'User authentication, registration, and role-based access control',
  needs_api: 'RESTful or GraphQL API design, development, and documentation',
  needs_payments: 'Payment gateway integration and checkout flow implementation',
  needs_search: 'Search functionality including indexing, filtering, and results optimisation',
  needs_email: 'Transactional email system, templates, and delivery infrastructure',
  needs_analytics: 'Analytics integration, event tracking, and reporting dashboard',
  needs_cms: 'Content management system setup and configuration',
  needs_cookie_policy: 'Cookie consent mechanism and cookie policy implementation',
};

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};
  const ctx = docsState.projectContext || {};
  const company = brandConfig?.companyName || 'ICU Media Design';
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const companyAddress = brandConfig?.address || '[PROVIDER ADDRESS]';
  const clientAddress = params['client-address'] || ctx.client?.location || '[CLIENT ADDRESS]';
  const projectValue = params['project-value'] || '[To be quoted]';
  const paymentTerms = params['payment-terms'] || '50% upfront, 50% on completion';
  const rate = params['project-rate'] || '[Rate to be confirmed]';
  const milestoneDates = params['key-milestone-dates'] || {};
  const clauseParams = { companyName: company, clientName };

  const sections = [];

  // 1. Parties
  sections.push(createHeading('Parties', 1));

  sections.push(createParagraph(
    'This Client Services Agreement ("Agreement") is entered into as of the date of the last signature below ("Effective Date") by and between:'
  ));

  sections.push(createParagraph(
    `Provider: ${company}, ${companyAddress} ("Provider")`, { bold: true }
  ));

  sections.push(createParagraph(
    `Client: ${clientName}, ${clientAddress} ("Client")`, { bold: true }
  ));

  sections.push(createParagraph(
    'Each a "Party" and together the "Parties".'
  ));

  // 2. Recitals
  sections.push(createHeading('Recitals', 1));

  sections.push(createParagraph(
    `A. The Provider carries on the business of web design, development, and related digital services.`
  ));

  sections.push(createParagraph(
    `B. The Client wishes to engage the Provider to perform services in connection with ${projectName} ("the Project") as described in this Agreement and any accompanying Statement of Work or proposal.`
  ));

  sections.push(createParagraph(
    'C. The Parties wish to record the terms and conditions upon which the Provider will supply the services to the Client.'
  ));

  sections.push(createParagraph(
    'D. This Agreement is subject to the Contract and Commercial Law Act 2017 (NZ) and the laws of New Zealand.'
  ));

  // 3. Definitions
  sections.push(createHeading('Definitions', 1));

  sections.push(createParagraph(
    'In this Agreement, unless the context otherwise requires:'
  ));

  sections.push(...createBulletList([
    '"Agreement" means this Client Services Agreement, including all schedules, appendices, statements of work, and change requests incorporated by reference.',
    '"Business Day" means any day other than a Saturday, Sunday, or public holiday in New Zealand.',
    '"Confidential Information" has the meaning given to it in the Confidentiality clause of this Agreement.',
    '"Deliverables" means all works, materials, documents, software, designs, and other outputs created by the Provider under this Agreement and described in the Scope of Services.',
    '"Effective Date" means the date of the last signature on this Agreement.',
    '"Fees" means the amounts payable by the Client to the Provider as set out in the Fees and Payment section of this Agreement.',
    '"Force Majeure Event" has the meaning given to it in the Force Majeure clause of this Agreement.',
    '"Intellectual Property Rights" means all intellectual property rights, including patents, trade marks, copyright, design rights, trade secrets, know-how, database rights, and all other intellectual property rights whether registered or unregistered, and including all applications for and renewals or extensions of such rights.',
    '"Project" means the project described in this Agreement, being ' + projectName + '.',
    '"Services" means the services to be provided by the Provider as set out in the Scope of Services and any Statement of Work.',
    '"Statement of Work" or "SoW" means a document describing specific deliverables, timelines, and fees for a phase or component of the Project.',
  ]));

  // 4. Scope of Services
  sections.push(createHeading('Scope of Services', 1));

  sections.push(createParagraph(
    `The Provider shall perform the Services described in this Agreement and any accompanying Statement of Work or proposal accepted by both Parties. The Services relate to the design, development, and delivery of ${projectName} for the Client.`
  ));

  if (reqs.goals || ctx.description) {
    sections.push(createParagraph(reqs.goals || ctx.description));
  }

  sections.push(createParagraph(
    'The scope of the Project includes the following deliverables:'
  ));

  const deliverables = [
    'Project discovery, planning, and requirements analysis',
    'Core application or website development and implementation',
  ];
  for (const [flag, desc] of Object.entries(MODULE_DELIVERABLES)) {
    if (flags[flag]) deliverables.push(desc);
  }
  deliverables.push(
    'Quality assurance, testing, and bug resolution',
    'Deployment to production environment',
    'Documentation, training, and project handover',
  );
  sections.push(...createBulletList(deliverables));

  sections.push(createParagraph(
    'Any work not expressly described in this Agreement or an accepted Statement of Work is outside the scope of this Agreement. Additional work shall be subject to a separate agreement or change request in accordance with the Amendments clause.'
  ));

  // 5. Project Timeline
  sections.push(createHeading('Project Timeline', 1));

  sections.push(createParagraph(
    'The Provider shall use reasonable endeavours to deliver the Services in accordance with the following indicative timeline. The Parties acknowledge that timelines are estimates and may be affected by the Client\'s responsiveness, scope changes, third-party dependencies, and Force Majeure Events.'
  ));

  const timeline = [
    ['Discovery & Planning', milestoneDates['design-start'] || 'To be confirmed'],
    ['Design', milestoneDates['design-start'] || 'To be confirmed'],
    ['Development', milestoneDates['development-start'] || 'To be confirmed'],
    ['QA & Testing', milestoneDates['qa-start'] || 'To be confirmed'],
    ['Launch', milestoneDates['launch-target'] || 'To be confirmed'],
    ['Handover & Training', 'Post-launch'],
  ];
  sections.push(createTable(['Milestone', 'Target Date'], timeline));

  sections.push(createParagraph(
    'Detailed milestone dates, durations, and dependencies shall be set out in the accompanying Statement of Work. Where there is a conflict between dates in this Agreement and a Statement of Work, the Statement of Work shall prevail.'
  ));

  // 6. Fees and Payment
  sections.push(createHeading('Fees and Payment', 1));

  sections.push(createParagraph(
    `The Client shall pay the Provider the following fees for the Services:`
  ));

  sections.push(createParagraph(
    `Project Value: ${typeof projectValue === 'number' ? `$${projectValue.toLocaleString()}` : projectValue}`
  ));

  sections.push(createParagraph(
    `Rate: ${rate}`
  ));

  sections.push(createParagraph(
    `Payment Terms: ${paymentTerms}`
  ));

  sections.push(...payment({
    ...clauseParams,
    paymentDays: params['payment-days'] || 14,
    currency: params['currency'] || 'NZD',
    gstRegistered: params['gst-registered'] !== false,
  }));

  if (flags.needs_payments) {
    sections.push(createHeading('Payment Processing', 2));

    sections.push(createParagraph(
      'The Project includes the integration of third-party payment processing services (Stripe or equivalent). The Client acknowledges and agrees that:'
    ));

    sections.push(...createBulletList([
      'All payment transactions processed through the Project are subject to the payment processor\'s terms of service, fees, and policies.',
      'The Provider is not responsible for payment processing failures, chargebacks, disputes, or fraud that occur within the payment processor\'s systems.',
      'The Client is responsible for obtaining and maintaining any merchant accounts, payment processor agreements, and PCI DSS compliance obligations required for their business.',
      'Transaction fees charged by the payment processor are the Client\'s responsibility and are separate from the Fees payable under this Agreement.',
    ]));
  }

  // 7. Intellectual Property
  sections.push(createHeading('Intellectual Property', 1));
  sections.push(...ip(clauseParams));

  // 8. Confidentiality
  sections.push(createHeading('Confidentiality', 1));
  sections.push(...confidentiality(clauseParams));

  // 9. Warranties
  sections.push(createHeading('Warranties', 1));
  sections.push(...warranties({
    ...clauseParams,
    warrantyPeriod: params['warranty-period'] || 30,
  }));

  // 10. Limitation of Liability
  sections.push(createHeading('Limitation of Liability', 1));
  sections.push(...liability(clauseParams));

  // 11. Indemnity
  sections.push(createHeading('Indemnity', 1));
  sections.push(...indemnity(clauseParams));

  // 12. Termination
  sections.push(createHeading('Termination', 1));
  sections.push(...termination(clauseParams));

  // 13. Force Majeure
  sections.push(createHeading('Force Majeure', 1));
  sections.push(...forceMajeure(clauseParams));

  // 14. Data Protection
  sections.push(createHeading('Data Protection', 1));

  const dpParams = {
    ...clauseParams,
    includeGdpr: params['include-gdpr'] || false,
  };
  sections.push(...dataProtection(dpParams));

  if (flags.needs_dpa) {
    sections.push(createParagraph(
      `The Parties acknowledge that the nature of the Services may require the processing of personal information on a scale or in a manner that necessitates a separate Data Processing Agreement ("DPA"). The Parties shall negotiate and execute a DPA in good faith prior to the commencement of any processing activities that require one. The DPA shall be deemed incorporated into this Agreement by reference and shall prevail over this clause to the extent of any inconsistency.`
    ));
  }

  // 15. Dispute Resolution
  sections.push(createHeading('Dispute Resolution', 1));
  sections.push(...dispute(clauseParams));

  // 16. Amendments
  sections.push(createHeading('Amendments', 1));
  sections.push(...amendments(clauseParams));

  // 17. Entire Agreement
  sections.push(createHeading('Entire Agreement', 1));
  sections.push(...entireAgreement(clauseParams));

  // 18. Signatures
  sections.push(createHeading('Execution', 1));

  sections.push(createParagraph(
    'The Parties have executed this Agreement as of the date set out below. Each signatory warrants that they have the authority to bind the Party on whose behalf they are signing.'
  ));

  sections.push(...createSignatureBlock([
    { role: 'Provider', name: company },
    { role: 'Client', name: clientName },
  ]));

  return createDocument({
    title: 'Client Services Agreement',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
