// Maintenance Guide document template
// Generates a comprehensive maintenance guide from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = (meta['project-slug'] || '[PROJECT]').replace(/-/g, ' ');
  const stack = params['tech-stack'] || '[TECH STACK]';
  const company = brandConfig ? getCompanyInfo(brandConfig) : {};
  const hostingPlatform = params['hosting-platform'] || '[HOSTING PLATFORM]';
  const pkgManager = params['package-manager'] || 'npm';
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxDependencies = ctx.dependencies || {};
  const ctxScripts = ctx.scripts || {};
  const ctxEnvVars = ctx.envVars || [];
  const ctxNodeVersion = resolveContext(docsState, 'nodeVersion', '');
  const ctxFramework = resolveContext(docsState, 'framework', '') || resolveContext(docsState, 'dependencies.framework', '');

  const sections = [];

  // 1. Overview
  sections.push(createHeading('Maintenance Overview', 1));
  sections.push(createParagraph(`This guide covers all ongoing maintenance procedures for ${projectName}. It is intended for developers and technical staff responsible for keeping the application secure, performant, and up to date.`));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['Application', projectName],
      ['Technology Stack', typeof stack === 'string' ? stack : JSON.stringify(stack)],
      ['Hosting', hostingPlatform],
      ['Package Manager', pkgManager],
      ...(ctxNodeVersion ? [['Runtime Version', `Node.js ${ctxNodeVersion}`]] : []),
      ...(ctxFramework ? [['Framework', typeof ctxFramework === 'string' ? ctxFramework : JSON.stringify(ctxFramework)]] : []),
      ['Support Contact', company.email || '[SUPPORT EMAIL]'],
    ]
  ));

  // 2. Routine Maintenance Schedule
  sections.push(createHeading('Routine Maintenance Schedule', 1));
  sections.push(createParagraph('Follow this schedule to keep the application in good health. Skipping maintenance tasks increases the risk of security vulnerabilities, performance degradation, and unexpected downtime.'));

  sections.push(createTable(
    ['Task', 'Frequency', 'Owner', 'Procedure'],
    [
      ['Security patches', 'As released (within 48h for critical)', 'Developer', 'See "Dependency Updates" section'],
      ['Dependency updates', 'Monthly', 'Developer', 'See "Dependency Updates" section'],
      ['Database backup verification', 'Monthly', 'Developer / Admin', 'Restore latest backup to test environment'],
      ['Uptime & error monitoring review', 'Weekly', 'Developer / Admin', 'Review monitoring dashboard and error logs'],
      ['Performance check', 'Monthly', 'Developer', 'Run Lighthouse, check server metrics'],
      ['SSL certificate check', 'Monthly (auto-renew)', 'Admin', 'Verify certificate validity and expiry date'],
      ['Content audit', 'Quarterly', 'Client / Editor', 'Review published content for accuracy'],
      ['Analytics review', 'Monthly', 'Client / Admin', 'Review traffic trends and user behaviour'],
      ['Full system backup test', 'Quarterly', 'Developer', 'Full restore to test environment'],
      ['Security audit', 'Annually', 'Security team', 'Comprehensive security review'],
    ]
  ));

  // 3. Dependency Updates
  sections.push(createHeading('Dependency Updates', 1));

  sections.push(createHeading('Checking for Updates', 2));
  const updateCheckSteps = [
    `Run \`${pkgManager} outdated\` to see available updates`,
    `Run \`${pkgManager} audit\` to check for known vulnerabilities`,
    'Review changelogs for breaking changes before upgrading major versions',
    'Always update on a branch, never directly on main/production',
  ];
  if (ctxScripts.lint) updateCheckSteps.push(`Run lint check: \`${ctxScripts.lint}\``);
  if (ctxScripts.test) updateCheckSteps.push(`Run tests after updating: \`${ctxScripts.test}\``);
  sections.push(createBulletList(updateCheckSteps));

  sections.push(createHeading('Update Procedure', 2));
  sections.push(createBulletList([
    '1. Create a new branch: `git checkout -b maintenance/dependency-updates`',
    `2. Update dependencies: \`${pkgManager} update\` (minor/patch) or manually for major versions`,
    `3. Run the full test suite: \`${ctxScripts.test || pkgManager + ' test'}\``,
    `4. Build and verify: \`${ctxScripts.build || pkgManager + ' run build'}\``,
    '5. Test manually in the staging environment',
    '6. Merge to main and deploy via the standard deployment process',
    '7. Monitor error tracking for 24 hours after deployment',
  ]));

  sections.push(createHeading('Security Patches', 2));
  sections.push(createParagraph('Security patches should be applied with urgency based on severity:'));
  sections.push(createTable(
    ['Severity', 'Response Time', 'Process'],
    [
      ['Critical (CVSS 9.0+)', 'Within 24 hours', 'Immediate patch, expedited deployment'],
      ['High (CVSS 7.0–8.9)', 'Within 48 hours', 'Patch and deploy within standard process'],
      ['Medium (CVSS 4.0–6.9)', 'Within 1 week', 'Include in next scheduled maintenance'],
      ['Low (CVSS < 4.0)', 'Within 1 month', 'Include in next monthly update cycle'],
    ]
  ));

  // 4. Database Maintenance
  if (flags.needs_database) {
    sections.push(createHeading('Database Maintenance', 1));

    sections.push(createHeading('Backups', 2));
    sections.push(createBulletList([
      'Automated daily backups should be configured and verified',
      'Backup retention: 30 days minimum',
      'Monthly: restore a backup to a test environment to verify integrity',
      'Backups should be stored in a separate location from the database',
    ]));

    sections.push(createHeading('Performance Optimisation', 2));
    sections.push(createBulletList([
      'Monitor slow queries via database logs or monitoring tools',
      'Review and optimise queries that exceed 200ms average',
      'Check index usage — add indexes for frequently queried columns',
      'Review table sizes and archive old data if tables grow excessively',
      'Run `VACUUM` / `OPTIMIZE TABLE` as appropriate for your database',
    ]));

    sections.push(createHeading('Migrations', 2));
    sections.push(createBulletList([
      'Always create migration files for schema changes — never modify the database directly',
      'Test migrations on staging before applying to production',
      'Keep a rollback migration for every forward migration',
      'Document breaking changes in the migration file comments',
    ]));
  }

  // 5. Server & Infrastructure
  sections.push(createHeading('Server & Infrastructure', 1));

  sections.push(createHeading('Health Monitoring', 2));
  sections.push(createTable(
    ['Metric', 'Healthy Range', 'Action If Exceeded'],
    [
      ['CPU usage', '< 70% sustained', 'Scale up or investigate resource-heavy processes'],
      ['Memory usage', '< 80%', 'Check for memory leaks, restart if needed'],
      ['Disk usage', '< 80%', 'Archive old files, clean logs, increase storage'],
      ['Response time (TTFB)', '< 200ms', 'Profile application, check database queries'],
      ['Error rate', '< 0.1%', 'Check error logs, investigate and fix root cause'],
      ['Uptime', '> 99.9%', 'Review outage causes, improve redundancy'],
    ]
  ));

  sections.push(createHeading('Log Management', 2));
  sections.push(createBulletList([
    'Application logs should be rotated daily and retained for 30 days',
    'Error logs should be forwarded to an error tracking service (e.g. Sentry)',
    'Access logs should be retained for 90 days for security analysis',
    'Never log sensitive data (passwords, tokens, personal information)',
    'Review error logs weekly for recurring issues',
  ]));

  sections.push(createHeading('SSL/TLS Certificates', 2));
  sections.push(createBulletList([
    'Certificates should auto-renew (e.g. via Let\'s Encrypt / hosting provider)',
    'Check certificate expiry monthly — renew at least 30 days before expiry',
    'Ensure all pages are served over HTTPS',
    'Test SSL configuration at ssllabs.com/ssltest periodically',
    'HSTS header should be enabled in production',
  ]));

  // 6. Content & Media
  if (flags.needs_cms) {
    sections.push(createHeading('Content & Media Maintenance', 1));
    sections.push(createBulletList([
      'Quarterly content review — check for outdated information, broken links',
      'Media library cleanup — remove unused uploads to save storage',
      'Image optimisation — ensure new uploads are optimised (WebP where supported)',
      'SEO review — check meta titles, descriptions, and structured data',
      'Sitemap regeneration — verify sitemap is current and submitted to search engines',
    ]));
  }

  // 7. Email System
  if (flags.needs_email) {
    sections.push(createHeading('Email System Maintenance', 1));
    sections.push(createBulletList([
      'Monthly: check email delivery rates and bounce rates',
      'Review spam complaints — investigate any spikes',
      'Verify DKIM, SPF, and DMARC records are correct',
      'Test transactional emails quarterly (password reset, notifications, etc.)',
      'Monitor email sending limits — upgrade plan if approaching limits',
      'Clean email lists — remove hard bounces and unsubscribed addresses',
    ]));
  }

  // 8. Payment System
  if (flags.needs_payments) {
    sections.push(createHeading('Payment System Maintenance', 1));
    sections.push(createBulletList([
      'Monthly: reconcile transactions against payment provider dashboard',
      'Verify webhook endpoints are responding correctly',
      'Test payment flow on staging after any updates',
      'Review PCI DSS compliance requirements annually',
      'Rotate payment API keys annually or on staff changes',
      'Monitor for failed payments and investigate patterns',
    ]));
  }

  // 9. Automation / n8n
  if (flags.needs_n8n) {
    sections.push(createHeading('Automation Maintenance (n8n)', 1));
    sections.push(createBulletList([
      'Weekly: check workflow execution logs for failures',
      'Monthly: review and update API credentials used by workflows',
      'Test critical workflows after any system updates',
      'Document any new workflows added',
      'Monitor execution counts against plan limits',
      'Back up workflow configurations monthly',
    ]));
  }

  // Configuration Reference (from context harvester)
  if (ctxEnvVars.length > 0) {
    sections.push(createHeading('Configuration Reference', 1));
    sections.push(createParagraph('The following environment variables are used by the application. Ensure these remain correctly set across all environments.'));
    sections.push(createTable(
      ['Variable', 'Description'],
      ctxEnvVars.map(v => typeof v === 'string' ? [v, '—'] : [v.name || v.key || String(v), v.description || '—'])
    ));
  }

  // 10. Incident Response
  sections.push(createHeading('Incident Response', 1));

  sections.push(createHeading('Severity Levels', 2));
  sections.push(createTable(
    ['Level', 'Definition', 'Response Time', 'Examples'],
    [
      ['Critical (P1)', 'Site down or major data loss', '< 1 hour', 'Complete outage, database corruption, security breach'],
      ['High (P2)', 'Major feature broken', '< 4 hours', 'Payment processing down, login broken, data not saving'],
      ['Medium (P3)', 'Minor feature broken', '< 1 business day', 'Styling issues, non-critical form errors, slow performance'],
      ['Low (P4)', 'Cosmetic or enhancement', '< 3 business days', 'Typos, minor UI inconsistencies, feature requests'],
    ]
  ));

  sections.push(createHeading('Incident Procedure', 2));
  sections.push(createBulletList([
    '1. Identify — confirm the issue and determine severity',
    '2. Communicate — notify affected stakeholders',
    '3. Investigate — check logs, monitoring, and recent changes',
    '4. Resolve — apply fix, verify on staging, deploy to production',
    '5. Verify — confirm the issue is resolved in production',
    '6. Document — write a post-incident report (for P1/P2 incidents)',
    '7. Learn — identify preventive measures and implement them',
  ]));

  sections.push(createHeading('Rollback Procedure', 2));
  sections.push(createParagraph('If a deployment causes issues and a fix cannot be applied quickly:'));
  sections.push(createBulletList([
    'Revert to the previous deployment via the hosting platform or CI/CD pipeline',
    'If database changes were made, restore from the pre-deployment backup',
    'Notify the team and client that a rollback has been performed',
    'Investigate the root cause before re-deploying',
  ]));

  // 11. Contact Information
  sections.push(createHeading('Contact Information', 1));
  sections.push(createTable(
    ['Role', 'Contact', 'When to Contact'],
    [
      ['Primary Support', company.email || '[SUPPORT EMAIL]', 'General maintenance and non-urgent issues'],
      ['Emergency Support', params['emergency-contact'] || '[EMERGENCY CONTACT]', 'P1/P2 incidents — site down, security breach'],
      ['Hosting Provider', params['hosting-support'] || '[HOSTING SUPPORT]', 'Infrastructure issues, server access'],
      ['Domain Registrar', params['domain-support'] || '[DOMAIN REGISTRAR SUPPORT]', 'DNS changes, domain renewal'],
    ]
  ));

  return createDocument({
    title: 'Maintenance Guide',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
