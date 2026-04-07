// Closure Report document template
// Generates a comprehensive project closure report from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = (meta['project-slug'] || '[PROJECT]').replace(/-/g, ' ');
  const company = brandConfig ? getCompanyInfo(brandConfig) : {};
  const stack = params['tech-stack'] || '[TECH STACK]';
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const appDescription = resolveContext(docsState, 'description', '');
  const ctxTaskSummary = ctx.taskSummary || {};

  const sections = [];

  // 1. Executive Summary
  sections.push(createHeading('Executive Summary', 1));
  const summaryText = appDescription
    ? `This closure report documents the completion of ${projectName} for ${clientName} — ${appDescription}. It summarises the project outcomes, deliverables, budget performance, timeline adherence, and lessons learned.`
    : `This closure report documents the completion of ${projectName} for ${clientName}. It summarises the project outcomes, deliverables, budget performance, timeline adherence, and lessons learned.`;
  sections.push(createParagraph(summaryText));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['Project', projectName],
      ['Client', clientName],
      ['Agency', company.name || '[AGENCY NAME]'],
      ['Project Manager', params['project-manager'] || '[PROJECT MANAGER]'],
      ['Start Date', params['start-date'] || '[START DATE]'],
      ['Completion Date', params['completion-date'] || '[COMPLETION DATE]'],
      ['Final Status', 'Complete'],
    ]
  ));

  // 2. Project Objectives
  sections.push(createHeading('Project Objectives', 1));
  sections.push(createParagraph('The following objectives were defined at project inception. Each is assessed against its outcome.'));

  const objectives = [
    ['Deliver a functional, production-ready application', 'Met', 'Application deployed and operational'],
    ['Meet agreed timeline', '[Met/Partially Met/Not Met]', '[Details]'],
    ['Stay within budget', '[Met/Partially Met/Not Met]', '[Details]'],
    ['Meet quality standards', 'Met', 'Passed QA, security audit, and performance testing'],
  ];
  if (flags.needs_cms) objectives.push(['Content management capability', 'Met', 'CMS implemented and editors trained']);
  if (flags.needs_payments) objectives.push(['E-commerce functionality', 'Met', 'Payment processing tested and operational']);
  if (flags.needs_api) objectives.push(['API integration', 'Met', 'API endpoints documented and tested']);

  sections.push(createTable(
    ['Objective', 'Status', 'Notes'],
    objectives
  ));

  // 3. Scope Summary
  sections.push(createHeading('Scope Summary', 1));

  sections.push(createHeading('Delivered Scope', 2));
  sections.push(createParagraph('The following features and components were delivered as part of the project:'));
  const deliveredScope = [
    'Core application built and deployed',
    'Responsive design across all breakpoints',
    'Cross-browser compatibility (Chrome, Firefox, Safari, Edge)',
  ];
  if (flags.needs_auth) deliveredScope.push('User authentication and role-based access control');
  if (flags.needs_cms) deliveredScope.push('Content management system with editorial workflow');
  if (flags.needs_database) deliveredScope.push('Database design, implementation, and migration scripts');
  if (flags.needs_api) deliveredScope.push('RESTful API with documentation');
  if (flags.needs_payments) deliveredScope.push('E-commerce with payment gateway integration');
  if (flags.needs_search) deliveredScope.push('Site search functionality');
  if (flags.needs_analytics) deliveredScope.push('Analytics integration and reporting');
  if (flags.needs_email) deliveredScope.push('Transactional email system');
  if (flags.needs_n8n) deliveredScope.push('Workflow automation via n8n');
  deliveredScope.push('Documentation suite (user manual, admin guide, deployment runbook)');
  deliveredScope.push('Training delivered to client team');
  sections.push(createBulletList(deliveredScope));

  // Completion metrics from context harvester
  if (ctxTaskSummary.total || ctxTaskSummary.completed) {
    sections.push(createHeading('Completion Metrics', 2));
    sections.push(createTable(
      ['Metric', 'Value'],
      [
        ['Total Tasks', String(ctxTaskSummary.total || '—')],
        ['Completed', String(ctxTaskSummary.completed || '—')],
        ['In Progress', String(ctxTaskSummary.inProgress || '—')],
        ['Remaining', String(ctxTaskSummary.remaining || '—')],
        ['Completion Rate', ctxTaskSummary.total ? `${Math.round((ctxTaskSummary.completed / ctxTaskSummary.total) * 100)}%` : '—'],
      ]
    ));
  }

  sections.push(createHeading('Out of Scope / Deferred', 2));
  sections.push(createParagraph('The following items were explicitly excluded from scope or deferred to a future phase:'));
  sections.push(createBulletList([
    '[Item 1 — description and reason for exclusion]',
    '[Item 2 — description and reason for exclusion]',
    '[Add or remove items as applicable]',
  ]));

  sections.push(createHeading('Change Requests', 2));
  sections.push(createParagraph('The following scope changes were requested and processed during the project:'));
  sections.push(createTable(
    ['Change Request', 'Description', 'Impact', 'Status'],
    [
      ['[CR-001]', '[Description]', '[Budget/timeline impact]', '[Approved/Rejected]'],
      ['[CR-002]', '[Description]', '[Budget/timeline impact]', '[Approved/Rejected]'],
    ]
  ));

  // 4. Timeline Performance
  sections.push(createHeading('Timeline Performance', 1));
  sections.push(createTable(
    ['Phase', 'Planned Duration', 'Actual Duration', 'Variance', 'Notes'],
    [
      ['Discovery & Scoping', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
      ['Design', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
      ['Development', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
      ['Testing & QA', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
      ['Deployment & Launch', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
      ['Training & Handover', '[X weeks]', '[X weeks]', '[+/- X]', '[Notes]'],
    ]
  ));

  // 5. Budget Performance
  sections.push(createHeading('Budget Performance', 1));
  sections.push(createTable(
    ['Category', 'Budgeted', 'Actual', 'Variance'],
    [
      ['Design', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Development', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Testing', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Project Management', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Third-party Licences', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Hosting / Infrastructure', '[Amount]', '[Amount]', '[+/- Amount]'],
      ['Change Requests', 'N/A', '[Amount]', '[Amount]'],
      ['Total', '[Amount]', '[Amount]', '[+/- Amount]'],
    ]
  ));

  // 6. Quality Summary
  sections.push(createHeading('Quality Summary', 1));

  sections.push(createTable(
    ['Quality Area', 'Result', 'Notes'],
    [
      ['Functional testing', '[Pass/Partial]', '[Details]'],
      ['Cross-browser testing', '[Pass/Partial]', '[Details]'],
      ['Mobile / Responsive', '[Pass/Partial]', '[Details]'],
      ['Performance (page load)', '[Pass/Partial]', '[Metric achieved]'],
      ['Accessibility (WCAG 2.1 AA)', '[Pass/Partial]', '[Details]'],
      ['Security audit', '[Pass/Partial]', '[Open issues if any]'],
      ['SEO baseline', '[Pass/Partial]', '[Details]'],
    ]
  ));

  // 7. Deliverables Register
  sections.push(createHeading('Deliverables Register', 1));
  sections.push(createParagraph('All project deliverables and their acceptance status:'));

  const deliverables = [
    ['Application (production)', 'Delivered', 'Accepted'],
    ['Source code (repository)', 'Delivered', 'Accepted'],
    ['User Manual', 'Delivered', '[Accepted/Pending]'],
    ['Administrator Guide', 'Delivered', '[Accepted/Pending]'],
    ['Deployment Runbook', 'Delivered', '[Accepted/Pending]'],
    ['Training Materials', 'Delivered', '[Accepted/Pending]'],
    ['Handover Checklist', 'Delivered', '[Accepted/Pending]'],
  ];
  if (flags.needs_api) deliverables.push(['API Documentation', 'Delivered', '[Accepted/Pending]']);
  if (flags.needs_database) deliverables.push(['Database Schema', 'Delivered', '[Accepted/Pending]']);
  deliverables.push(['Architecture Documentation', 'Delivered', '[Accepted/Pending]']);

  sections.push(createTable(
    ['Deliverable', 'Status', 'Client Acceptance'],
    deliverables
  ));

  // 8. Risks & Issues Log
  sections.push(createHeading('Risks & Issues Encountered', 1));
  sections.push(createParagraph('Key risks and issues encountered during the project, and how they were resolved:'));
  sections.push(createTable(
    ['Issue', 'Severity', 'Impact', 'Resolution'],
    [
      ['[Issue 1]', '[High/Medium/Low]', '[Description of impact]', '[How it was resolved]'],
      ['[Issue 2]', '[High/Medium/Low]', '[Description of impact]', '[How it was resolved]'],
    ]
  ));

  // 9. Lessons Learned
  sections.push(createHeading('Lessons Learned', 1));

  sections.push(createHeading('What Went Well', 2));
  sections.push(createBulletList([
    '[Positive outcome 1 — what contributed to success]',
    '[Positive outcome 2 — what contributed to success]',
    '[Positive outcome 3 — what contributed to success]',
  ]));

  sections.push(createHeading('What Could Be Improved', 2));
  sections.push(createBulletList([
    '[Area for improvement 1 — recommendation]',
    '[Area for improvement 2 — recommendation]',
    '[Area for improvement 3 — recommendation]',
  ]));

  sections.push(createHeading('Recommendations for Future Projects', 2));
  sections.push(createBulletList([
    '[Recommendation 1]',
    '[Recommendation 2]',
    '[Recommendation 3]',
  ]));

  // 10. Ongoing Support
  sections.push(createHeading('Ongoing Support', 1));
  sections.push(createTable(
    ['Item', 'Detail'],
    [
      ['Support Agreement', params['support-agreement'] || '[Type of agreement — retainer, ad-hoc, etc.]'],
      ['Warranty Period', params['warranty-period'] || '[X months from launch date]'],
      ['Support Hours', params['support-hours'] || '[Business hours / 24-7]'],
      ['Primary Contact', company.email || '[SUPPORT EMAIL]'],
      ['Escalation Contact', params['escalation-contact'] || '[ESCALATION CONTACT]'],
      ['SLA — Critical', '1-hour response, 4-hour resolution target'],
      ['SLA — High', '4-hour response, 1 business day resolution target'],
      ['SLA — Normal', '1 business day response, 3 business day resolution target'],
    ]
  ));

  // 11. Sign-Off
  sections.push(createHeading('Project Sign-Off', 1));
  sections.push(createParagraph('By signing below, both parties confirm that the project has been completed to their satisfaction and all deliverables have been accepted.'));

  sections.push(createTable(
    ['Role', 'Name', 'Signature', 'Date'],
    [
      ['Project Manager (Agency)', '[NAME]', '', '[DATE]'],
      ['Client Representative', '[NAME]', '', '[DATE]'],
      ['Technical Lead', '[NAME]', '', '[DATE]'],
    ]
  ));

  return createDocument({
    title: 'Project Closure Report',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
