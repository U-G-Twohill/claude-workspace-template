// Test Plan document template
// Generates a comprehensive test plan from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const company = getCompanyInfo(brandConfig || {});
  const launchDate = params['launch-date'] || '[TBC]';
  const testLead = params['test-lead'] || company.name || 'ICU Media Design';
  const primaryStack = params['primary-stack'] || meta['primary-stack'] || ctx.framework || '[TBC]';

  const sections = [];

  // --- 1. Test Strategy ---
  sections.push(createHeading('Test Strategy', 1));
  sections.push(createParagraph(`This document defines the test plan for ${projectName}, developed for ${clientName}. It establishes the testing approach, scope, environments, schedules, and acceptance criteria required to validate the application before production deployment.`));

  sections.push(createHeading('Approach', 2));
  sections.push(createParagraph('Testing follows a risk-based approach, prioritising critical user journeys and high-impact functionality. All testing is performed across multiple layers to ensure comprehensive coverage:'));
  sections.push(...createBulletList([
    'Unit testing — individual functions and components tested in isolation',
    'Integration testing — interactions between modules, services, and external systems verified',
    'Functional testing — end-to-end user flows validated against requirements',
    'Cross-browser testing — visual and functional consistency across target browsers and devices',
    'Performance testing — load capacity, response times, and resource usage benchmarked',
    'Security testing — vulnerability scanning and penetration testing on critical surfaces',
    'Accessibility testing — WCAG 2.1 AA compliance verified',
    'User Acceptance Testing (UAT) — client validates business requirements are met',
  ]));

  sections.push(createHeading('Methodologies', 2));
  sections.push(createTable(
    ['Methodology', 'Application', 'Tools'],
    [
      ['Manual exploratory testing', 'New features, UX flows, visual review', 'Browser DevTools, screen recording'],
      ['Automated regression testing', 'Stable features, critical paths, smoke tests', params['test-framework'] || ctx.testFramework || 'Playwright / Vitest / Jest'],
      ['Boundary value analysis', 'Form inputs, numeric fields, text limits', 'Manual + automated'],
      ['Equivalence partitioning', 'Input validation, role-based access', 'Manual + automated'],
      ['State transition testing', 'Multi-step workflows, status changes', 'Manual'],
      ['Error guessing', 'Edge cases, known problem patterns', 'Manual exploratory'],
    ]
  ));

  sections.push(createHeading('Tools', 2));
  const tools = [
    `Test framework: ${params['test-framework'] || ctx.testFramework || (ctx.dependencies?.testing ? Object.keys(ctx.dependencies.testing).join(', ') : null) || 'Playwright (E2E), Vitest/Jest (unit/integration)'}`,
    `CI/CD: ${params['ci-platform'] || 'GitHub Actions — automated test runs on every pull request'}`,
    `Bug tracking: ${params['bug-tracker'] || 'GitHub Issues with severity labels'}`,
    'Browser testing: BrowserStack or local device lab for cross-browser coverage',
    'Performance: Lighthouse, WebPageTest, k6 (load testing)',
    'Accessibility: axe-core, WAVE, manual screen reader testing',
  ];
  if (flags.needs_api) tools.push('API testing: Postman / Thunder Client for endpoint validation');
  if (flags.needs_auth) tools.push('Security scanning: OWASP ZAP, npm audit, Snyk');
  sections.push(...createBulletList(tools));

  // --- 2. Test Scope ---
  sections.push(createHeading('Test Scope', 1));

  sections.push(createHeading('In Scope', 2));
  const inScope = [
    'All user-facing pages and interactive elements',
    'Navigation, routing, and page transitions',
    'Form validation and submission flows',
    'Responsive layout across breakpoints (mobile, tablet, desktop)',
    'Content rendering and media display',
    'Error handling and user feedback (toast notifications, form errors, 404/500 pages)',
  ];
  if (flags.needs_auth) inScope.push('Authentication flows (registration, login, logout, password reset, MFA)');
  if (flags.needs_auth) inScope.push('Role-based access control and permission enforcement');
  if (flags.needs_payments) inScope.push('Payment processing (checkout, payment confirmation, refunds)');
  if (flags.needs_payments) inScope.push('Subscription management and billing flows');
  if (flags.needs_cms) inScope.push('CMS content creation, editing, publishing, and scheduling');
  if (flags.needs_cms) inScope.push('Media library upload, management, and display');
  if (flags.needs_api) inScope.push('API endpoints — request/response validation, error codes, rate limiting');
  if (flags.needs_api) inScope.push('API authentication and authorisation enforcement');
  if (flags.needs_search) inScope.push('Search functionality — relevance, filtering, pagination, empty states');
  if (flags.needs_email) inScope.push('Email delivery — transactional emails, templates, link validity');
  if (flags.needs_n8n) inScope.push('n8n workflow triggers, execution, and error handling');
  if (flags.needs_database) inScope.push('Database operations — CRUD, data integrity, migration scripts');
  inScope.push('Third-party integration points (per Integration Testing section)');
  inScope.push('SEO elements — meta tags, structured data, sitemap, robots.txt');
  sections.push(...createBulletList(inScope));

  sections.push(createHeading('Out of Scope', 2));
  const outOfScope = [
    'Third-party service internal reliability (payment provider uptime, email delivery rates)',
    'Content accuracy and copywriting quality (client responsibility)',
    'Hosting infrastructure and server-level security (managed by hosting provider)',
    'Load testing beyond defined capacity targets',
    'Penetration testing by external security firm (separate engagement if required)',
    'Browser versions below the minimum support matrix defined in this plan',
    'Native mobile application testing (web only unless otherwise specified)',
  ];
  sections.push(...createBulletList(outOfScope));

  // --- 3. Test Environment ---
  sections.push(createHeading('Test Environment', 1));

  sections.push(createHeading('Environments', 2));
  sections.push(createTable(
    ['Environment', 'URL', 'Purpose', 'Data'],
    [
      ['Local', 'http://localhost:3000', 'Developer testing, unit tests, debugging', 'Seed data / fixtures'],
      ['Staging', params['staging-url'] || '[staging-url]', 'Integration testing, UAT, client review', 'Anonymised production clone'],
      ['Production', params['production-url'] || '[production-url]', 'Smoke tests post-deployment only', 'Live data (read-only tests)'],
    ]
  ));

  sections.push(createHeading('Browser Support Matrix', 2));
  sections.push(createParagraph('The application is tested against the following browser/OS combinations. "Full" support means all features work correctly. "Basic" support means core content is accessible but advanced interactions may degrade gracefully.'));
  sections.push(createTable(
    ['Browser', 'Version', 'OS', 'Support Level'],
    [
      ['Chrome', 'Latest 2 versions', 'Windows, macOS, Android', 'Full'],
      ['Firefox', 'Latest 2 versions', 'Windows, macOS', 'Full'],
      ['Safari', 'Latest 2 versions', 'macOS, iOS', 'Full'],
      ['Edge', 'Latest 2 versions', 'Windows', 'Full'],
      ['Samsung Internet', 'Latest version', 'Android', 'Basic'],
      ['Safari', 'iOS 15+', 'iPhone, iPad', 'Full'],
      ['Chrome', 'Latest version', 'Android 12+', 'Full'],
    ]
  ));

  sections.push(createHeading('Device Matrix', 2));
  sections.push(createParagraph('Responsive testing is performed at the following breakpoints and on representative devices:'));
  sections.push(createTable(
    ['Category', 'Breakpoint', 'Representative Devices', 'Orientation'],
    [
      ['Mobile S', '320px', 'iPhone SE, Galaxy S8', 'Portrait'],
      ['Mobile M', '375px', 'iPhone 12/13/14, Pixel 7', 'Portrait'],
      ['Mobile L', '425px', 'iPhone 14 Pro Max, Galaxy S23 Ultra', 'Portrait + Landscape'],
      ['Tablet', '768px', 'iPad Air, Galaxy Tab S8', 'Portrait + Landscape'],
      ['Laptop', '1024px', 'MacBook Air 13", Surface Laptop', 'Landscape'],
      ['Desktop', '1440px', '27" monitor, iMac', 'Landscape'],
      ['Large Desktop', '1920px+', 'External monitors, ultrawide', 'Landscape'],
    ]
  ));

  // --- 4. Functional Testing ---
  sections.push(createHeading('Functional Testing', 1));
  sections.push(createParagraph('Functional tests validate that each feature area works correctly against its requirements. Test cases are organised by feature area and prioritised by business impact.'));

  // Auth testing
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication & Authorisation', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Register with valid credentials', 'Critical', 'Positive', 'Account created, confirmation email sent, user redirected to dashboard'],
        ['Register with existing email', 'High', 'Negative', 'Error displayed: "Email already in use", no duplicate account created'],
        ['Register with weak password', 'High', 'Negative', 'Password policy error displayed, account not created'],
        ['Login with valid credentials', 'Critical', 'Positive', 'User authenticated, session created, redirected to intended page'],
        ['Login with incorrect password', 'Critical', 'Negative', 'Generic error: "Invalid email or password", no information leakage'],
        ['Login with non-existent email', 'High', 'Negative', 'Same generic error as incorrect password (timing-safe)'],
        ['Account lockout after failed attempts', 'High', 'Security', 'Account locked after 5 failed attempts, lockout message displayed'],
        ['Password reset request', 'High', 'Positive', 'Reset email sent, token valid for limited time, old password still works until reset'],
        ['Password reset with expired token', 'Medium', 'Negative', 'Error displayed, user prompted to request new reset'],
        ['Logout from active session', 'High', 'Positive', 'Session invalidated, user redirected to login, back button does not restore session'],
        ['Access protected route unauthenticated', 'Critical', 'Security', 'Redirected to login, return URL preserved'],
        ['Access admin route as regular user', 'Critical', 'Security', 'HTTP 403 returned, access denied message displayed'],
        ['Session expiry handling', 'High', 'Edge case', 'User prompted to re-authenticate, unsaved work preserved where possible'],
        ['MFA enrolment and verification', 'High', 'Positive', 'TOTP setup successful, codes accepted, recovery codes generated'],
        ['Concurrent session limit', 'Medium', 'Edge case', 'Oldest session terminated when limit exceeded, user notified'],
      ]
    ));
  }

  // Payment testing
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Processing', 2));
    const paymentProvider = params['payment-provider'] || 'Stripe';
    sections.push(createParagraph(`Payment testing uses ${paymentProvider} test mode with test card numbers. No real transactions are processed during testing.`));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Successful payment with test card', 'Critical', 'Positive', 'Payment processed, confirmation displayed, receipt email sent'],
        ['Declined card', 'Critical', 'Negative', 'Decline message displayed, user can retry with different card'],
        ['Insufficient funds', 'High', 'Negative', 'Specific error displayed, transaction not completed'],
        ['3D Secure authentication', 'High', 'Positive', 'User redirected to 3DS flow, payment completes after authentication'],
        ['Payment with expired card', 'High', 'Negative', 'Card error displayed, user prompted to update payment method'],
        ['Network timeout during payment', 'High', 'Edge case', 'Graceful handling, no duplicate charges, user informed of status'],
        ['Refund processing', 'High', 'Positive', 'Refund initiated, confirmation displayed, amount returned to original method'],
        ['Subscription creation', 'High', 'Positive', 'Subscription active, next billing date set, confirmation email sent'],
        ['Subscription cancellation', 'High', 'Positive', 'Subscription cancelled, access continues until end of billing period'],
        ['Subscription upgrade/downgrade', 'Medium', 'Positive', 'Plan changed, prorated charge/credit applied correctly'],
        ['Webhook signature validation', 'High', 'Security', 'Valid webhooks processed, invalid signatures rejected with 400'],
        ['Idempotency on payment retry', 'Critical', 'Edge case', 'Duplicate submission does not create duplicate charge'],
        ['Currency display and formatting', 'Medium', 'Positive', 'Amounts displayed with correct currency symbol, decimal places, and locale'],
      ]
    ));
  }

  // CMS testing
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management System', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Create new content entry', 'Critical', 'Positive', 'Content saved to database, preview available, not published until explicit action'],
        ['Edit existing content', 'High', 'Positive', 'Changes saved, revision history updated, preview reflects changes'],
        ['Publish content', 'Critical', 'Positive', 'Content visible on public site, correct URL generated, cache invalidated'],
        ['Unpublish content', 'High', 'Positive', 'Content removed from public site, returns 404 or redirect, admin still accessible'],
        ['Schedule content publication', 'Medium', 'Positive', 'Content published at scheduled time, notification sent to author'],
        ['Upload media (images)', 'High', 'Positive', 'Image uploaded, resized/optimised, metadata extracted, available in media library'],
        ['Upload unsupported file type', 'Medium', 'Negative', 'Upload rejected with clear error message, no file stored'],
        ['Upload oversized file', 'Medium', 'Negative', 'Upload rejected, file size limit communicated to user'],
        ['Rich text editor functionality', 'High', 'Positive', 'Formatting, links, images, embeds work correctly, output sanitised'],
        ['Content versioning and rollback', 'Medium', 'Positive', 'Previous versions viewable, rollback restores content accurately'],
        ['Concurrent editing detection', 'Medium', 'Edge case', 'Warning displayed when another user is editing, merge or lock strategy applied'],
        ['SEO fields (title, description, slug)', 'High', 'Positive', 'Meta tags rendered correctly in page head, slug generates valid URL'],
        ['Content search and filtering', 'Medium', 'Positive', 'Admin can search/filter content by status, type, author, date'],
      ]
    ));
  }

  // API testing
  if (flags.needs_api) {
    sections.push(createHeading('API Endpoints', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Valid GET request', 'Critical', 'Positive', 'HTTP 200, correct response body and content-type'],
        ['Valid POST request with body', 'Critical', 'Positive', 'HTTP 201, resource created, correct Location header'],
        ['Valid PUT/PATCH request', 'High', 'Positive', 'HTTP 200, resource updated, response reflects changes'],
        ['Valid DELETE request', 'High', 'Positive', 'HTTP 204, resource removed, subsequent GET returns 404'],
        ['Request with invalid JSON body', 'High', 'Negative', 'HTTP 400, descriptive error message, no server crash'],
        ['Request with missing required fields', 'High', 'Negative', 'HTTP 422, validation errors list missing fields'],
        ['Request to non-existent resource', 'High', 'Negative', 'HTTP 404, consistent error format'],
        ['Request without authentication', 'Critical', 'Security', 'HTTP 401, no data leakage in error response'],
        ['Request with insufficient permissions', 'Critical', 'Security', 'HTTP 403, action not performed'],
        ['Request exceeding rate limit', 'High', 'Negative', 'HTTP 429, Retry-After header present'],
        ['Large payload exceeding size limit', 'Medium', 'Negative', 'HTTP 413, request rejected before processing'],
        ['SQL injection in query parameters', 'Critical', 'Security', 'Input sanitised, no database error, no data leakage'],
        ['XSS payload in text fields', 'Critical', 'Security', 'Input sanitised or escaped, script not executed in response'],
        ['Pagination (first, middle, last page)', 'Medium', 'Positive', 'Correct page size, total count, next/prev links'],
        ['Concurrent modification (optimistic locking)', 'Medium', 'Edge case', 'HTTP 409, conflict detected, client can retry with updated data'],
      ]
    ));
  }

  // Search testing
  if (flags.needs_search) {
    sections.push(createHeading('Search Functionality', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Search with exact match', 'Critical', 'Positive', 'Matching results returned, ranked by relevance'],
        ['Search with partial match', 'High', 'Positive', 'Relevant results returned, partial matches included'],
        ['Search with no results', 'High', 'Negative', 'Empty state displayed with suggestions or alternative actions'],
        ['Search with special characters', 'Medium', 'Edge case', 'Characters handled safely, no errors or injection'],
        ['Search with filters applied', 'High', 'Positive', 'Results filtered correctly, filter state reflected in UI and URL'],
        ['Search results pagination', 'Medium', 'Positive', 'Pages load correctly, result count accurate, no duplicates across pages'],
        ['Search performance (response time)', 'High', 'Performance', 'Results returned within 500ms for typical queries'],
        ['Search indexing after content update', 'Medium', 'Positive', 'Updated content searchable within acceptable delay'],
        ['Search autocomplete/suggestions', 'Medium', 'Positive', 'Suggestions appear as user types, selectable via keyboard and mouse'],
        ['Empty search query', 'Medium', 'Edge case', 'Handled gracefully — shows recent/popular or validation message'],
      ]
    ));
  }

  // Email testing
  if (flags.needs_email) {
    sections.push(createHeading('Email Notifications', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Transactional email delivery', 'Critical', 'Positive', 'Email delivered to inbox (not spam), correct content and formatting'],
        ['Email template rendering', 'High', 'Positive', 'HTML renders correctly in major email clients (Gmail, Outlook, Apple Mail)'],
        ['Email link validity', 'Critical', 'Positive', 'All links in emails resolve to correct pages, tokens valid'],
        ['Email with expired token link', 'High', 'Edge case', 'User shown expiry message with option to request new email'],
        ['Unsubscribe mechanism', 'High', 'Positive', 'One-click unsubscribe works, preferences updated, confirmation shown'],
        ['Email delivery to invalid address', 'Medium', 'Negative', 'Bounce handled gracefully, logged for review, no retry loop'],
        ['Email rate limiting', 'Medium', 'Edge case', 'User cannot trigger excessive emails (e.g. repeated password resets)'],
        ['Email plain text fallback', 'Medium', 'Positive', 'Plain text version available and readable for clients that block HTML'],
        ['Reply-to address configured', 'Low', 'Positive', 'Replies go to correct address (not no-reply for support emails)'],
      ]
    ));
  }

  // n8n testing
  if (flags.needs_n8n) {
    sections.push(createHeading('n8n Workflow Automation', 2));
    sections.push(createTable(
      ['Test Case', 'Priority', 'Type', 'Expected Result'],
      [
        ['Webhook trigger fires correctly', 'Critical', 'Positive', 'n8n workflow triggered on application event, correct payload received'],
        ['Workflow execution completes', 'High', 'Positive', 'All workflow nodes execute successfully, expected outcome achieved'],
        ['Workflow error handling', 'High', 'Negative', 'Errors caught by error handler node, notification sent, no data loss'],
        ['Workflow retry on transient failure', 'Medium', 'Edge case', 'Failed node retried per configuration, success on retry logged'],
        ['Workflow idempotency', 'High', 'Edge case', 'Duplicate webhook triggers do not cause duplicate actions'],
        ['Workflow with external API dependency', 'Medium', 'Integration', 'External API timeout handled gracefully, workflow pauses or skips'],
        ['Scheduled workflow execution', 'Medium', 'Positive', 'Cron-triggered workflows run on schedule, results correct'],
        ['Data transformation accuracy', 'High', 'Positive', 'Data mapped and transformed correctly between nodes'],
        ['Workflow performance under load', 'Medium', 'Performance', 'Concurrent webhook triggers processed without queue overflow'],
      ]
    ));
  }

  // --- 5. Cross-Browser Testing ---
  sections.push(createHeading('Cross-Browser Testing', 1));
  sections.push(createParagraph('Cross-browser testing verifies visual consistency and functional correctness across the supported browser/OS matrix. Testing covers layout rendering, interactive behaviour, font rendering, and JavaScript feature support.'));

  sections.push(createHeading('Browser/OS Test Matrix', 2));
  sections.push(createTable(
    ['Test Area', 'Chrome (Win)', 'Chrome (Mac)', 'Firefox (Win)', 'Safari (Mac)', 'Safari (iOS)', 'Chrome (Android)', 'Edge (Win)'],
    [
      ['Layout and grid rendering', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required'],
      ['Typography and font loading', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required'],
      ['Form inputs and validation', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required'],
      ['Navigation and routing', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required'],
      ['Animations and transitions', 'Required', 'Required', 'Required', 'Required', 'Verify', 'Verify', 'Required'],
      ['Image and media rendering', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required', 'Required'],
      ['Touch interactions', 'N/A', 'N/A', 'N/A', 'N/A', 'Required', 'Required', 'N/A'],
      ['Print styles', 'Required', 'Verify', 'Verify', 'Verify', 'N/A', 'N/A', 'Verify'],
      ['Dark mode (if supported)', 'Verify', 'Verify', 'Verify', 'Verify', 'Verify', 'Verify', 'Verify'],
    ]
  ));

  sections.push(createHeading('Known Browser Quirks', 2));
  sections.push(...createBulletList([
    'Safari: date input type not fully supported — verify custom date picker fallback',
    'Safari iOS: viewport height (100vh) includes address bar — use CSS dvh or JavaScript workaround',
    'Firefox: scrollbar styling differs — ensure scroll containers are usable without custom scrollbars',
    'Safari: backdrop-filter may have performance issues with many layered elements',
    'Chrome Android: touch target sizes must meet 44x44px minimum per WCAG',
    'Edge: verify that any Chromium-specific CSS features also work (should, as Edge is Chromium-based)',
  ]));

  // --- 6. Performance Testing ---
  sections.push(createHeading('Performance Testing', 1));

  sections.push(createHeading('Load Targets', 2));
  const concurrentUsers = params['concurrent-users'] || '100';
  const peakUsers = params['peak-users'] || '500';
  sections.push(createParagraph(`The application must handle ${concurrentUsers} concurrent users under normal load and ${peakUsers} concurrent users at peak without degradation beyond acceptable thresholds.`));
  sections.push(createTable(
    ['Metric', 'Target', 'Acceptable', 'Failure Threshold'],
    [
      ['Time to First Byte (TTFB)', '< 200ms', '< 600ms', '> 1000ms'],
      ['First Contentful Paint (FCP)', '< 1.2s', '< 2.5s', '> 4.0s'],
      ['Largest Contentful Paint (LCP)', '< 2.5s', '< 4.0s', '> 6.0s'],
      ['Cumulative Layout Shift (CLS)', '< 0.1', '< 0.25', '> 0.25'],
      ['Interaction to Next Paint (INP)', '< 200ms', '< 500ms', '> 500ms'],
      ['Total page weight', '< 1MB', '< 2MB', '> 3MB'],
      ['Lighthouse Performance score', '> 90', '> 70', '< 50'],
    ]
  ));

  sections.push(createHeading('Response Time Criteria', 2));
  sections.push(createTable(
    ['Request Type', 'P50 Target', 'P95 Target', 'P99 Target'],
    [
      ['Static asset (cached)', '< 50ms', '< 100ms', '< 200ms'],
      ['Page render (SSR/SSG)', '< 200ms', '< 500ms', '< 1000ms'],
      ['API read (simple query)', '< 100ms', '< 300ms', '< 500ms'],
      ['API read (complex query)', '< 300ms', '< 800ms', '< 1500ms'],
      ['API write (create/update)', '< 200ms', '< 500ms', '< 1000ms'],
      ['Search query', '< 300ms', '< 500ms', '< 1000ms'],
      ['File upload (< 5MB)', '< 2s', '< 5s', '< 10s'],
      ['Third-party API call', '< 500ms', '< 1500ms', '< 3000ms'],
    ]
  ));

  sections.push(createHeading('Load Testing Scenarios', 2));
  sections.push(...createBulletList([
    `Baseline: ${concurrentUsers} concurrent users performing typical browsing patterns for 30 minutes`,
    `Peak load: ${peakUsers} concurrent users simulating marketing campaign traffic spike`,
    'Soak test: sustained moderate load for 4 hours to detect memory leaks and resource exhaustion',
    'Spike test: sudden increase from baseline to peak and back to detect recovery behaviour',
    'Stress test: gradually increase beyond peak until failure to determine breaking point',
  ]));

  // --- 7. Security Testing (conditional) ---
  if (flags.needs_auth || flags.needs_api) {
    sections.push(createHeading('Security Testing', 1));
    sections.push(createParagraph('Security testing focuses on the OWASP Top 10 vulnerability categories and application-specific attack surfaces. Testing is performed in the staging environment with test data only.'));

    sections.push(createHeading('OWASP Top 10 Test Cases', 2));
    sections.push(createTable(
      ['Category', 'Test', 'Method', 'Pass Criteria'],
      [
        ['A01: Broken Access Control', 'Attempt to access resources belonging to other users', 'Manual + automated', 'All requests return 403, no data leakage'],
        ['A01: Broken Access Control', 'Attempt privilege escalation via parameter tampering', 'Manual', 'Role enforcement holds, audit log records attempt'],
        ['A02: Cryptographic Failures', 'Verify TLS configuration and cipher suites', 'SSL Labs scan', 'Grade A or A+, no weak ciphers'],
        ['A02: Cryptographic Failures', 'Check for sensitive data in URLs or logs', 'Manual review', 'No passwords, tokens, or PII in logs or query strings'],
        ['A03: Injection', 'SQL injection on all input fields', 'OWASP ZAP + manual', 'All inputs parameterised, no SQL errors returned'],
        ['A03: Injection', 'XSS injection (stored, reflected, DOM-based)', 'OWASP ZAP + manual', 'All output encoded, CSP prevents script execution'],
        ['A04: Insecure Design', 'Verify rate limiting on sensitive endpoints', 'Automated', 'Rate limits enforced, 429 returned when exceeded'],
        ['A05: Security Misconfiguration', 'Check security headers on all responses', 'Automated scan', 'All required headers present with correct values'],
        ['A05: Security Misconfiguration', 'Check for exposed admin panels or debug endpoints', 'Manual', 'No unprotected admin routes, debug mode disabled'],
        ['A06: Vulnerable Components', 'Scan dependencies for known vulnerabilities', 'npm audit / Snyk', 'Zero critical or high severity vulnerabilities'],
        ['A07: Auth Failures', 'Brute force login endpoint', 'Automated', 'Account lockout triggers, rate limiting enforced'],
        ['A08: Data Integrity', 'Verify JWT signature validation', 'Manual', 'Modified tokens rejected, expired tokens rejected'],
        ['A09: Logging Failures', 'Verify security events are logged', 'Manual review', 'All auth and access events appear in logs'],
        ['A10: SSRF', 'Attempt server-side requests to internal IPs', 'Manual', 'Internal IP ranges blocked, only allowlisted URLs permitted'],
      ]
    ));

    sections.push(createHeading('Additional Security Checks', 2));
    sections.push(...createBulletList([
      'CSRF tokens present on all state-changing forms and validated server-side',
      'Cookie flags verified: Secure, HttpOnly, SameSite=Strict (or Lax where required)',
      'Content-Type header validated on file uploads (magic bytes checked, not just extension)',
      'Error responses do not leak stack traces, database schemas, or internal paths',
      'Directory listing disabled on all web-accessible paths',
      'robots.txt does not inadvertently reveal sensitive URL patterns',
      'CORS configuration tested — wildcard origin not permitted in production',
      'Clickjacking protection verified via X-Frame-Options and CSP frame-ancestors',
    ]));
  }

  // --- 8. Accessibility Testing ---
  sections.push(createHeading('Accessibility Testing', 1));
  sections.push(createParagraph('The application is tested against WCAG 2.1 Level AA criteria. Accessibility testing combines automated scanning (axe-core) with manual testing using assistive technologies.'));

  sections.push(createHeading('WCAG 2.1 AA Checklist', 2));
  sections.push(createTable(
    ['Criterion', 'Requirement', 'Test Method', 'Status'],
    [
      ['1.1.1 Non-text Content', 'All images have meaningful alt text (or empty alt for decorative)', 'Automated + manual', 'Pending'],
      ['1.2.1 Audio/Video Alternatives', 'Captions or transcripts provided for media content', 'Manual', 'Pending'],
      ['1.3.1 Info and Relationships', 'Semantic HTML used (headings, lists, landmarks, tables)', 'Automated + manual', 'Pending'],
      ['1.3.2 Meaningful Sequence', 'Reading order makes sense when CSS is disabled', 'Manual', 'Pending'],
      ['1.4.1 Use of Colour', 'Colour is not the sole means of conveying information', 'Manual', 'Pending'],
      ['1.4.3 Contrast (Minimum)', 'Text contrast ratio at least 4.5:1 (3:1 for large text)', 'Automated (axe)', 'Pending'],
      ['1.4.4 Resize Text', 'Content readable and functional at 200% zoom', 'Manual', 'Pending'],
      ['1.4.10 Reflow', 'No horizontal scrolling at 320px width (1280px at 400% zoom)', 'Manual', 'Pending'],
      ['2.1.1 Keyboard', 'All functionality available via keyboard', 'Manual', 'Pending'],
      ['2.1.2 No Keyboard Trap', 'Focus is never trapped (especially in modals and dropdowns)', 'Manual', 'Pending'],
      ['2.4.1 Bypass Blocks', 'Skip-to-content link provided', 'Manual', 'Pending'],
      ['2.4.3 Focus Order', 'Tab order follows logical reading order', 'Manual', 'Pending'],
      ['2.4.4 Link Purpose', 'Link text is descriptive (no "click here" or "read more" without context)', 'Manual', 'Pending'],
      ['2.4.6 Headings and Labels', 'Headings are descriptive and hierarchically correct', 'Automated + manual', 'Pending'],
      ['2.4.7 Focus Visible', 'Keyboard focus indicator is clearly visible on all interactive elements', 'Manual', 'Pending'],
      ['3.1.1 Language of Page', 'HTML lang attribute set correctly', 'Automated', 'Pending'],
      ['3.2.1 On Focus', 'No unexpected context changes on focus', 'Manual', 'Pending'],
      ['3.3.1 Error Identification', 'Form errors clearly identified and described in text', 'Manual', 'Pending'],
      ['3.3.2 Labels or Instructions', 'All form inputs have visible labels', 'Automated + manual', 'Pending'],
      ['4.1.1 Parsing', 'No duplicate IDs, valid HTML structure', 'Automated (validator)', 'Pending'],
      ['4.1.2 Name, Role, Value', 'Custom widgets have correct ARIA roles and states', 'Automated + manual', 'Pending'],
    ]
  ));

  sections.push(createHeading('Assistive Technology Testing', 2));
  sections.push(...createBulletList([
    'Screen reader: NVDA on Windows (Chrome/Firefox) and VoiceOver on macOS/iOS (Safari)',
    'Keyboard-only navigation: complete all critical user journeys without a mouse',
    'High contrast mode: verify readability in Windows High Contrast and macOS Increase Contrast',
    'Reduced motion: verify prefers-reduced-motion media query disables animations',
    'Screen magnification: verify usability at 200% and 400% zoom',
  ]));

  // --- 9. Integration Testing ---
  sections.push(createHeading('Integration Testing', 1));
  sections.push(createParagraph('Integration tests verify that the application communicates correctly with external services and third-party systems. Each integration is tested for success paths, error handling, and timeout behaviour.'));

  const integrationRows = [];

  if (flags.needs_auth) {
    const authProvider = params['auth-provider'] || 'Auth provider';
    integrationRows.push([authProvider, 'User authentication, token validation, user management', 'Auth flow completes, tokens valid, errors handled']);
  }
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    integrationRows.push([paymentProvider, 'Payment processing, refunds, webhooks', 'Test transactions succeed, webhooks verified, errors handled']);
  }
  if (flags.needs_email) {
    const emailProvider = params['email-provider'] || 'Email service';
    integrationRows.push([emailProvider, 'Transactional email delivery', 'Emails delivered, templates rendered, bounces handled']);
  }
  if (flags.needs_search) {
    const searchProvider = params['search-provider'] || 'Search engine';
    integrationRows.push([searchProvider, 'Content indexing, search queries', 'Index updated on content change, queries return correct results']);
  }
  if (flags.needs_cms) {
    const cmsProvider = params['cms-provider'] || 'CMS';
    integrationRows.push([cmsProvider, 'Content CRUD, media upload, webhooks', 'Content synced, media processed, webhook payloads valid']);
  }
  if (flags.needs_n8n) {
    integrationRows.push(['n8n', 'Workflow triggers, webhook endpoints, data sync', 'Webhooks fire reliably, workflows execute, errors surfaced']);
  }
  if (flags.needs_database) {
    const dbProvider = params['database-provider'] || 'Database';
    integrationRows.push([dbProvider, 'CRUD operations, migrations, connection pooling', 'Queries execute correctly, connections managed, failover works']);
  }

  // Add any custom integrations from integrationClauses
  for (const [name, clause] of Object.entries(integrations)) {
    if (typeof clause === 'object' && clause.description) {
      integrationRows.push([name, clause.description, clause.testCriteria || 'Integration functions as specified']);
    }
  }

  if (integrationRows.length > 0) {
    sections.push(createTable(
      ['Integration', 'Scope', 'Pass Criteria'],
      integrationRows
    ));
  } else {
    sections.push(createParagraph('No integrations identified. This section will be updated as integrations are confirmed.'));
  }

  sections.push(createHeading('Integration Failure Scenarios', 2));
  sections.push(createParagraph('Each integration is tested for failure modes to verify graceful degradation:'));
  sections.push(...createBulletList([
    'Service unavailable (HTTP 5xx) — application displays user-friendly error, retries where appropriate',
    'Network timeout — request times out within configured threshold, user not left waiting indefinitely',
    'Invalid response format — unexpected response handled without application crash',
    'Rate limit exceeded — application respects rate limits, queues or retries with backoff',
    'Authentication failure (expired token, revoked key) — re-authentication triggered or error surfaced',
    'Webhook delivery failure — retry mechanism active, dead-letter queue for persistent failures',
  ]));

  // --- 10. Regression Testing ---
  sections.push(createHeading('Regression Testing', 1));

  sections.push(createHeading('Approach', 2));
  sections.push(createParagraph('Regression testing ensures that new changes do not break existing functionality. The regression suite runs automatically on every pull request via CI and must pass before merge.'));
  sections.push(...createBulletList([
    'Automated regression suite covers all critical user journeys identified in this plan',
    'Smoke test suite (subset of regression) runs on every deployment to staging and production',
    'Visual regression testing captures screenshots of key pages and compares against baselines',
    'Regression tests are updated whenever new features are added or existing features are modified',
    'Flaky tests are identified, quarantined, and fixed — never ignored or silently skipped',
  ]));

  sections.push(createHeading('Critical Path Regression Suite', 2));
  const regressionPaths = [
    'Homepage loads correctly with all content sections visible',
    'Primary navigation works on all breakpoints',
    'Footer links resolve to correct pages',
    'Contact/enquiry form submits successfully',
  ];
  if (flags.needs_auth) {
    regressionPaths.push('Login flow completes and redirects to dashboard');
    regressionPaths.push('Protected routes redirect unauthenticated users to login');
  }
  if (flags.needs_payments) regressionPaths.push('Checkout flow completes with test payment');
  if (flags.needs_search) regressionPaths.push('Search returns relevant results for common queries');
  if (flags.needs_cms) regressionPaths.push('Content publishes and displays on the public site');
  if (flags.needs_email) regressionPaths.push('Transactional email triggers and delivers correctly');
  regressionPaths.push('404 page displays for invalid URLs');
  regressionPaths.push('Sitemap.xml and robots.txt are valid and accessible');
  sections.push(...createBulletList(regressionPaths));

  // --- 11. UAT Plan ---
  sections.push(createHeading('User Acceptance Testing (UAT)', 1));

  sections.push(createHeading('UAT Overview', 2));
  sections.push(createParagraph(`UAT is performed by ${clientName} (or designated representatives) in the staging environment. UAT validates that the application meets business requirements and is suitable for production use. UAT begins after all Critical and High priority defects from internal testing are resolved.`));

  sections.push(createHeading('UAT Scenarios', 2));
  const uatScenarios = [
    ['Homepage review', 'Verify all content, images, and messaging are correct and on-brand', clientName],
    ['Navigation walkthrough', 'Navigate through all pages via primary and footer navigation', clientName],
    ['Mobile experience', 'Complete key tasks on a mobile phone (real device)', clientName],
    ['Contact/enquiry form', 'Submit an enquiry and verify confirmation and email receipt', clientName],
    ['Content accuracy', 'Review all pages for copy accuracy, spelling, and grammar', clientName],
  ];
  if (flags.needs_auth) {
    uatScenarios.push(['Account creation', 'Register a new account and complete onboarding flow', clientName]);
    uatScenarios.push(['User management', 'Create, modify, and deactivate user accounts', clientName + ' (admin)']);
  }
  if (flags.needs_payments) {
    uatScenarios.push(['Purchase flow', 'Complete a test purchase from product selection to confirmation', clientName]);
    uatScenarios.push(['Order management', 'View order history, initiate a refund request', clientName + ' (admin)']);
  }
  if (flags.needs_cms) {
    uatScenarios.push(['Content workflow', 'Create, edit, preview, and publish a content entry', clientName + ' (editor)']);
  }
  if (flags.needs_search) {
    uatScenarios.push(['Search functionality', 'Search for known content and verify relevance of results', clientName]);
  }
  sections.push(createTable(
    ['Scenario', 'Description', 'Tester'],
    uatScenarios
  ));

  sections.push(createHeading('UAT Participants', 2));
  sections.push(createTable(
    ['Role', 'Name', 'Responsibility'],
    [
      ['Product Owner', params['product-owner'] || '[TBC]', 'Final sign-off on UAT completion and go-live approval'],
      ['Primary Tester', params['primary-tester'] || '[TBC]', 'Executes all UAT scenarios, logs issues'],
      ['Subject Matter Expert', params['sme'] || '[TBC]', 'Validates domain-specific functionality and content accuracy'],
      ['Accessibility Reviewer', params['a11y-reviewer'] || '[TBC]', 'Spot-checks accessibility with assistive technology'],
      ['QA Lead', testLead, 'Supports UAT, triages issues, coordinates fixes'],
    ]
  ));

  sections.push(createHeading('UAT Feedback Process', 2));
  sections.push(...createBulletList([
    'Issues logged via shared bug tracker with screenshot/screen recording and steps to reproduce',
    'Issues triaged daily during UAT period — Critical/High fixed immediately, Medium/Low scheduled',
    'UAT round 1: full scenario walkthrough (allow 3-5 business days)',
    'UAT round 2: verify fixes and re-test failed scenarios (allow 2-3 business days)',
    'UAT sign-off: client confirms all scenarios pass and approves go-live',
  ]));

  // --- 12. Test Schedule ---
  sections.push(createHeading('Test Schedule', 1));

  sections.push(createParagraph('The following schedule outlines the testing phases. Dates are indicative and will be confirmed during project planning. Testing phases may overlap where activities are independent.'));
  sections.push(createTable(
    ['Phase', 'Activities', 'Duration', 'Dependencies', 'Target Completion'],
    [
      ['Unit Testing', 'Component and function-level tests written during development', 'Ongoing', 'Development sprints', 'Concurrent with development'],
      ['Integration Testing', 'Third-party service integration verification', '3-5 days', 'API development complete, test credentials available', '[TBC]'],
      ['Functional Testing', 'Feature-by-feature testing against requirements', '5-7 days', 'Feature development complete', '[TBC]'],
      ['Cross-Browser Testing', 'Browser/OS matrix validation', '2-3 days', 'UI development complete', '[TBC]'],
      ['Performance Testing', 'Load testing, Lighthouse audits, response time benchmarking', '2-3 days', 'Staging environment available', '[TBC]'],
      ['Security Testing', 'Vulnerability scanning, OWASP checks', '2-3 days', 'Auth and API features complete', '[TBC]'],
      ['Accessibility Testing', 'WCAG audit, assistive technology testing', '2-3 days', 'UI complete and stable', '[TBC]'],
      ['Regression Testing', 'Full regression suite execution', '1-2 days', 'All fixes applied', '[TBC]'],
      ['UAT Round 1', 'Client scenario testing', '3-5 days', 'Internal testing complete, zero Critical defects', '[TBC]'],
      ['UAT Round 2', 'Fix verification and re-test', '2-3 days', 'UAT R1 fixes deployed', '[TBC]'],
      ['Pre-Launch Verification', 'Final smoke test on production', '1 day', 'UAT sign-off, production deployment', launchDate],
    ]
  ));

  // --- 13. Defect Management ---
  sections.push(createHeading('Defect Management', 1));

  sections.push(createHeading('Severity Classification', 2));
  sections.push(createParagraph('All defects are classified by severity to determine resolution priority and SLA:'));
  sections.push(createTable(
    ['Severity', 'Definition', 'Examples', 'Resolution SLA'],
    [
      ['Critical (S1)', 'Application unusable, data loss, security breach, or complete feature failure with no workaround', 'Login broken for all users, payment processing fails, data exposed to unauthorised users', 'Fix within 4 hours, deploy hotfix immediately'],
      ['High (S2)', 'Major feature broken or significantly impaired, workaround available but unacceptable for production', 'Search returns incorrect results, email notifications not sending, admin panel inaccessible', 'Fix within 24 hours, include in next deployment'],
      ['Medium (S3)', 'Feature works but with noticeable issues, acceptable workaround exists', 'Layout broken on one browser, form validation message unclear, slow page load on mobile', 'Fix within 5 business days'],
      ['Low (S4)', 'Minor cosmetic issue, enhancement request, or edge case with minimal impact', 'Pixel alignment off, tooltip wording improvement, animation glitch on rare interaction', 'Fix within 10 business days or next sprint'],
    ]
  ));

  sections.push(createHeading('Defect Lifecycle', 2));
  sections.push(createParagraph('Defects follow a standard lifecycle from discovery to closure:'));
  sections.push(...createBulletList([
    'New — defect logged with steps to reproduce, expected vs actual result, severity, and screenshot/recording',
    'Triaged — severity confirmed, assigned to developer, sprint/milestone allocated',
    'In Progress — developer working on fix',
    'In Review — fix submitted as pull request, code review in progress',
    'Ready for Test — fix deployed to staging, ready for QA verification',
    'Verified — QA confirms fix resolves the defect and no regression introduced',
    'Closed — defect resolved, no further action required',
    'Reopened — fix did not fully resolve the issue or caused a regression',
  ]));

  sections.push(createHeading('Defect Report Template', 2));
  sections.push(createParagraph('All defects are logged with the following information:'));
  sections.push(...createBulletList([
    'Title: concise description of the defect',
    'Severity: S1 (Critical) / S2 (High) / S3 (Medium) / S4 (Low)',
    'Environment: browser, OS, device, and environment (staging/production)',
    'Steps to reproduce: numbered steps from a clean state to the defect',
    'Expected result: what should happen',
    'Actual result: what actually happens',
    'Evidence: screenshot, screen recording, or console error log',
    'Frequency: always reproducible / intermittent / one-time',
  ]));

  // --- 14. Sign-off Criteria ---
  sections.push(createHeading('Sign-off Criteria', 1));
  sections.push(createParagraph('The following criteria must be met before the application is approved for production deployment. All criteria are evaluated in the staging environment.'));

  sections.push(createHeading('Go-Live Gate', 2));
  sections.push(createTable(
    ['Criterion', 'Requirement', 'Status'],
    [
      ['Critical defects (S1)', 'Zero open Critical defects', 'Pending'],
      ['High defects (S2)', 'Zero open High defects', 'Pending'],
      ['Medium defects (S3)', 'Fewer than 5 open, none in critical user journeys', 'Pending'],
      ['Low defects (S4)', 'Documented and accepted by client (fix in post-launch sprint)', 'Pending'],
      ['Regression suite', '100% pass rate on critical path regression suite', 'Pending'],
      ['Cross-browser testing', 'All "Required" cells in browser matrix verified', 'Pending'],
      ['Performance benchmarks', 'All Core Web Vitals within "Acceptable" thresholds', 'Pending'],
      ['Accessibility compliance', 'WCAG 2.1 AA — zero automated violations, manual checks passed', 'Pending'],
      ['Security scan', 'Zero critical/high vulnerabilities in dependency and application scan', 'Pending'],
      ['UAT sign-off', 'Client has confirmed all UAT scenarios pass', 'Pending'],
      ['Content review', 'All content reviewed and approved by client', 'Pending'],
      ['Analytics and tracking', 'Analytics configured, events firing, data flowing to dashboards', 'Pending'],
      ['Backup and recovery', 'Database backup verified, restore procedure tested', 'Pending'],
      ['Monitoring and alerting', 'Uptime monitoring, error tracking, and alerting configured', 'Pending'],
      ['Documentation', 'Handover documentation complete (admin guide, content guide, runbook)', 'Pending'],
    ]
  ));

  sections.push(createHeading('Sign-off Parties', 2));
  sections.push(createTable(
    ['Role', 'Name', 'Sign-off Scope', 'Date'],
    [
      ['QA Lead', testLead, 'Internal testing complete, all criteria met', ''],
      ['Project Lead', params['project-lead'] || company.name || '[TBC]', 'Technical readiness confirmed', ''],
      ['Client Product Owner', params['product-owner'] || '[TBC]', 'UAT complete, business requirements met', ''],
      ['Client Stakeholder', params['client-stakeholder'] || '[TBC]', 'Final go-live approval', ''],
    ]
  ));

  sections.push(createParagraph('Production deployment proceeds only after all required sign-off parties have approved. Any outstanding items are documented with agreed timelines for post-launch resolution.', { bold: true }));

  return createDocument({
    title: 'Test Plan',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
