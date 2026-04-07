// Technical Specification document template
// Generates a comprehensive tech spec from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { formatDate, resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const ctx = docsState.projectContext || {};
  const clientName = params['client-name'] || meta['client-name'] || ctx.client?.name || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const scopeSummary = params['scope-summary'] || ctx.description || '[Scope summary — complete requirements gathering to populate]';
  const techStack = params['tech-stack'] || ctx.framework || '[Tech stack — to be confirmed]';
  const hostingPlatform = params['hosting-platform'] || '[To be confirmed]';
  const targetUsers = params['target-concurrent-users'] || '[To be confirmed]';
  const browserSupport = params['browser-support'] || 'Last 2 versions of Chrome, Firefox, Safari, Edge';
  const teamSize = params['team-size'] || '1 (solo developer)';
  const timeline = params['timeline'] || '[To be confirmed]';

  const integrations = Object.keys(docsState.integrationClauses || {}).filter(k => docsState.integrationClauses[k] === 'active');
  const company = getCompanyInfo(brandConfig || {});

  const sections = [];

  // --- 1. System Overview ---
  sections.push(createHeading('System Overview', 1));
  sections.push(createParagraph(`This document defines the technical specification for ${projectName}, developed for ${clientName}. It serves as the authoritative reference for architecture decisions, technology choices, and implementation standards throughout the project lifecycle.`));
  sections.push(createParagraph(scopeSummary));

  sections.push(createHeading('Major Components', 2));
  const components = ['Frontend application', 'Backend server/API layer'];
  if (flags.needs_database) components.push('Database and data persistence layer');
  if (flags.needs_auth) components.push('Authentication and authorisation service');
  if (flags.needs_payments) components.push('Payment processing subsystem');
  if (flags.needs_cms) components.push('Content management system');
  if (flags.needs_search) components.push('Search engine/indexing service');
  if (flags.needs_email) components.push('Email and notification service');
  if (flags.needs_analytics) components.push('Analytics and event tracking');
  if (flags.needs_n8n) components.push('n8n automation workflows');
  if (integrations.length) components.push('Third-party integration layer');
  sections.push(...createBulletList(components));

  sections.push(createHeading('System Boundaries', 2));
  sections.push(createParagraph('The system encompasses all custom-built software components, their configuration, and the infrastructure required to run them. The following are explicitly outside the system boundary:'));
  const boundaries = [
    'Third-party SaaS platforms (used via API only)',
    'Client-managed DNS and domain registration',
    'End-user devices and browsers',
  ];
  if (flags.needs_payments) boundaries.push('Payment processor internal systems (Stripe, etc.)');
  if (flags.needs_email) boundaries.push('Email delivery infrastructure (SendGrid, Postmark, etc.)');
  sections.push(...createBulletList(boundaries));

  // --- 2. Technology Stack ---
  sections.push(createHeading('Technology Stack', 1));
  sections.push(createParagraph(`The following technology choices have been made for ${projectName}. All selections prioritise long-term maintainability, community support, and performance.`));

  const stackRows = [];
  if (typeof techStack === 'string' && techStack !== '[Tech stack — to be confirmed]') {
    stackRows.push(['Application', techStack, 'Core application framework and language']);
  } else if (typeof techStack === 'object') {
    if (techStack.frontend) stackRows.push(['Frontend', techStack.frontend, 'Client-side UI framework']);
    if (techStack.backend) stackRows.push(['Backend', techStack.backend, 'Server-side application layer']);
    if (techStack.language) stackRows.push(['Language', techStack.language, 'Primary programming language']);
  }
  if (flags.needs_database) {
    const dbTech = params['database-technology'] || 'To be confirmed';
    stackRows.push(['Database', dbTech, 'Primary data store']);
  }
  if (hostingPlatform !== '[To be confirmed]') {
    stackRows.push(['Hosting', hostingPlatform, 'Application hosting and deployment']);
  }
  if (params['cdn']) {
    stackRows.push(['CDN', params['cdn'], 'Static asset delivery and edge caching']);
  }
  if (flags.needs_search) {
    stackRows.push(['Search', params['search-technology'] || 'To be confirmed', 'Full-text search and indexing']);
  }
  if (flags.needs_email) {
    stackRows.push(['Email', params['email-provider'] || 'To be confirmed', 'Transactional email delivery']);
  }
  if (flags.needs_analytics) {
    stackRows.push(['Analytics', params['analytics-platform'] || 'To be confirmed', 'Usage tracking and reporting']);
  }
  // Enrich stack from harvested dependencies if available
  if (ctx.dependencies && typeof ctx.dependencies === 'object') {
    for (const [name, version] of Object.entries(ctx.dependencies)) {
      if (!stackRows.some(r => r[1]?.toLowerCase().includes(name.toLowerCase()))) {
        // Skip common utility packages — only surface framework-level deps
        if (['express', 'fastify', 'koa', 'next', 'nuxt', 'astro', 'svelte', 'prisma', 'drizzle', 'sequelize', 'mongoose', 'redis', 'bullmq'].includes(name.toLowerCase())) {
          stackRows.push([name, `${name}@${version}`, 'Detected from package.json']);
        }
      }
    }
  }
  stackRows.push(['Version Control', 'Git (GitHub)', 'Source code management']);
  stackRows.push(['CI/CD', params['ci-platform'] || 'GitHub Actions', 'Continuous integration and deployment']);

  if (stackRows.length) {
    sections.push(createTable(['Layer', 'Technology', 'Purpose'], stackRows));
  }

  // --- 3. Architecture ---
  sections.push(createHeading('Architecture', 1));

  sections.push(createHeading('System Layers', 2));
  sections.push(createParagraph('The application follows a layered architecture with clear separation of concerns:'));
  const layers = [
    'Presentation Layer — UI components, routing, client-side state management',
    'API/Transport Layer — HTTP endpoints, request validation, response formatting',
    'Business Logic Layer — domain rules, workflows, data transformations',
    'Data Access Layer — database queries, ORM/query builder, caching',
  ];
  if (flags.needs_auth) layers.splice(1, 0, 'Authentication Layer — session validation, token verification, access control');
  sections.push(...createBulletList(layers));

  sections.push(createHeading('Component Descriptions', 2));
  sections.push(createParagraph('Each major component is responsible for a single bounded context. Components communicate through well-defined interfaces — direct function calls within the same process, or HTTP/message queues for cross-service communication.'));
  if (reqs.architecture || ctx.architecture) {
    sections.push(createParagraph(reqs.architecture || ctx.architecture));
  }

  sections.push(createHeading('Data Flow', 2));
  sections.push(createParagraph('The standard request lifecycle flows through the following stages:'));
  const dataFlow = [
    'Client sends HTTP request to the API layer',
    'Request passes through middleware (logging, auth, rate limiting, validation)',
    'Router dispatches to the appropriate controller/handler',
    'Business logic executes, interacting with the data layer as needed',
    'Response is formatted and returned to the client',
  ];
  if (flags.needs_auth) dataFlow.splice(1, 0, 'Authentication middleware verifies session/token validity');
  sections.push(...createBulletList(dataFlow));

  // --- 4. Database Schema (conditional) ---
  if (flags.needs_database) {
    sections.push(createHeading('Database Schema', 1));

    sections.push(createHeading('Entity Overview', 2));
    sections.push(createParagraph('The database schema is designed around the core domain entities. Each entity maps to a single table with clearly defined relationships and constraints.'));
    if (reqs.dataModel) {
      sections.push(createParagraph(reqs.dataModel));
    }
    const dbEntities = params['database-entities'] || [];
    if (Array.isArray(dbEntities) && dbEntities.length) {
      sections.push(...createBulletList(dbEntities));
    } else {
      sections.push(createParagraph('[Entity list — to be defined during detailed design]'));
    }

    sections.push(createHeading('Key Relationships', 2));
    sections.push(createParagraph('Referential integrity is enforced at the database level via foreign key constraints. Cascade rules are defined per-relationship to ensure data consistency during deletions and updates.'));
    if (params['database-relationships']) {
      sections.push(createParagraph(params['database-relationships']));
    }

    sections.push(createHeading('Migration Strategy', 2));
    sections.push(createParagraph('All schema changes are managed through versioned migration files. Migrations are applied sequentially and are immutable once deployed to staging or production.'));
    sections.push(...createBulletList([
      'Forward-only migrations — no manual schema changes in any environment',
      'Each migration is timestamped and includes both up and down operations',
      'Migrations run automatically as part of the deployment pipeline',
      'Seed data is versioned separately from schema migrations',
      'Destructive changes (column drops, table removals) require a two-phase approach: deprecate first, remove in a subsequent release',
    ]));
  }

  // --- 5. API Specification (conditional) ---
  if (flags.needs_api) {
    sections.push(createHeading('API Specification', 1));

    sections.push(createHeading('Endpoint Groups', 2));
    sections.push(createParagraph('The API is organised into logical resource groups. All endpoints follow RESTful conventions with consistent URL patterns, HTTP methods, and response structures.'));
    const apiGroups = params['api-groups'] || [];
    if (Array.isArray(apiGroups) && apiGroups.length) {
      sections.push(...createBulletList(apiGroups));
    } else {
      sections.push(createParagraph('[API endpoint groups — to be defined during detailed design]'));
    }

    sections.push(createHeading('Authentication Strategy', 2));
    const apiAuth = params['api-auth-strategy'] || 'Bearer token (JWT) in Authorization header';
    sections.push(createParagraph(`API authentication: ${apiAuth}. All endpoints except public routes require a valid authentication token. Tokens are validated on every request via middleware.`));

    sections.push(createHeading('Rate Limiting', 2));
    const rateLimit = params['rate-limit'] || '100 requests per minute per authenticated user';
    sections.push(createParagraph(`Rate limiting is enforced at the API gateway level: ${rateLimit}. Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) are included in all responses.`));

    sections.push(createHeading('Versioning', 2));
    const apiVersioning = params['api-versioning'] || 'URL path prefix (e.g. /api/v1/)';
    sections.push(createParagraph(`API versioning strategy: ${apiVersioning}. Breaking changes require a new API version. Previous versions are supported for a minimum of 6 months after deprecation notice.`));

    sections.push(createHeading('Error Format', 2));
    sections.push(createParagraph('All error responses use a consistent JSON structure:'));
    sections.push(...createBulletList([
      'status — HTTP status code (4xx for client errors, 5xx for server errors)',
      'error — machine-readable error code (e.g. VALIDATION_FAILED, NOT_FOUND)',
      'message — human-readable description of the error',
      'details — optional array of field-level validation errors',
      'requestId — unique identifier for tracing the request through logs',
    ]));
  }

  // --- 6. Authentication & Authorization (conditional) ---
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication & Authorisation', 1));

    sections.push(createHeading('Auth Provider', 2));
    const authProvider = params['auth-provider'] || '[To be confirmed]';
    sections.push(createParagraph(`Authentication is handled by ${authProvider}. The implementation follows current OWASP authentication guidelines and industry best practices.`));

    sections.push(createHeading('Session Management', 2));
    const sessionStrategy = params['session-strategy'] || 'JWT with short-lived access tokens and long-lived refresh tokens';
    sections.push(createParagraph(`Session strategy: ${sessionStrategy}.`));
    sections.push(...createBulletList([
      'Access tokens expire after 15 minutes',
      'Refresh tokens expire after 7 days (configurable)',
      'Tokens are rotated on each refresh to prevent replay attacks',
      'Sessions are invalidated on password change or explicit logout',
      'Concurrent session limits are enforced per user role',
    ]));

    sections.push(createHeading('Role Matrix', 2));
    const roles = params['user-roles'] || [
      { role: 'Admin', permissions: 'Full system access, user management, configuration' },
      { role: 'Manager', permissions: 'Content management, reporting, user oversight' },
      { role: 'User', permissions: 'Standard application features, own profile management' },
      { role: 'Viewer', permissions: 'Read-only access to permitted resources' },
    ];
    const roleRows = Array.isArray(roles) ? roles.map(r =>
      typeof r === 'object' ? [r.role || r.name, r.permissions || r.description] : [String(r), '[Permissions to be defined]']
    ) : [];
    if (roleRows.length) {
      sections.push(createTable(['Role', 'Permissions'], roleRows));
    }

    sections.push(createHeading('MFA Considerations', 2));
    const mfa = params['mfa-strategy'] || 'TOTP-based MFA (e.g. Google Authenticator) available for all users, mandatory for admin roles';
    sections.push(createParagraph(mfa));
    sections.push(...createBulletList([
      'MFA is enforced during login and sensitive operations (password change, payment updates)',
      'Recovery codes are generated at MFA enrolment and stored as hashed values',
      'MFA bypass requires identity verification through a secondary channel',
    ]));
  }

  // --- 7. Payment Processing (conditional) ---
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Processing', 1));

    sections.push(createHeading('Payment Flow', 2));
    const paymentProvider = params['payment-provider'] || 'Stripe';
    sections.push(createParagraph(`Payments are processed through ${paymentProvider}. The application never handles raw card data — all sensitive payment information is collected and tokenised by the payment provider's client-side SDK.`));
    sections.push(...createBulletList([
      'User initiates checkout from the application',
      `Payment form is rendered by ${paymentProvider}'s embedded UI components`,
      'Card details are tokenised client-side and sent directly to the payment provider',
      'Server receives the token and creates a charge/subscription via the provider API',
      'Payment confirmation is displayed to the user and a receipt email is triggered',
    ]));

    sections.push(createHeading('Webhook Handling', 2));
    sections.push(createParagraph('Payment webhooks are processed asynchronously to handle events that occur outside the normal request flow:'));
    sections.push(...createBulletList([
      'Webhook endpoint verifies the signature using the provider-supplied secret',
      'Events are processed idempotently — duplicate deliveries produce the same result',
      'Failed webhook processing triggers automatic retries with exponential backoff',
      'Critical events (payment_failed, subscription_cancelled) trigger immediate notifications',
      'All webhook events are logged with full payload for audit and debugging',
    ]));

    sections.push(createHeading('PCI Compliance', 2));
    sections.push(createParagraph(`By using ${paymentProvider}'s tokenisation and never handling raw card data, the application operates under PCI DSS SAQ-A compliance scope. The following controls are maintained:`));
    sections.push(...createBulletList([
      'No storage, processing, or transmission of raw cardholder data',
      'All payment pages served over HTTPS with TLS 1.2+',
      'Content Security Policy headers restrict script sources on payment pages',
      `${paymentProvider} SDK loaded from verified CDN origins only`,
      'Regular review of PCI compliance scope as features evolve',
    ]));

    sections.push(createHeading('Refund Process', 2));
    sections.push(createParagraph('Refunds are initiated through the admin interface and processed via the payment provider API:'));
    sections.push(...createBulletList([
      'Full and partial refunds are supported',
      'Refund requests are logged with the initiating user, reason, and amount',
      'Refunds are reflected in the user-facing transaction history within 24 hours',
      'Automated refund notifications are sent to the customer via email',
      'Refund processing times are governed by the payment provider (typically 5-10 business days)',
    ]));
  }

  // --- 8. CMS Integration (conditional) ---
  if (flags.needs_cms) {
    sections.push(createHeading('CMS Integration', 1));

    const cmsProvider = params['cms-provider'] || '[CMS platform to be confirmed]';
    sections.push(createParagraph(`Content is managed through ${cmsProvider}, operating as a headless CMS. Content is authored in the CMS and consumed by the application via API.`));

    sections.push(createHeading('Content Model', 2));
    sections.push(createParagraph('The content model defines the structure of all managed content types. Each content type has a defined schema with required fields, validation rules, and relationships to other content types.'));
    const contentTypes = params['content-types'] || [];
    if (Array.isArray(contentTypes) && contentTypes.length) {
      sections.push(...createBulletList(contentTypes));
    } else {
      sections.push(createParagraph('[Content types — to be defined during content modelling phase]'));
    }

    sections.push(createHeading('API Schema', 2));
    sections.push(createParagraph(`Content is fetched from ${cmsProvider} via its API. Responses are cached at the application level to reduce API calls and improve page load performance.`));
    sections.push(...createBulletList([
      'Content queries use GraphQL or REST depending on the CMS provider',
      'Response schemas are typed and validated at the application boundary',
      'Stale content is revalidated on a configurable interval (default: 60 seconds)',
      'Webhook-triggered cache invalidation ensures near-instant content updates',
    ]));

    sections.push(createHeading('Editorial Workflow', 2));
    sections.push(createParagraph('Content follows a structured editorial workflow before publication:'));
    sections.push(...createBulletList([
      'Draft — content is being authored or edited',
      'Review — content is submitted for review by an editor or approver',
      'Scheduled — content is approved and scheduled for future publication',
      'Published — content is live and visible to end users',
      'Archived — content is removed from the live site but retained for reference',
    ]));

    sections.push(createHeading('Preview & Draft System', 2));
    sections.push(createParagraph('A preview mode allows content editors to see unpublished changes in the context of the live site:'));
    sections.push(...createBulletList([
      'Preview URLs are generated per content item with time-limited access tokens',
      'Draft content is fetched from the CMS preview API (bypassing published cache)',
      'Preview mode is visually indicated in the UI to prevent confusion with live content',
      'Preview links can be shared with stakeholders for approval',
    ]));
  }

  // --- 9. n8n Automation (conditional) ---
  if (flags.needs_n8n) {
    sections.push(createHeading('n8n Automation', 1));

    sections.push(createParagraph('Automated workflows are managed through n8n, a self-hosted workflow automation platform. Workflows handle background processing, integrations, and scheduled tasks that do not require real-time user interaction.'));

    sections.push(createHeading('Workflow Types', 2));
    const workflowTypes = params['n8n-workflows'] || [
      'Data synchronisation between systems',
      'Scheduled report generation and distribution',
      'Event-driven notifications and alerts',
      'Automated data transformation and ETL pipelines',
    ];
    if (Array.isArray(workflowTypes) && workflowTypes.length) {
      sections.push(...createBulletList(workflowTypes));
    }

    sections.push(createHeading('Triggers', 2));
    sections.push(createParagraph('Workflows are triggered by one or more of the following mechanisms:'));
    sections.push(...createBulletList([
      'Webhook — external events trigger a workflow via HTTP POST',
      'Schedule — cron-based triggers for periodic tasks',
      'Manual — on-demand execution via the n8n dashboard',
      'Application event — the main application triggers workflows via webhook on specific events',
    ]));

    sections.push(createHeading('Error Handling', 2));
    sections.push(createParagraph('Failed workflow executions are handled with a consistent error strategy:'));
    sections.push(...createBulletList([
      'Each workflow has a dedicated error branch that captures failure details',
      'Failed executions are retried automatically (configurable max retries and backoff)',
      'Persistent failures trigger an alert notification (email or Slack)',
      'All execution logs are retained for a configurable period (default: 30 days)',
      'Critical workflows have a manual fallback procedure documented in the operations runbook',
    ]));

    sections.push(createHeading('Monitoring', 2));
    sections.push(createParagraph('Workflow health is monitored through the n8n dashboard and external alerting:'));
    sections.push(...createBulletList([
      'Execution success/failure rates are tracked per workflow',
      'Long-running executions trigger timeout alerts',
      'Workflow versioning is maintained — changes are reviewed before deployment',
      'Credentials used by workflows are stored in n8n\'s encrypted credential store',
    ]));
  }

  // --- 10. Multi-tenancy (conditional) ---
  if (flags.needs_multitenancy) {
    sections.push(createHeading('Multi-tenancy', 1));

    const isolationStrategy = params['tenancy-isolation'] || 'Shared database with tenant ID column on all tenant-scoped tables';
    sections.push(createParagraph(`The application supports multiple tenants (organisations/accounts) within a single deployment. Isolation strategy: ${isolationStrategy}.`));

    sections.push(createHeading('Isolation Strategy', 2));
    sections.push(createParagraph('Data isolation is enforced at every layer of the application:'));
    sections.push(...createBulletList([
      'All database queries include a tenant scope filter — enforced by middleware, not by individual queries',
      'API responses are filtered to the authenticated user\'s tenant',
      'File storage uses tenant-prefixed paths to prevent cross-tenant access',
      'Background jobs carry tenant context and execute within the correct scope',
      'Admin/super-admin roles can access cross-tenant data through explicit scope elevation',
    ]));

    sections.push(createHeading('Routing', 2));
    const routingStrategy = params['tenancy-routing'] || 'Subdomain-based routing (e.g. tenant1.app.com)';
    sections.push(createParagraph(`Tenant identification: ${routingStrategy}. The tenant is resolved early in the request pipeline and attached to the request context for use by all downstream handlers.`));

    sections.push(createHeading('Data Partitioning', 2));
    sections.push(createParagraph('Tenant data is partitioned to ensure performance and isolation:'));
    sections.push(...createBulletList([
      'Tenant ID is indexed on all tenant-scoped tables',
      'Composite indexes include tenant ID as the leading column',
      'Large tenants can be migrated to dedicated database instances if required',
      'Backups and data exports are scoped to individual tenants',
      'Tenant deletion includes a cascading purge of all associated data',
    ]));
  }

  // --- 11. Integration Points ---
  if (integrations.length) {
    sections.push(createHeading('Integration Points', 1));
    sections.push(createParagraph(`${projectName} integrates with the following external services. Each integration is encapsulated in a dedicated service module with its own error handling, retry logic, and circuit breaker.`));

    for (const integration of integrations) {
      const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);
      const clause = (docsState.integrationClauses || {})[integration];
      sections.push(createHeading(displayName, 2));
      sections.push(createParagraph(`Integration: ${displayName}`));
      sections.push(...createBulletList([
        `Credentials stored in environment variables (never committed to source control)`,
        `API calls are wrapped with retry logic and exponential backoff`,
        `Circuit breaker pattern prevents cascading failures when ${displayName} is unavailable`,
        `All API interactions are logged for debugging and audit purposes`,
        `Graceful degradation — the application remains functional if ${displayName} is temporarily unreachable`,
      ]));
    }
  }

  // --- 12. Security Requirements ---
  sections.push(createHeading('Security Requirements', 1));
  sections.push(createParagraph(`Security is a foundational concern for ${projectName}. The following requirements apply across all environments and are validated during code review and automated testing.`));

  sections.push(createHeading('Encryption', 2));
  sections.push(...createBulletList([
    'Data at rest: sensitive fields are encrypted using AES-256-GCM (database-level or application-level depending on the field)',
    'Data in transit: all communication uses TLS 1.2+ (HTTPS enforced, HTTP redirects to HTTPS)',
    'Secrets management: API keys, database credentials, and encryption keys are stored in environment variables or a secrets manager — never in source code',
  ]));

  sections.push(createHeading('Security Checklist', 2));
  const securityRows = [
    ['HTTPS Enforcement', 'All traffic served over HTTPS, HSTS header enabled', 'Required'],
    ['CORS Policy', 'Restricted to known origins, credentials mode explicit', 'Required'],
    ['Input Validation', 'All user input validated and sanitised at the API boundary', 'Required'],
    ['SQL Injection', 'Parameterised queries or ORM — no string concatenation in queries', 'Required'],
    ['XSS Prevention', 'Output encoding, Content Security Policy header, no inline scripts', 'Required'],
    ['CSRF Protection', 'CSRF tokens on state-changing requests (or SameSite cookies)', 'Required'],
    ['Authentication', 'Secure password hashing (bcrypt/argon2), account lockout, brute force protection', 'Required'],
    ['Authorisation', 'Role-based access control enforced at the API layer', 'Required'],
    ['Dependency Scanning', 'Automated vulnerability scanning in CI pipeline (npm audit, Snyk, etc.)', 'Required'],
    ['Security Headers', 'X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy', 'Required'],
    ['Logging', 'Security events logged (failed logins, permission denials, data access)', 'Required'],
    ['Secrets Rotation', 'API keys and tokens have defined rotation schedules', 'Recommended'],
  ];
  sections.push(createTable(['Control', 'Description', 'Priority'], securityRows));

  sections.push(createHeading('OWASP Top 10 Considerations', 2));
  sections.push(createParagraph('The implementation addresses the OWASP Top 10 web application security risks:'));
  sections.push(...createBulletList([
    'A01: Broken Access Control — enforced at middleware level, tested with integration tests',
    'A02: Cryptographic Failures — AES-256 encryption, TLS 1.2+, no weak algorithms',
    'A03: Injection — parameterised queries, input validation, output encoding',
    'A04: Insecure Design — threat modelling during design phase, secure defaults',
    'A05: Security Misconfiguration — environment-specific configs, no default credentials',
    'A06: Vulnerable Components — automated dependency scanning, regular updates',
    'A07: Authentication Failures — strong password policy, MFA, account lockout',
    'A08: Data Integrity Failures — signed tokens, integrity checks on critical data',
    'A09: Logging & Monitoring — security event logging, alerting on anomalies',
    'A10: SSRF — URL validation, allowlisting for outbound requests',
  ]));

  // --- 13. Performance Targets ---
  sections.push(createHeading('Performance Targets', 1));

  sections.push(createHeading('Response Time Targets', 2));
  const perfRows = [
    ['Page Load (initial)', '< 2 seconds', 'First Contentful Paint on 4G connection'],
    ['Page Load (subsequent)', '< 500ms', 'Client-side navigation with cached assets'],
    ['API Response (read)', '< 200ms', 'p95 response time for GET endpoints'],
    ['API Response (write)', '< 500ms', 'p95 response time for POST/PUT/DELETE endpoints'],
    ['Search', '< 300ms', 'p95 response time for search queries'],
    ['Background Jobs', '< 30 seconds', 'p95 completion time for async processing'],
  ];
  sections.push(createTable(['Operation', 'Target', 'Notes'], perfRows));

  sections.push(createHeading('Concurrent Users', 2));
  sections.push(createParagraph(`Target concurrent users: ${targetUsers}. The system is designed to handle this load with headroom for traffic spikes (2x sustained load).`));

  sections.push(createHeading('Caching Strategy', 2));
  sections.push(createParagraph('A multi-layer caching strategy reduces database load and improves response times:'));
  sections.push(...createBulletList([
    'Browser cache — static assets with long cache TTLs and content-hashed filenames',
    'CDN cache — static files and optionally API responses at edge locations',
    'Application cache — frequently accessed data cached in-memory (Redis or in-process)',
    'Database query cache — query result caching for expensive, infrequently-changing queries',
    'Cache invalidation — event-driven invalidation on data writes, time-based expiry as fallback',
  ]));

  sections.push(createHeading('CDN Usage', 2));
  const cdn = params['cdn'] || 'CDN provider to be confirmed';
  sections.push(createParagraph(`Static assets (JS, CSS, images, fonts) are served via ${cdn}. CDN configuration includes:`));
  sections.push(...createBulletList([
    'Automatic compression (gzip/brotli) for text-based assets',
    'Image optimisation and responsive image serving where supported',
    'Cache-busting via content-hashed filenames in the build pipeline',
    'Custom cache rules for different asset types (immutable for hashed files, short TTL for HTML)',
  ]));

  // --- 14. Deployment & Infrastructure ---
  sections.push(createHeading('Deployment & Infrastructure', 1));

  sections.push(createHeading('Hosting Platform', 2));
  sections.push(createParagraph(`The application is hosted on ${hostingPlatform}. The hosting configuration supports zero-downtime deployments and horizontal scaling.`));

  sections.push(createHeading('CI/CD Pipeline', 2));
  const ciPlatform = params['ci-platform'] || 'GitHub Actions';
  sections.push(createParagraph(`Continuous integration and deployment is managed via ${ciPlatform}. The pipeline runs on every push to the main branch and on all pull requests.`));
  sections.push(...createBulletList([
    'Lint — code style and formatting checks',
    'Type check — static type analysis (where applicable)',
    'Unit tests — fast, isolated tests for business logic',
    'Integration tests — API and database integration tests',
    'Security scan — dependency vulnerability scanning',
    'Build — production build with optimisation',
    'Deploy (main branch only) — deploy to staging, then production with manual approval',
  ]));

  sections.push(createHeading('Environment Configuration', 2));
  sections.push(createTable(
    ['Environment', 'Purpose', 'Deploy Trigger'],
    [
      ['Development', 'Local developer machines, feature branches', 'Manual (local)'],
      ['Staging', 'Pre-production testing, QA, client review', 'Automatic on merge to main'],
      ['Production', 'Live application serving end users', 'Manual promotion from staging'],
    ]
  ));
  sections.push(createParagraph('Environment-specific configuration is managed through environment variables. A .env.example file documents all required variables without exposing secrets.'));

  if (ctx.envVars && Array.isArray(ctx.envVars) && ctx.envVars.length > 0) {
    sections.push(createHeading('Required Environment Variables', 3));
    sections.push(createParagraph('The following environment variables have been identified in the project:'));
    sections.push(...createBulletList(ctx.envVars.map(v => typeof v === 'string' ? v : `${v.name} — ${v.description || 'Required'}`)));
  }

  sections.push(createHeading('Monitoring & Alerting', 2));
  sections.push(createParagraph('Application health is monitored continuously with alerts for degraded performance or errors:'));
  sections.push(...createBulletList([
    'Uptime monitoring — external health check pings every 60 seconds',
    'Error tracking — unhandled exceptions captured and grouped (Sentry or equivalent)',
    'Performance monitoring — response time percentiles, throughput, error rates',
    'Log aggregation — structured logs collected and searchable (stdout to log service)',
    'Alerting — critical errors and downtime trigger immediate notifications (email/Slack)',
    'Resource monitoring — CPU, memory, disk usage tracked with threshold alerts',
  ]));

  // --- 15. Error Handling & Logging ---
  sections.push(createHeading('Error Handling & Logging', 1));

  sections.push(createHeading('Error Codes', 2));
  sections.push(createParagraph('The application uses structured error codes to classify errors consistently:'));
  sections.push(createTable(
    ['Code Range', 'Category', 'Example'],
    [
      ['VALIDATION_*', 'Input validation failures', 'VALIDATION_REQUIRED_FIELD'],
      ['AUTH_*', 'Authentication and authorisation errors', 'AUTH_TOKEN_EXPIRED'],
      ['NOT_FOUND_*', 'Resource not found errors', 'NOT_FOUND_USER'],
      ['CONFLICT_*', 'Data conflict errors', 'CONFLICT_DUPLICATE_EMAIL'],
      ['RATE_LIMIT_*', 'Rate limiting errors', 'RATE_LIMIT_EXCEEDED'],
      ['INTERNAL_*', 'Unexpected server errors', 'INTERNAL_DATABASE_ERROR'],
      ['EXTERNAL_*', 'Third-party service failures', 'EXTERNAL_PAYMENT_FAILED'],
    ]
  ));

  sections.push(createHeading('Log Levels', 2));
  sections.push(createParagraph('Structured JSON logging is used across all environments:'));
  sections.push(createTable(
    ['Level', 'Usage', 'Environment'],
    [
      ['error', 'Unhandled exceptions, failed critical operations', 'All'],
      ['warn', 'Recoverable issues, deprecation notices, retry attempts', 'All'],
      ['info', 'Request lifecycle, business events, deployment events', 'Staging, Production'],
      ['debug', 'Detailed execution flow, variable state, query details', 'Development only'],
    ]
  ));

  sections.push(createHeading('Alerting Strategy', 2));
  sections.push(createParagraph('Alerts are tiered by severity to avoid alert fatigue:'));
  sections.push(...createBulletList([
    'Critical — application down or data loss risk: immediate notification (PagerDuty/phone)',
    'High — elevated error rate or degraded performance: Slack notification + email',
    'Medium — non-critical warnings, approaching resource limits: daily digest email',
    'Low — informational, audit events: logged only, reviewed in weekly ops check',
  ]));

  sections.push(createHeading('Recovery Procedures', 2));
  sections.push(createParagraph('Documented recovery procedures exist for the following failure scenarios:'));
  sections.push(...createBulletList([
    'Database connection failure — automatic reconnection with exponential backoff, failover to read replica if available',
    'Third-party service outage — circuit breaker trips, graceful degradation, cached responses where appropriate',
    'Deployment failure — automatic rollback to the previous stable version',
    'Data corruption — point-in-time database restore from automated backups',
    'Security incident — incident response playbook with containment, investigation, and communication steps',
  ]));

  // --- 16. Assumptions & Constraints ---
  sections.push(createHeading('Assumptions & Constraints', 1));

  sections.push(createHeading('Team & Timeline', 2));
  sections.push(createTable(
    ['Constraint', 'Value'],
    [
      ['Team Size', teamSize],
      ['Timeline', timeline],
      ['Development Methodology', params['methodology'] || 'Iterative (2-week sprints)'],
      ['Code Review', params['code-review-process'] || 'All changes reviewed before merge'],
    ]
  ));

  sections.push(createHeading('Technical Constraints', 2));
  const constraints = params['technical-constraints'] || [];
  const defaultConstraints = [
    'The application must run on modern server infrastructure (Node.js 20+ or equivalent)',
    'All third-party dependencies must be actively maintained with no known critical vulnerabilities',
    'The codebase must be deployable from a single Git repository',
  ];
  const allConstraints = Array.isArray(constraints) && constraints.length ? constraints : defaultConstraints;
  sections.push(...createBulletList(allConstraints));

  sections.push(createHeading('Browser Support', 2));
  sections.push(createParagraph(`Supported browsers: ${browserSupport}. Progressive enhancement is used where possible — core functionality works without JavaScript where practical, enhanced features require a modern browser.`));

  sections.push(createHeading('Assumptions', 2));
  const assumptions = params['assumptions'] || [
    'The client will provide all required content, assets, and credentials in a timely manner',
    'Third-party services (hosting, APIs, payment processors) will remain available and maintain their current API contracts',
    'The project scope is as defined in the accompanying Statement of Work — changes require a formal change request',
    'Development and staging environments will be available throughout the project lifecycle',
  ];
  if (Array.isArray(assumptions) && assumptions.length) {
    sections.push(...createBulletList(assumptions));
  }

  return createDocument({
    title: 'Technical Specification',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
