// Handover Checklist document template
// Generates a comprehensive handover checklist from docs-state parameters and module flags

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
  const ctxIntegrations = ctx.integrations || [];
  const ctxEnvVars = ctx.envVars || [];
  const ctxDependencies = ctx.dependencies || {};

  const sections = [];

  // 1. Handover Summary
  sections.push(createHeading('Handover Summary', 1));
  sections.push(createParagraph(`This checklist tracks the handover of ${projectName} from ${company.name || '[AGENCY]'} to ${clientName}. All items must be completed and signed off before the project is considered fully handed over.`));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['Project', projectName],
      ['Client', clientName],
      ['Handover Date', '[DATE]'],
      ['Agency Contact', company.email || '[AGENCY CONTACT]'],
      ['Client Contact', params['client-contact'] || '[CLIENT CONTACT]'],
    ]
  ));

  // 2. Documentation Checklist
  sections.push(createHeading('Documentation', 1));
  sections.push(createParagraph('All project documentation should be delivered and confirmed received.'));

  const docItems = [
    ['User Manual', 'End-user guide for day-to-day site management', 'Not Started'],
    ['Administrator Guide', 'Admin-level configuration and maintenance guide', 'Not Started'],
    ['Training Materials', 'Training guide and/or recorded sessions', 'Not Started'],
    ['Deployment Runbook', 'Step-by-step deployment procedures', 'Not Started'],
  ];
  if (flags.needs_api) docItems.push(['API Documentation', 'API endpoint reference and authentication guide', 'Not Started']);
  if (flags.needs_database) docItems.push(['Database Schema', 'Database structure and relationship documentation', 'Not Started']);
  docItems.push(['Architecture Overview', 'System architecture and technology decisions', 'Not Started']);
  docItems.push(['Environment Guide', 'Environment variables and configuration reference', 'Not Started']);

  sections.push(createTable(
    ['Document', 'Description', 'Status'],
    docItems
  ));

  // 3. Access & Credentials
  sections.push(createHeading('Access & Credentials', 1));
  sections.push(createParagraph('All credentials and access must be transferred to the client and agency access revoked.'));

  const accessItems = [
    ['Domain registrar', 'Login transferred to client', 'Not Started'],
    ['DNS management', 'Client has access to manage DNS records', 'Not Started'],
    ['Hosting platform', 'Client account created and ownership transferred', 'Not Started'],
    ['SSL certificate', 'Certificate ownership and renewal transferred', 'Not Started'],
    ['Admin accounts', 'Client admin accounts created, agency accounts deactivated', 'Not Started'],
  ];
  if (flags.needs_email) accessItems.push(['Email service (SMTP)', 'Credentials transferred, test email sent', 'Not Started']);
  if (flags.needs_analytics) accessItems.push(['Analytics platform', 'Client added as owner/admin', 'Not Started']);
  if (flags.needs_payments) accessItems.push(['Payment gateway', 'Client account configured and verified', 'Not Started']);
  if (flags.needs_search) accessItems.push(['Search service', 'API keys transferred to client', 'Not Started']);
  if (flags.needs_n8n) accessItems.push(['n8n / Automation platform', 'Access transferred, workflows documented', 'Not Started']);
  // Add integration-specific access items from context
  for (const integration of ctxIntegrations) {
    const name = typeof integration === 'string' ? integration : integration.name || String(integration);
    const capitalised = name.charAt(0).toUpperCase() + name.slice(1);
    accessItems.push([capitalised, `${capitalised} credentials transferred to client`, 'Not Started']);
  }
  accessItems.push(['Source code repository', 'Client added as owner or repo transferred', 'Not Started']);
  accessItems.push(['CI/CD pipeline', 'Client has access to deployment pipeline', 'Not Started']);

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    accessItems
  ));

  // 4. Environment & Infrastructure
  sections.push(createHeading('Environment & Infrastructure', 1));

  const envItems = [
    ['Production environment', 'Running, monitored, and accessible', 'Not Started'],
    ['Staging environment', 'Available for testing future changes', 'Not Started'],
    ['Environment variables', 'All env vars documented and accessible to client', 'Not Started'],
    ['Backups', 'Automated backups configured and verified', 'Not Started'],
    ['Monitoring', 'Uptime monitoring active and alerting to client', 'Not Started'],
    ['SSL/TLS', 'Valid certificate installed, auto-renewal configured', 'Not Started'],
    ['CDN / Caching', 'Configured and cache purge procedure documented', 'Not Started'],
  ];
  if (flags.needs_database) envItems.push(['Database backups', 'Automated daily backups with 30-day retention', 'Not Started']);

  // Itemize environment variables from context
  if (ctxEnvVars.length > 0) {
    for (const v of ctxEnvVars) {
      const varName = typeof v === 'string' ? v : v.name || v.key || String(v);
      envItems.push([`Env: ${varName}`, `Set in target environment and documented`, 'Not Started']);
    }
  }

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    envItems
  ));

  // 5. Code & Repository
  sections.push(createHeading('Code & Repository', 1));

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    [
      ['Source code', 'Latest version pushed to main/master branch', 'Not Started'],
      ['README', 'Up-to-date README with setup instructions', 'Not Started'],
      ['Dependencies', 'All dependencies documented and up to date', 'Not Started'],
      ['Environment file', '.env.example provided with all required variables', 'Not Started'],
      ['Build process', 'Build commands documented and tested', 'Not Started'],
      ['Linting / Formatting', 'Code style configuration included in repo', 'Not Started'],
      ['Tests', 'Test suite passes, test coverage documented', 'Not Started'],
      ['Branching strategy', 'Documented (e.g. main, develop, feature branches)', 'Not Started'],
    ]
  ));

  // Third-party service credentials checklist from dependencies
  const depCategories = ['auth', 'payments', 'email', 'database', 'search'];
  const thirdPartyItems = [];
  for (const cat of depCategories) {
    const deps = ctxDependencies[cat] || [];
    for (const dep of deps) {
      const depName = typeof dep === 'string' ? dep.split('@')[0] : String(dep);
      thirdPartyItems.push([depName, `Credentials and API keys for ${depName} transferred`, 'Not Started']);
    }
  }
  if (thirdPartyItems.length > 0) {
    sections.push(createHeading('Third-Party Service Credentials', 2));
    sections.push(createTable(
      ['Service', 'Requirement', 'Status'],
      thirdPartyItems
    ));
  }

  // 6. Training & Knowledge Transfer
  sections.push(createHeading('Training & Knowledge Transfer', 1));

  const trainingItems = [
    ['Content management training', 'Editors trained on creating and managing content', 'Not Started'],
    ['Admin training', 'Admins trained on user management and configuration', 'Not Started'],
    ['Training materials delivered', 'Written guides and/or video recordings provided', 'Not Started'],
  ];
  if (flags.needs_payments) trainingItems.push(['E-commerce training', 'Staff trained on order processing and product management', 'Not Started']);
  if (flags.needs_analytics) trainingItems.push(['Analytics training', 'Staff trained on viewing and interpreting reports', 'Not Started']);
  trainingItems.push(['Deployment training', 'Technical staff trained on deployment procedure', 'Not Started']);
  trainingItems.push(['Troubleshooting guide reviewed', 'Client has reviewed common issues and resolutions', 'Not Started']);

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    trainingItems
  ));

  // 7. Testing & Quality
  sections.push(createHeading('Testing & Quality Assurance', 1));

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    [
      ['Cross-browser testing', 'Tested in Chrome, Firefox, Safari, Edge', 'Not Started'],
      ['Mobile responsiveness', 'Tested on mobile and tablet devices', 'Not Started'],
      ['Accessibility', 'WCAG 2.1 AA compliance verified', 'Not Started'],
      ['Performance', 'Page load times within acceptable thresholds', 'Not Started'],
      ['Security scan', 'No critical or high vulnerabilities outstanding', 'Not Started'],
      ['Forms tested', 'All forms submit correctly and send notifications', 'Not Started'],
      ['404 / Error pages', 'Custom error pages in place', 'Not Started'],
      ['SEO basics', 'Meta titles, descriptions, sitemap, robots.txt configured', 'Not Started'],
    ]
  ));

  // 8. Legal & Compliance
  sections.push(createHeading('Legal & Compliance', 1));

  const legalItems = [
    ['Privacy policy', 'Published and accessible from all pages', 'Not Started'],
    ['Terms of service', 'Published (if applicable)', 'Not Started'],
    ['Cookie consent', 'Cookie banner implemented and functional', 'Not Started'],
    ['Licensing', 'All third-party licenses documented and compliant', 'Not Started'],
    ['Data processing', 'DPA signed if handling personal data', 'Not Started'],
  ];
  if (flags.needs_payments) legalItems.push(['PCI compliance', 'Payment handling meets PCI DSS requirements', 'Not Started']);
  if (flags.needs_analytics) legalItems.push(['Analytics consent', 'Analytics only tracked with user consent', 'Not Started']);

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    legalItems
  ));

  // 9. Support & Maintenance Agreement
  sections.push(createHeading('Support & Maintenance', 1));

  sections.push(createTable(
    ['Item', 'Requirement', 'Status'],
    [
      ['Support agreement', 'Ongoing support terms agreed and documented', 'Not Started'],
      ['SLA defined', 'Response times and availability commitments agreed', 'Not Started'],
      ['Escalation process', 'Contact hierarchy documented for emergencies', 'Not Started'],
      ['Maintenance schedule', 'Regular update/maintenance schedule agreed', 'Not Started'],
      ['Warranty period', 'Post-launch warranty period and scope defined', 'Not Started'],
    ]
  ));

  // 10. Sign-Off
  sections.push(createHeading('Sign-Off', 1));
  sections.push(createParagraph('Both parties confirm that all handover items have been completed satisfactorily.'));

  sections.push(createTable(
    ['Role', 'Name', 'Signature', 'Date'],
    [
      ['Agency Representative', '[NAME]', '', '[DATE]'],
      ['Client Representative', '[NAME]', '', '[DATE]'],
      ['Technical Lead', '[NAME]', '', '[DATE]'],
    ]
  ));

  sections.push(createParagraph('By signing above, both parties acknowledge that:'));
  sections.push(createBulletList([
    'All deliverables have been received and reviewed',
    'All credentials and access have been transferred',
    'Training has been completed to the client\'s satisfaction',
    'The support and maintenance agreement is understood',
    'The warranty period and its scope are agreed',
  ]));

  return createDocument({
    title: 'Handover Checklist',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
