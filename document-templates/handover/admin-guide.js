// Administrator Guide document template
// Generates a comprehensive admin guide from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = (meta['project-slug'] || '[PROJECT]').replace(/-/g, ' ');
  const stack = params['tech-stack'] || '[TECH STACK]';
  const company = brandConfig ? getCompanyInfo(brandConfig) : {};
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const appDescription = resolveContext(docsState, 'description', '');
  const ctxEnvVars = ctx.envVars || [];
  const ctxIntegrations = ctx.integrations || [];

  const sections = [];

  // 1. System Overview
  sections.push(createHeading('System Overview', 1));
  const overviewText = appDescription
    ? `${projectName} is ${appDescription}. This guide provides administrators with the information needed to configure, maintain, and troubleshoot the system. It covers user management, system configuration, integrations, security, and maintenance procedures.`
    : 'This guide provides administrators with the information needed to configure, maintain, and troubleshoot the system. It covers user management, system configuration, integrations, security, and maintenance procedures.';
  sections.push(createParagraph(overviewText));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Application', projectName],
      ['Technology Stack', typeof stack === 'string' ? stack : JSON.stringify(stack)],
      ['Hosting', params['hosting-platform'] || '[HOSTING PLATFORM]'],
      ['Admin URL', params['admin-url'] || `[ADMIN URL]`],
      ['Support Contact', company.email || '[SUPPORT EMAIL]'],
    ]
  ));

  // 2. User Management
  if (flags.needs_auth) {
    sections.push(createHeading('User Management', 1));

    sections.push(createHeading('Creating Users', 2));
    sections.push(createParagraph('New user accounts can be created through the admin dashboard. Each user must be assigned a role that determines their access level.'));
    sections.push(createBulletList([
      'Navigate to Admin > Users > Add New User',
      'Enter the user\'s email address and display name',
      'Select the appropriate role from the dropdown',
      'Choose whether to send an invitation email',
      'Click "Create User" to finalise',
    ]));

    sections.push(createHeading('Roles and Permissions', 2));
    sections.push(createTable(
      ['Role', 'Access Level', 'Capabilities'],
      [
        ['Super Admin', 'Full', 'All system settings, user management, content, integrations'],
        ['Admin', 'High', 'Content management, user management, reports'],
        ['Editor', 'Medium', 'Create and edit content, manage media'],
        ['Author', 'Limited', 'Create own content, upload media'],
        ['Viewer', 'Read-only', 'View content and reports only'],
      ]
    ));

    sections.push(createHeading('Deactivating Users', 2));
    sections.push(createParagraph('User accounts should be deactivated rather than deleted to preserve audit trails and content attribution.'));
    sections.push(createBulletList([
      'Navigate to Admin > Users > select the user',
      'Click "Deactivate Account"',
      'Confirm deactivation — the user will lose access immediately',
      'Deactivated users can be reactivated at any time',
    ]));

    sections.push(createHeading('Password Policies', 2));
    sections.push(createTable(
      ['Policy', 'Setting'],
      [
        ['Minimum length', '12 characters'],
        ['Complexity', 'Uppercase, lowercase, number, special character'],
        ['Expiry', '90 days (configurable)'],
        ['History', 'Cannot reuse last 5 passwords'],
        ['Lockout', 'After 5 failed attempts, 15-minute lockout'],
        ['MFA', flags.needs_auth ? 'Recommended for all admin users' : 'Optional'],
      ]
    ));
  }

  // 3. Configuration
  sections.push(createHeading('System Configuration', 1));
  sections.push(createParagraph('System configuration is managed through the admin dashboard settings panel. Changes take effect immediately unless otherwise noted.'));

  sections.push(createHeading('General Settings', 2));
  sections.push(createTable(
    ['Setting', 'Description', 'Default'],
    [
      ['Site Name', 'Displayed in browser title and emails', projectName],
      ['Site URL', 'Base URL for all links', '[SITE URL]'],
      ['Timezone', 'Default timezone for dates and scheduling', 'Pacific/Auckland'],
      ['Language', 'Default interface language', 'English (NZ)'],
      ['Date Format', 'Display format for dates', 'DD/MM/YYYY'],
      ['Maintenance Mode', 'Show maintenance page to non-admin users', 'Off'],
    ]
  ));

  sections.push(createHeading('Feature Toggles', 2));
  sections.push(createParagraph('Feature toggles allow you to enable or disable functionality without code changes.'));
  const featureToggles = [
    ['Registration', flags.needs_auth ? 'Open/Closed/Invite-only' : 'N/A', 'Invite-only'],
    ['Comments', 'Enable user comments on content', 'Disabled'],
    ['Notifications', 'Email notifications for system events', 'Enabled'],
  ];
  if (flags.needs_search) featureToggles.push(['Search', 'Enable site search', 'Enabled']);
  if (flags.needs_analytics) featureToggles.push(['Analytics', 'Enable analytics tracking', 'Enabled']);
  if (flags.needs_payments) featureToggles.push(['Store', 'Enable e-commerce features', 'Enabled']);
  sections.push(createTable(['Feature', 'Options', 'Default'], featureToggles));

  // Environment Variables (from context harvester)
  if (ctxEnvVars.length > 0) {
    sections.push(createHeading('Environment Variables', 2));
    sections.push(createParagraph('The following environment variables control system configuration. Refer to the deployment runbook for environment-specific values.'));
    sections.push(createTable(
      ['Variable', 'Description'],
      ctxEnvVars.map(v => typeof v === 'string' ? [v, '—'] : [v.name || v.key || String(v), v.description || '—'])
    ));
  }

  // 4. Content Types & Taxonomy
  if (flags.needs_cms) {
    sections.push(createHeading('Content Types & Taxonomy', 1));

    sections.push(createHeading('Managing Content Types', 2));
    sections.push(createParagraph('Content types define the structure of content in the CMS. Each type has a set of fields that determine what data can be entered.'));
    sections.push(createBulletList([
      'Navigate to Admin > Content Types to view all registered types',
      'Each content type has a name, slug, and set of fields',
      'Fields can be: text, rich text, number, date, media, reference, boolean, select',
      'Required fields are marked and validated on save',
      'Custom fields can be added without code changes',
    ]));

    sections.push(createHeading('Taxonomy Management', 2));
    sections.push(createParagraph('Taxonomies organise content into categories and tags. Categories are hierarchical; tags are flat.'));
    sections.push(createBulletList([
      'Categories: Navigate to Admin > Taxonomy > Categories to manage the hierarchy',
      'Tags: Navigate to Admin > Taxonomy > Tags to add or merge tags',
      'Each taxonomy term has a name, slug, and optional description',
      'Merging tags: select multiple tags and choose "Merge" to combine them',
      'Deleting a category does not delete the content assigned to it',
    ]));
  }

  // 5. Integration Management
  sections.push(createHeading('Integration Management', 1));
  sections.push(createParagraph('Third-party integrations are managed through Admin > Integrations. Each integration has its own configuration panel.'));

  // Combine docsState integrations with harvested context integrations
  const activeIntegrations = Object.entries(integrations).filter(([, v]) => v === 'active');
  const ctxIntegrationRows = ctxIntegrations
    .filter(i => !activeIntegrations.some(([name]) => name.toLowerCase() === (i.name || i).toLowerCase()))
    .map(i => {
      const name = typeof i === 'string' ? i : i.name || String(i);
      return [name.charAt(0).toUpperCase() + name.slice(1), 'Active', `Admin > Integrations > ${name.charAt(0).toUpperCase() + name.slice(1)}`];
    });

  if (activeIntegrations.length > 0 || ctxIntegrationRows.length > 0) {
    const integrationRows = [
      ...activeIntegrations.map(([name]) => [
        name.charAt(0).toUpperCase() + name.slice(1),
        'Active',
        `Admin > Integrations > ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      ]),
      ...ctxIntegrationRows,
    ];
    sections.push(createTable(
      ['Integration', 'Status', 'Configuration Location'],
      integrationRows
    ));

    sections.push(createHeading('Common Integration Tasks', 2));
    sections.push(createBulletList([
      'Updating API keys: Admin > Integrations > select integration > API Keys',
      'Testing connection: Use the "Test Connection" button on each integration page',
      'Viewing logs: Admin > Integrations > select integration > Activity Log',
      'Disabling: Toggle the "Active" switch to temporarily disable without removing configuration',
    ]));
  } else {
    sections.push(createParagraph('No third-party integrations are currently active. Integrations can be added through Admin > Integrations > Add New.'));
  }

  // 6. Email Configuration
  if (flags.needs_email) {
    sections.push(createHeading('Email Configuration', 1));

    sections.push(createHeading('SMTP Settings', 2));
    sections.push(createTable(
      ['Setting', 'Description'],
      [
        ['SMTP Host', 'Mail server hostname'],
        ['SMTP Port', '587 (TLS) or 465 (SSL)'],
        ['Username', 'SMTP authentication username'],
        ['Password', 'SMTP authentication password (stored encrypted)'],
        ['From Address', 'Default sender email address'],
        ['From Name', 'Default sender display name'],
      ]
    ));

    sections.push(createHeading('Email Templates', 2));
    sections.push(createParagraph('Email templates can be customised through Admin > Email > Templates. Each template supports variables that are replaced with dynamic content.'));
    sections.push(createBulletList([
      'Welcome email — sent when a new user registers or is invited',
      'Password reset — sent when a user requests a password reset',
      'Notification — sent for system events (new content, comments, etc.)',
      'Order confirmation — sent after a successful purchase (if e-commerce enabled)',
    ]));

    sections.push(createHeading('Bounce Handling', 2));
    sections.push(createBulletList([
      'Soft bounces: retried up to 3 times over 24 hours',
      'Hard bounces: email address marked as invalid, no further sends',
      'Complaint handling: user automatically unsubscribed on spam complaint',
      'Bounce logs: Admin > Email > Delivery Logs',
    ]));
  }

  // 7. Backup & Restore
  sections.push(createHeading('Backup & Restore', 1));

  sections.push(createHeading('Automated Backups', 2));
  sections.push(createTable(
    ['Component', 'Frequency', 'Retention', 'Location'],
    [
      ['Database', 'Daily', '30 days', '[BACKUP LOCATION]'],
      ['Media files', 'Daily (incremental)', '30 days', '[BACKUP LOCATION]'],
      ['Configuration', 'On change', '90 days', '[BACKUP LOCATION]'],
      ['Full system', 'Weekly', '12 weeks', '[BACKUP LOCATION]'],
    ]
  ));

  sections.push(createHeading('Manual Backup', 2));
  sections.push(createBulletList([
    'Database: Admin > System > Backup > Create Database Backup',
    'Media: Admin > System > Backup > Create Media Backup',
    'Full export: Admin > System > Backup > Full System Export',
    'Backups are downloaded as encrypted archives',
  ]));

  sections.push(createHeading('Restore Procedure', 2));
  sections.push(createBulletList([
    'Navigate to Admin > System > Restore',
    'Upload the backup archive',
    'Select restore scope: full, database only, or media only',
    'Confirm the restore — this will overwrite current data',
    'The system will restart after restore completes',
    'Verify data integrity after restore',
  ]));

  // 8. Performance Monitoring
  sections.push(createHeading('Performance Monitoring', 1));
  sections.push(createParagraph('Key performance metrics should be monitored regularly to ensure the system is running optimally.'));

  sections.push(createTable(
    ['Metric', 'Target', 'Alert Threshold', 'Where to Check'],
    [
      ['Page load time', '< 2 seconds', '> 5 seconds', 'Analytics dashboard'],
      ['Server response (TTFB)', '< 200ms', '> 500ms', 'Monitoring dashboard'],
      ['Error rate', '< 0.1%', '> 1%', 'Error tracking'],
      ['Uptime', '99.9%', '< 99.5%', 'Status page'],
      ['Database query time', '< 50ms avg', '> 200ms avg', 'Database monitoring'],
      ['Disk usage', '< 80%', '> 90%', 'Server dashboard'],
      ['Memory usage', '< 80%', '> 90%', 'Server dashboard'],
    ]
  ));

  // 9. Security Administration
  sections.push(createHeading('Security Administration', 1));

  sections.push(createHeading('Audit Logs', 2));
  sections.push(createParagraph('All administrative actions are logged with timestamp, user, action, and IP address. Audit logs are retained for 12 months.'));
  sections.push(createBulletList([
    'View logs: Admin > Security > Audit Log',
    'Filter by: user, action type, date range, IP address',
    'Export: CSV or JSON format for compliance reporting',
    'Logs cannot be modified or deleted by any user',
  ]));

  sections.push(createHeading('IP Blocking', 2));
  sections.push(createBulletList([
    'Automatic: IP addresses are blocked after repeated failed login attempts',
    'Manual: Admin > Security > IP Blocklist to add/remove addresses',
    'Allowlist: Admin > Security > IP Allowlist for trusted addresses',
    'Blocked IPs receive a 403 response with no additional information',
  ]));

  sections.push(createHeading('Rate Limiting', 2));
  sections.push(createTable(
    ['Endpoint', 'Limit', 'Window'],
    [
      ['Login', '5 attempts', '15 minutes'],
      ['API (authenticated)', '100 requests', '1 minute'],
      ['API (unauthenticated)', '20 requests', '1 minute'],
      ['File upload', '10 uploads', '5 minutes'],
      ['Password reset', '3 requests', '1 hour'],
    ]
  ));

  // 10. Updates & Maintenance
  sections.push(createHeading('Updates & Maintenance', 1));

  sections.push(createHeading('Applying Updates', 2));
  sections.push(createBulletList([
    'Check for updates: Admin > System > Updates',
    'Review changelog before applying any update',
    'Always backup before updating (automatic backup is triggered)',
    'Apply updates to staging first, verify, then apply to production',
    'Security updates should be applied within 48 hours of release',
  ]));

  sections.push(createHeading('Scheduled Maintenance', 2));
  sections.push(createTable(
    ['Task', 'Frequency', 'Procedure'],
    [
      ['Security patches', 'As released', 'Apply via Admin > System > Updates'],
      ['Dependency updates', 'Monthly', 'Review and apply non-breaking updates'],
      ['Database optimisation', 'Weekly', 'Automatic — runs Sunday 3am'],
      ['Log rotation', 'Daily', 'Automatic — logs archived after 30 days'],
      ['SSL certificate renewal', '60 days before expiry', 'Automatic via hosting provider'],
      ['Backup verification', 'Monthly', 'Restore to test environment and verify'],
    ]
  ));

  // 11. Troubleshooting
  sections.push(createHeading('Troubleshooting', 1));
  sections.push(createTable(
    ['Issue', 'Possible Cause', 'Resolution'],
    [
      ['Cannot log in', 'Account locked or password expired', 'Check audit log, reset password or unlock account'],
      ['Slow page loads', 'Cache expired or database bottleneck', 'Clear cache (Admin > System > Cache), check database metrics'],
      ['Email not sending', 'SMTP credentials invalid or provider issue', 'Test SMTP connection in Admin > Email > Settings'],
      ['Upload fails', 'File too large or unsupported format', 'Check max upload size in Admin > System > Upload Settings'],
      ['Integration error', 'API key expired or service outage', 'Check integration logs, verify API key, check service status page'],
      ['502/503 errors', 'Server overloaded or deployment in progress', 'Check server health, wait for deployment to complete'],
      ['Search not returning results', 'Index out of date', 'Rebuild search index: Admin > System > Search > Reindex'],
    ]
  ));

  sections.push(createHeading('Getting Help', 2));
  sections.push(createParagraph('If you encounter an issue not covered in this guide:'));
  sections.push(createBulletList([
    `Contact support: ${company.email || '[SUPPORT EMAIL]'}`,
    `Phone: ${company.phone || '[SUPPORT PHONE]'}`,
    'Include: description of the issue, steps to reproduce, any error messages, and screenshots if possible',
    'Priority levels: Critical (site down) — 1 hour response, High (feature broken) — 4 hours, Normal — 1 business day',
  ]));

  return createDocument({
    title: 'Administrator Guide',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
