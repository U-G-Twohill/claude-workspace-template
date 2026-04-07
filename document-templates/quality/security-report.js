// Security Report document template
// Generates a security assessment report from harden findings or structured placeholder sections
// Designed to consume output from the /harden command or standalone security audits

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { formatDate, resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  // options.hardenReport can contain findings from /harden command
  const findings = options.hardenReport || null;

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || params['project-name'] || '[PROJECT NAME]';
  const assessmentDate = formatDate(params['assessment-date'] || new Date());
  const assessor = params['assessor'] || getCompanyInfo(brandConfig || {}).name || 'ICU Media Design';
  const scope = params['assessment-scope'] || 'Full application security assessment';
  const company = getCompanyInfo(brandConfig || {});

  // Compute severity counts from findings
  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
  if (findings && Array.isArray(findings)) {
    for (const f of findings) {
      const sev = normaliseSeverity(f.severity);
      if (sev in severityCounts) {
        severityCounts[sev]++;
      }
    }
  }
  const totalFindings = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  const sections = [];

  // --- 1. Executive Summary ---
  sections.push(createHeading('Executive Summary', 1));

  if (findings && findings.length > 0) {
    const posture = determinePosture(severityCounts);
    sections.push(createParagraph(`This security assessment of ${projectName} was conducted on ${assessmentDate} by ${assessor}. The assessment covered: ${scope}.`));
    sections.push(createParagraph(`Overall security posture: ${posture}. A total of ${totalFindings} finding(s) were identified across all severity levels.`));
    sections.push(createParagraph(`Critical findings: ${severityCounts.Critical}. High findings: ${severityCounts.High}. Medium findings: ${severityCounts.Medium}. Low findings: ${severityCounts.Low}. Informational: ${severityCounts.Informational}.`, { bold: true }));

    if (severityCounts.Critical > 0) {
      sections.push(createParagraph('IMMEDIATE ACTION REQUIRED: Critical-severity findings have been identified that pose an imminent risk to the application and its users. These must be remediated before production deployment or as an emergency hotfix if already in production.', { bold: true }));
    } else if (severityCounts.High > 0) {
      sections.push(createParagraph('High-severity findings require prompt remediation. These should be addressed within the current development cycle or sprint.'));
    } else {
      sections.push(createParagraph('No critical or high-severity findings were identified. The application demonstrates a solid security baseline. Medium and low findings should be addressed during regular maintenance cycles.'));
    }
  } else {
    sections.push(createParagraph(`This security assessment of ${projectName} was conducted on ${assessmentDate} by ${assessor}. The assessment covered: ${scope}.`));
    sections.push(createParagraph('This report documents the findings from the security assessment, including identified vulnerabilities, their potential impact, and recommended remediation steps. Findings are prioritised by severity to guide remediation efforts.'));
    sections.push(createParagraph('[Overall security posture and critical findings count to be completed after assessment.]', { italic: true }));
  }

  // --- 2. Methodology ---
  sections.push(createHeading('Methodology', 1));

  sections.push(createHeading('Assessment Scope', 2));
  sections.push(createParagraph(`Scope: ${scope}. The assessment was performed against the application in its current state as of ${assessmentDate}.`));

  const scopeAreas = params['scope-areas'] || [
    'Application source code and configuration',
    'Authentication and authorisation mechanisms',
    'API endpoints and input validation',
    'Third-party dependencies and supply chain',
    'Infrastructure configuration and security headers',
    'Data storage and encryption practices',
    'Error handling and information disclosure',
  ];
  sections.push(createParagraph('The following areas were included in the assessment:'));
  sections.push(...createBulletList(scopeAreas));

  sections.push(createHeading('Tools and Techniques', 2));
  const tools = params['assessment-tools'] || [
    'Static code analysis (manual review and automated scanning)',
    'Dependency vulnerability scanning (npm audit, Snyk, or equivalent)',
    'Security header analysis (observatory, securityheaders.com)',
    'SSL/TLS configuration testing (ssllabs.com or testssl.sh)',
    'OWASP Testing Guide v4 methodology',
    '/harden command (Claude Code automated security analysis)',
    'Manual penetration testing of identified attack surfaces',
  ];
  sections.push(createParagraph('The following tools and techniques were used during this assessment:'));
  sections.push(...createBulletList(tools));

  sections.push(createHeading('Severity Classification', 2));
  sections.push(createParagraph('Findings are classified using the following severity scale, aligned with CVSS v3.1 scoring:'));
  sections.push(createTable(
    ['Severity', 'CVSS Range', 'Description', 'Remediation SLA'],
    [
      ['Critical', '9.0 - 10.0', 'Actively exploitable, immediate risk of data breach or system compromise', 'Within 24 hours'],
      ['High', '7.0 - 8.9', 'Significant risk, exploitable with moderate effort or impact', 'Within 7 days'],
      ['Medium', '4.0 - 6.9', 'Moderate risk, requires specific conditions to exploit', 'Within 30 days'],
      ['Low', '0.1 - 3.9', 'Minor risk, limited impact or difficult to exploit', 'Within 90 days'],
      ['Informational', 'N/A', 'Best practice recommendation, no direct vulnerability', 'Next maintenance cycle'],
    ]
  ));

  // --- 3. Findings Summary ---
  sections.push(createHeading('Findings Summary', 1));

  sections.push(createHeading('Severity Breakdown', 2));
  if (findings && findings.length > 0) {
    sections.push(createTable(
      ['Severity', 'Count', 'Open', 'Resolved'],
      [
        ['Critical', String(severityCounts.Critical), String(countByStatus(findings, 'Critical', 'open')), String(countByStatus(findings, 'Critical', 'resolved'))],
        ['High', String(severityCounts.High), String(countByStatus(findings, 'High', 'open')), String(countByStatus(findings, 'High', 'resolved'))],
        ['Medium', String(severityCounts.Medium), String(countByStatus(findings, 'Medium', 'open')), String(countByStatus(findings, 'Medium', 'resolved'))],
        ['Low', String(severityCounts.Low), String(countByStatus(findings, 'Low', 'open')), String(countByStatus(findings, 'Low', 'resolved'))],
        ['Informational', String(severityCounts.Informational), String(countByStatus(findings, 'Informational', 'open')), String(countByStatus(findings, 'Informational', 'resolved'))],
        ['Total', String(totalFindings), String(countAllByStatus(findings, 'open')), String(countAllByStatus(findings, 'resolved'))],
      ]
    ));
  } else {
    sections.push(createTable(
      ['Severity', 'Count', 'Open', 'Resolved'],
      [
        ['Critical', '0', '0', '0'],
        ['High', '0', '0', '0'],
        ['Medium', '0', '0', '0'],
        ['Low', '0', '0', '0'],
        ['Informational', '0', '0', '0'],
        ['Total', '0', '0', '0'],
      ]
    ));
    sections.push(createParagraph('[Populate after assessment is complete.]', { italic: true }));
  }

  sections.push(createHeading('Category Breakdown', 2));
  if (findings && findings.length > 0) {
    const categories = groupByCategory(findings);
    const categoryRows = Object.entries(categories).map(([cat, items]) => {
      const maxSev = getMaxSeverity(items);
      return [cat, String(items.length), maxSev];
    });
    sections.push(createTable(['Category', 'Findings', 'Highest Severity'], categoryRows));
  } else {
    sections.push(createTable(
      ['Category', 'Findings', 'Highest Severity'],
      [
        ['Authentication', '-', '-'],
        ['API Security', '-', '-'],
        ['Dependencies', '-', '-'],
        ['Infrastructure', '-', '-'],
        ['Data Protection', '-', '-'],
        ['Input Validation', '-', '-'],
      ]
    ));
  }

  // --- 4. Detailed Findings ---
  sections.push(createHeading('Detailed Findings', 1));

  if (findings && findings.length > 0) {
    // Sort by severity: Critical first, then High, Medium, Low, Informational
    const sorted = [...findings].sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
    let findingNumber = 1;

    for (const finding of sorted) {
      const sev = normaliseSeverity(finding.severity);
      const status = finding.status || 'Open';
      sections.push(createHeading(`${sev}-${String(findingNumber).padStart(3, '0')}: ${finding.title}`, 2));

      sections.push(createTable(
        ['Property', 'Value'],
        [
          ['Severity', sev],
          ['Category', finding.category || 'General'],
          ['Status', capitalise(status)],
        ]
      ));

      sections.push(createHeading('Description', 3));
      sections.push(createParagraph(finding.description || 'No description provided.'));

      sections.push(createHeading('Impact', 3));
      sections.push(createParagraph(finding.impact || 'Impact assessment pending.'));

      sections.push(createHeading('Remediation', 3));
      if (finding.remediation) {
        if (Array.isArray(finding.remediation)) {
          sections.push(...createBulletList(finding.remediation));
        } else {
          sections.push(createParagraph(finding.remediation));
        }
      } else {
        sections.push(createParagraph('Remediation steps to be determined.', { italic: true }));
      }

      findingNumber++;
    }
  } else {
    // Placeholder sections when no harden findings are provided
    sections.push(createParagraph('No automated findings were provided. The following sections contain placeholder templates for manual assessment documentation.', { italic: true }));

    // 4a. Authentication Audit placeholder
    sections.push(createHeading('Authentication Audit', 2));
    sections.push(createParagraph('Review of authentication mechanisms, password policies, session management, and multi-factor authentication implementation.'));
    sections.push(createTable(
      ['Check', 'Expected', 'Actual', 'Status'],
      [
        ['Password minimum length', '>= 12 characters', '[Result]', 'Pending'],
        ['Password complexity enforcement', 'Upper, lower, digit, special', '[Result]', 'Pending'],
        ['Breached password check', 'HIBP k-anonymity integration', '[Result]', 'Pending'],
        ['Account lockout policy', '5 failures, 15-min lockout', '[Result]', 'Pending'],
        ['Password hashing algorithm', 'bcrypt (cost 12+) or Argon2id', '[Result]', 'Pending'],
        ['Session token expiry', 'Access: 15min, Refresh: 7 days', '[Result]', 'Pending'],
        ['Session invalidation on password change', 'All sessions revoked', '[Result]', 'Pending'],
        ['MFA availability', 'Available for all, enforced for admins', '[Result]', 'Pending'],
        ['Secure cookie flags', 'Secure, HttpOnly, SameSite=Strict', '[Result]', 'Pending'],
        ['Login rate limiting', 'Stricter than general rate limit', '[Result]', 'Pending'],
      ]
    ));

    // 4b. API Security placeholder
    sections.push(createHeading('API Security', 2));
    sections.push(createParagraph('Review of API endpoint security, rate limiting, CORS configuration, input validation, and authentication enforcement.'));
    sections.push(createTable(
      ['Check', 'Expected', 'Actual', 'Status'],
      [
        ['Authentication on all non-public endpoints', 'Enforced via middleware', '[Result]', 'Pending'],
        ['Rate limiting configured', 'Per-endpoint, per-user limits', '[Result]', 'Pending'],
        ['CORS origin restrictions', 'Specific origins, no wildcard', '[Result]', 'Pending'],
        ['Input schema validation', 'All endpoints validated', '[Result]', 'Pending'],
        ['SQL injection prevention', 'Parameterised queries only', '[Result]', 'Pending'],
        ['XSS prevention', 'Output encoding, CSP header', '[Result]', 'Pending'],
        ['CSRF protection', 'Token or SameSite cookies', '[Result]', 'Pending'],
        ['Error response sanitisation', 'No stack traces or internal paths', '[Result]', 'Pending'],
        ['HTTP method restriction', 'Only required methods allowed', '[Result]', 'Pending'],
        ['Request body size limits', 'Enforced at server level', '[Result]', 'Pending'],
      ]
    ));

    // 4c. Dependency Audit placeholder
    sections.push(createHeading('Dependency Audit', 2));
    sections.push(createParagraph('Review of third-party dependencies for known vulnerabilities, maintenance status, and licence compliance.'));
    if (ctx.dependencies && typeof ctx.dependencies === 'object') {
      const depNames = Object.keys(ctx.dependencies);
      const securityRelevant = depNames.filter(d => /helmet|cors|csurf|csrf|bcrypt|argon|jose|jsonwebtoken|passport|auth|sanitize|xss|rate.limit/i.test(d));
      if (securityRelevant.length > 0) {
        sections.push(createParagraph(`Security-relevant packages detected: ${securityRelevant.map(d => `${d}@${ctx.dependencies[d]}`).join(', ')}.`));
      }
      sections.push(createParagraph(`Total dependencies detected from project: ${depNames.length}.`));
    }
    sections.push(createTable(
      ['Check', 'Expected', 'Actual', 'Status'],
      [
        ['npm audit / pip audit clean', '0 critical or high vulnerabilities', '[Result]', 'Pending'],
        ['Lockfile committed', 'package-lock.json or equivalent present', '[Result]', 'Pending'],
        ['No abandoned packages', 'All deps updated within 2 years', '[Result]', 'Pending'],
        ['Licence compliance', 'MIT, Apache 2.0, BSD only', '[Result]', 'Pending'],
        ['No unnecessary dependencies', 'No unused packages in manifest', '[Result]', 'Pending'],
        ['Automated scanning configured', 'CI pipeline includes audit step', '[Result]', 'Pending'],
      ]
    ));

    if (ctx.envVars && Array.isArray(ctx.envVars) && ctx.envVars.length > 0) {
      sections.push(createHeading('Secrets Audit', 3));
      sections.push(createParagraph('The following environment variables were detected in the project and should be verified for secure handling:'));
      sections.push(...createBulletList(ctx.envVars.map(v => typeof v === 'string' ? v : `${v.name} — ${v.description || 'Verify not committed to source'}`)));
    }

    // 4d. Infrastructure placeholder
    sections.push(createHeading('Infrastructure Audit', 2));
    sections.push(createParagraph('Review of security headers, SSL/TLS configuration, DNS records, and server hardening.'));
    sections.push(createTable(
      ['Check', 'Expected', 'Actual', 'Status'],
      [
        ['HTTPS enforced', 'HSTS with 1-year max-age', '[Result]', 'Pending'],
        ['TLS version', '>= TLS 1.2, prefer 1.3', '[Result]', 'Pending'],
        ['SSL certificate validity', 'Valid, auto-renewal configured', '[Result]', 'Pending'],
        ['X-Content-Type-Options', 'nosniff', '[Result]', 'Pending'],
        ['X-Frame-Options', 'DENY or SAMEORIGIN', '[Result]', 'Pending'],
        ['Content-Security-Policy', 'Strict CSP defined', '[Result]', 'Pending'],
        ['Referrer-Policy', 'strict-origin-when-cross-origin', '[Result]', 'Pending'],
        ['Permissions-Policy', 'Restrictive feature policy', '[Result]', 'Pending'],
        ['DNS CAA records', 'CA restriction configured', '[Result]', 'Pending'],
        ['DNSSEC', 'Enabled if supported by registrar', '[Result]', 'Pending'],
        ['Server information disclosure', 'No server version in headers', '[Result]', 'Pending'],
        ['Directory listing', 'Disabled', '[Result]', 'Pending'],
      ]
    ));
  }

  // --- 5. Auth Audit (conditional, only when findings not provided) ---
  if (flags.needs_auth && findings && findings.length > 0) {
    const authFindings = findings.filter(f => /auth/i.test(f.category || ''));
    if (authFindings.length > 0) {
      sections.push(createHeading('Authentication Assessment', 1));
      sections.push(createParagraph(`${authFindings.length} finding(s) relate to authentication and session management. These findings are documented in the Detailed Findings section above. The following summarises the authentication security posture.`));

      const authCritical = authFindings.filter(f => normaliseSeverity(f.severity) === 'Critical').length;
      const authHigh = authFindings.filter(f => normaliseSeverity(f.severity) === 'High').length;

      if (authCritical > 0 || authHigh > 0) {
        sections.push(createParagraph(`Authentication security requires immediate attention: ${authCritical} critical and ${authHigh} high-severity issues identified.`, { bold: true }));
      } else {
        sections.push(createParagraph('Authentication mechanisms are generally well-implemented. Minor improvements are recommended in the detailed findings.'));
      }

      sections.push(...createBulletList([
        'Review all authentication-related findings in the Detailed Findings section',
        'Prioritise credential handling and session management fixes',
        'Verify MFA implementation covers all privileged access paths',
        'Ensure password policy aligns with current NIST SP 800-63B guidelines',
      ]));
    }
  }

  // --- 6. API Security (conditional) ---
  if (flags.needs_api && findings && findings.length > 0) {
    const apiFindings = findings.filter(f => /api/i.test(f.category || ''));
    if (apiFindings.length > 0) {
      sections.push(createHeading('API Security Assessment', 1));
      sections.push(createParagraph(`${apiFindings.length} finding(s) relate to API security. These are documented in the Detailed Findings section. Key areas reviewed include endpoint authentication, rate limiting, CORS, input validation, and error handling.`));

      sections.push(createParagraph('API security recommendations:'));
      sections.push(...createBulletList([
        'Ensure all non-public endpoints require authentication via middleware',
        'Implement per-endpoint rate limiting with appropriate thresholds',
        'Restrict CORS to specific known origins in production',
        'Validate all request parameters against a schema before processing',
        'Sanitise error responses to prevent information disclosure',
        'Use Content-Type validation to reject unexpected payload formats',
      ]));
    }
  }

  // --- 7. Payment Security (conditional) ---
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Security Assessment', 1));

    const paymentProvider = params['payment-provider'] || 'Stripe';

    if (findings && findings.length > 0) {
      const paymentFindings = findings.filter(f => /payment|pci|billing|stripe|transaction/i.test(f.category || '') || /payment|pci|billing|stripe|transaction/i.test(f.title || ''));
      if (paymentFindings.length > 0) {
        sections.push(createParagraph(`${paymentFindings.length} finding(s) relate to payment security. All payment-related findings are documented in the Detailed Findings section.`));
      } else {
        sections.push(createParagraph('No payment-specific vulnerabilities were identified during this assessment.'));
      }
    } else {
      sections.push(createParagraph('Payment security assessment pending. The following checklist should be completed during the assessment.', { italic: true }));
    }

    sections.push(createHeading('PCI-DSS Scope Validation', 2));
    sections.push(createParagraph(`Payment provider: ${paymentProvider}. The application should operate under SAQ-A scope, meaning no cardholder data is stored, processed, or transmitted by the application.`));
    sections.push(createTable(
      ['Validation Check', 'Expected', 'Result', 'Status'],
      [
        ['Card input handled by provider SDK', `${paymentProvider} Elements/Checkout`, '[Result]', 'Pending'],
        ['No raw card data in application logs', 'No PAN, CVV, or expiry logged', '[Result]', 'Pending'],
        ['No card data in database', 'Only tokenised references stored', '[Result]', 'Pending'],
        ['Provider SDK loaded with SRI', 'Subresource Integrity hash present', '[Result]', 'Pending'],
        ['Webhook signature verification', `${paymentProvider} signatures validated`, '[Result]', 'Pending'],
        ['Payment admin access restricted', 'MFA required for payment config', '[Result]', 'Pending'],
        ['Refund controls', 'Authorisation required, audit logged', '[Result]', 'Pending'],
      ]
    ));
  }

  // --- 8. Dependency Audit ---
  sections.push(createHeading('Dependency Security Summary', 1));

  if (findings && findings.length > 0) {
    const depFindings = findings.filter(f => /depend|package|library|npm|supply.chain|vulnerable.component/i.test(f.category || '') || /depend|package|library|npm/i.test(f.title || ''));
    if (depFindings.length > 0) {
      sections.push(createParagraph(`${depFindings.length} finding(s) relate to dependencies and supply chain security. Details are in the Detailed Findings section.`));
    } else {
      sections.push(createParagraph('No dependency-specific vulnerabilities were identified by the automated scan. Manual review of the dependency tree is recommended.'));
    }
  } else {
    sections.push(createParagraph('Dependency audit results pending. Run dependency scanning tools and record results below.', { italic: true }));
  }

  sections.push(createHeading('Dependency Management Recommendations', 2));
  sections.push(...createBulletList([
    'Run npm audit (or equivalent) as part of every CI pipeline',
    'Enable automated dependency update PRs via Dependabot or Renovate',
    'Enforce lockfile usage to prevent phantom dependency changes',
    'Review new dependencies before adoption: maintenance status, security history, licence',
    'Remove unused dependencies identified during the audit',
    'Document accepted vulnerabilities with justification if a fix is unavailable',
  ]));

  sections.push(createHeading('Update Policy', 2));
  sections.push(createTable(
    ['Severity', 'SLA', 'Action Required'],
    [
      ['Critical (CVSS 9.0+)', 'Within 24 hours', 'Emergency patch and hotfix deployment'],
      ['High (CVSS 7.0-8.9)', 'Within 7 days', 'Prioritised fix in current sprint'],
      ['Medium (CVSS 4.0-6.9)', 'Within 30 days', 'Scheduled in next maintenance window'],
      ['Low (CVSS 0.1-3.9)', 'Within 90 days', 'Bundled with routine updates'],
    ]
  ));

  // --- 9. Infrastructure Audit ---
  sections.push(createHeading('Infrastructure Security Summary', 1));

  if (findings && findings.length > 0) {
    const infraFindings = findings.filter(f => /infra|header|ssl|tls|dns|server|config/i.test(f.category || ''));
    if (infraFindings.length > 0) {
      sections.push(createParagraph(`${infraFindings.length} finding(s) relate to infrastructure and server configuration. Details are in the Detailed Findings section.`));
    } else {
      sections.push(createParagraph('No infrastructure-specific vulnerabilities were identified. The following areas were reviewed.'));
    }
  } else {
    sections.push(createParagraph('Infrastructure audit results pending.', { italic: true }));
  }

  sections.push(createHeading('Security Headers', 2));
  sections.push(createParagraph('The following security headers should be present on all HTTP responses:'));
  sections.push(createTable(
    ['Header', 'Required Value', 'Present', 'Correct'],
    [
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains', '[Y/N]', '[Y/N]'],
      ['X-Content-Type-Options', 'nosniff', '[Y/N]', '[Y/N]'],
      ['X-Frame-Options', 'DENY', '[Y/N]', '[Y/N]'],
      ['Content-Security-Policy', 'Strict policy (see spec)', '[Y/N]', '[Y/N]'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin', '[Y/N]', '[Y/N]'],
      ['Permissions-Policy', 'Restrictive policy', '[Y/N]', '[Y/N]'],
      ['Cache-Control', 'no-store for auth responses', '[Y/N]', '[Y/N]'],
    ]
  ));

  sections.push(createHeading('SSL/TLS Configuration', 2));
  sections.push(createTable(
    ['Check', 'Requirement', 'Result'],
    [
      ['Minimum TLS version', 'TLS 1.2 (1.3 preferred)', '[Result]'],
      ['Weak cipher suites', 'None (only forward-secrecy suites)', '[Result]'],
      ['Certificate validity', 'Valid, not expired', '[Result]'],
      ['Certificate chain', 'Complete chain served', '[Result]'],
      ['OCSP stapling', 'Enabled', '[Result]'],
      ['SSL Labs grade', 'A or A+', '[Result]'],
    ]
  ));

  sections.push(createHeading('DNS Security', 2));
  sections.push(createTable(
    ['Check', 'Requirement', 'Result'],
    [
      ['CAA records', 'Restrict to approved CAs', '[Result]'],
      ['DNSSEC', 'Enabled if registrar supports', '[Result]'],
      ['SPF record', 'Configured for email domain', '[Result]'],
      ['DKIM', 'Configured for email sending', '[Result]'],
      ['DMARC', 'p=reject or p=quarantine', '[Result]'],
    ]
  ));

  // --- 10. Recommendations ---
  sections.push(createHeading('Recommendations', 1));

  sections.push(createHeading('Prioritised Remediation Plan', 2));
  sections.push(createParagraph('Findings should be remediated in the following order of priority. Critical and high-severity items must be addressed before production deployment or as emergency fixes if already live.'));

  if (findings && findings.length > 0) {
    const openFindings = findings.filter(f => (f.status || 'open').toLowerCase() !== 'resolved');
    if (openFindings.length > 0) {
      const sorted = [...openFindings].sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

      // Phase 1: Critical
      const critical = sorted.filter(f => normaliseSeverity(f.severity) === 'Critical');
      if (critical.length > 0) {
        sections.push(createHeading('Phase 1: Immediate (Critical)', 3));
        sections.push(createParagraph('These issues must be fixed immediately. They represent active or easily exploitable vulnerabilities.'));
        sections.push(...createBulletList(critical.map(f => `${f.title} -- ${f.remediation || 'See detailed findings'}`)));
      }

      // Phase 2: High
      const high = sorted.filter(f => normaliseSeverity(f.severity) === 'High');
      if (high.length > 0) {
        sections.push(createHeading('Phase 2: Urgent (High)', 3));
        sections.push(createParagraph('Address within the current sprint or development cycle.'));
        sections.push(...createBulletList(high.map(f => `${f.title} -- ${f.remediation || 'See detailed findings'}`)));
      }

      // Phase 3: Medium
      const medium = sorted.filter(f => normaliseSeverity(f.severity) === 'Medium');
      if (medium.length > 0) {
        sections.push(createHeading('Phase 3: Scheduled (Medium)', 3));
        sections.push(createParagraph('Plan remediation within the next 30 days.'));
        sections.push(...createBulletList(medium.map(f => `${f.title} -- ${f.remediation || 'See detailed findings'}`)));
      }

      // Phase 4: Low + Informational
      const lowInfo = sorted.filter(f => ['Low', 'Informational'].includes(normaliseSeverity(f.severity)));
      if (lowInfo.length > 0) {
        sections.push(createHeading('Phase 4: Maintenance (Low / Informational)', 3));
        sections.push(createParagraph('Address during regular maintenance windows.'));
        sections.push(...createBulletList(lowInfo.map(f => `${f.title} -- ${f.remediation || 'See detailed findings'}`)));
      }
    } else {
      sections.push(createParagraph('All findings have been resolved. No open remediation items remain.'));
    }
  } else {
    sections.push(createTable(
      ['Phase', 'Priority', 'Timeline', 'Items'],
      [
        ['Phase 1', 'Critical', 'Within 24 hours', '[To be populated]'],
        ['Phase 2', 'High', 'Within 7 days', '[To be populated]'],
        ['Phase 3', 'Medium', 'Within 30 days', '[To be populated]'],
        ['Phase 4', 'Low / Informational', 'Within 90 days', '[To be populated]'],
      ]
    ));
  }

  sections.push(createHeading('Ongoing Security Practices', 2));
  sections.push(createParagraph('Beyond remediating the findings in this report, the following practices are recommended for ongoing security maintenance:'));
  sections.push(...createBulletList([
    'Schedule regular security assessments (quarterly for active applications)',
    'Run automated dependency scanning in CI/CD on every build',
    'Maintain an incident response procedure and test it annually',
    'Review and rotate API keys, secrets, and credentials on a defined schedule',
    'Monitor security advisories for all frameworks and libraries in use',
    'Conduct threat modelling when adding significant new features',
    'Keep security documentation (including this report) up to date',
    'Train development team on OWASP Top 10 and secure coding practices',
  ]));

  // --- 11. Appendix ---
  sections.push(createHeading('Appendix', 1));

  sections.push(createHeading('Tool Output References', 2));
  sections.push(createParagraph('Raw output from security scanning tools is available in the following locations for verification and audit purposes:'));

  const toolReferences = params['tool-references'] || [
    'Harden report: outputs/harden-report-[date].md',
    'npm audit output: [CI pipeline artifact or local output]',
    'SSL Labs report: https://www.ssllabs.com/ssltest/analyze.html?d=[domain]',
    'Security headers report: https://securityheaders.com/?q=[domain]',
    'Dependency scan results: [Snyk/Dependabot dashboard URL]',
  ];
  sections.push(...createBulletList(toolReferences));

  sections.push(createHeading('Assessment Limitations', 2));
  sections.push(createParagraph('This assessment was conducted within the defined scope and timeframe. The following limitations apply:'));
  sections.push(...createBulletList([
    'Assessment is point-in-time and reflects the application state on the assessment date',
    'Findings are limited to the scope areas defined in the Methodology section',
    'Automated scanning may produce false positives that require manual verification',
    'Zero-day vulnerabilities and undisclosed threats are not covered',
    'Social engineering and physical security were not in scope',
    'Performance under sustained attack (DDoS resilience) was not tested',
  ]));

  sections.push(createHeading('Glossary', 2));
  sections.push(createTable(
    ['Term', 'Definition'],
    [
      ['CVSS', 'Common Vulnerability Scoring System -- industry standard for rating vulnerability severity'],
      ['CORS', 'Cross-Origin Resource Sharing -- browser security mechanism for cross-domain requests'],
      ['CSP', 'Content Security Policy -- HTTP header that prevents XSS and injection attacks'],
      ['HSTS', 'HTTP Strict Transport Security -- forces browsers to use HTTPS'],
      ['MFA', 'Multi-Factor Authentication -- requires two or more verification methods'],
      ['OWASP', 'Open Web Application Security Project -- community-driven security standards'],
      ['PCI-DSS', 'Payment Card Industry Data Security Standard'],
      ['PII', 'Personally Identifiable Information'],
      ['RBAC', 'Role-Based Access Control -- permissions assigned through roles'],
      ['SRI', 'Subresource Integrity -- verification of third-party resources'],
      ['TLS', 'Transport Layer Security -- cryptographic protocol for secure communication'],
      ['XSS', 'Cross-Site Scripting -- injection of malicious scripts into web pages'],
    ]
  ));

  sections.push(createHeading('Document Control', 2));
  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Document title', `Security Assessment Report -- ${projectName}`],
      ['Client', clientName],
      ['Assessment date', assessmentDate],
      ['Assessor', assessor],
      ['Report version', params['report-version'] || 'v1.0'],
      ['Classification', 'Confidential'],
      ['Distribution', params['distribution'] || 'Client project stakeholders and development team only'],
      ['Next assessment due', params['next-assessment'] || '[To be scheduled]'],
    ]
  ));

  return createDocument({
    title: 'Security Assessment Report',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
    version: params['report-version'] || 'v1',
  version: options.version ? `v${options.version}` : undefined,
  });
}

