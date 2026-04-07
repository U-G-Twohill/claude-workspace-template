// UAT Sign-off document template
// Formal user acceptance testing sign-off with conditional test scenarios based on module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable, createSignatureBlock } from '../_shared/generator.js';
import { formatDate, resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const sections = [];

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || params['project-name'] || '[PROJECT NAME]';
  const company = getCompanyInfo(brandConfig || {});
  const companyName = company.name || brandConfig?.companyName || 'ICU Media Design';
  const scopeSummary = params['scope-summary'] || ctx.description || '[Summary of project scope and objectives]';
  const testEnvironment = params['test-environment'] || '[Staging URL / environment details]';
  const testPeriodStart = params['test-period-start'] ? formatDate(params['test-period-start']) : '[START DATE]';
  const testPeriodEnd = params['test-period-end'] ? formatDate(params['test-period-end']) : '[END DATE]';
  const clientRepName = params['client-rep-name'] || clientName;
  const clientRepRole = params['client-rep-role'] || 'Client Representative';
  const pmName = params['pm-name'] || companyName;
  const pmRole = params['pm-role'] || 'Project Manager';
  const wcagLevel = params['wcag-level'] || 'AA';
  const today = formatDate(new Date());

  // -------------------------------------------------------------------------
  // 1. Project Summary
  // -------------------------------------------------------------------------
  sections.push(createHeading('Project Summary', 1));
  sections.push(createParagraph(`This document records the formal User Acceptance Testing (UAT) outcomes and client sign-off for the ${projectName} project.`));

  sections.push(createTable(
    ['Field', 'Detail'],
    [
      ['Project Name', projectName],
      ['Client', clientName],
      ['Provider', companyName],
      ['Document Date', today],
      ['Document Version', params['version'] || '1.0'],
    ]
  ));

  sections.push(createHeading('Scope Summary', 2));
  sections.push(createParagraph(scopeSummary));

  // -------------------------------------------------------------------------
  // 2. UAT Scope
  // -------------------------------------------------------------------------
  sections.push(createHeading('UAT Scope', 1));
  sections.push(createParagraph('This section defines the boundaries of user acceptance testing, including what was tested, the environments used, and the testing period.'));

  sections.push(createHeading('What Was Tested', 2));

  const testedAreas = [
    'Core application functionality and user workflows',
    'Cross-browser compatibility (Chrome, Firefox, Safari, Edge)',
    'Responsive design across desktop, tablet, and mobile viewports',
    'Form validation and error handling',
    'Navigation and information architecture',
  ];

  if (flags.needs_auth) testedAreas.push('Authentication and authorisation flows');
  if (flags.needs_payments) testedAreas.push('Payment processing and transaction workflows');
  if (flags.needs_cms) testedAreas.push('Content management operations');
  if (flags.needs_search) testedAreas.push('Search functionality and result accuracy');
  if (flags.needs_email) testedAreas.push('Email notifications and transactional messaging');
  if (flags.needs_api) testedAreas.push('API integrations and data exchange');
  if (flags.needs_database) testedAreas.push('Data persistence and retrieval');

  sections.push(...createBulletList(testedAreas));

  sections.push(createHeading('Test Environment', 2));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Environment', testEnvironment],
      ['Browser Requirements', params['browsers'] || 'Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)'],
      ['Device Requirements', params['devices'] || 'Desktop (1920x1080), Tablet (768x1024), Mobile (375x812)'],
      ['Test Data', params['test-data'] || 'Production-representative test data set'],
    ]
  ));

  sections.push(createHeading('Test Period', 2));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Start Date', testPeriodStart],
      ['End Date', testPeriodEnd],
      ['Total Business Days', params['test-days'] || '[NUMBER]'],
      ['Tester(s)', params['testers'] || '[TESTER NAMES]'],
    ]
  ));

  // -------------------------------------------------------------------------
  // 3. Test Scenarios
  // -------------------------------------------------------------------------
  sections.push(createHeading('Test Scenarios', 1));
  sections.push(createParagraph('The following test scenarios were executed during the UAT period. Each scenario group covers a functional area of the application.'));

  // 3a. Core Functionality (always included)
  sections.push(createHeading('Core Functionality', 2));
  sections.push(createParagraph('Fundamental application features and user-facing workflows.'));
  sections.push(createTable(
    ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
    [
      ['CF-01', 'Homepage loads correctly', 'All content, images, and styles render as designed', '[PASS/FAIL]', ''],
      ['CF-02', 'Primary navigation works on all pages', 'All links resolve to correct destinations', '[PASS/FAIL]', ''],
      ['CF-03', 'Footer links and content display correctly', 'All footer elements render and link correctly', '[PASS/FAIL]', ''],
      ['CF-04', 'Contact form submission', 'Form validates input, submits successfully, shows confirmation', '[PASS/FAIL]', ''],
      ['CF-05', 'Responsive layout at all breakpoints', 'Layout adapts correctly for desktop, tablet, and mobile', '[PASS/FAIL]', ''],
      ['CF-06', '404 / error page handling', 'Invalid URLs show a branded error page with navigation', '[PASS/FAIL]', ''],
      ['CF-07', 'Page load performance', 'Pages load within acceptable thresholds (< 3s)', '[PASS/FAIL]', ''],
      ['CF-08', 'Cross-browser visual consistency', 'Consistent appearance across supported browsers', '[PASS/FAIL]', ''],
    ]
  ));

  // 3b. Auth Flow (conditional)
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication & Authorisation', 2));
    sections.push(createParagraph('User authentication, session management, and access control workflows.'));
    sections.push(createTable(
      ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
      [
        ['AU-01', 'User registration with valid details', 'Account created, confirmation email sent, user can log in', '[PASS/FAIL]', ''],
        ['AU-02', 'User registration with invalid/duplicate email', 'Appropriate validation errors displayed', '[PASS/FAIL]', ''],
        ['AU-03', 'Login with valid credentials', 'User authenticated, redirected to dashboard/home', '[PASS/FAIL]', ''],
        ['AU-04', 'Login with invalid credentials', 'Error message shown, account not locked on first attempt', '[PASS/FAIL]', ''],
        ['AU-05', 'Password reset request', 'Reset email sent with valid, time-limited link', '[PASS/FAIL]', ''],
        ['AU-06', 'Password reset completion', 'Password updated, user can log in with new password', '[PASS/FAIL]', ''],
        ['AU-07', 'Session timeout/expiry', 'User redirected to login after inactivity period', '[PASS/FAIL]', ''],
        ['AU-08', 'Protected page access without login', 'User redirected to login page', '[PASS/FAIL]', ''],
        ['AU-09', 'Role-based access control', 'Users only see content and actions matching their role', '[PASS/FAIL]', ''],
        ['AU-10', 'Multi-factor authentication (if applicable)', 'MFA challenge presented and verified correctly', '[PASS/FAIL]', ''],
        ['AU-11', 'Logout', 'Session destroyed, user returned to public page', '[PASS/FAIL]', ''],
      ]
    ));
  }

  // 3c. Payment Scenarios (conditional)
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Processing', 2));
    sections.push(createParagraph('Payment workflows including purchases, refunds, and subscription management.'));
    sections.push(createTable(
      ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
      [
        ['PM-01', 'Successful one-time purchase', 'Payment processed, confirmation shown, receipt emailed', '[PASS/FAIL]', ''],
        ['PM-02', 'Failed payment (declined card)', 'Appropriate error shown, order not created', '[PASS/FAIL]', ''],
        ['PM-03', 'Payment with invalid card details', 'Validation errors before submission', '[PASS/FAIL]', ''],
        ['PM-04', 'Refund processing', 'Refund initiated, confirmation shown, amount returned', '[PASS/FAIL]', ''],
        ['PM-05', 'Subscription creation', 'Recurring payment set up, confirmation and schedule shown', '[PASS/FAIL]', ''],
        ['PM-06', 'Subscription cancellation', 'Subscription cancelled, access maintained until period end', '[PASS/FAIL]', ''],
        ['PM-07', 'Subscription plan change (upgrade/downgrade)', 'Plan changed, prorated billing applied correctly', '[PASS/FAIL]', ''],
        ['PM-08', 'Payment receipt/invoice generation', 'Downloadable receipt with correct details', '[PASS/FAIL]', ''],
        ['PM-09', 'Tax/GST calculation', 'Correct tax applied and displayed in checkout', '[PASS/FAIL]', ''],
        ['PM-10', 'Cart persistence across sessions', 'Cart contents retained after logout/login', '[PASS/FAIL]', ''],
      ]
    ));
  }

  // 3d. CMS Operations (conditional)
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management', 2));
    sections.push(createParagraph('Content creation, editing, publishing, and scheduling workflows.'));
    sections.push(createTable(
      ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
      [
        ['CM-01', 'Create new content item', 'Content created as draft, saved correctly', '[PASS/FAIL]', ''],
        ['CM-02', 'Edit existing content', 'Changes saved, revision history updated', '[PASS/FAIL]', ''],
        ['CM-03', 'Publish content', 'Content visible on public-facing site immediately', '[PASS/FAIL]', ''],
        ['CM-04', 'Unpublish/revert to draft', 'Content removed from public site, remains in CMS', '[PASS/FAIL]', ''],
        ['CM-05', 'Schedule content for future publication', 'Content publishes automatically at scheduled time', '[PASS/FAIL]', ''],
        ['CM-06', 'Media/image upload', 'Files uploaded, thumbnails generated, insertable into content', '[PASS/FAIL]', ''],
        ['CM-07', 'Content preview before publishing', 'Accurate preview of how content will appear live', '[PASS/FAIL]', ''],
        ['CM-08', 'Bulk content operations', 'Multiple items selected and updated/deleted correctly', '[PASS/FAIL]', ''],
        ['CM-09', 'Content categorisation and tagging', 'Categories/tags applied and filterable', '[PASS/FAIL]', ''],
      ]
    ));
  }

  // 3e. Search (conditional)
  if (flags.needs_search) {
    sections.push(createHeading('Search Functionality', 2));
    sections.push(createParagraph('Search features including keyword search, filtering, and result presentation.'));
    sections.push(createTable(
      ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
      [
        ['SR-01', 'Basic keyword search', 'Relevant results returned, ranked by relevance', '[PASS/FAIL]', ''],
        ['SR-02', 'Search with no results', 'Friendly no-results message with suggestions', '[PASS/FAIL]', ''],
        ['SR-03', 'Search with filters applied', 'Results correctly narrowed by selected filters', '[PASS/FAIL]', ''],
        ['SR-04', 'Search result pagination', 'Pages navigate correctly, result count accurate', '[PASS/FAIL]', ''],
        ['SR-05', 'Search with special characters', 'No errors, results handled gracefully', '[PASS/FAIL]', ''],
        ['SR-06', 'Search performance under load', 'Results returned within acceptable time (< 2s)', '[PASS/FAIL]', ''],
      ]
    ));
  }

  // 3f. Email (conditional)
  if (flags.needs_email) {
    sections.push(createHeading('Email & Notifications', 2));
    sections.push(createParagraph('Transactional emails, notification preferences, and delivery verification.'));
    sections.push(createTable(
      ['#', 'Scenario', 'Expected Result', 'Status', 'Notes'],
      [
        ['EM-01', 'Welcome/registration email', 'Email delivered with correct content and branding', '[PASS/FAIL]', ''],
        ['EM-02', 'Password reset email', 'Email delivered with valid reset link', '[PASS/FAIL]', ''],
        ['EM-03', 'Order/action confirmation email', 'Email delivered with accurate transaction details', '[PASS/FAIL]', ''],
        ['EM-04', 'Notification preference management', 'User can opt in/out of notification types', '[PASS/FAIL]', ''],
        ['EM-05', 'Email rendering across clients', 'Correct display in Gmail, Outlook, Apple Mail', '[PASS/FAIL]', ''],
        ['EM-06', 'Unsubscribe link functionality', 'User unsubscribed, confirmation shown', '[PASS/FAIL]', ''],
      ]
    ));
  }

  // -------------------------------------------------------------------------
  // 4. Test Results Summary
  // -------------------------------------------------------------------------
  sections.push(createHeading('Test Results Summary', 1));
  sections.push(createParagraph('Consolidated results from all test scenarios executed during the UAT period.'));

  sections.push(createTable(
    ['Scenario', 'Status', 'Tester', 'Date Tested', 'Notes'],
    [
      ['[Scenario description]', '[Pass/Fail]', '[Tester name]', '[DD/MM/YYYY]', '[Any observations]'],
      ['[Scenario description]', '[Pass/Fail]', '[Tester name]', '[DD/MM/YYYY]', '[Any observations]'],
      ['[Scenario description]', '[Pass/Fail]', '[Tester name]', '[DD/MM/YYYY]', '[Any observations]'],
      ['[Scenario description]', '[Pass/Fail]', '[Tester name]', '[DD/MM/YYYY]', '[Any observations]'],
      ['[Scenario description]', '[Pass/Fail]', '[Tester name]', '[DD/MM/YYYY]', '[Any observations]'],
    ]
  ));

  sections.push(createHeading('Summary Statistics', 2));
  sections.push(createTable(
    ['Metric', 'Count'],
    [
      ['Total Scenarios Tested', '[NUMBER]'],
      ['Passed', '[NUMBER]'],
      ['Failed', '[NUMBER]'],
      ['Blocked', '[NUMBER]'],
      ['Not Tested', '[NUMBER]'],
      ['Pass Rate', '[PERCENTAGE]%'],
    ]
  ));

  // -------------------------------------------------------------------------
  // 5. Defects
  // -------------------------------------------------------------------------
  sections.push(createHeading('Defects', 1));
  sections.push(createParagraph('All defects identified during the UAT period are recorded below, along with their current status and acceptance decision.'));

  sections.push(createTable(
    ['ID', 'Severity', 'Description', 'Status', 'Accepted'],
    [
      ['DEF-001', '[Critical/High/Medium/Low]', '[Description of the defect]', '[Open/Fixed/Deferred]', '[Yes/No]'],
      ['DEF-002', '[Critical/High/Medium/Low]', '[Description of the defect]', '[Open/Fixed/Deferred]', '[Yes/No]'],
      ['DEF-003', '[Critical/High/Medium/Low]', '[Description of the defect]', '[Open/Fixed/Deferred]', '[Yes/No]'],
    ]
  ));

  sections.push(createHeading('Severity Definitions', 2));
  sections.push(createTable(
    ['Severity', 'Definition'],
    [
      ['Critical', 'System unusable, data loss, or security vulnerability. Blocks go-live.'],
      ['High', 'Major feature broken with no workaround. Must be resolved before go-live.'],
      ['Medium', 'Feature impaired but workaround exists. Should be resolved within an agreed timeframe.'],
      ['Low', 'Minor cosmetic or usability issue. Can be deferred to a future release.'],
    ]
  ));

  sections.push(createParagraph('All Critical and High severity defects must be resolved or formally accepted before sign-off can proceed.', { bold: true }));

  // -------------------------------------------------------------------------
  // 6. Agreed Exceptions
  // -------------------------------------------------------------------------
  sections.push(createHeading('Agreed Exceptions', 1));
  sections.push(createParagraph('The following known issues have been reviewed and formally accepted by the Client as exceptions that do not block project acceptance. These items may be addressed in a future phase or maintenance cycle.'));

  sections.push(createTable(
    ['#', 'Description', 'Impact', 'Workaround', 'Resolution Plan'],
    [
      ['EX-01', '[Description of accepted issue]', '[Impact on users/business]', '[Temporary workaround if any]', '[Planned fix timeline]'],
      ['EX-02', '[Description of accepted issue]', '[Impact on users/business]', '[Temporary workaround if any]', '[Planned fix timeline]'],
    ]
  ));

  sections.push(createParagraph('Both parties acknowledge that the above exceptions are accepted in their current state and do not constitute a failure to deliver the agreed scope.'));

  // -------------------------------------------------------------------------
  // 7. Performance Acceptance
  // -------------------------------------------------------------------------
  sections.push(createHeading('Performance Acceptance', 1));
  sections.push(createParagraph('The following performance metrics were measured against agreed targets during the UAT period.'));

  const perfRows = [
    ['Page Load Time (First Contentful Paint)', '< 1.5s', '[ACTUAL]', '[PASS/FAIL]'],
    ['Page Load Time (Largest Contentful Paint)', '< 2.5s', '[ACTUAL]', '[PASS/FAIL]'],
    ['Time to Interactive', '< 3.0s', '[ACTUAL]', '[PASS/FAIL]'],
    ['Cumulative Layout Shift', '< 0.1', '[ACTUAL]', '[PASS/FAIL]'],
    ['First Input Delay', '< 100ms', '[ACTUAL]', '[PASS/FAIL]'],
    ['Server Response Time (TTFB)', '< 600ms', '[ACTUAL]', '[PASS/FAIL]'],
    ['Lighthouse Performance Score', '>= 90', '[ACTUAL]', '[PASS/FAIL]'],
  ];

  if (flags.needs_api) {
    perfRows.push(['API Response Time (p95)', '< 500ms', '[ACTUAL]', '[PASS/FAIL]']);
  }
  if (flags.needs_search) {
    perfRows.push(['Search Response Time', '< 2.0s', '[ACTUAL]', '[PASS/FAIL]']);
  }
  if (flags.needs_database) {
    perfRows.push(['Database Query Time (p95)', '< 200ms', '[ACTUAL]', '[PASS/FAIL]']);
  }

  sections.push(createTable(
    ['Metric', 'Target', 'Actual', 'Pass/Fail'],
    perfRows
  ));

  sections.push(createParagraph('Performance was measured using industry-standard tooling (Lighthouse, WebPageTest, or equivalent) against the agreed test environment.'));

  // -------------------------------------------------------------------------
  // 8. Accessibility Acceptance
  // -------------------------------------------------------------------------
  sections.push(createHeading('Accessibility Acceptance', 1));
  sections.push(createParagraph(`The application has been evaluated for compliance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level ${wcagLevel}.`));

  sections.push(createTable(
    ['Criterion', 'Requirement', 'Status', 'Notes'],
    [
      ['Perceivable', `All non-text content has text alternatives (WCAG ${wcagLevel})`, '[PASS/FAIL]', ''],
      ['Operable', `All functionality available via keyboard (WCAG ${wcagLevel})`, '[PASS/FAIL]', ''],
      ['Understandable', `Content is readable and predictable (WCAG ${wcagLevel})`, '[PASS/FAIL]', ''],
      ['Robust', `Content is compatible with assistive technologies (WCAG ${wcagLevel})`, '[PASS/FAIL]', ''],
      ['Colour Contrast', 'Minimum 4.5:1 ratio for normal text, 3:1 for large text', '[PASS/FAIL]', ''],
      ['Screen Reader', 'Key workflows navigable with NVDA/VoiceOver', '[PASS/FAIL]', ''],
      ['Focus Management', 'Visible focus indicators, logical tab order', '[PASS/FAIL]', ''],
      ['Form Accessibility', 'Labels, error messages, and ARIA attributes correct', '[PASS/FAIL]', ''],
    ]
  ));

  sections.push(createParagraph('Accessibility testing was conducted using automated tools (axe-core, Lighthouse) supplemented by manual keyboard and screen reader testing.'));

  sections.push(createHeading('Accessibility Exceptions', 2));
  sections.push(createParagraph('Any accessibility issues that have been reviewed and accepted are documented in the Agreed Exceptions section above. The Client acknowledges that accessibility compliance is an ongoing responsibility, particularly when content is updated post-launch.'));

  // -------------------------------------------------------------------------
  // 9. Sign-off Declaration
  // -------------------------------------------------------------------------
  sections.push(createHeading('Sign-off Declaration', 1));
  sections.push(createParagraph('By signing this document, the undersigned parties confirm the following:'));

  sections.push(...createBulletList([
    `User Acceptance Testing for the ${projectName} project has been completed in accordance with the agreed test plan.`,
    'All Critical and High severity defects have been resolved or formally accepted as exceptions (documented above).',
    'The application meets the functional requirements as defined in the project scope and Statement of Work.',
    'Performance metrics meet the agreed targets or exceptions have been formally recorded.',
    `Accessibility requirements have been evaluated against WCAG 2.1 Level ${wcagLevel} standards.`,
    'The Client accepts the deliverables as complete and authorises the project to proceed to production deployment.',
  ]));

  sections.push(createParagraph(`This sign-off constitutes formal acceptance of the ${projectName} project deliverables. Any issues discovered after sign-off that were not identified during the UAT period will be addressed under the agreed maintenance or support arrangement.`));

  sections.push(createParagraph(`Date of Sign-off: ${today}`));

  // -------------------------------------------------------------------------
  // 10. Signatures
  // -------------------------------------------------------------------------
  sections.push(createHeading('Signatures', 1));
  sections.push(createParagraph('By signing below, both parties confirm they have reviewed this document and agree to its contents.'));

  sections.push(...createSignatureBlock([
    { name: clientRepName, role: clientRepRole },
    { name: pmName, role: pmRole },
  ]));

  return createDocument({
    title: 'UAT Sign-off',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
