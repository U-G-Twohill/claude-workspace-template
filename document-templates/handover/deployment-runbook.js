// Deployment Runbook document template
// Generates a comprehensive deployment runbook covering all environments, procedures, rollback, DNS, and monitoring

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { getCompanyInfo } from '../_shared/brand.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const techStack = params['tech-stack'] || '[Tech stack — to be confirmed]';
  const hostingPlatform = params['hosting-platform'] || '[To be confirmed]';
  const ciPlatform = params['ci-platform'] || '[CI platform — to be confirmed]';
  const company = getCompanyInfo(brandConfig || {});
  const stackStr = typeof techStack === 'string' ? techStack.toLowerCase() : JSON.stringify(techStack).toLowerCase();
  const pkgManager = params['package-manager'] || 'npm';
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const repoUrl = resolveContext(docsState, 'repoUrl', params['repo-url'] || '[Repository URL — to be confirmed]');
  const nodeVersion = resolveContext(docsState, 'nodeVersion', params['node-version'] || '20.x LTS');
  const ctxCiPlatform = resolveContext(docsState, 'ciPlatform', '');
  const enrichedCiPlatform = ctxCiPlatform || ciPlatform;
  const ctxScripts = ctx.scripts || {};
  const ctxEnvVars = ctx.envVars || [];
  const ctxDevCommands = ctx.devCommands || {};
  const ctxCiWorkflows = ctx.ciWorkflows || [];

  const sections = [];

  // --- 1. Overview ---
  sections.push(createHeading('Overview', 1));
  sections.push(createParagraph(`This runbook documents the complete deployment procedure for ${projectName}. It covers all environments from development through to production, including pre-deployment checks, step-by-step deployment instructions, post-deployment verification, rollback procedures, and emergency contacts.`));
  sections.push(createParagraph('This document is the authoritative reference for anyone deploying this application. Follow each section in order. Do not skip steps — even routine deployments can fail if prerequisites are missed.'));

  sections.push(createHeading('Project Summary', 2));
  sections.push(createTable(
    ['Detail', 'Value'],
    [
      ['Project', projectName],
      ['Client', clientName],
      ['Tech Stack', typeof techStack === 'string' ? techStack : JSON.stringify(techStack)],
      ['Hosting Platform', hostingPlatform],
      ['CI/CD Platform', enrichedCiPlatform],
      ['Repository', repoUrl],
      ['Production URL', params['production-url'] || '[Production URL — to be confirmed]'],
      ['Staging URL', params['staging-url'] || '[Staging URL — to be confirmed]'],
    ]
  ));

  sections.push(createHeading('Environments', 2));
  sections.push(createTable(
    ['Environment', 'Branch', 'URL', 'Deploy Method'],
    [
      ['Development', params['dev-branch'] || 'feature/*', 'http://localhost:' + (params['dev-port'] || '3000'), 'Local'],
      ['Staging', params['staging-branch'] || 'main', params['staging-url'] || '[Staging URL]', 'Automatic on merge'],
      ['Production', params['production-branch'] || 'main', params['production-url'] || '[Production URL]', 'Manual promotion or tag-based'],
    ]
  ));

  // --- 2. Prerequisites ---
  sections.push(createHeading('Prerequisites', 1));
  sections.push(createParagraph('Ensure the following are in place before initiating any deployment. Missing prerequisites are the most common cause of failed deployments.'));

  sections.push(createHeading('Access Requirements', 2));
  const accessItems = [
    'Write access to the source repository',
    `Access to ${hostingPlatform} dashboard or CLI`,
    `Access to ${enrichedCiPlatform} pipeline dashboard`,
    'Credentials for the hosting platform stored in a password manager — never shared via chat or email',
  ];
  if (flags.needs_database) {
    accessItems.push('Database admin credentials for migration execution');
  }
  if (params['domain'] || flags.needs_dns) {
    accessItems.push('DNS provider dashboard access (for domain and DNS changes)');
  }
  sections.push(...createBulletList(accessItems));

  sections.push(createHeading('Tooling', 2));
  const toolRows = [['Git', '2.40+', 'Version control and tagging']];

  if (stackStr.includes('node') || stackStr.includes('next') || stackStr.includes('react') || stackStr.includes('express') || stackStr.includes('astro') || stackStr.includes('vue')) {
    toolRows.push(['Node.js', nodeVersion, 'Application runtime']);
    toolRows.push([pkgManager, 'Latest stable', 'Dependency management']);
  }
  if (stackStr.includes('python') || stackStr.includes('django') || stackStr.includes('fastapi') || stackStr.includes('flask')) {
    toolRows.push(['Python', params['python-version'] || '3.11+', 'Application runtime']);
  }
  if (stackStr.includes('docker') || params['uses-docker']) {
    toolRows.push(['Docker', 'Latest stable', 'Container builds and local testing']);
    toolRows.push(['Docker Compose', 'v2+', 'Local service orchestration']);
  }
  if (hostingPlatform.toLowerCase().includes('vercel')) {
    toolRows.push(['Vercel CLI', 'Latest', 'vercel deploy for manual deployments']);
  }
  if (hostingPlatform.toLowerCase().includes('netlify')) {
    toolRows.push(['Netlify CLI', 'Latest', 'netlify deploy for manual deployments']);
  }
  if (hostingPlatform.toLowerCase().includes('fly')) {
    toolRows.push(['flyctl', 'Latest', 'fly deploy for Fly.io deployments']);
  }
  if (hostingPlatform.toLowerCase().includes('railway')) {
    toolRows.push(['Railway CLI', 'Latest', 'railway up for Railway deployments']);
  }
  if (hostingPlatform.toLowerCase().includes('aws')) {
    toolRows.push(['AWS CLI', 'v2', 'AWS resource management and deployment']);
  }
  sections.push(createTable(['Tool', 'Version', 'Purpose'], toolRows));

  // --- 3. Pre-Deployment Checklist ---
  sections.push(createHeading('Pre-Deployment Checklist', 1));
  sections.push(createParagraph('Complete every item before proceeding. Check each box and note the result. If any item fails, resolve it before deploying.'));

  sections.push(createHeading('Code Readiness', 2));
  const codeChecks = [
    'All feature branches have been merged — no outstanding PRs targeting this release',
    'All automated tests pass on the CI pipeline (unit, integration, e2e)',
    'Code review has been completed and approved for all changes in this release',
    'No known critical or high-severity bugs remain open for this release',
    'CHANGELOG or release notes have been updated with the changes in this release',
  ];
  if (flags.needs_api) {
    codeChecks.push('API documentation has been updated to reflect any endpoint changes');
  }
  sections.push(...createBulletList(codeChecks));

  sections.push(createHeading('Infrastructure Readiness', 2));
  const infraChecks = [
    `${hostingPlatform} environment is healthy — check the platform dashboard for any incidents`,
    'All required environment variables are set in the target environment',
    'Secrets (API keys, credentials) are current and not expired',
    'SSL/TLS certificates are valid and not expiring within 30 days',
  ];
  if (flags.needs_database) {
    infraChecks.push('Database backups have been taken (or automated backup is confirmed running)');
    infraChecks.push('Pending database migrations have been reviewed for safety (no destructive changes without a migration plan)');
  }
  if (flags.needs_auth) {
    infraChecks.push('Authentication provider configuration is correct for the target environment');
    infraChecks.push('OAuth redirect URLs are set correctly for the target domain');
  }
  if (flags.needs_api) {
    infraChecks.push('Rate limiting and API throttling are configured appropriately');
  }
  sections.push(...createBulletList(infraChecks));

  sections.push(createHeading('Communication', 2));
  sections.push(...createBulletList([
    'Team has been notified of the upcoming deployment and timeline',
    'Client has been informed of any expected downtime or changes (if applicable)',
    'On-call or emergency contact is available during the deployment window',
    'Rollback plan has been reviewed and is ready to execute if needed',
  ]));

  // --- 4. Deployment Procedure ---
  sections.push(createHeading('Deployment Procedure', 1));

  // 4a. Development
  sections.push(createHeading('Development Environment', 2));
  sections.push(createParagraph('Development deployments happen locally on each developer\'s machine. This section covers the local build and run process for verifying changes before pushing.'));

  const installCmd = pkgManager === 'pnpm' ? 'pnpm install' : pkgManager === 'yarn' ? 'yarn' : 'npm install';
  const buildCmd = pkgManager === 'pnpm' ? 'pnpm build' : pkgManager === 'yarn' ? 'yarn build' : 'npm run build';
  const testCmd = pkgManager === 'pnpm' ? 'pnpm test' : pkgManager === 'yarn' ? 'yarn test' : 'npm test';

  const devSteps = [
    'Pull the latest changes: git pull origin main',
    `Install dependencies: ${ctxDevCommands.install || installCmd}`,
    `Run the test suite: ${ctxScripts.test || testCmd}`,
    `Build the application: ${ctxScripts.build || buildCmd}`,
    'Verify the build completes without errors or warnings',
  ];
  if (flags.needs_database) {
    devSteps.push('Run pending migrations against the local database');
  }
  devSteps.push('Start the local server and verify key user flows manually');
  devSteps.push('Commit changes, push the branch, and open a pull request');
  sections.push(...createBulletList(devSteps));

  // 4b. Staging
  sections.push(createHeading('Staging Environment', 2));
  sections.push(createParagraph('Staging mirrors production as closely as possible. Deployments to staging are typically automatic on merge to the main branch.'));

  sections.push(createHeading('Automatic Deployment (CI/CD)', 3));
  const stagingAutoSteps = [
    `Merge the approved PR into the ${params['staging-branch'] || 'main'} branch`,
    `The ${enrichedCiPlatform} pipeline triggers automatically on the merge event`,
    'Pipeline stages: install dependencies, lint, test, build, deploy to staging',
    'Monitor the pipeline dashboard for any failures during the build or deploy stages',
    'Once the pipeline completes successfully, verify the deployment (see Post-Deployment Verification)',
  ];
  sections.push(...createBulletList(stagingAutoSteps));

  sections.push(createHeading('Manual Deployment (Fallback)', 3));
  sections.push(createParagraph('Use manual deployment only if the CI/CD pipeline is unavailable or for emergency fixes.'));

  const stagingManualSteps = [
    `Checkout the ${params['staging-branch'] || 'main'} branch: git checkout main && git pull`,
    `Install dependencies: ${installCmd}`,
    `Build the application: ${buildCmd}`,
  ];
  if (hostingPlatform.toLowerCase().includes('vercel')) {
    stagingManualSteps.push('Deploy to staging: vercel --env staging');
  } else if (hostingPlatform.toLowerCase().includes('netlify')) {
    stagingManualSteps.push('Deploy to staging: netlify deploy --dir=dist');
  } else if (hostingPlatform.toLowerCase().includes('fly')) {
    stagingManualSteps.push('Deploy to staging: fly deploy --config fly.staging.toml');
  } else if (hostingPlatform.toLowerCase().includes('railway')) {
    stagingManualSteps.push('Deploy to staging: railway up --environment staging');
  } else {
    stagingManualSteps.push(`Deploy using the ${hostingPlatform} CLI or dashboard`);
  }
  stagingManualSteps.push('Verify the deployment (see Post-Deployment Verification)');
  sections.push(...createBulletList(stagingManualSteps));

  // 4c. Production
  sections.push(createHeading('Production Environment', 2));
  sections.push(createParagraph('Production deployments require explicit approval. Never deploy directly to production without first verifying on staging. Follow every step in order.'));

  sections.push(createHeading('Step 1: Prepare the Release', 3));
  sections.push(...createBulletList([
    'Confirm all changes have been verified on staging and approved for production',
    'Create a release tag: git tag -a v[X.Y.Z] -m "Release v[X.Y.Z]: [brief description]"',
    'Push the tag: git push origin v[X.Y.Z]',
    'Update CHANGELOG with the release version, date, and summary of changes',
  ]));

  sections.push(createHeading('Step 2: Pre-Deploy Checks', 3));
  const preDeployChecks = [
    'Re-run the pre-deployment checklist above — confirm nothing has changed since staging verification',
  ];
  if (flags.needs_database) {
    preDeployChecks.push('Take a manual database backup (in addition to automated backups): document the backup identifier');
    preDeployChecks.push('Review pending migrations one final time — confirm they are non-destructive or have a rollback path');
  }
  preDeployChecks.push('Confirm the rollback target: note the current production release tag or commit hash');
  preDeployChecks.push('Notify the team that production deployment is starting');
  sections.push(...createBulletList(preDeployChecks));

  sections.push(createHeading('Step 3: Deploy', 3));
  const prodDeploySteps = [];
  if (enrichedCiPlatform.toLowerCase().includes('github')) {
    prodDeploySteps.push('Trigger the production deployment workflow in GitHub Actions (manual dispatch or tag-based trigger)');
    prodDeploySteps.push('Monitor the Actions tab for pipeline progress — do not leave unattended');
  } else if (enrichedCiPlatform.toLowerCase().includes('gitlab')) {
    prodDeploySteps.push('Trigger the production deployment stage in the GitLab CI pipeline (manual job)');
    prodDeploySteps.push('Monitor the pipeline for progress — do not leave unattended');
  } else {
    prodDeploySteps.push(`Trigger the production deployment via ${enrichedCiPlatform} (manual approval or tag-based trigger)`);
    prodDeploySteps.push('Monitor the pipeline for progress — do not leave unattended');
  }
  if (flags.needs_database) {
    prodDeploySteps.push('Migrations are applied automatically during deployment — watch for migration errors in the pipeline logs');
  }
  prodDeploySteps.push('Wait for the deployment to complete and the health check to pass');
  prodDeploySteps.push('Proceed immediately to Post-Deployment Verification');
  sections.push(...createBulletList(prodDeploySteps));

  sections.push(createHeading('Step 4: Post-Deploy Communication', 3));
  sections.push(...createBulletList([
    'Notify the team that production deployment is complete',
    'Notify the client of any user-facing changes (if applicable)',
    'Update the project status or task board to reflect the completed deployment',
    'Close the release tag / milestone in the project management tool',
  ]));

  // --- 5. Post-Deployment Verification ---
  sections.push(createHeading('Post-Deployment Verification', 1));
  sections.push(createParagraph('Complete these checks immediately after every deployment. If any check fails, escalate to the rollback procedure.'));

  sections.push(createHeading('Automated Checks', 2));
  sections.push(...createBulletList([
    'Health check endpoint returns 200 OK (e.g. GET /health or GET /api/health)',
    'Application responds on the expected URL without errors',
    'SSL/TLS certificate is valid and the connection is secure',
    'No new errors appearing in the error tracking system (Sentry, Bugsnag, etc.)',
  ]));

  sections.push(createHeading('Manual Smoke Tests', 2));
  const smokeTests = [
    'Homepage loads correctly with all assets (images, CSS, JS)',
    'Navigation between key pages works without errors',
  ];
  if (flags.needs_auth) {
    smokeTests.push('User login and logout flow works correctly');
    smokeTests.push('Protected pages redirect unauthenticated users to the login page');
  }
  if (flags.needs_database) {
    smokeTests.push('Data reads return expected results (verify a known record)');
    smokeTests.push('Data writes succeed (create a test record, then clean up)');
  }
  if (flags.needs_api) {
    smokeTests.push('Key API endpoints return expected responses (test with curl or Postman)');
    smokeTests.push('API authentication and authorization are enforced correctly');
  }
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    smokeTests.push(`${paymentProvider} integration is functional — verify the checkout flow with a test transaction (if safe to do so)`);
  }
  if (flags.needs_email) {
    smokeTests.push('Transactional emails are sent successfully — trigger a test email (e.g. password reset)');
  }
  if (flags.needs_search) {
    smokeTests.push('Search functionality returns relevant results');
  }
  smokeTests.push('Performance is acceptable — page load times are within expected ranges');
  sections.push(...createBulletList(smokeTests));

  sections.push(createHeading('Verification Sign-Off', 2));
  sections.push(createTable(
    ['Check', 'Status', 'Verified By', 'Timestamp'],
    [
      ['Health endpoint', '[ ] Pass / [ ] Fail', '', ''],
      ['Homepage loads', '[ ] Pass / [ ] Fail', '', ''],
      ['Core user flow', '[ ] Pass / [ ] Fail', '', ''],
      ['Error tracking clear', '[ ] Pass / [ ] Fail', '', ''],
      ['Performance acceptable', '[ ] Pass / [ ] Fail', '', ''],
    ]
  ));

  // --- 6. Rollback Procedure ---
  sections.push(createHeading('Rollback Procedure', 1));
  sections.push(createParagraph('If post-deployment verification fails or a critical issue is discovered after deployment, follow this rollback procedure immediately. Speed is critical — rollback first, investigate later.'));

  sections.push(createHeading('Decision Criteria', 2));
  sections.push(createParagraph('Initiate a rollback if any of the following are true:'));
  sections.push(...createBulletList([
    'The application is returning 5xx errors to users',
    'A core user flow is broken (login, checkout, data access)',
    'Error rates have increased significantly compared to pre-deployment baseline',
    'Performance has degraded beyond acceptable thresholds',
    'Data integrity issues are detected',
  ]));

  sections.push(createHeading('Rollback Steps', 2));
  const rollbackSteps = [
    'Notify the team that a rollback is being initiated — include the reason',
  ];
  if (enrichedCiPlatform.toLowerCase().includes('github')) {
    rollbackSteps.push('Redeploy the previous release: trigger the deployment workflow with the previous release tag');
  } else if (enrichedCiPlatform.toLowerCase().includes('gitlab')) {
    rollbackSteps.push('Redeploy the previous release: trigger the deployment pipeline for the previous release tag');
  } else {
    rollbackSteps.push(`Redeploy the previous release via ${enrichedCiPlatform} using the previous release tag or commit hash`);
  }
  if (hostingPlatform.toLowerCase().includes('vercel')) {
    rollbackSteps.push('Alternative: use the Vercel dashboard to promote the previous deployment to production');
  }
  if (hostingPlatform.toLowerCase().includes('netlify')) {
    rollbackSteps.push('Alternative: use the Netlify dashboard to publish the previous deployment');
  }
  if (flags.needs_database) {
    rollbackSteps.push('If database migrations were applied, assess whether they need to be reverted:');
    rollbackSteps.push('  - Additive migrations (new tables, columns): typically safe to leave in place');
    rollbackSteps.push('  - Destructive migrations (dropped columns, renamed tables): restore from the pre-deployment backup');
    rollbackSteps.push('  - If restoring from backup: restore to the backup taken in Step 2 of the production deploy');
  }
  rollbackSteps.push('Verify the rollback by running the Post-Deployment Verification checks against the rolled-back version');
  rollbackSteps.push('Notify the team and client (if applicable) that the rollback is complete');
  rollbackSteps.push('Document the incident: what failed, why, and what the fix will be');
  sections.push(...createBulletList(rollbackSteps));

  sections.push(createHeading('After Rollback', 2));
  sections.push(...createBulletList([
    'Investigate the root cause of the failure on a development or staging environment',
    'Create a fix, test it on staging, and follow the full deployment procedure again',
    'Update this runbook if the failure revealed a gap in the pre-deployment checklist',
    'Conduct a brief post-incident review with the team',
  ]));

  // --- 7. DNS & Domain Setup (conditional — client projects or when domain is specified) ---
  if (clientName !== '[CLIENT NAME]' || params['domain'] || flags.needs_dns) {
    sections.push(createHeading('DNS & Domain Setup', 1));
    sections.push(createParagraph('This section documents the DNS configuration for the project. DNS changes can take up to 48 hours to propagate globally, so plan domain cutover carefully.'));

    sections.push(createHeading('Domain Details', 2));
    sections.push(createTable(
      ['Detail', 'Value'],
      [
        ['Primary Domain', params['domain'] || '[Domain — to be confirmed]'],
        ['Registrar', params['domain-registrar'] || '[Registrar — to be confirmed]'],
        ['DNS Provider', params['dns-provider'] || params['domain-registrar'] || '[DNS provider — to be confirmed]'],
        ['SSL Provider', params['ssl-provider'] || 'Automatic (hosting platform managed)'],
      ]
    ));

    sections.push(createHeading('DNS Records', 2));
    sections.push(createParagraph('The following DNS records must be configured. Exact values depend on the hosting platform.'));

    const dnsRows = [];
    if (hostingPlatform.toLowerCase().includes('vercel')) {
      dnsRows.push(['A', '@', '76.76.21.21', '—', 'Points root domain to Vercel']);
      dnsRows.push(['CNAME', 'www', 'cname.vercel-dns.com', '—', 'Points www to Vercel']);
    } else if (hostingPlatform.toLowerCase().includes('netlify')) {
      dnsRows.push(['A', '@', '75.2.60.5', '—', 'Points root domain to Netlify load balancer']);
      dnsRows.push(['CNAME', 'www', '[site-name].netlify.app', '—', 'Points www to Netlify']);
    } else if (hostingPlatform.toLowerCase().includes('fly')) {
      dnsRows.push(['A', '@', '[Fly.io allocated IP]', '—', 'Points root domain to Fly.io']);
      dnsRows.push(['AAAA', '@', '[Fly.io allocated IPv6]', '—', 'IPv6 for Fly.io']);
      dnsRows.push(['CNAME', 'www', '[app-name].fly.dev', '—', 'Points www to Fly.io']);
    } else {
      dnsRows.push(['A', '@', '[Hosting IP]', '—', 'Points root domain to hosting']);
      dnsRows.push(['CNAME', 'www', '[Hosting CNAME target]', '—', 'Points www to hosting']);
    }
    if (flags.needs_email) {
      dnsRows.push(['MX', '@', '[Mail server]', '10', 'Email routing']);
      dnsRows.push(['TXT', '@', 'v=spf1 include:[provider] ~all', '—', 'SPF record for email authentication']);
    }
    sections.push(createTable(['Type', 'Name', 'Value', 'Priority', 'Purpose'], dnsRows));

    sections.push(createHeading('Domain Cutover Procedure', 2));
    sections.push(...createBulletList([
      'Deploy the application to production and verify it is working on the platform URL',
      'Configure the custom domain in the hosting platform dashboard',
      'Update DNS records at the registrar/DNS provider as documented above',
      'Wait for DNS propagation — verify with dig or nslookup (propagation can take up to 48 hours)',
      'Verify SSL certificate is issued and active for the custom domain',
      'Test the site on the custom domain — check both root domain and www subdomain',
      'Set up HTTP-to-HTTPS redirect if not handled automatically by the hosting platform',
      'Verify old URLs redirect correctly (if migrating from a previous domain)',
    ]));
  }

  // --- 8. Monitoring Setup ---
  sections.push(createHeading('Monitoring Setup', 1));
  sections.push(createParagraph('Monitoring must be configured before the first production deployment. All alerts should route to the on-call contact and the project communication channel.'));

  sections.push(createHeading('Uptime Monitoring', 2));
  sections.push(...createBulletList([
    'Configure an external uptime monitor (UptimeRobot, Better Uptime, or equivalent)',
    `Monitor URL: ${params['production-url'] || '[Production URL]'}`,
    'Check interval: 60 seconds',
    'Alert channels: email and Slack/Teams (or equivalent)',
    'Monitor the health check endpoint (e.g. /health) — not just the homepage',
  ]));

  sections.push(createHeading('Error Tracking', 2));
  sections.push(...createBulletList([
    'Configure error tracking (Sentry, Bugsnag, or equivalent) with the production DSN',
    'Set up alert rules: notify on first occurrence of new error types',
    'Configure source maps upload in the build pipeline for readable stack traces',
    'Set the release version in the error tracker to match the deployment tag',
    'Review and triage new errors within 24 hours of first occurrence',
  ]));

  sections.push(createHeading('Performance Monitoring', 2));
  const perfItems = [
    'Track server response times — alert if p95 exceeds 2 seconds',
    'Track error rate — alert if 5xx rate exceeds 1% of requests',
    'Monitor resource usage (CPU, memory, disk) on the hosting platform',
  ];
  if (flags.needs_database) {
    perfItems.push('Monitor database connection pool usage and query performance');
    perfItems.push('Set up slow query logging for queries exceeding 500ms');
  }
  if (flags.needs_api) {
    perfItems.push('Track API endpoint response times individually — identify slow endpoints');
    perfItems.push('Monitor API rate limit utilisation for third-party integrations');
  }
  perfItems.push('Set up weekly performance reports to track trends over time');
  sections.push(...createBulletList(perfItems));

  sections.push(createHeading('Log Management', 2));
  sections.push(...createBulletList([
    'Structured logging (JSON format) in production for searchability',
    'Log aggregation via the hosting platform or a dedicated service (Datadog, Logtail, etc.)',
    'Log retention: minimum 30 days for production, 7 days for staging',
    'Sensitive data must never appear in logs — sanitise PII, credentials, and tokens',
    'Include request IDs in all log entries for request tracing',
  ]));

  // --- 9. Emergency Contacts ---
  sections.push(createHeading('Emergency Contacts', 1));
  sections.push(createParagraph('Contact the following people or teams if an issue arises during or after deployment that cannot be resolved with the procedures in this runbook.'));

  sections.push(createTable(
    ['Role', 'Name', 'Contact', 'Availability'],
    [
      ['Project Lead', params['project-lead'] || company.contactName || '[Name]', company.email || '[Email / Phone]', 'Business hours'],
      ['Technical Lead', params['tech-lead'] || '[Name]', params['tech-lead-contact'] || '[Email / Phone]', 'Business hours + on-call'],
      ['Hosting Support', `${hostingPlatform} Support`, params['hosting-support-url'] || '[Support URL / Email]', '24/7 (platform SLA)'],
      ['Client Contact', clientName, params['client-contact'] || '[Email / Phone]', 'Business hours'],
    ]
  ));

  sections.push(createHeading('Escalation Path', 2));
  sections.push(...createBulletList([
    'Level 1: Developer on-call — first responder for deployment issues',
    'Level 2: Technical Lead — escalate if the issue cannot be resolved within 30 minutes',
    'Level 3: Project Lead — escalate if the issue affects the client or requires a business decision',
    'Client communication: the Project Lead handles all client-facing communication about incidents',
  ]));

  // --- 10. Appendix ---
  sections.push(createHeading('Appendix', 1));

  sections.push(createHeading('Useful Commands', 2));
  const commandRows = [];

  if (stackStr.includes('node') || stackStr.includes('next') || stackStr.includes('react') || stackStr.includes('express') || stackStr.includes('astro')) {
    const run = pkgManager === 'pnpm' ? 'pnpm' : pkgManager === 'yarn' ? 'yarn' : 'npm run';
    commandRows.push([`${run} build`, 'Build the application for production']);
    commandRows.push([`${run} start`, 'Start the production server']);
    commandRows.push([`${run} test`, 'Run the test suite']);
    if (flags.needs_database) {
      commandRows.push([`${run} migrate`, 'Run database migrations']);
      commandRows.push([`${run} migrate:rollback`, 'Rollback the last migration batch']);
    }
  }
  if (stackStr.includes('python') || stackStr.includes('django') || stackStr.includes('fastapi')) {
    commandRows.push(['python -m pytest', 'Run the test suite']);
    if (stackStr.includes('django')) {
      commandRows.push(['python manage.py migrate', 'Run database migrations']);
      commandRows.push(['python manage.py collectstatic', 'Collect static files for production']);
    }
    if (stackStr.includes('fastapi')) {
      commandRows.push(['uvicorn main:app --host 0.0.0.0 --port 8000', 'Start the production server']);
    }
  }
  if (stackStr.includes('docker') || params['uses-docker']) {
    commandRows.push(['docker build -t app .', 'Build the Docker image']);
    commandRows.push(['docker-compose up -d', 'Start all services in detached mode']);
    commandRows.push(['docker-compose logs -f', 'Tail logs from all services']);
    commandRows.push(['docker-compose down', 'Stop and remove all containers']);
  }
  if (hostingPlatform.toLowerCase().includes('vercel')) {
    commandRows.push(['vercel', 'Deploy a preview']);
    commandRows.push(['vercel --prod', 'Deploy to production']);
    commandRows.push(['vercel ls', 'List recent deployments']);
  }
  if (hostingPlatform.toLowerCase().includes('netlify')) {
    commandRows.push(['netlify deploy --dir=dist', 'Deploy a draft preview']);
    commandRows.push(['netlify deploy --prod --dir=dist', 'Deploy to production']);
    commandRows.push(['netlify status', 'Show current site status']);
  }
  if (hostingPlatform.toLowerCase().includes('fly')) {
    commandRows.push(['fly deploy', 'Deploy to Fly.io']);
    commandRows.push(['fly status', 'Show application status']);
    commandRows.push(['fly logs', 'Tail application logs']);
    commandRows.push(['fly ssh console', 'SSH into the running instance']);
  }
  // Add actual project scripts from context if available
  if (Object.keys(ctxScripts).length > 0) {
    for (const [name, cmd] of Object.entries(ctxScripts)) {
      if (!['build', 'start', 'test'].includes(name)) {
        commandRows.push([cmd, `${name} script`]);
      }
    }
  }
  commandRows.push(['git tag -a v[X.Y.Z] -m "message"', 'Create an annotated release tag']);
  commandRows.push(['git log --oneline -10', 'View recent commit history']);

  sections.push(createTable(['Command', 'Description'], commandRows));

  sections.push(createHeading('Environment Variable Reference', 2));
  if (ctxEnvVars.length > 0) {
    sections.push(createParagraph('The following environment variables are required. Refer to the Environment & Configuration Guide for full descriptions and example values.'));
    sections.push(createTable(
      ['Variable', 'Description'],
      ctxEnvVars.map(v => typeof v === 'string' ? [v, '—'] : [v.name || v.key || String(v), v.description || '—'])
    ));
  } else {
    sections.push(createParagraph('For a complete list of all environment variables, their descriptions, and example values, refer to the Environment & Configuration Guide for this project. The .env.example file in the repository root is the definitive list of required variables.'));
  }

  sections.push(createHeading('Release History', 2));
  sections.push(createParagraph('Track all production deployments here for audit purposes.'));
  sections.push(createTable(
    ['Version', 'Date', 'Deployed By', 'Notes'],
    [
      ['v1.0.0', '[Date]', '[Name]', 'Initial production release'],
      ['—', '—', '—', '—'],
    ]
  ));

  sections.push(createHeading('Document Revision History', 2));
  sections.push(createTable(
    ['Version', 'Date', 'Author', 'Changes'],
    [
      ['v1', new Date().toISOString().split('T')[0], company.contactName || '[Author]', 'Initial version'],
    ]
  ));

  return createDocument({
    title: 'Deployment Runbook',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