// --- Internal helpers ---

function normaliseSeverity(severity) {
  if (!severity) return 'Informational';
  const s = severity.toLowerCase().trim();
  if (s === 'critical') return 'Critical';
  if (s === 'high') return 'High';
  if (s === 'medium' || s === 'moderate') return 'Medium';
  if (s === 'low') return 'Low';
  return 'Informational';
}

function severityOrder(severity) {
  const order = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };
  return order[normaliseSeverity(severity)] ?? 5;
}

function countByStatus(findings, severity, status) {
  return findings.filter(f => {
    const fSev = normaliseSeverity(f.severity);
    const fStatus = (f.status || 'open').toLowerCase();
    return fSev === severity && fStatus === status;
  }).length;
}

function countAllByStatus(findings, status) {
  return findings.filter(f => (f.status || 'open').toLowerCase() === status).length;
}

function groupByCategory(findings) {
  const groups = {};
  for (const f of findings) {
    const cat = f.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(f);
  }
  return groups;
}

function getMaxSeverity(items) {
  let min = 5;
  for (const item of items) {
    const order = severityOrder(item.severity);
    if (order < min) min = order;
  }
  const map = { 0: 'Critical', 1: 'High', 2: 'Medium', 3: 'Low', 4: 'Informational' };
  return map[min] || 'Informational';
}

function determinePosture(counts) {
  if (counts.Critical > 0) return 'CRITICAL -- Immediate remediation required';
  if (counts.High > 2) return 'POOR -- Significant issues require urgent attention';
  if (counts.High > 0) return 'FAIR -- High-severity issues need prompt resolution';
  if (counts.Medium > 5) return 'MODERATE -- Multiple medium-severity issues to address';
  if (counts.Medium > 0) return 'GOOD -- Minor improvements recommended';
  return 'STRONG -- No significant vulnerabilities identified';
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
