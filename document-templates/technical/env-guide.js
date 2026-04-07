// Environment & Configuration Guide document template
// Generates a comprehensive env/config guide from docs-state parameters, module flags, and integration clauses

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const techStack = params['tech-stack'] || '[Tech stack — to be confirmed]';
  const hostingPlatform = params['hosting-platform'] || '[To be confirmed]';
  const company = getCompanyInfo(brandConfig || {});

  const activeIntegrations = Object.keys(integrations).filter(k => integrations[k] === 'active');
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxEnvVars = ctx.envVars || [];
  const ctxDeps = ctx.dependencies || {};
  const ctxScripts = ctx.scripts || {};

  const sections = [];

  // --- 1. Overview ---
  sections.push(createHeading('Overview', 1));
  sections.push(createParagraph(`This document describes the environment configuration for ${projectName}. It covers all environments from local development through to production, including environment variables, configuration files, secrets management, and setup procedures.`));
  sections.push(createParagraph('This guide is the single source of truth for how the application is configured. All team members and deployment pipelines should reference this document when setting up or modifying environment configuration.'));

  sections.push(createHeading('Environments', 2));
  sections.push(createTable(
    ['Environment', 'Purpose', 'URL / Access'],
    [
      ['Development', 'Local developer machines, feature branch testing', 'http://localhost:' + (params['dev-port'] || '3000')],
      ['Staging', 'Pre-production QA, client review, integration testing', params['staging-url'] || '[Staging URL — to be configured]'],
      ['Production', 'Live application serving end users', params['production-url'] || '[Production URL — to be configured]'],
    ]
  ));

  sections.push(createHeading('Configuration Principles', 2));
  sections.push(...createBulletList([
    'Environment-specific values are stored in environment variables — never hardcoded',
    'Secrets are never committed to source control',
    'Each environment has its own isolated configuration — no shared credentials between environments',
    'A .env.example file documents all required variables without exposing actual values',
    'Configuration changes are reviewed and deployed through the same pipeline as code changes',
  ]));

  // --- 2. Prerequisites ---
  sections.push(createHeading('Prerequisites', 1));
  sections.push(createParagraph('The following tools and runtimes must be installed before setting up the project locally.'));

  const prereqRows = [];

  // Infer runtime from tech stack, enriching with harvested data
  const fwDeps = listDependencies(docsState, 'framework');
  const stackStr = fwDeps.length
    ? fwDeps.join(' ').toLowerCase()
    : (typeof techStack === 'string' ? techStack.toLowerCase() : JSON.stringify(techStack).toLowerCase());
  if (stackStr.includes('node') || stackStr.includes('next') || stackStr.includes('react') || stackStr.includes('express') || stackStr.includes('astro') || stackStr.includes('vue')) {
    prereqRows.push(['Node.js', params['node-version'] || '20.x LTS or later', 'https://nodejs.org']);
    const pkgManager = params['package-manager'] || 'npm';
    prereqRows.push(['Package Manager', pkgManager, pkgManager === 'pnpm' ? 'https://pnpm.io' : pkgManager === 'yarn' ? 'https://yarnpkg.com' : 'Included with Node.js']);
  }
  if (stackStr.includes('python') || stackStr.includes('django') || stackStr.includes('fastapi') || stackStr.includes('flask')) {
    prereqRows.push(['Python', params['python-version'] || '3.11 or later', 'https://python.org']);
    prereqRows.push(['pip / pipenv', 'Latest stable', 'Included with Python']);
  }
  if (stackStr.includes('docker') || params['uses-docker']) {
    prereqRows.push(['Docker', 'Latest stable', 'https://docker.com']);
    prereqRows.push(['Docker Compose', 'v2+', 'Included with Docker Desktop']);
  }
  if (flags.needs_database) {
    const dbTech = params['database-technology'] || '';
    if (dbTech.toLowerCase().includes('postgres')) {
      prereqRows.push(['PostgreSQL', params['postgres-version'] || '16+', 'https://postgresql.org (or use Docker)']);
    } else if (dbTech.toLowerCase().includes('mysql') || dbTech.toLowerCase().includes('maria')) {
      prereqRows.push(['MySQL/MariaDB', 'Latest stable', 'https://mysql.com (or use Docker)']);
    } else if (dbTech.toLowerCase().includes('sqlite')) {
      prereqRows.push(['SQLite', '3.x', 'Often bundled with runtime']);
    } else if (dbTech) {
      prereqRows.push([dbTech, 'Latest stable', 'See provider documentation']);
    }
  }
  if (flags.needs_search) {
    const searchTech = params['search-technology'] || '';
    if (searchTech) prereqRows.push([searchTech, 'Latest stable', 'See provider documentation']);
  }
  prereqRows.push(['Git', '2.40+', 'https://git-scm.com']);

  if (prereqRows.length === 0) {
    prereqRows.push(['Runtime', '[To be confirmed]', '[See project documentation]']);
  }

  sections.push(createTable(['Tool', 'Version', 'Source'], prereqRows));

  sections.push(createHeading('Operating System', 2));
  sections.push(createParagraph(params['os-requirements'] || 'Development is supported on macOS, Linux, and Windows (WSL2 recommended for Windows). CI/CD pipelines run on Linux (Ubuntu).'));

  // --- 3. Environment Variables ---
  sections.push(createHeading('Environment Variables', 1));
  sections.push(createParagraph('All environment-specific configuration is managed through environment variables. Variables are grouped by function and documented below with their purpose, format, and which environments require them.'));
  sections.push(createParagraph('A .env.example file in the repository root contains all variable names with placeholder values. Copy this file to .env and populate with real values for local development.'));

  // If we have harvested env vars, show the actual project variables first
  if (ctxEnvVars.length) {
    sections.push(createHeading('Discovered Variables', 2));
    sections.push(createParagraph('The following environment variables were detected in the project configuration (e.g. .env.example, docker-compose, or application code):'));
    const discoveredVarRows = ctxEnvVars.map(v => {
      if (typeof v === 'object' && v.name) {
        return [v.name, v.description || v.comment || '', v.defaultValue || v.example || '', v.required ? 'Yes' : ''];
      }
      return [String(v), '', '', ''];
    });
    sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required'], discoveredVarRows));
  }

  // 3a. Core Variables
  sections.push(createHeading('Core Variables', 2));
  const coreVars = [
    ['NODE_ENV', 'Application environment mode', 'development | staging | production', 'All'],
    ['PORT', 'HTTP server listen port', params['dev-port'] || '3000', 'All'],
    ['APP_URL', 'Canonical application URL', 'http://localhost:' + (params['dev-port'] || '3000'), 'All'],
    ['LOG_LEVEL', 'Logging verbosity', 'debug | info | warn | error', 'All'],
  ];
  if (flags.needs_database) {
    const dbTech = (params['database-technology'] || 'database').toLowerCase();
    coreVars.push(['DATABASE_URL', `${dbTech} connection string`, `${dbTech}://user:pass@localhost:5432/dbname`, 'All']);
    if (dbTech.includes('postgres') || dbTech.includes('mysql')) {
      coreVars.push(['DATABASE_POOL_SIZE', 'Maximum connection pool size', '10 (dev) / 25 (prod)', 'Staging, Production']);
    }
  }
  if (flags.needs_auth) {
    coreVars.push(['SESSION_SECRET', 'Session signing key (min 32 chars)', 'Random string — generate with openssl rand -hex 32', 'All']);
  }
  sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required In'], coreVars));

  // 3b. Authentication Variables (conditional)
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication Variables', 2));
    const authVars = [
      ['JWT_SECRET', 'JWT signing key (min 64 chars)', 'Generate with openssl rand -hex 64', 'All'],
      ['JWT_EXPIRY', 'Access token expiry duration', '15m', 'All'],
      ['REFRESH_TOKEN_EXPIRY', 'Refresh token expiry duration', '7d', 'All'],
    ];
    const authProvider = params['auth-provider'] || '';
    if (authProvider.toLowerCase().includes('oauth') || params['oauth-client-id']) {
      authVars.push(['OAUTH_CLIENT_ID', 'OAuth provider client ID', '[From provider dashboard]', 'All']);
      authVars.push(['OAUTH_CLIENT_SECRET', 'OAuth provider client secret', '[From provider dashboard]', 'All']);
      authVars.push(['OAUTH_CALLBACK_URL', 'OAuth callback URL', '/auth/callback', 'All']);
    }
    if (authProvider.toLowerCase().includes('auth0')) {
      authVars.push(['AUTH0_DOMAIN', 'Auth0 tenant domain', 'your-tenant.auth0.com', 'All']);
      authVars.push(['AUTH0_AUDIENCE', 'Auth0 API audience', 'https://api.yourapp.com', 'All']);
    }
    sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required In'], authVars));
  }

  // 3c. Payment Variables (conditional)
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Variables', 2));
    const paymentProvider = params['payment-provider'] || 'Stripe';
    const paymentVars = [
      [`${paymentProvider.toUpperCase()}_SECRET_KEY`, `${paymentProvider} secret API key`, 'sk_test_... (dev) / sk_live_... (prod)', 'All'],
      [`${paymentProvider.toUpperCase()}_PUBLISHABLE_KEY`, `${paymentProvider} publishable key`, 'pk_test_... (dev) / pk_live_... (prod)', 'All'],
      [`${paymentProvider.toUpperCase()}_WEBHOOK_SECRET`, `${paymentProvider} webhook signing secret`, 'whsec_...', 'Staging, Production'],
    ];
    sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required In'], paymentVars));
    sections.push(createParagraph(`Use ${paymentProvider} test mode keys in development and staging. Production keys must only be configured in the production environment. Never log or expose secret keys in error messages or API responses.`));
  }

  // 3d. Email Variables (conditional)
  if (flags.needs_email) {
    sections.push(createHeading('Email Variables', 2));
    const emailProvider = params['email-provider'] || 'SMTP';
    const emailVars = [
      ['SMTP_HOST', 'Mail server hostname', params['smtp-host'] || 'smtp.example.com', 'All'],
      ['SMTP_PORT', 'Mail server port', '587 (TLS) / 465 (SSL)', 'All'],
      ['SMTP_USER', 'Mail server username', '[Provider credentials]', 'All'],
      ['SMTP_PASS', 'Mail server password', '[Provider credentials]', 'All'],
      ['SMTP_FROM', 'Default sender address', `noreply@${params['domain'] || 'yourdomain.com'}`, 'All'],
    ];
    if (emailProvider.toLowerCase().includes('sendgrid')) {
      emailVars.push(['SENDGRID_API_KEY', 'SendGrid API key', 'SG.xxxx', 'All']);
    }
    if (emailProvider.toLowerCase().includes('postmark')) {
      emailVars.push(['POSTMARK_API_TOKEN', 'Postmark server token', '[From Postmark dashboard]', 'All']);
    }
    sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required In'], emailVars));
  }

  // 3e. Integration Variables (from integrationClauses)
  if (activeIntegrations.length) {
    sections.push(createHeading('Integration Variables', 2));
    sections.push(createParagraph('The following variables are required for active third-party integrations. Each integration uses its own namespaced variables to avoid collisions.'));

    const integrationVars = [];
    for (const name of activeIntegrations) {
      const prefix = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      integrationVars.push([`${prefix}_API_KEY`, `${name} API key`, `[From ${name} dashboard]`, 'All']);
      integrationVars.push([`${prefix}_API_URL`, `${name} API base URL`, `[See ${name} documentation]`, 'All']);
    }
    sections.push(createTable(['Variable', 'Description', 'Example / Default', 'Required In'], integrationVars));
  }

  // --- 4. Configuration Files ---
  sections.push(createHeading('Configuration Files', 1));
  sections.push(createParagraph('In addition to environment variables, the application uses the following configuration files. These are committed to source control (except where noted) and contain non-sensitive settings.'));

  const configRows = [
    ['.env', 'Environment variables (local dev only)', 'NOT committed — use .env.example as template'],
    ['.env.example', 'Variable documentation with placeholder values', 'Committed — keep in sync with all required variables'],
  ];
  if (stackStr.includes('node') || stackStr.includes('next') || stackStr.includes('react') || stackStr.includes('express')) {
    configRows.push(['package.json', 'Dependencies, scripts, and project metadata', 'Committed']);
  }
  if (stackStr.includes('next')) {
    configRows.push(['next.config.js', 'Next.js framework configuration', 'Committed']);
  }
  if (stackStr.includes('astro')) {
    configRows.push(['astro.config.mjs', 'Astro framework configuration', 'Committed']);
  }
  if (stackStr.includes('vite') || stackStr.includes('vue') || stackStr.includes('react')) {
    configRows.push(['vite.config.ts', 'Vite build and dev server configuration', 'Committed']);
  }
  if (stackStr.includes('python') || stackStr.includes('django') || stackStr.includes('fastapi')) {
    configRows.push(['pyproject.toml', 'Python project metadata and dependencies', 'Committed']);
  }
  if (stackStr.includes('docker') || params['uses-docker']) {
    configRows.push(['Dockerfile', 'Container build instructions', 'Committed']);
    configRows.push(['docker-compose.yml', 'Local service orchestration', 'Committed']);
  }
  if (flags.needs_database) {
    configRows.push(['database config', 'Database connection and migration settings', 'Committed (references env vars for credentials)']);
  }
  configRows.push(['.gitignore', 'Files excluded from version control', 'Committed — includes .env, node_modules, build artifacts']);

  sections.push(createTable(['File', 'Purpose', 'Version Control'], configRows));

  sections.push(createHeading('Configuration Reload', 2));
  sections.push(createParagraph('Environment variables are read at application startup. Changing a variable requires a restart of the application process. In production, deployments handle this automatically. For local development, restart the dev server after modifying .env.'));
  sections.push(...createBulletList([
    'Development — restart the dev server (Ctrl+C then re-run)',
    'Staging — redeploy via CI/CD pipeline',
    'Production — redeploy via CI/CD pipeline with the updated variable in the hosting platform',
    'Configuration files (non-.env) — changes take effect on next build or restart depending on the file',
  ]));

  // --- 5. Local Development Setup ---
  sections.push(createHeading('Local Development Setup', 1));
  sections.push(createParagraph('Follow these steps to set up a local development environment from scratch.'));

  sections.push(createHeading('Clone and Install', 2));
  const repoUrl = params['repo-url'] || `[repository URL]`;
  const pkgManager = params['package-manager'] || 'npm';
  const installCmd = pkgManager === 'pnpm' ? 'pnpm install' : pkgManager === 'yarn' ? 'yarn' : 'npm install';
  const devCmd = ctxScripts.dev
    ? `${pkgManager === 'npm' ? 'npm run' : pkgManager} dev`
    : (pkgManager === 'pnpm' ? 'pnpm dev' : pkgManager === 'yarn' ? 'yarn dev' : 'npm run dev');

  const setupSteps = [
    `Clone the repository: git clone ${repoUrl}`,
    `Install dependencies: ${installCmd}`,
    'Copy the environment template: cp .env.example .env',
    'Edit .env and populate with your local values (see Environment Variables section above)',
  ];
  if (flags.needs_database) {
    const dbTech = (params['database-technology'] || 'database').toLowerCase();
    setupSteps.push(`Create the local ${dbTech} database (see database setup below)`);
    setupSteps.push('Run database migrations: npm run migrate (or equivalent)');
  }
  if (params['seed-command']) {
    setupSteps.push(`Seed the database: ${params['seed-command']}`);
  }
  setupSteps.push(`Start the development server: ${devCmd}`);
  setupSteps.push(`Open http://localhost:${params['dev-port'] || '3000'} in your browser`);
  sections.push(...createBulletList(setupSteps));

  if (flags.needs_database) {
    sections.push(createHeading('Database Setup', 2));
    const dbTech = params['database-technology'] || 'your database';
    sections.push(createParagraph(`Create a local ${dbTech} instance. You can use Docker for a consistent setup:`));
    sections.push(...createBulletList([
      `Docker: docker-compose up -d db (if a docker-compose.yml is provided)`,
      `Manual: install ${dbTech} locally and create the database referenced in DATABASE_URL`,
      'Run migrations to set up the schema: npm run migrate (or the project-specific command)',
      'Optionally seed test data for development',
    ]));
  }

  sections.push(createHeading('Verifying the Setup', 2));
  sections.push(createParagraph('After completing the setup, verify that everything is working:'));
  sections.push(...createBulletList([
    'The dev server starts without errors',
    `The application is accessible at http://localhost:${params['dev-port'] || '3000'}`,
    flags.needs_database ? 'Database connections succeed (check server logs for connection confirmation)' : null,
    flags.needs_auth ? 'Authentication flow works with test credentials' : null,
    'Existing tests pass: npm test (or the project-specific command)',
  ].filter(Boolean)));

  // --- 6. Staging Environment ---
  sections.push(createHeading('Staging Environment', 1));
  sections.push(createParagraph('The staging environment mirrors production as closely as possible. It is used for QA, client review, and integration testing before changes are promoted to production.'));

  sections.push(createHeading('Access', 2));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['URL', params['staging-url'] || '[To be configured]'],
      ['Hosting', hostingPlatform],
      ['Deploy Trigger', 'Automatic on merge to main branch (or manual promotion)'],
      ['Access Control', 'Restricted — team members and approved reviewers only'],
    ]
  ));

  sections.push(createHeading('Deployment', 2));
  sections.push(...createBulletList([
    'Staging deploys are triggered automatically when code is merged to the main branch',
    'Environment variables are configured in the hosting platform dashboard — not in source control',
    'Database migrations run automatically as part of the deployment pipeline',
    'After deployment, smoke tests verify the critical paths are functional',
  ]));

  sections.push(createHeading('Test Data', 2));
  sections.push(createParagraph('Staging uses a separate database with representative test data:'));
  sections.push(...createBulletList([
    'Test data is seeded from a maintained seed script — never copied from production',
    'Payment integrations use test/sandbox mode credentials',
    'Email sending is either disabled or routed to a catch-all inbox (e.g. Mailtrap)',
    'Test user accounts are documented in the team password manager',
  ]));

  // --- 7. Production Environment ---
  sections.push(createHeading('Production Environment', 1));
  sections.push(createParagraph('The production environment serves live end-user traffic. Changes to production configuration require explicit approval and are tracked in the deployment audit log.'));

  sections.push(createHeading('Access', 2));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['URL', params['production-url'] || '[To be configured]'],
      ['Hosting', hostingPlatform],
      ['Deploy Trigger', 'Manual promotion from staging (with approval)'],
      ['Access Control', 'Restricted — only authorised deployment personnel'],
    ]
  ));

  sections.push(createHeading('Deployment', 2));
  sections.push(...createBulletList([
    'Production deploys require manual approval after staging verification',
    'Zero-downtime deployment strategy (rolling update or blue-green)',
    'Database migrations are applied automatically — destructive migrations require a two-phase approach',
    'Rollback procedure: redeploy the previous release tag via the CI/CD pipeline',
    'Post-deploy verification: automated health checks confirm the deployment is healthy',
  ]));

  sections.push(createHeading('Monitoring', 2));
  sections.push(createParagraph('Production is monitored continuously:'));
  sections.push(...createBulletList([
    'Uptime monitoring with external health checks (every 60 seconds)',
    'Error tracking via Sentry or equivalent — unhandled exceptions are captured and grouped',
    'Performance monitoring — response times, throughput, and error rates',
    'Resource monitoring — CPU, memory, and disk usage with threshold alerts',
    'Log aggregation — structured logs searchable via the hosting platform or a log service',
  ]));

  // --- 8. Secrets Management ---
  sections.push(createHeading('Secrets Management', 1));
  sections.push(createParagraph('Secrets (API keys, database credentials, signing keys) require careful handling. This section defines the storage, access, and rotation policies for all sensitive configuration values.'));

  sections.push(createHeading('Storage', 2));
  sections.push(...createBulletList([
    'Development — .env file on the developer\'s local machine (never committed)',
    'Staging / Production — hosting platform\'s secrets manager or environment variable store',
    'Shared secrets (team access) — stored in the team password manager with access logging',
    'Secrets are never logged, included in error messages, or exposed in API responses',
    'Backup encryption keys are stored in a separate secure location from the data they protect',
  ]));

  sections.push(createHeading('Rotation Policy', 2));
  const rotationRows = [
    ['Database passwords', 'Every 90 days', 'Coordinate with deployment to avoid downtime'],
    ['API keys (third-party)', 'Every 6 months or on suspected compromise', 'Rotate in provider dashboard, update env vars, deploy'],
    ['JWT / session secrets', 'Every 6 months', 'Deploy with new secret — existing sessions will be invalidated'],
  ];
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    rotationRows.push([`${paymentProvider} keys`, 'Every 12 months or on suspected compromise', `Generate new keys in ${paymentProvider} dashboard, update env vars`]);
  }
  if (flags.needs_email) {
    rotationRows.push(['SMTP credentials', 'Every 12 months', 'Update in email provider and hosting platform']);
  }
  rotationRows.push(['Encryption keys', 'Annually — requires data re-encryption', 'Plan a maintenance window for re-encryption']);
  sections.push(createTable(['Secret Type', 'Rotation Frequency', 'Procedure'], rotationRows));

  sections.push(createHeading('Emergency Rotation', 2));
  sections.push(createParagraph('If a secret is suspected to be compromised, follow this emergency procedure:'));
  sections.push(...createBulletList([
    'Immediately generate a new secret in the relevant provider or system',
    'Update the environment variable in the hosting platform',
    'Deploy the application to pick up the new value',
    'Revoke the compromised secret in the provider dashboard',
    'Audit access logs for the compromised secret to assess impact',
    'Notify affected parties if user data may have been exposed',
    'Document the incident, timeline, and remediation steps',
  ]));

  // --- 9. Feature Flags ---
  sections.push(createHeading('Feature Flags', 1));
  sections.push(createParagraph('Feature flags control the availability of features across environments without code deployments. They enable gradual rollouts, A/B testing, and quick feature disabling.'));

  sections.push(createHeading('Implementation', 2));
  sections.push(createParagraph(params['feature-flag-system'] || 'Feature flags are managed through environment variables prefixed with FF_ (e.g. FF_NEW_CHECKOUT=true). For more complex flag management, consider a dedicated feature flag service (LaunchDarkly, Unleash, Flagsmith).'));

  sections.push(createHeading('Current Flags', 2));
  const featureFlags = params['feature-flags'] || [];
  if (Array.isArray(featureFlags) && featureFlags.length) {
    const flagRows = featureFlags.map(f =>
      typeof f === 'object'
        ? [f.name || f.flag, f.description || '', f.dev || 'true', f.staging || 'true', f.prod || 'false']
        : [String(f), '[Description]', 'true', 'true', 'false']
    );
    sections.push(createTable(['Flag', 'Description', 'Dev', 'Staging', 'Production'], flagRows));
  } else {
    sections.push(createParagraph('No feature flags are currently configured. When flags are introduced, document them here with their purpose and state per environment.'));
  }

  sections.push(createHeading('Flag Lifecycle', 2));
  sections.push(...createBulletList([
    'New flags default to off in production, on in development and staging',
    'Flags are reviewed monthly — fully-rolled-out features should have their flags removed',
    'Emergency flags (kill switches) can be toggled without a deployment via the hosting platform',
    'Flag changes in production are logged and require a brief justification',
  ]));

  // --- 10. Troubleshooting ---
  sections.push(createHeading('Troubleshooting', 1));
  sections.push(createParagraph('Common setup and configuration issues, with their causes and resolutions.'));

  const troubleshootRows = [
    ['Application fails to start', 'Missing required environment variable', 'Check .env against .env.example — ensure all required variables are set'],
    ['Port already in use', `Another process is using port ${params['dev-port'] || '3000'}`, 'Kill the conflicting process or change the PORT variable'],
  ];
  if (flags.needs_database) {
    troubleshootRows.push(['Database connection refused', 'Database server not running or wrong credentials', 'Verify the database is running and DATABASE_URL is correct']);
    troubleshootRows.push(['Migration fails', 'Schema conflict or missing migration files', 'Pull latest code, check migration order, verify database state']);
  }
  if (flags.needs_auth) {
    troubleshootRows.push(['Authentication errors', 'Invalid or expired JWT_SECRET / SESSION_SECRET', 'Regenerate the secret and restart — existing sessions will be invalidated']);
    if (params['auth-provider']?.toLowerCase().includes('oauth') || params['oauth-client-id']) {
      troubleshootRows.push(['OAuth callback fails', 'Callback URL mismatch', 'Ensure OAUTH_CALLBACK_URL matches the URL registered in the provider dashboard']);
    }
  }
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    troubleshootRows.push([`${paymentProvider} webhook errors`, 'Webhook secret mismatch or endpoint not reachable', `Verify ${paymentProvider.toUpperCase()}_WEBHOOK_SECRET and that the endpoint URL is correct in the provider dashboard`]);
  }
  if (flags.needs_email) {
    troubleshootRows.push(['Emails not sending', 'SMTP credentials incorrect or provider blocking', 'Verify SMTP_HOST, SMTP_USER, SMTP_PASS — check provider logs for delivery status']);
  }
  troubleshootRows.push(['Dependencies fail to install', 'Node/Python version mismatch or corrupted cache', 'Verify runtime version matches prerequisites, clear package cache (npm cache clean --force), reinstall']);
  troubleshootRows.push(['Environment variable not picked up', 'Variable changed after server start', 'Restart the dev server — env vars are read at startup']);
  troubleshootRows.push(['.env file not loading', 'File not in project root or wrong filename', 'Verify the file is named exactly .env (not .env.txt) and is in the repository root']);

  sections.push(createTable(['Issue', 'Likely Cause', 'Resolution'], troubleshootRows));

  sections.push(createHeading('Getting Help', 2));
  sections.push(createParagraph('If the issue is not listed above:'));
  sections.push(...createBulletList([
    'Check the application logs for detailed error messages',
    'Verify all environment variables are set correctly by comparing with .env.example',
    'Ensure your runtime versions match the prerequisites documented above',
    'Search the project repository issues for similar problems',
    company.email ? `Contact the development team: ${company.email}` : 'Contact the development team for assistance',
  ]));

  return createDocument({
    title: 'Environment & Configuration Guide',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
