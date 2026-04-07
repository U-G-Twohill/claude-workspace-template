// Security Specification document template
// Generates a comprehensive security spec from docs-state parameters and module flags

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
  const riskLevel = params['risk-assessment-level'] || 'Standard';
  const complianceReqs = params['compliance-requirements'] || [];
  const threatModel = params['threat-model'] || 'Web application threat model — STRIDE methodology applied to all system boundaries';
  const company = getCompanyInfo(brandConfig || {});

  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxAuthDeps = listDependencies(docsState, 'auth');
  const ctxEnvVars = ctx.envVars || [];
  const ctxFramework = ctx.framework || '';
  const ctxSecrets = ctxEnvVars.filter(v => {
    const name = (v.name || v || '').toString().toLowerCase();
    return name.includes('secret') || name.includes('key') || name.includes('token') || name.includes('password');
  });

  const sections = [];

  // --- 1. Security Overview ---
  sections.push(createHeading('Security Overview', 1));
  sections.push(createParagraph(`This document defines the security specification for ${projectName}, developed for ${clientName}. It establishes the security controls, policies, and procedures required to protect the application, its data, and its users throughout the project lifecycle and into production operation.`));

  sections.push(createHeading('Threat Model', 2));
  sections.push(createParagraph(threatModel));
  sections.push(createParagraph('The threat model considers the following actor categories:'));
  sections.push(...createBulletList([
    'External attackers — unauthenticated users attempting to exploit public-facing surfaces',
    'Authenticated malicious users — users attempting privilege escalation or data exfiltration',
    'Insider threats — compromised credentials or malicious insiders with system access',
    'Automated threats — bots, scrapers, credential stuffing, and denial-of-service attacks',
    'Supply chain threats — compromised dependencies, malicious packages, or vulnerable libraries',
  ]));

  sections.push(createHeading('Risk Assessment Level', 2));
  sections.push(createParagraph(`Risk assessment classification: ${riskLevel}. This classification determines the depth and rigour of security controls applied throughout the system.`));
  sections.push(createTable(
    ['Level', 'Description', 'Controls Applied'],
    [
      ['Minimal', 'Low-risk informational site, no user data', 'HTTPS, security headers, dependency scanning'],
      ['Standard', 'User accounts, form submissions, moderate data', 'All minimal controls + auth hardening, input validation, logging'],
      ['Enhanced', 'Sensitive data, financial transactions, PII', 'All standard controls + encryption at rest, MFA, audit logging, penetration testing'],
      ['Critical', 'Healthcare, financial services, government data', 'All enhanced controls + WAF, SIEM, incident response team, compliance certification'],
    ]
  ));

  sections.push(createHeading('Compliance Requirements', 2));
  if (Array.isArray(complianceReqs) && complianceReqs.length) {
    sections.push(createParagraph('The following compliance frameworks apply to this project:'));
    sections.push(...createBulletList(complianceReqs));
  } else {
    sections.push(createParagraph('Applicable compliance frameworks are identified in the Compliance Mapping section of this document. At minimum, the NZ Privacy Act 2020 applies to all projects handling personal information of New Zealand residents.'));
  }

  // --- 2. Authentication (conditional) ---
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication', 1));

    sections.push(createHeading('Authentication Method', 2));
    const authMethod = params['auth-method'] || 'Email/password with optional social login (OAuth 2.0)';
    // Enrich auth provider from harvested dependencies
    const authProvider = ctxAuthDeps.length
      ? ctxAuthDeps.join(', ')
      : (params['auth-provider'] || '[To be confirmed]');
    sections.push(createParagraph(`Authentication is handled by ${authProvider}. Method: ${authMethod}. The implementation follows OWASP Authentication Cheat Sheet guidelines.`));

    // List discovered auth-related packages
    if (ctxAuthDeps.length) {
      sections.push(createParagraph('Detected authentication packages:'));
      sections.push(...createBulletList(ctxAuthDeps));
    }

    sections.push(createHeading('Password Policy', 2));
    const passwordPolicy = params['password-policy'] || {};
    const minLength = passwordPolicy.minLength || 12;
    const requireComplexity = passwordPolicy.requireComplexity !== false;
    sections.push(createParagraph('The following password policy is enforced for all user accounts:'));
    sections.push(...createBulletList([
      `Minimum length: ${minLength} characters`,
      requireComplexity ? 'Complexity: at least one uppercase letter, one lowercase letter, one digit, and one special character' : 'No specific complexity requirements beyond minimum length',
      'Passwords are checked against the Have I Been Pwned breached password list via k-anonymity API',
      'Password history: last 5 passwords cannot be reused',
      'Account lockout: 5 failed attempts triggers a 15-minute lockout with exponential backoff',
      'Password hashing: bcrypt with minimum cost factor of 12 (or Argon2id where supported)',
      'Password change requires current password verification',
    ]));

    sections.push(createHeading('Multi-Factor Authentication', 2));
    const mfaStrategy = params['mfa-strategy'] || 'TOTP-based MFA (e.g. Google Authenticator) available for all users, mandatory for admin roles';
    sections.push(createParagraph(mfaStrategy));
    sections.push(...createBulletList([
      'MFA is enforced during login and sensitive operations (password change, payment updates, role changes)',
      'Recovery codes are generated at MFA enrolment — 10 single-use codes, stored as hashed values',
      'MFA bypass requires identity verification through a secondary channel (email or SMS)',
      'MFA enrolment status is logged as a security event',
      'Admin users cannot disable their own MFA without another admin approving the change',
    ]));

    sections.push(createHeading('Session Management', 2));
    const sessionStrategy = params['session-strategy'] || 'JWT with short-lived access tokens and long-lived refresh tokens';
    const tokenExpiry = params['token-expiry'] || '15 minutes (access), 7 days (refresh)';
    sections.push(createParagraph(`Session strategy: ${sessionStrategy}. Token expiry: ${tokenExpiry}.`));
    sections.push(...createBulletList([
      'Access tokens are short-lived and stateless — validated via signature verification',
      'Refresh tokens are stored server-side and revocable — single use with rotation on each refresh',
      'Sessions are invalidated on password change, MFA change, or explicit logout',
      'Concurrent session limits are enforced per user role (default: 5 active sessions)',
      'Session tokens are bound to user-agent and IP range to detect stolen tokens',
      'Idle timeout: sessions expire after 30 minutes of inactivity (configurable per role)',
      'Absolute timeout: sessions expire after 24 hours regardless of activity',
    ]));
  }

  // --- 3. Authorization ---
  sections.push(createHeading('Authorisation', 1));

  sections.push(createHeading('RBAC Model', 2));
  sections.push(createParagraph(`${projectName} uses Role-Based Access Control (RBAC) to manage user permissions. Roles are assigned at the user level and enforced at the API layer via middleware. The principle of least privilege is applied — users receive the minimum permissions required for their function.`));
  sections.push(...createBulletList([
    'Roles are defined in the database and loaded into the user session at authentication time',
    'Permission checks are performed on every API request via authorisation middleware',
    'Role changes take effect on the next token refresh (not immediately for active sessions)',
    'Custom roles can be created by combining permissions from a predefined permission set',
    'Role assignment and changes are logged as security events with the acting user recorded',
  ]));

  sections.push(createHeading('Permission Matrix', 2));
  const roles = params['user-roles'] || [
    { role: 'Super Admin', create: 'All', read: 'All', update: 'All', delete: 'All', admin: 'Yes' },
    { role: 'Admin', create: 'All', read: 'All', update: 'All', delete: 'Own scope', admin: 'Limited' },
    { role: 'Manager', create: 'Own scope', read: 'All', update: 'Own scope', delete: 'No', admin: 'No' },
    { role: 'User', create: 'Own', read: 'Own + shared', update: 'Own', delete: 'No', admin: 'No' },
    { role: 'Viewer', create: 'No', read: 'Permitted only', update: 'No', delete: 'No', admin: 'No' },
  ];
  const roleRows = Array.isArray(roles) ? roles.map(r => {
    if (typeof r === 'object' && r.role) {
      return [r.role, r.create || '-', r.read || '-', r.update || '-', r.delete || '-', r.admin || '-'];
    }
    return [String(r), '-', '-', '-', '-', '-'];
  }) : [];
  if (roleRows.length) {
    sections.push(createTable(['Role', 'Create', 'Read', 'Update', 'Delete', 'Admin'], roleRows));
  }

  sections.push(createHeading('Resource-Level Access', 2));
  sections.push(createParagraph('Beyond role-based permissions, resource-level access controls are applied:'));
  sections.push(...createBulletList([
    'Object ownership — users can only modify resources they own unless granted broader permissions',
    'Team/organisation scoping — resources are scoped to the user\'s team or organisation',
    'Field-level access — sensitive fields (e.g. salary, SSN) are restricted to specific roles',
    'Temporal access — some permissions can be granted with an expiry date (e.g. temporary project access)',
    'API key scoping — API keys are scoped to specific resources and operations',
  ]));

  // --- 4. Data Protection ---
  sections.push(createHeading('Data Protection', 1));

  sections.push(createHeading('Encryption at Rest', 2));
  sections.push(createParagraph('Sensitive data is encrypted at rest using industry-standard algorithms:'));
  sections.push(...createBulletList([
    'Database-level encryption: AES-256-GCM for sensitive columns (PII, tokens, secrets)',
    'File storage encryption: server-side encryption enabled on all storage buckets (AES-256)',
    'Backup encryption: all database backups are encrypted with a separate key from the application',
    'Key management: encryption keys are stored in a dedicated secrets manager, never in application code',
    'Key rotation: encryption keys are rotated on a defined schedule (minimum annually)',
  ]));

  sections.push(createHeading('Encryption in Transit', 2));
  sections.push(createParagraph('All data in transit is protected using TLS:'));
  sections.push(...createBulletList([
    'TLS 1.2 minimum enforced on all connections (TLS 1.3 preferred where supported)',
    'HTTPS enforced via HSTS header with a minimum max-age of 1 year and includeSubDomains',
    'HTTP requests are redirected to HTTPS with a 301 permanent redirect',
    'Internal service-to-service communication uses TLS (no plaintext internal traffic)',
    'Certificate management: automated renewal via Let\'s Encrypt or managed certificates',
    'Weak cipher suites are disabled — only forward-secrecy-capable suites are permitted',
  ]));

  sections.push(createHeading('PII Handling', 2));
  sections.push(createParagraph('Personally Identifiable Information (PII) is subject to additional controls:'));
  sections.push(...createBulletList([
    'PII fields are identified and tagged in the data model during design',
    'Access to PII is logged and auditable — all reads and writes to PII fields generate audit events',
    'PII is excluded from application logs, error messages, and stack traces',
    'Data minimisation — only PII required for the stated purpose is collected',
    'Retention limits — PII is deleted or anonymised when no longer required (per retention schedule)',
    'Data subject requests (access, correction, deletion) are supported via admin tooling',
    'PII is never stored in browser localStorage or sessionStorage — cookies with Secure and HttpOnly flags only',
  ]));

  // Show discovered secrets/sensitive env vars if available
  if (ctxSecrets.length) {
    sections.push(createHeading('Identified Secrets', 2));
    sections.push(createParagraph('The following environment variables have been identified as containing sensitive values. These must be managed according to the secrets management policy:'));
    const secretNames = ctxSecrets.map(v => typeof v === 'object' ? v.name : String(v));
    sections.push(...createBulletList(secretNames));
  }

  sections.push(createHeading('Data Classification', 2));
  sections.push(createParagraph('All data is classified into the following categories, each with specific handling requirements:'));
  sections.push(createTable(
    ['Classification', 'Description', 'Encryption', 'Access Control', 'Retention'],
    [
      ['Public', 'Marketing content, published pages', 'In transit only', 'Open', 'Indefinite'],
      ['Internal', 'Business logic, non-sensitive config', 'In transit only', 'Authenticated users', 'Project lifetime'],
      ['Confidential', 'User data, email addresses, usage data', 'At rest + in transit', 'Role-based', 'Per privacy policy'],
      ['Restricted', 'Passwords, API keys, payment tokens, PII', 'At rest + in transit (AES-256)', 'Strict role-based + audit', 'Minimum required'],
      ['Regulated', 'Health data, financial records (if applicable)', 'At rest + in transit (AES-256)', 'Named individuals only + audit', 'Per regulatory requirement'],
    ]
  ));

  // Framework-specific security considerations
  if (ctxFramework) {
    sections.push(createHeading('Framework Security', 2));
    sections.push(createParagraph(`${projectName} uses ${ctxFramework}. Framework-specific security considerations:`));
    const frameworkNotes = [`Follow ${ctxFramework} security best practices and update advisories`];
    const fwLower = ctxFramework.toLowerCase();
    if (fwLower.includes('next')) frameworkNotes.push('Use Next.js middleware for auth checks, configure CSP via next.config.js headers');
    if (fwLower.includes('express')) frameworkNotes.push('Use helmet for security headers, configure CORS middleware, validate all req.body/params');
    if (fwLower.includes('fastapi')) frameworkNotes.push('Use FastAPI dependency injection for auth, Pydantic models for input validation');
    if (fwLower.includes('django')) frameworkNotes.push('Enable Django CSRF protection, use Django ORM to prevent SQL injection, configure SECURE_* settings');
    if (fwLower.includes('astro')) frameworkNotes.push('Sanitise dynamic content in Astro components, configure CSP headers at the hosting layer');
    sections.push(...createBulletList(frameworkNotes));
  }

  // --- 5. Input Validation ---
  sections.push(createHeading('Input Validation', 1));

  sections.push(createHeading('Sanitisation Rules', 2));
  sections.push(createParagraph('All user input is validated and sanitised at the API boundary before processing. The application follows a whitelist (allow-list) approach — only expected input formats are accepted.'));
  sections.push(...createBulletList([
    'All input is validated against a schema (JSON Schema, Zod, or equivalent) before reaching business logic',
    'String inputs are trimmed, length-limited, and checked for expected character patterns',
    'HTML input is sanitised using a strict allowlist of tags and attributes (DOMPurify or equivalent)',
    'File uploads are validated by MIME type, file extension, file size, and content inspection (magic bytes)',
    'Numeric inputs are range-checked and type-coerced at the boundary',
    'URL inputs are validated against an allowlist of schemes (https only) and checked for SSRF patterns',
    'JSON payloads have a maximum body size enforced at the server level (default: 1MB)',
    'Query parameters and path parameters are validated identically to body parameters',
  ]));

  sections.push(createHeading('OWASP Top 10 Coverage', 2));
  sections.push(createParagraph('The following table maps OWASP Top 10 (2021) vulnerabilities to specific mitigations implemented in the application:'));
  sections.push(createTable(
    ['Vulnerability', 'Mitigation', 'Status'],
    [
      ['A01: Broken Access Control', 'RBAC middleware on all routes, object-level authorisation checks, CORS restricted to known origins', 'Required'],
      ['A02: Cryptographic Failures', 'AES-256-GCM at rest, TLS 1.2+ in transit, no weak algorithms, secrets in environment variables', 'Required'],
      ['A03: Injection', 'Parameterised queries (no string concatenation), input schema validation, output encoding', 'Required'],
      ['A04: Insecure Design', 'Threat modelling during design, secure defaults, rate limiting, account lockout', 'Required'],
      ['A05: Security Misconfiguration', 'Environment-specific configs, no default credentials, security headers enforced, unnecessary features disabled', 'Required'],
      ['A06: Vulnerable Components', 'Automated dependency scanning (npm audit/Snyk), update SLA defined, lockfile enforced', 'Required'],
      ['A07: Identification & Authentication Failures', 'Strong password policy, MFA, brute force protection, session management controls', 'Required'],
      ['A08: Software & Data Integrity Failures', 'Signed JWTs, subresource integrity for CDN assets, CI/CD pipeline integrity checks', 'Required'],
      ['A09: Security Logging & Monitoring Failures', 'Structured security event logging, alerting on anomalies, log retention policy', 'Required'],
      ['A10: Server-Side Request Forgery', 'URL allowlisting for outbound requests, private IP range blocking, DNS rebinding protection', 'Required'],
    ]
  ));

  // --- 6. API Security (conditional) ---
  if (flags.needs_api) {
    sections.push(createHeading('API Security', 1));

    sections.push(createHeading('Rate Limiting', 2));
    const rateLimit = params['rate-limit'] || '100 requests per minute per authenticated user, 20 per minute for unauthenticated';
    sections.push(createParagraph(`Rate limiting policy: ${rateLimit}. Rate limits are enforced at the API gateway or reverse proxy level.`));
    sections.push(...createBulletList([
      'Rate limit headers are included in all responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
      'Exceeded rate limits return HTTP 429 with a Retry-After header',
      'Separate rate limits apply to authentication endpoints (stricter) to prevent brute force',
      'Rate limits are configurable per endpoint, per role, and per API key',
      'Distributed rate limiting uses a shared store (Redis) to prevent bypass via load balancer',
    ]));

    sections.push(createHeading('CORS Policy', 2));
    const corsOrigins = params['cors-origins'] || '[Allowed origins to be configured per environment]';
    sections.push(createParagraph(`CORS (Cross-Origin Resource Sharing) is restricted to known origins: ${corsOrigins}.`));
    sections.push(...createBulletList([
      'Access-Control-Allow-Origin is set to specific origins — wildcard (*) is never used in production',
      'Access-Control-Allow-Credentials is set to true only when required for cookie-based auth',
      'Access-Control-Allow-Methods is restricted to the HTTP methods actually used by the API',
      'Access-Control-Allow-Headers includes only required custom headers',
      'Preflight responses are cached with Access-Control-Max-Age to reduce OPTIONS requests',
    ]));

    sections.push(createHeading('Content Security Policy', 2));
    sections.push(createParagraph('A strict Content Security Policy (CSP) is enforced to prevent XSS and data injection attacks:'));
    sections.push(...createBulletList([
      "default-src 'self' — only same-origin resources are loaded by default",
      "script-src 'self' — no inline scripts, no eval(), nonce-based exceptions where required",
      "style-src 'self' 'unsafe-inline' — inline styles allowed for framework compatibility (reviewed regularly)",
      'img-src \'self\' data: https: — images from same origin, data URIs, and HTTPS sources',
      "connect-src 'self' [API domains] — XHR/fetch restricted to own API and approved third-party APIs",
      "frame-ancestors 'none' — prevents clickjacking (equivalent to X-Frame-Options: DENY)",
      'upgrade-insecure-requests — automatically upgrades HTTP resource requests to HTTPS',
      'report-uri / report-to — CSP violations are reported to a monitoring endpoint',
    ]));

    sections.push(createHeading('Security Headers', 2));
    sections.push(createParagraph('The following security headers are set on all responses:'));
    sections.push(createTable(
      ['Header', 'Value', 'Purpose'],
      [
        ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload', 'Force HTTPS for 1 year'],
        ['X-Content-Type-Options', 'nosniff', 'Prevent MIME type sniffing'],
        ['X-Frame-Options', 'DENY', 'Prevent clickjacking'],
        ['X-XSS-Protection', '0', 'Disabled (CSP is the modern replacement)'],
        ['Referrer-Policy', 'strict-origin-when-cross-origin', 'Limit referrer leakage'],
        ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()', 'Restrict browser feature access'],
        ['Content-Security-Policy', '[See CSP section above]', 'Prevent XSS and injection'],
        ['Cache-Control', 'no-store (for authenticated responses)', 'Prevent caching of sensitive data'],
      ]
    ));

    sections.push(createHeading('API Authentication Headers', 2));
    const apiAuthMethod = params['api-auth-strategy'] || 'Bearer token (JWT) in Authorization header';
    sections.push(createParagraph(`API authentication: ${apiAuthMethod}. All API endpoints except explicitly public routes require authentication.`));
    sections.push(...createBulletList([
      'Authorization header: Bearer <token> format for JWT-based auth',
      'API keys (where used) are passed via X-API-Key header — never in query parameters',
      'Tokens are validated on every request — signature, expiry, issuer, and audience claims checked',
      'Invalid or expired tokens return HTTP 401 with a machine-readable error code',
      'Authentication failures are rate-limited and logged as security events',
    ]));
  }

  // --- 7. Payment Security (conditional) ---
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Security', 1));

    const paymentProvider = params['payment-provider'] || 'Stripe';

    sections.push(createHeading('PCI-DSS Compliance Checklist', 2));
    sections.push(createParagraph(`Payment processing uses ${paymentProvider}'s tokenisation — the application never handles, stores, or transmits raw cardholder data. This places the application under PCI DSS SAQ-A scope.`));
    sections.push(createTable(
      ['Requirement', 'Control', 'Status'],
      [
        ['1. Network Security', 'Firewall configured, segmented network, no direct database access from internet', 'Required'],
        ['2. Default Passwords', 'No default credentials in any environment, secrets rotated on deployment', 'Required'],
        ['3. Stored Cardholder Data', `No raw card data stored — all tokenised by ${paymentProvider}`, 'Compliant'],
        ['4. Encryption in Transit', 'TLS 1.2+ on all payment-related endpoints, HSTS enabled', 'Required'],
        ['5. Anti-Virus', 'Server hardening, no user-executable uploads on payment servers', 'Required'],
        ['6. Secure Systems', 'Regular patching, vulnerability scanning, dependency updates', 'Required'],
        ['7. Access Restriction', 'Payment admin access restricted to named individuals with MFA', 'Required'],
        ['8. Authentication', 'Unique IDs for all payment admin users, no shared accounts', 'Required'],
        ['9. Physical Access', 'Managed by hosting provider (cloud infrastructure)', 'N/A (cloud)'],
        ['10. Logging & Monitoring', 'All payment events logged with tamper-evident audit trail', 'Required'],
        ['11. Security Testing', 'Quarterly vulnerability scans, annual penetration test on payment flows', 'Required'],
        ['12. Security Policy', 'Documented security policy covering payment handling procedures', 'This document'],
      ]
    ));

    sections.push(createHeading('Tokenisation', 2));
    sections.push(createParagraph(`All payment card data is tokenised client-side by ${paymentProvider}'s SDK. The application only handles opaque tokens — never raw card numbers, CVVs, or expiry dates.`));
    sections.push(...createBulletList([
      `${paymentProvider} Elements/Checkout is used for all card input — no custom card fields`,
      'Tokens are single-use and bound to the merchant account',
      `Customer payment methods are stored as ${paymentProvider} Customer objects — only token references are stored locally`,
      'Token references in the local database are encrypted at rest',
      `${paymentProvider} SDK is loaded from their CDN with Subresource Integrity (SRI) hashes`,
    ]));

    sections.push(createHeading('Payment Audit Logging', 2));
    sections.push(createParagraph('All payment-related operations generate audit log entries:'));
    sections.push(...createBulletList([
      'Payment initiation — user, amount, currency, payment method token (last 4 digits only)',
      'Payment success/failure — transaction ID, status, decline reason (if applicable)',
      'Refund initiation — user, original transaction, refund amount, reason',
      'Subscription changes — plan change, billing cycle, effective date',
      'Webhook events — event type, processing result, idempotency key',
      'Admin actions — manual payment operations, dispute responses, configuration changes',
      'Audit logs are append-only, tamper-evident, and retained for a minimum of 7 years',
    ]));
  }

  // --- 8. Infrastructure Security ---
  sections.push(createHeading('Infrastructure Security', 1));

  sections.push(createHeading('Firewall Rules', 2));
  sections.push(createParagraph('Network access is restricted by default-deny firewall rules:'));
  sections.push(createTable(
    ['Direction', 'Port', 'Protocol', 'Source', 'Purpose'],
    [
      ['Inbound', '443', 'HTTPS', 'Any (via CDN/LB)', 'Application traffic'],
      ['Inbound', '80', 'HTTP', 'Any', 'Redirect to HTTPS only'],
      ['Inbound', '22', 'SSH', 'Allowed IP list only', 'Server administration'],
      ['Outbound', '443', 'HTTPS', 'Application servers', 'API calls to third-party services'],
      ['Outbound', '587/465', 'SMTP/SMTPS', 'Application servers', 'Email delivery (if applicable)'],
      ['Internal', '5432/3306', 'PostgreSQL/MySQL', 'Application servers only', 'Database access'],
      ['Internal', '6379', 'Redis', 'Application servers only', 'Cache and session store'],
    ]
  ));
  sections.push(createParagraph('All other ports and protocols are blocked by default. Firewall rules are version-controlled and require review before changes are applied.'));

  sections.push(createHeading('Network Segmentation', 2));
  sections.push(createParagraph('The infrastructure is segmented into isolated network zones:'));
  sections.push(...createBulletList([
    'Public zone — load balancer and CDN edge (internet-facing)',
    'Application zone — application servers (accessible from public zone only via load balancer)',
    'Data zone — database and cache servers (accessible from application zone only)',
    'Management zone — CI/CD, monitoring, and administration tools (VPN access only)',
    'Each zone has its own security group/firewall rules with minimal cross-zone permissions',
  ]));

  sections.push(createHeading('SSH Access', 2));
  sections.push(createParagraph('SSH access to production servers is tightly controlled:'));
  sections.push(...createBulletList([
    'SSH key-based authentication only — password authentication is disabled',
    'SSH access restricted to a named allowlist of IP addresses or VPN',
    'Root login via SSH is disabled — administrators use named accounts with sudo',
    'SSH sessions are logged with command history captured',
    'SSH keys are rotated on a defined schedule (minimum quarterly)',
    'Emergency access procedures are documented for scenarios where normal SSH is unavailable',
  ]));

  // --- 9. Dependency Security ---
  sections.push(createHeading('Dependency Security', 1));

  const scanningTool = params['vulnerability-scanning-tool'] || 'npm audit + Snyk (or GitHub Dependabot)';
  const updatePolicy = params['dependency-update-policy'] || 'Critical within 24 hours, high within 7 days, medium within 30 days';

  sections.push(createHeading('Vulnerability Scanning', 2));
  sections.push(createParagraph(`Dependencies are continuously monitored for known vulnerabilities using: ${scanningTool}.`));
  sections.push(...createBulletList([
    'Automated scanning runs on every CI pipeline execution',
    'Dependency lock files (package-lock.json, yarn.lock) are committed and enforced',
    'Pull requests that introduce new vulnerable dependencies are blocked by CI',
    'A weekly scheduled scan runs independently of code changes to catch newly disclosed vulnerabilities',
    'Scan results are surfaced in the development workflow (GitHub PR checks, Slack notifications)',
  ]));

  sections.push(createHeading('Update Policy', 2));
  sections.push(createParagraph(`Dependency update SLA: ${updatePolicy}.`));
  sections.push(createTable(
    ['Severity', 'Response Time', 'Action'],
    [
      ['Critical (CVSS 9.0+)', 'Within 24 hours', 'Patch immediately, deploy hotfix, notify stakeholders'],
      ['High (CVSS 7.0-8.9)', 'Within 7 days', 'Schedule patch in next sprint, test in staging first'],
      ['Medium (CVSS 4.0-6.9)', 'Within 30 days', 'Include in next regular update cycle'],
      ['Low (CVSS 0.1-3.9)', 'Within 90 days', 'Bundle with routine maintenance updates'],
      ['Informational', 'Best effort', 'Review and address during regular dependency updates'],
    ]
  ));

  sections.push(createHeading('Dependency Governance', 2));
  sections.push(createParagraph('New dependencies are subject to review before adoption:'));
  sections.push(...createBulletList([
    'Maintenance status — package must have active maintainers and recent releases',
    'Security history — packages with a pattern of critical vulnerabilities are avoided',
    'License compatibility — only permissive open-source licences (MIT, Apache 2.0, BSD) are accepted without review',
    'Size and scope — prefer small, focused packages over large multi-purpose libraries',
    'Alternatives — trivial functionality is implemented directly rather than adding a dependency',
  ]));

  // --- 10. Logging & Monitoring ---
  sections.push(createHeading('Logging & Monitoring', 1));

  sections.push(createHeading('Security Events Logged', 2));
  sections.push(createParagraph('The following security-relevant events generate structured log entries:'));
  sections.push(createTable(
    ['Event Category', 'Events', 'Log Level'],
    [
      ['Authentication', 'Login success/failure, logout, password change, MFA enrolment/use', 'info/warn'],
      ['Authorisation', 'Permission denied, role change, privilege escalation attempt', 'warn'],
      ['Data Access', 'PII access, bulk data export, admin data queries', 'info'],
      ['Account Management', 'User creation, deletion, role assignment, account lockout', 'info'],
      ['API Security', 'Rate limit exceeded, invalid token, CORS violation, malformed request', 'warn'],
      ['Infrastructure', 'SSH login, firewall rule change, deployment, config change', 'info'],
      ['Payment', 'Transaction initiated, completed, failed, refunded (if applicable)', 'info'],
      ['Anomaly', 'Unusual access patterns, impossible travel, credential stuffing detection', 'warn/error'],
    ]
  ));

  sections.push(createHeading('Log Format', 2));
  sections.push(createParagraph('All security logs use structured JSON format with the following fields:'));
  sections.push(...createBulletList([
    'timestamp — ISO 8601 format with timezone (UTC)',
    'level — error, warn, info, debug',
    'event — machine-readable event type (e.g. auth.login.failed)',
    'actor — user ID or system identifier that initiated the action',
    'resource — the resource or endpoint affected',
    'outcome — success or failure',
    'ip — source IP address (for user-initiated events)',
    'userAgent — browser/client identifier (for HTTP requests)',
    'requestId — correlation ID for tracing across services',
    'details — additional context (never includes PII, passwords, or tokens)',
  ]));

  sections.push(createHeading('Alerting Rules', 2));
  sections.push(createParagraph('Automated alerts are configured for the following conditions:'));
  sections.push(...createBulletList([
    'Critical: 5+ failed login attempts from the same IP in 5 minutes — immediate notification',
    'Critical: Successful login from a previously unseen country — immediate notification',
    'High: Rate limit exceeded 10+ times from the same source in 1 minute — Slack + email alert',
    'High: Any privilege escalation attempt (authorised or denied) — Slack notification',
    'High: Dependency vulnerability with CVSS 9.0+ discovered — immediate notification',
    'Medium: Unusual data access pattern (bulk export, off-hours admin access) — daily digest',
    'Medium: SSL certificate expiry within 14 days — daily notification until resolved',
    'Low: Failed webhook signature verification — logged, reviewed weekly',
  ]));

  sections.push(createHeading('SIEM Integration', 2));
  const siemPlatform = params['siem-platform'] || '[SIEM platform to be confirmed — e.g. Datadog, Elastic SIEM, AWS CloudWatch]';
  sections.push(createParagraph(`Security logs are forwarded to: ${siemPlatform}. The SIEM provides centralised log aggregation, correlation, and alerting across all system components.`));
  sections.push(...createBulletList([
    'Logs are forwarded in real-time via structured log shipping (not batch)',
    'Log retention: minimum 12 months online, 7 years archived (or per compliance requirements)',
    'Correlation rules detect multi-stage attacks across log sources',
    'Dashboards provide real-time visibility into security event trends',
    'Regular review of SIEM rules and thresholds (minimum quarterly)',
  ]));

  // --- 11. Incident Response ---
  sections.push(createHeading('Incident Response', 1));

  sections.push(createHeading('Incident Response Procedure', 2));
  sections.push(createParagraph('The following procedure is followed for all security incidents:'));
  const irSteps = [
    'Detection — incident identified via monitoring alert, user report, or security scan',
    'Triage — severity classified (Critical, High, Medium, Low) and incident lead assigned',
    'Containment — immediate steps to limit damage (isolate affected systems, revoke compromised credentials, block malicious IPs)',
    'Investigation — determine root cause, scope of impact, and affected data/users',
    'Eradication — remove the threat (patch vulnerability, remove malware, close attack vector)',
    'Recovery — restore affected systems to normal operation, verify integrity',
    'Notification — notify affected users and relevant authorities per legal requirements (NZ Privacy Act: notify within 72 hours if notifiable breach)',
    'Post-mortem — document timeline, root cause, impact, and corrective actions within 5 business days',
    'Remediation — implement corrective actions from post-mortem, update security controls',
  ];
  sections.push(...createBulletList(irSteps));

  sections.push(createHeading('Escalation Contacts', 2));
  sections.push(createParagraph('Incidents are escalated based on severity:'));
  sections.push(createTable(
    ['Severity', 'Response Time', 'Escalation Contact', 'Communication Channel'],
    [
      ['Critical', 'Within 15 minutes', 'Project lead + client security contact', 'Phone + email'],
      ['High', 'Within 1 hour', 'Project lead', 'Slack + email'],
      ['Medium', 'Within 4 hours', 'Development team', 'Slack'],
      ['Low', 'Within 24 hours', 'Development team', 'Ticket/issue tracker'],
    ]
  ));

  sections.push(createHeading('Post-Mortem Template', 2));
  sections.push(createParagraph('All Critical and High severity incidents require a written post-mortem covering:'));
  sections.push(...createBulletList([
    'Incident summary — one-paragraph description of what happened',
    'Timeline — chronological sequence of events from detection to resolution',
    'Root cause — the underlying cause (not just the symptom)',
    'Impact — users affected, data exposed, downtime duration, financial impact',
    'Detection — how the incident was detected, time to detection',
    'Response — actions taken, time to containment, time to resolution',
    'What went well — effective controls and response actions',
    'What could be improved — gaps in detection, response, or communication',
    'Action items — specific remediation tasks with owners and deadlines',
    'Lessons learned — changes to prevent recurrence (process, tooling, architecture)',
  ]));

  // --- 12. Compliance Mapping ---
  sections.push(createHeading('Compliance Mapping', 1));
  sections.push(createParagraph('The following compliance frameworks are addressed by the security controls defined in this specification.'));

  // GDPR (conditional)
  const hasGdpr = flags.needs_gdpr || (Array.isArray(complianceReqs) && complianceReqs.some(r => /gdpr/i.test(r)));
  if (hasGdpr) {
    sections.push(createHeading('GDPR (General Data Protection Regulation)', 2));
    sections.push(createParagraph('Applicable if the application processes personal data of EU/EEA residents.'));
    sections.push(createTable(
      ['GDPR Article', 'Requirement', 'Implementation'],
      [
        ['Art. 5', 'Data processing principles', 'Data minimisation, purpose limitation, accuracy controls'],
        ['Art. 6', 'Lawful basis for processing', 'Consent management, legitimate interest documentation'],
        ['Art. 12-14', 'Transparency and information', 'Privacy policy, cookie consent, data collection notices'],
        ['Art. 15-20', 'Data subject rights', 'Data export, correction, deletion, portability endpoints'],
        ['Art. 25', 'Data protection by design', 'Privacy impact assessment, encryption, pseudonymisation'],
        ['Art. 28', 'Processor obligations', 'Data Processing Agreement with all sub-processors'],
        ['Art. 32', 'Security of processing', 'Encryption, access controls, incident response, testing'],
        ['Art. 33-34', 'Breach notification', 'Incident response procedure, 72-hour notification to supervisory authority'],
        ['Art. 35', 'Data protection impact assessment', 'DPIA conducted for high-risk processing activities'],
      ]
    ));
  }

  // NZ Privacy Act 2020 (always included)
  sections.push(createHeading('NZ Privacy Act 2020', 2));
  sections.push(createParagraph('The New Zealand Privacy Act 2020 applies to all projects handling personal information of New Zealand residents.'));
  sections.push(createTable(
    ['Principle', 'Requirement', 'Implementation'],
    [
      ['IPP 1', 'Purpose of collection', 'Clear purpose statements at all data collection points'],
      ['IPP 2', 'Source of information', 'Data collected directly from the individual where practicable'],
      ['IPP 3', 'Collection from subject', 'Collection notices provided, consent obtained where required'],
      ['IPP 4', 'Manner of collection', 'Lawful, fair collection — no deceptive practices'],
      ['IPP 5', 'Storage and security', 'Encryption, access controls, breach notification procedures'],
      ['IPP 6', 'Access to information', 'Data subject access request mechanism implemented'],
      ['IPP 7', 'Correction of information', 'Data correction mechanism implemented'],
      ['IPP 8', 'Accuracy', 'Data validation at input, periodic accuracy reviews'],
      ['IPP 9', 'Retention', 'Data retention schedule defined, automated deletion where possible'],
      ['IPP 10', 'Use limitation', 'Data used only for stated purposes'],
      ['IPP 11', 'Disclosure limitation', 'No unauthorised disclosure, third-party agreements in place'],
      ['IPP 12', 'Cross-border disclosure', 'Overseas transfers only with comparable protection or consent'],
      ['IPP 13', 'Unique identifiers', 'No unnecessary unique identifiers assigned'],
    ]
  ));
  sections.push(createParagraph('Notifiable privacy breaches (breaches that cause or are likely to cause serious harm) must be reported to the Office of the Privacy Commissioner and affected individuals as soon as practicable.'));

  // PCI-DSS (conditional)
  if (flags.needs_payments) {
    sections.push(createHeading('PCI-DSS (Payment Card Industry Data Security Standard)', 2));
    sections.push(createParagraph('PCI-DSS compliance is addressed through the tokenisation approach described in the Payment Security section. The application operates under SAQ-A scope — see the PCI-DSS Compliance Checklist above for detailed requirement mapping.'));
    sections.push(...createBulletList([
      'Annual self-assessment questionnaire (SAQ-A) completion',
      'Quarterly external vulnerability scan by an Approved Scanning Vendor (ASV)',
      'Annual review of PCI scope as features and integrations evolve',
      'Attestation of Compliance (AOC) maintained and available on request',
    ]));
  }

  // --- 13. Pre-Launch Security Checklist ---
  sections.push(createHeading('Pre-Launch Security Checklist', 1));
  sections.push(createParagraph('The following checklist must be completed before the application is deployed to production. All required items must have a status of "Complete" before launch is approved.'));

  const checklistRows = [
    ['HTTPS enforced with HSTS header', 'Pending', ''],
    ['Security headers configured (CSP, X-Frame-Options, etc.)', 'Pending', ''],
    ['All user input validated and sanitised', 'Pending', ''],
    ['Authentication hardened (password policy, brute force protection)', 'Pending', flags.needs_auth ? '' : 'N/A if no auth'],
    ['MFA available for admin accounts', 'Pending', flags.needs_auth ? '' : 'N/A if no auth'],
    ['RBAC enforced on all API endpoints', 'Pending', ''],
    ['Sensitive data encrypted at rest', 'Pending', ''],
    ['Database queries parameterised (no SQL injection vectors)', 'Pending', ''],
    ['XSS prevention verified (output encoding, CSP)', 'Pending', ''],
    ['CSRF protection on state-changing requests', 'Pending', ''],
    ['CORS restricted to allowed origins', 'Pending', flags.needs_api ? '' : 'N/A if no API'],
    ['Rate limiting configured', 'Pending', flags.needs_api ? '' : 'N/A if no API'],
    ['Dependency vulnerability scan passing (0 critical/high)', 'Pending', ''],
    ['Secrets removed from codebase (checked with git-secrets or trufflehog)', 'Pending', ''],
    ['Error messages do not leak internal details', 'Pending', ''],
    ['Security logging configured and forwarding to SIEM', 'Pending', ''],
    ['Backup and recovery procedures tested', 'Pending', ''],
    ['Incident response procedure documented and contacts confirmed', 'Pending', ''],
    ['Privacy policy published and data collection notices in place', 'Pending', ''],
    ['Cookie consent mechanism implemented (if applicable)', 'Pending', ''],
    ['PCI-DSS SAQ-A completed', 'Pending', flags.needs_payments ? '' : 'N/A if no payments'],
    ['Penetration test completed (for Enhanced/Critical risk levels)', 'Pending', riskLevel === 'Enhanced' || riskLevel === 'Critical' ? '' : 'N/A for Standard/Minimal'],
    ['Admin default credentials changed/removed', 'Pending', ''],
    ['File upload restrictions verified (type, size, content)', 'Pending', ''],
    ['DNS CAA records configured for certificate authority restriction', 'Pending', ''],
  ];

  sections.push(createTable(['Item', 'Status', 'Notes'], checklistRows));

  sections.push(createParagraph('This checklist is reviewed and signed off by the project lead and client security contact (where applicable) before production deployment.', { bold: true }));

  return createDocument({
    title: 'Security Specification',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
