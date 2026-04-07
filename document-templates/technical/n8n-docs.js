// n8n Automation Documentation template
// Generates comprehensive n8n workflow documentation from docs-state parameters and module flags
// Only generates when flags.needs_n8n is true

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  if (!flags.needs_n8n) return null;

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const company = getCompanyInfo(brandConfig || {});

  const n8nVersion = params['n8n-version'] || '[To be confirmed]';
  const n8nHosting = params['n8n-hosting'] || 'Self-hosted (Docker)';
  const n8nUrl = params['n8n-url'] || '[To be confirmed — e.g. https://n8n.example.com]';
  const n8nAuth = params['n8n-auth'] || 'Basic authentication with per-user accounts';
  const appUrl = params['app-url'] || '[Main application URL]';
  const webhookBaseUrl = params['n8n-webhook-url'] || params['n8n-url'] ? `${params['n8n-url']}/webhook` : '[n8n webhook base URL]';

  const activeIntegrations = Object.keys(integrations).filter(k => integrations[k] === 'active');
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxIntegrations = ctx.integrations || [];

  const sections = [];

  // --- 1. Overview ---
  sections.push(createHeading('Overview', 1));
  sections.push(createParagraph(`This document describes the n8n automation layer for ${projectName}. n8n handles background workflows, scheduled tasks, data synchronisation, and event-driven automation that do not require real-time user interaction.`));

  sections.push(createHeading('Instance Details', 2));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['n8n Version', n8nVersion],
      ['Hosting', n8nHosting],
      ['Access URL', n8nUrl],
      ['Authentication', n8nAuth],
      ['Webhook Base URL', webhookBaseUrl],
      ['Timezone', params['n8n-timezone'] || 'Pacific/Auckland'],
      ['Execution Mode', params['n8n-execution-mode'] || 'Regular (queue mode for production)'],
    ]
  ));

  sections.push(createHeading('Access Control', 2));
  sections.push(createParagraph('Access to the n8n instance is restricted to authorised personnel only. The following access levels are defined:'));
  sections.push(...createBulletList([
    'Admin — full access to all workflows, credentials, and instance settings',
    'Editor — create, edit, and execute workflows; manage own credentials',
    'Viewer — view workflow definitions and execution logs (read-only)',
  ]));

  // --- 2. Architecture ---
  sections.push(createHeading('Architecture', 1));
  sections.push(createParagraph(`n8n operates as a separate service alongside the main ${projectName} application. Communication between the application and n8n is bidirectional — the application triggers workflows via webhooks, and n8n calls back to the application API to read or write data.`));

  sections.push(createHeading('System Integration', 2));
  sections.push(createParagraph('The following diagram describes the logical data flow:'));
  sections.push(...createBulletList([
    `${projectName} application emits events to n8n via webhook triggers`,
    'n8n processes events through configured workflow nodes',
    `n8n reads and writes data via the ${projectName} API using service account credentials`,
    'n8n connects to third-party services using stored credentials',
    'Scheduled workflows run independently on cron triggers',
    'Error workflows capture failures and route notifications to the configured alert channel',
  ]));

  sections.push(createHeading('Network Configuration', 2));
  sections.push(createParagraph('n8n communicates with the following endpoints:'));
  const networkEndpoints = [
    [`${projectName} API`, appUrl, 'Internal', 'Data read/write, event acknowledgement'],
  ];
  if (flags.needs_database) {
    networkEndpoints.push(['Database', params['database-host'] || '[Database host]', 'Internal', 'Direct queries for bulk operations']);
  }
  if (flags.needs_email) {
    networkEndpoints.push(['Email Provider', params['email-provider'] || '[Email service]', 'External', 'Transactional and automated emails']);
  }
  if (flags.needs_payments) {
    networkEndpoints.push(['Payment Provider', params['payment-provider'] || 'Stripe', 'External', 'Payment events and receipt generation']);
  }
  // Include declared integrations
  for (const integration of activeIntegrations) {
    const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);
    networkEndpoints.push([displayName, `[${displayName} API]`, 'External', `${displayName} integration workflows`]);
  }
  // Include harvested integrations not already in activeIntegrations
  for (const ctxInt of ctxIntegrations) {
    const intName = typeof ctxInt === 'string' ? ctxInt : ctxInt.name || '';
    if (intName && !activeIntegrations.includes(intName.toLowerCase())) {
      const displayName = intName.charAt(0).toUpperCase() + intName.slice(1);
      const purpose = (typeof ctxInt === 'object' && ctxInt.purpose) || `${displayName} integration workflows`;
      networkEndpoints.push([displayName, `[${displayName} API]`, 'External', purpose]);
    }
  }
  sections.push(createTable(['Service', 'Endpoint', 'Network', 'Purpose'], networkEndpoints));

  // --- 3. Workflow Inventory ---
  sections.push(createHeading('Workflow Inventory', 1));
  sections.push(createParagraph('The following table lists all configured workflows. Each workflow is documented in detail in subsequent sections.'));

  const inventoryRows = params['n8n-workflow-inventory'] || [];
  if (Array.isArray(inventoryRows) && inventoryRows.length) {
    sections.push(createTable(
      ['Name', 'Trigger Type', 'Purpose', 'Status', 'Schedule'],
      inventoryRows.map(w => [w.name || '', w.trigger || '', w.purpose || '', w.status || 'Active', w.schedule || 'N/A'])
    ));
  } else {
    sections.push(createParagraph('[Workflow inventory — populate from n8n instance. Use the table format below.]'));
    const placeholderRows = [
      ['[Workflow Name]', 'Webhook / Cron / Manual', '[Purpose description]', 'Active / Draft / Disabled', '[Cron expression or N/A]'],
    ];
    sections.push(createTable(['Name', 'Trigger Type', 'Purpose', 'Status', 'Schedule'], placeholderRows));
  }

  // --- 4. Standard Workflow Templates ---
  sections.push(createHeading('Standard Workflow Templates', 1));
  sections.push(createParagraph('The following sections describe standard workflow patterns used in this project. Each pattern includes recommended node configurations and trigger strategies.'));

  // 4a. Data sync workflows
  if (flags.needs_database) {
    sections.push(createHeading('Data Synchronisation Workflows', 2));
    sections.push(createParagraph('Data sync workflows keep systems in alignment. Two patterns are used depending on the synchronisation requirement.'));

    sections.push(createHeading('Periodic Sync', 3));
    sections.push(createParagraph('Runs on a cron schedule to reconcile data between the application database and external systems.'));
    sections.push(...createBulletList([
      'Trigger: Cron node (configurable interval — default every 15 minutes)',
      'Query source system for records modified since last sync timestamp',
      'Transform data to match target schema',
      'Upsert records in the target system (insert or update based on unique key)',
      'Update sync checkpoint timestamp on success',
      'Log sync summary: records processed, created, updated, skipped, failed',
    ]));

    sections.push(createHeading('Webhook-Triggered Sync', 3));
    sections.push(createParagraph('Reacts to individual data change events for near-real-time synchronisation.'));
    sections.push(...createBulletList([
      'Trigger: Webhook node receiving POST from the application',
      'Validate webhook payload signature',
      'Extract entity type and changed fields from the event',
      'Fetch full record from source if payload is partial',
      'Apply transformation and write to target system',
      'Return 200 acknowledgement to the calling application',
    ]));
  }

  // 4b. Email automation
  if (flags.needs_email) {
    sections.push(createHeading('Email Automation Workflows', 2));
    sections.push(createParagraph('Email workflows handle automated messaging triggered by application events or schedules.'));

    sections.push(createHeading('Welcome Email', 3));
    sections.push(...createBulletList([
      'Trigger: Webhook from application on user registration',
      'Personalise email template with user name and account details',
      'Send via email provider (SendGrid, Postmark, or SMTP node)',
      'Log delivery status and message ID',
    ]));

    sections.push(createHeading('Notification Emails', 3));
    sections.push(...createBulletList([
      'Trigger: Webhook from application on relevant events (order placed, status change, etc.)',
      'Route to correct template based on event type',
      'Include dynamic content from event payload',
      'Respect user notification preferences (check opt-out flags before sending)',
    ]));

    sections.push(createHeading('Digest Emails', 3));
    sections.push(...createBulletList([
      'Trigger: Cron node (daily or weekly schedule)',
      'Query application API for digest content (activity summary, pending items, reports)',
      'Aggregate and format into a digest template',
      'Send to subscribed users only',
    ]));
  }

  // 4c. Payment processing
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    sections.push(createHeading('Payment Processing Workflows', 2));
    sections.push(createParagraph(`Payment workflows respond to ${paymentProvider} webhook events and handle downstream processing.`));

    sections.push(createHeading('Order Confirmation', 3));
    sections.push(...createBulletList([
      `Trigger: Webhook from ${paymentProvider} (payment_intent.succeeded or checkout.session.completed)`,
      'Verify webhook signature using provider secret',
      'Fetch order details from application API',
      'Generate confirmation email with order summary',
      'Update order status in application database',
    ]));

    sections.push(createHeading('Receipt Generation', 3));
    sections.push(...createBulletList([
      'Trigger: Chained from order confirmation workflow or scheduled batch',
      'Fetch invoice data from payment provider API',
      'Format receipt with line items, tax, and totals',
      'Send receipt email to customer',
      'Store receipt reference in application for future access',
    ]));

    sections.push(createHeading('Refund Processing', 3));
    sections.push(...createBulletList([
      `Trigger: Webhook from ${paymentProvider} (charge.refunded)`,
      'Verify webhook signature',
      'Update order status to refunded in application',
      'Send refund confirmation email to customer',
      'Log refund details for accounting reconciliation',
    ]));
  }

  // 4d. CMS workflows
  if (flags.needs_cms) {
    const cmsProvider = params['cms-provider'] || '[CMS platform]';
    sections.push(createHeading('CMS Workflows', 2));
    sections.push(createParagraph(`CMS workflows respond to content lifecycle events from ${cmsProvider}.`));

    sections.push(createHeading('Content Publish Notifications', 3));
    sections.push(...createBulletList([
      `Trigger: Webhook from ${cmsProvider} on content publish event`,
      'Identify content type and affected pages',
      'Invalidate application cache for affected routes',
      'Notify relevant team members via Slack or email',
      'Update sitemap and notify search engines if applicable',
    ]));

    sections.push(createHeading('Scheduled Content', 3));
    sections.push(...createBulletList([
      'Trigger: Cron node checking for content with scheduled publish dates',
      `Query ${cmsProvider} API for content due for publication`,
      'Trigger publish action via CMS API',
      'Verify publication and log result',
      'Send confirmation notification to content author',
    ]));
  }

  // 4e. Analytics workflows
  if (flags.needs_analytics) {
    sections.push(createHeading('Analytics Workflows', 2));
    sections.push(createParagraph('Analytics workflows automate report generation and data aggregation tasks.'));

    sections.push(createHeading('Report Generation', 3));
    sections.push(...createBulletList([
      'Trigger: Cron node (daily, weekly, or monthly schedule)',
      'Query analytics platform API for metrics within the reporting period',
      'Aggregate and calculate key performance indicators',
      'Format report data into a summary template',
      'Distribute report via email or push to a shared dashboard/channel',
    ]));

    sections.push(createHeading('Data Aggregation', 3));
    sections.push(...createBulletList([
      'Trigger: Cron node (hourly or daily)',
      'Collect raw event data from multiple sources',
      'Transform and normalise data into a consistent schema',
      'Write aggregated records to the analytics data store',
      'Prune raw event data beyond the retention window',
    ]));
  }

  // 4f. Per-integration workflows
  if (activeIntegrations.length) {
    sections.push(createHeading('Integration-Specific Workflows', 2));
    sections.push(createParagraph('The following workflows handle automation for each active third-party integration.'));

    for (const integration of activeIntegrations) {
      const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);
      sections.push(createHeading(`${displayName} Workflows`, 3));
      sections.push(...createBulletList([
        `Inbound: Webhook receiver for ${displayName} events — validates payload, routes to handler`,
        `Outbound: Triggered by application events — pushes data to ${displayName} API`,
        `Sync: Periodic reconciliation between application data and ${displayName} records`,
        `Error handler: Captures ${displayName} API failures and routes to alert channel`,
      ]));
    }
  }

  // --- 5. Workflow Documentation Template ---
  sections.push(createHeading('Workflow Documentation Template', 1));
  sections.push(createParagraph('Each workflow in the inventory must be documented using the following structure. This section serves as both a reference template and a documentation standard.'));

  sections.push(createHeading('Workflow Name', 2));
  sections.push(createParagraph('[Human-readable name matching the n8n workflow title]'));

  sections.push(createHeading('Trigger', 3));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Type', 'Webhook / Cron / Manual / Application Event'],
      ['Source', '[What sends the trigger — application, external service, or schedule]'],
      ['Schedule', '[Cron expression if scheduled, e.g. 0 */15 * * * for every 15 minutes]'],
      ['Webhook Path', '[Relative webhook path if webhook-triggered]'],
      ['Payload Schema', '[Expected fields in the trigger payload]'],
    ]
  ));

  sections.push(createHeading('Node Chain', 3));
  sections.push(createParagraph('Document each node in execution order:'));
  sections.push(createTable(
    ['Order', 'Node Type', 'Name', 'Purpose', 'Configuration Notes'],
    [
      ['1', 'Trigger', '[Trigger name]', '[Receives the initiating event]', '[Auth, path, schedule]'],
      ['2', 'Function / Set', '[Transform name]', '[Data transformation or enrichment]', '[Key logic notes]'],
      ['3', 'HTTP Request / DB', '[Action name]', '[External call or data operation]', '[Endpoint, query details]'],
      ['4', 'IF / Switch', '[Branch name]', '[Conditional routing]', '[Branch conditions]'],
      ['5', 'Email / Slack', '[Output name]', '[Final action or notification]', '[Template, channel]'],
    ]
  ));

  sections.push(createHeading('Input / Output', 3));
  sections.push(...createBulletList([
    'Input: [Describe the data the workflow receives — fields, types, and validation rules]',
    'Output: [Describe what the workflow produces — API calls, database writes, emails, notifications]',
    'Side Effects: [Any external state changes — cache invalidation, file creation, third-party updates]',
  ]));

  sections.push(createHeading('Error Handling', 3));
  sections.push(...createBulletList([
    'Error Branch: [Describe the error workflow or error trigger node configuration]',
    'Retry Policy: [Number of retries, backoff strategy — e.g. 3 retries with exponential backoff]',
    'Failure Notification: [Where failure alerts are sent — email, Slack channel, webhook]',
    'Manual Recovery: [Steps to manually recover or re-run the workflow after a failure]',
  ]));

  sections.push(createHeading('Dependencies', 3));
  sections.push(...createBulletList([
    'Credentials: [List credential nodes required — e.g. application API key, SMTP, Stripe]',
    'External Services: [Services that must be available for the workflow to succeed]',
    'Upstream Workflows: [Other workflows that must run before this one, if any]',
    'Downstream Workflows: [Workflows triggered by this workflow\'s output, if any]',
  ]));

  // --- 6. Credentials ---
  sections.push(createHeading('Credentials', 1));
  sections.push(createParagraph('All credentials used by n8n workflows are stored in n8n\'s built-in encrypted credential store. Credentials are never hardcoded in workflow definitions.'));

  sections.push(createHeading('Credential Inventory', 2));
  const credentialRows = params['n8n-credentials'] || [];
  if (Array.isArray(credentialRows) && credentialRows.length) {
    sections.push(createTable(
      ['Credential Name', 'Type', 'Used By', 'Rotation Schedule'],
      credentialRows.map(c => [c.name || '', c.type || '', c.usedBy || '', c.rotation || '90 days'])
    ));
  } else {
    sections.push(createTable(
      ['Credential Name', 'Type', 'Used By', 'Rotation Schedule'],
      [
        [`${projectName} API Key`, 'Header Auth / API Key', 'All application API workflows', '90 days'],
        ['SMTP / Email Provider', 'SMTP / API Key', 'Email automation workflows', '90 days'],
        ...(flags.needs_payments ? [['Payment Provider', 'API Key', 'Payment processing workflows', '90 days']] : []),
        ...(flags.needs_cms ? [['CMS API', 'API Key / OAuth2', 'CMS workflows', '90 days']] : []),
        ...activeIntegrations.map(i => {
          const name = i.charAt(0).toUpperCase() + i.slice(1);
          return [`${name} API`, 'API Key / OAuth2', `${name} workflows`, '90 days'];
        }),
        // Include harvested integrations not already covered
        ...ctxIntegrations
          .map(ci => typeof ci === 'string' ? ci : ci.name || '')
          .filter(name => name && !activeIntegrations.includes(name.toLowerCase()))
          .map(name => {
            const display = name.charAt(0).toUpperCase() + name.slice(1);
            return [`${display} API`, 'API Key / OAuth2', `${display} workflows`, '90 days'];
          }),
      ]
    ));
  }

  sections.push(createHeading('Rotation Schedule', 2));
  sections.push(createParagraph('Credentials are rotated on a regular schedule to limit exposure from compromised keys. The following process applies:'));
  sections.push(...createBulletList([
    'Default rotation period: 90 days for API keys, 365 days for OAuth2 tokens',
    'Rotation is tracked in the project key vault or credential management system',
    'Before rotation: create new credential in the external service',
    'Update the credential in n8n\'s credential store',
    'Verify affected workflows execute successfully with the new credential',
    'Revoke the old credential in the external service',
    'Log the rotation event with date and operator',
  ]));

  // --- 7. Environment Configuration ---
  sections.push(createHeading('Environment Configuration', 1));
  sections.push(createParagraph('The following environment variables configure the n8n instance. These are set in the deployment environment (Docker, systemd, or hosting platform) — never committed to source control.'));

  sections.push(createHeading('n8n Instance Variables', 2));
  const envRows = [
    ['N8N_HOST', n8nUrl.replace(/https?:\/\//, '').split('/')[0] || '[hostname]', 'n8n instance hostname'],
    ['N8N_PORT', params['n8n-port'] || '5678', 'n8n HTTP port'],
    ['N8N_PROTOCOL', 'https', 'Protocol for webhook URLs'],
    ['N8N_ENCRYPTION_KEY', '[Generated — stored securely]', 'Encrypts credentials at rest'],
    ['WEBHOOK_URL', webhookBaseUrl, 'Base URL for webhook triggers'],
    ['N8N_BASIC_AUTH_ACTIVE', 'true', 'Enable basic auth on the n8n UI'],
    ['N8N_BASIC_AUTH_USER', '[Set per environment]', 'Basic auth username'],
    ['N8N_BASIC_AUTH_PASSWORD', '[Set per environment]', 'Basic auth password'],
    ['GENERIC_TIMEZONE', params['n8n-timezone'] || 'Pacific/Auckland', 'Default timezone for cron triggers'],
    ['EXECUTIONS_DATA_PRUNE', 'true', 'Auto-prune old execution data'],
    ['EXECUTIONS_DATA_MAX_AGE', params['n8n-execution-retention'] || '168', 'Hours to retain execution data'],
  ];

  if (flags.needs_database) {
    const dbType = params['n8n-db-type'] || 'postgresdb';
    envRows.push(['DB_TYPE', dbType, 'n8n internal database type']);
    envRows.push(['DB_POSTGRESDB_HOST', '[Database host]', 'n8n database hostname']);
    envRows.push(['DB_POSTGRESDB_PORT', '5432', 'n8n database port']);
    envRows.push(['DB_POSTGRESDB_DATABASE', 'n8n', 'n8n database name']);
    envRows.push(['DB_POSTGRESDB_USER', '[Set per environment]', 'n8n database user']);
    envRows.push(['DB_POSTGRESDB_PASSWORD', '[Set per environment]', 'n8n database password']);
  }

  sections.push(createTable(['Variable', 'Value', 'Description'], envRows));

  sections.push(createHeading('Webhook URLs', 2));
  sections.push(createParagraph('The following webhook URLs are registered in the main application for triggering n8n workflows:'));

  const webhookRows = [];
  if (flags.needs_database) {
    webhookRows.push([`${webhookBaseUrl}/data-sync`, 'POST', 'Trigger data synchronisation on record change']);
  }
  if (flags.needs_email) {
    webhookRows.push([`${webhookBaseUrl}/email/welcome`, 'POST', 'Trigger welcome email on user registration']);
    webhookRows.push([`${webhookBaseUrl}/email/notification`, 'POST', 'Trigger event-driven notification emails']);
  }
  if (flags.needs_payments) {
    webhookRows.push([`${webhookBaseUrl}/payment/confirmed`, 'POST', 'Handle payment confirmation events']);
    webhookRows.push([`${webhookBaseUrl}/payment/refund`, 'POST', 'Handle refund events']);
  }
  if (flags.needs_cms) {
    webhookRows.push([`${webhookBaseUrl}/cms/publish`, 'POST', 'Handle content publish events']);
  }

  if (webhookRows.length) {
    sections.push(createTable(['URL', 'Method', 'Purpose'], webhookRows));
  } else {
    sections.push(createParagraph('[Webhook URL inventory — document as workflows are created]'));
  }

  // --- 8. Error Handling ---
  sections.push(createHeading('Error Handling', 1));
  sections.push(createParagraph('A consistent error handling strategy is applied across all workflows. Every workflow includes an error branch that captures failures and routes them to the central error workflow.'));

  sections.push(createHeading('Error Workflow Pattern', 2));
  sections.push(createParagraph('All production workflows use the following error handling pattern:'));
  sections.push(...createBulletList([
    'Each workflow has the "Error Workflow" setting pointed to the central error handler workflow',
    'The error handler receives the failed execution ID, workflow name, error message, and node that failed',
    'Error data is enriched with workflow metadata (trigger type, last successful run, owner)',
    'Errors are classified by severity: Critical (data loss risk), High (user-facing failure), Medium (degraded functionality), Low (informational)',
  ]));

  sections.push(createHeading('Notification Channels', 2));
  const notificationChannels = params['n8n-alert-channels'] || [
    'Email — sent to the technical team distribution list for all error severities',
    'Slack — posted to the #ops-alerts channel for High and Critical errors',
  ];
  sections.push(...createBulletList(notificationChannels));

  sections.push(createHeading('Retry Configuration', 2));
  sections.push(createParagraph('Retry behaviour is configured per workflow based on the nature of the operations:'));
  sections.push(createTable(
    ['Workflow Type', 'Max Retries', 'Backoff Strategy', 'Retry Interval'],
    [
      ['Webhook-triggered', '3', 'Exponential', '1min, 5min, 15min'],
      ['Scheduled sync', '2', 'Fixed', '5min between retries'],
      ['Email sending', '3', 'Exponential', '30s, 2min, 10min'],
      ['Payment processing', '1', 'None (manual review)', 'N/A — alert immediately'],
      ['Data aggregation', '2', 'Fixed', '10min between retries'],
    ]
  ));

  sections.push(createHeading('Dead Letter Queue', 2));
  sections.push(createParagraph('Executions that fail after all retries are exhausted are logged to a dead letter queue for manual investigation:'));
  sections.push(...createBulletList([
    'Failed execution details are stored with full input data and error stack trace',
    'A daily summary of dead letter items is sent to the operations team',
    'Items are reviewed and either re-queued (after fixing the root cause) or acknowledged',
    'Dead letter items older than 30 days are archived',
  ]));

  // --- 9. Testing ---
  sections.push(createHeading('Testing', 1));
  sections.push(createParagraph('All workflows must be tested before deployment to production. n8n provides several mechanisms for safe testing.'));

  sections.push(createHeading('Test Mode', 2));
  sections.push(createParagraph('n8n\'s built-in test execution allows running workflows with real or mock data without triggering external side effects:'));
  sections.push(...createBulletList([
    'Use the "Execute Workflow" button in the n8n editor to run with test data',
    'Pin test data on trigger nodes to simulate specific payloads',
    'Review node-by-node output in the execution panel before activating',
    'Use the "Test Webhook" feature for webhook-triggered workflows',
  ]));

  sections.push(createHeading('Mock Data', 2));
  sections.push(createParagraph('Test data sets are maintained for each workflow type:'));
  sections.push(...createBulletList([
    'Store mock payloads as pinned data on trigger nodes in test copies of workflows',
    'Include edge cases: empty arrays, missing fields, maximum payload sizes, unicode content',
    'For webhook workflows: use curl or Postman to send test payloads to the test webhook URL',
    'For scheduled workflows: temporarily set the trigger to manual and execute with representative data',
  ]));

  sections.push(createHeading('Testing Checklist', 2));
  sections.push(createParagraph('Before activating a workflow in production, verify the following:'));
  sections.push(...createBulletList([
    'Workflow executes successfully with valid test data',
    'Error branch triggers correctly with invalid or malformed data',
    'Retry logic behaves as configured (test by temporarily breaking a downstream node)',
    'Credentials are set to production values (not test/sandbox keys)',
    'Webhook URLs are registered in the calling application',
    'Output data is written to the correct destination (database, API, email)',
    'Execution time is within acceptable limits for the workflow type',
    'No sensitive data is logged in workflow output (check for PII in execution logs)',
  ]));

  // --- 10. Monitoring ---
  sections.push(createHeading('Monitoring', 1));
  sections.push(createParagraph('Continuous monitoring ensures workflow health and early detection of failures. Monitoring covers execution logs, failure alerts, and performance metrics.'));

  sections.push(createHeading('Execution Logs', 2));
  sections.push(createParagraph('n8n retains execution logs for all workflow runs. Logs are accessible through the n8n dashboard and API.'));
  sections.push(...createBulletList([
    `Execution history is retained for ${params['n8n-execution-retention'] || '168'} hours (configurable via EXECUTIONS_DATA_MAX_AGE)`,
    'Successful and failed executions are logged with full input/output data per node',
    'Execution logs can be filtered by workflow, status, and date range',
    'Long-term execution data is archived to external storage if retention exceeds the configured window',
  ]));

  sections.push(createHeading('Failure Alerts', 2));
  sections.push(createParagraph('Automated alerts are triggered when workflows fail:'));
  sections.push(createTable(
    ['Alert Type', 'Trigger Condition', 'Channel', 'Response Time'],
    [
      ['Execution Failure', 'Any workflow execution fails after retries', 'Email + Slack', 'Within 1 hour'],
      ['Consecutive Failures', 'Same workflow fails 3+ times in a row', 'Slack (urgent)', 'Within 30 minutes'],
      ['Timeout', 'Execution exceeds configured timeout threshold', 'Email', 'Next business day'],
      ['Credential Expiry', 'Credential approaching rotation date', 'Email (7 days prior)', 'Before expiry'],
      ['Queue Backlog', 'Pending executions exceed threshold', 'Slack', 'Within 1 hour'],
    ]
  ));

  sections.push(createHeading('Performance Metrics', 2));
  sections.push(createParagraph('The following metrics are tracked to identify performance trends and capacity issues:'));
  sections.push(...createBulletList([
    'Execution count — total executions per workflow per day/week',
    'Success rate — percentage of successful executions per workflow',
    'Average execution time — per workflow, tracked over time for trend analysis',
    'Peak execution time — p95 execution duration per workflow',
    'Queue depth — number of pending executions (queue mode only)',
    'Memory usage — n8n process memory consumption',
    'Webhook response time — time from webhook receipt to first node execution',
  ]));

  sections.push(createHeading('Health Check', 2));
  sections.push(createParagraph('A dedicated health check workflow runs every 5 minutes to verify the n8n instance is operational:'));
  sections.push(...createBulletList([
    'Verifies n8n API is responsive',
    'Checks that critical workflows are active (not accidentally disabled)',
    'Validates credential connectivity for key services',
    'Reports health status to the application monitoring dashboard',
  ]));

  // --- 11. Maintenance ---
  sections.push(createHeading('Maintenance', 1));
  sections.push(createParagraph('Regular maintenance ensures the n8n instance remains stable, secure, and performant.'));

  sections.push(createHeading('Backup and Restore', 2));
  sections.push(createParagraph('Workflow definitions and credentials are backed up regularly to protect against data loss.'));
  sections.push(...createBulletList([
    'Workflow export: all workflows are exported as JSON via the n8n CLI or API on a daily schedule',
    'Credential backup: n8n database (containing encrypted credentials) is backed up alongside workflow exports',
    'Backups are stored in a secure, off-site location with encryption at rest',
    'Restore procedure: import workflow JSON files via n8n CLI; restore database for credentials',
    'Backup retention: 30 days of daily backups, 12 months of weekly backups',
    'Restore is tested quarterly to verify backup integrity',
  ]));

  sections.push(createHeading('Version Upgrades', 2));
  sections.push(createParagraph('n8n version upgrades follow a controlled process to avoid workflow disruption:'));
  sections.push(...createBulletList([
    'Review n8n release notes for breaking changes and deprecated nodes',
    'Back up all workflows and the database before upgrading',
    'Upgrade in a staging environment first — test all active workflows',
    'Verify credentials remain functional after the upgrade',
    'Monitor execution logs closely for 24 hours post-upgrade',
    'Roll back to the previous version if critical issues are detected',
    'Document the upgrade in the project changelog with the new version number and date',
  ]));

  sections.push(createHeading('Workflow Export and Version Control', 2));
  sections.push(createParagraph('Workflow definitions are version-controlled to enable change tracking, code review, and rollback.'));
  sections.push(...createBulletList([
    'Export workflows as JSON using the n8n CLI: n8n export:workflow --all --output=./workflows/',
    'Commit exported JSON files to the project repository in a dedicated n8n/workflows/ directory',
    'Review workflow changes in pull requests before deploying to production',
    'Import workflows from version control: n8n import:workflow --input=./workflows/[name].json',
    'Tag workflow exports with the n8n version they were exported from',
  ]));

  sections.push(createHeading('Routine Maintenance Tasks', 2));
  sections.push(createTable(
    ['Task', 'Frequency', 'Owner', 'Notes'],
    [
      ['Review execution logs', 'Daily', 'Operations', 'Check for failed executions and errors'],
      ['Credential rotation', 'Quarterly (90 days)', 'Operations', 'Rotate all API keys and service credentials'],
      ['Workflow backup', 'Daily (automated)', 'Automated', 'Export all workflows and database'],
      ['n8n version check', 'Monthly', 'Development', 'Review available updates and security patches'],
      ['Performance review', 'Monthly', 'Development', 'Review execution times and resource usage trends'],
      ['Dead letter review', 'Weekly', 'Operations', 'Process or acknowledge failed executions'],
      ['Cleanup disabled workflows', 'Quarterly', 'Development', 'Archive or remove unused workflows'],
      ['Backup restore test', 'Quarterly', 'Operations', 'Verify backups can be restored successfully'],
    ]
  ));

  return createDocument({
    title: 'n8n Automation Documentation',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
