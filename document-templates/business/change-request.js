// Change Request Form template
// A shorter form document for scope changes

import { createDocument, createHeading, createParagraph, createTable, createSignatureBlock } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const meta = docsState.meta || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const company = brandConfig?.companyName || 'ICU Media Design';
  const today = new Date().toISOString().split('T')[0];
  const crNumber = options.crNumber || 'CR-001';

  // Context-aware enrichment from project harvester
  const ctx = docsState.projectContext || {};
  const ctxDescription = resolveContext(docsState, 'description', '');
  const ctxFramework = resolveContext(docsState, 'framework', '');
  const allDeps = listDependencies(docsState, 'all');

  const sections = [];

  // Header info
  sections.push(createHeading('Change Request Details', 1));
  sections.push(createTable(
    ['Field', 'Value'],
    [
      ['CR Number', crNumber],
      ['Project', projectName],
      ['Client', clientName],
      ['Date Submitted', today],
      ['Requested By', options.requestedBy || clientName],
      ['Priority', options.priority || 'Medium'],
      ...(ctxDescription ? [['Project Context', ctxDescription]] : []),
    ]
  ));

  // Change Description
  sections.push(createHeading('Change Description', 1));
  sections.push(createParagraph(options.description || '[Describe the requested change in detail. What needs to change and why?]'));

  // Reason for Change
  sections.push(createHeading('Reason for Change', 1));
  sections.push(createParagraph(options.reason || '[Explain the business or technical reason for this change.]'));

  // Impact Assessment
  sections.push(createHeading('Impact Assessment', 1));
  sections.push(createTable(
    ['Area', 'Impact'],
    [
      ['Scope', options.scopeImpact || '[Describe scope changes]'],
      ['Timeline', options.timelineImpact || '[Estimated delay or no impact]'],
      ['Cost', options.costImpact || '[Additional cost or included in existing budget]'],
      ['Quality/Risk', options.riskImpact || '[Any quality or risk implications]'],
      ...(ctxFramework ? [['Technology', `Current stack: ${ctxFramework}${allDeps.length ? `. Key dependencies: ${allDeps.slice(0, 5).join(', ')}` : ''}`]] : []),
    ]
  ));

  // Affected Documents
  sections.push(createHeading('Affected Documents', 1));
  sections.push(createParagraph('The following documents may need to be regenerated or updated:'));
  const affectedDocs = options.affectedDocs || ['Project Plan', 'Statement of Work'];
  sections.push(createTable(
    ['Document', 'Action Required'],
    affectedDocs.map(d => [d, 'Review and update if affected'])
  ));

  // Decision
  sections.push(createHeading('Decision', 1));
  sections.push(createTable(
    ['Decision', 'Date', 'Decided By'],
    [
      ['[ ] Approved  [ ] Rejected  [ ] Deferred', '', ''],
    ]
  ));
  sections.push(createParagraph('Comments:'));
  sections.push(createParagraph('[Decision notes and conditions]'));

  // Signatures
  sections.push(createHeading('Approval', 1));
  sections.push(...createSignatureBlock([
    { role: 'Provider', name: company },
    { role: 'Client', name: clientName },
  ]));

  return createDocument({
    title: 'Change Request Form',
    subtitle: `${projectName} — ${crNumber}`,
    clientName,
    brandConfig,
    sections,
    version: crNumber,
  version: options.version ? `v${options.version}` : undefined,
  });
}
