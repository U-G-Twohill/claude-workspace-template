// Architecture Document template
// Generates a comprehensive architecture document from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { formatDate, resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};
  const integrations = docsState.integrationClauses || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const scopeSummary = params['scope-summary'] || '[Scope summary — complete requirements gathering to populate]';
  const techStack = params['tech-stack'] || '[Tech stack — to be confirmed]';
  const hostingPlatform = params['hosting-platform'] || '[To be confirmed]';
  const dbTechnology = params['database-technology'] || '[To be confirmed]';
  const targetUsers = params['target-concurrent-users'] || '[To be confirmed]';

  const activeIntegrations = Object.keys(integrations).filter(k => integrations[k] === 'active');
  const company = getCompanyInfo(brandConfig || {});
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context where available
  const ctxDescription = ctx.description || '';
  const ctxFramework = ctx.framework || '';
  const ctxEnvVars = ctx.envVars || [];
  const ctxIntegrations = ctx.integrations || [];
  const ctxUsesDocker = ctx.usesDocker || false;
  const ctxDeps = ctx.dependencies || {};

  const sections = [];

  // --- 1. Executive Summary ---
  sections.push(createHeading('Executive Summary', 1));
  sections.push(createParagraph(`This document defines the architecture for ${projectName}, developed for ${clientName}. It describes the system's structural design, technology choices, component relationships, data flows, and infrastructure requirements. This is the authoritative reference for how the system is built and why specific architectural decisions were made.`));
  sections.push(createParagraph(ctxDescription || scopeSummary));

  const summaryPoints = [
    `Technology foundation: ${typeof techStack === 'string' ? techStack : '[See Technology Stack section]'}`,
    `Hosting: ${hostingPlatform}`,
  ];
  if (flags.needs_database) summaryPoints.push(`Database: ${dbTechnology}`);
  if (flags.needs_api) summaryPoints.push('RESTful API layer with versioned endpoints');
  if (flags.needs_auth) summaryPoints.push('Authentication and role-based access control');
  if (flags.needs_payments) summaryPoints.push('Payment processing with PCI-compliant integration');
  if (flags.needs_cms) summaryPoints.push('Headless CMS for content management');
  if (flags.needs_search) summaryPoints.push('Full-text search and indexing');
  if (activeIntegrations.length) summaryPoints.push(`${activeIntegrations.length} third-party integration(s)`);
  sections.push(...createBulletList(summaryPoints));

  // --- 2. System Overview ---
  sections.push(createHeading('System Overview', 1));
  sections.push(createParagraph(`${projectName} is designed to ${scopeSummary.toLowerCase().startsWith('[') ? '[DESCRIBE the primary purpose and business value of the system]' : scopeSummary}. The system serves ${clientName} and their end users, providing a reliable, secure, and performant experience.`));

  sections.push(createHeading('Technology Stack Summary', 2));
  const stackRows = [];

  // Populate from harvested dependencies when available, fall back to params
  const allDeps = listDependencies(docsState, 'all');
  if (allDeps.length) {
    // Framework layer from harvested data
    const fwDeps = listDependencies(docsState, 'framework');
    if (fwDeps.length) {
      stackRows.push(['Framework', fwDeps.join(', '), ctxFramework ? `${ctxFramework} application` : 'Core application framework']);
    } else if (typeof techStack === 'string' && !techStack.startsWith('[')) {
      stackRows.push(['Application', techStack, 'Core application framework and language']);
    }
    // CSS/UI layer
    const cssDeps = listDependencies(docsState, 'css');
    if (cssDeps.length) stackRows.push(['CSS / UI', cssDeps.join(', '), 'Styling and UI components']);
    // Testing layer
    const testDeps = listDependencies(docsState, 'testing');
    if (testDeps.length) stackRows.push(['Testing', testDeps.join(', '), 'Test framework and utilities']);
  } else {
    if (typeof techStack === 'string' && !techStack.startsWith('[')) {
      stackRows.push(['Application', techStack, 'Core application framework and language']);
    } else if (typeof techStack === 'object') {
      if (techStack.frontend) stackRows.push(['Frontend', techStack.frontend, 'Client-side UI framework']);
      if (techStack.backend) stackRows.push(['Backend', techStack.backend, 'Server-side application layer']);
      if (techStack.language) stackRows.push(['Language', techStack.language, 'Primary programming language']);
    }
  }

  if (flags.needs_database) {
    const dbDeps = listDependencies(docsState, 'database');
    stackRows.push(['Database', dbDeps.length ? `${dbTechnology} (${dbDeps.join(', ')})` : dbTechnology, 'Primary data store']);
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
    const emailDeps = listDependencies(docsState, 'email');
    stackRows.push(['Email', emailDeps.length ? emailDeps.join(', ') : (params['email-provider'] || 'To be confirmed'), 'Transactional email delivery']);
  }
  if (flags.needs_analytics) {
    stackRows.push(['Analytics', params['analytics-platform'] || 'To be confirmed', 'Usage tracking and reporting']);
  }
  if (flags.needs_n8n) {
    stackRows.push(['Automation', 'n8n (self-hosted)', 'Workflow automation and background processing']);
  }
  if (ctxUsesDocker) {
    stackRows.push(['Containerisation', 'Docker', 'Application containerisation and local development']);
  }
  stackRows.push(['Version Control', 'Git (GitHub)', 'Source code management']);
  stackRows.push(['CI/CD', params['ci-platform'] || 'GitHub Actions', 'Continuous integration and deployment']);

  if (stackRows.length) {
    sections.push(createTable(['Layer', 'Technology', 'Purpose'], stackRows));
  }

  sections.push(createHeading('Key Stakeholders', 2));
  sections.push(createParagraph('This document is intended for the following audiences:'));
  sections.push(...createBulletList([
    'Development team — primary reference for implementation decisions',
    'Project management — understanding of system scope and dependencies',
    `${clientName} technical contacts — visibility into architectural choices`,
    'Operations — infrastructure, deployment, and monitoring requirements',
  ]));

  // --- 3. Architecture Principles ---
  sections.push(createHeading('Architecture Principles', 1));
  sections.push(createParagraph('The following principles guide all architectural decisions for this project. When trade-offs arise, these principles are applied in order of priority.'));

  const principles = [
    'Simplicity over cleverness — prefer straightforward solutions that are easy to understand, debug, and maintain',
    'Separation of concerns — each component has a single, well-defined responsibility with clear boundaries',
    'Convention over configuration — follow established patterns and standards rather than inventing custom approaches',
    'Defence in depth — security controls are layered, never reliant on a single mechanism',
    'Fail gracefully — the system degrades predictably under failure conditions rather than cascading',
    'Observable by default — every component produces structured logs, metrics, and health signals',
  ];
  sections.push(...createBulletList(principles));

  if (reqs.constraints) {
    sections.push(createHeading('Design Constraints', 2));
    sections.push(createParagraph(reqs.constraints));
  }

  if (reqs.goals) {
    sections.push(createHeading('Architecture Goals', 2));
    sections.push(createParagraph(reqs.goals));
  }

  // --- 4. Component Architecture ---
  sections.push(createHeading('Component Architecture', 1));
  sections.push(createParagraph('The system is decomposed into the following major components. Each component is independently deployable, testable, and replaceable without affecting the rest of the system.'));

  if (reqs.architecture) {
    sections.push(createParagraph(reqs.architecture));
  }

  // Frontend
  sections.push(createHeading('Frontend', 2));
  const frontendTech = (typeof techStack === 'object' && techStack.frontend) ? techStack.frontend : (typeof techStack === 'string' && !techStack.startsWith('[') ? techStack : '[Frontend framework to be confirmed]');
  sections.push(createParagraph(`The frontend is built with ${frontendTech}. It is responsible for rendering the user interface, managing client-side state, handling user interactions, and communicating with the backend via API calls.`));
  sections.push(...createBulletList([
    'Component-based architecture with reusable UI elements',
    'Client-side routing for single-page application navigation',
    'State management for complex UI interactions and data caching',
    'Responsive design supporting mobile, tablet, and desktop viewports',
    'Accessibility compliance (WCAG 2.1 AA) across all interactive elements',
    'Progressive enhancement — core functionality works without JavaScript where practical',
  ]));

  // Backend
  sections.push(createHeading('Backend', 2));
  const backendTech = (typeof techStack === 'object' && techStack.backend) ? techStack.backend : (typeof techStack === 'string' && !techStack.startsWith('[') ? techStack : '[Backend framework to be confirmed]');
  sections.push(createParagraph(`The backend is built with ${backendTech}. It serves as the API layer, orchestrates business logic, manages data persistence, and handles integrations with external services.`));

  sections.push(createHeading('System Layers', 3));
  sections.push(createParagraph('The backend follows a layered architecture with strict dependency rules — each layer may only call into the layer directly below it:'));
  const layers = [
    'Transport Layer — HTTP request handling, input validation, response formatting',
    'Service Layer — business logic, workflow orchestration, data transformation',
    'Data Access Layer — database queries, ORM/query builder, caching',
    'Infrastructure Layer — external service clients, file storage, messaging',
  ];
  if (flags.needs_auth) layers.splice(0, 0, 'Middleware Layer — authentication, rate limiting, request logging, CORS');
  sections.push(...createBulletList(layers));

  // Database
  if (flags.needs_database) {
    sections.push(createHeading('Database', 2));
    sections.push(createParagraph(`The primary data store is ${dbTechnology}. The database is responsible for durable storage of all application state, enforcing referential integrity, and providing efficient query execution.`));
    sections.push(...createBulletList([
      'Schema managed through versioned migrations (forward-only in production)',
      'Connection pooling to manage concurrent access efficiently',
      'Read replicas for scaling read-heavy workloads (if required)',
      'Automated daily backups with point-in-time recovery capability',
      'Sensitive fields encrypted at the application layer before storage',
    ]));
  }

  // External Services
  if (activeIntegrations.length || flags.needs_email || flags.needs_analytics || flags.needs_n8n) {
    sections.push(createHeading('External Services', 2));
    sections.push(createParagraph('The system integrates with the following external services. Each integration is encapsulated in a dedicated service module with its own error handling, retry logic, and circuit breaker pattern.'));

    const externalServices = [];
    if (flags.needs_email) externalServices.push(`Email delivery — ${params['email-provider'] || '[Provider to be confirmed]'}: transactional emails, notifications, password resets`);
    if (flags.needs_analytics) externalServices.push(`Analytics — ${params['analytics-platform'] || '[Platform to be confirmed]'}: user behaviour tracking, conversion events, reporting`);
    if (flags.needs_n8n) externalServices.push('Automation — n8n (self-hosted): background workflows, scheduled tasks, data synchronisation');
    for (const name of activeIntegrations) {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      externalServices.push(`${displayName} — [DESCRIBE ${displayName} integration purpose and data exchanged]`);
    }
    sections.push(...createBulletList(externalServices));
  }

  // --- 5. Data Flow ---
  sections.push(createHeading('Data Flow', 1));
  sections.push(createParagraph('This section describes the primary data flows through the system. Understanding these flows is critical for debugging, performance optimisation, and security analysis.'));

  sections.push(createHeading('Request Lifecycle', 2));
  sections.push(createParagraph('A standard client request follows this path through the system:'));
  const requestFlow = [
    'Client sends an HTTP request (browser, mobile app, or API consumer)',
    'Request hits the reverse proxy/load balancer (TLS termination, initial rate limiting)',
    'Application server receives the request and runs middleware (logging, CORS, request ID)',
  ];
  if (flags.needs_auth) requestFlow.push('Authentication middleware validates the session token or API key');
  requestFlow.push(
    'Input validation middleware checks request body, query parameters, and path parameters',
    'Router dispatches the request to the appropriate controller/handler',
    'Service layer executes business logic, interacting with the data layer as needed',
  );
  if (flags.needs_database) requestFlow.push('Data access layer queries the database (with connection pooling and query parameterisation)');
  requestFlow.push(
    'Response is formatted (JSON serialisation, status code, pagination metadata)',
    'Response passes back through middleware (response logging, timing headers)',
    'Client receives the HTTP response',
  );
  sections.push(...createBulletList(requestFlow));

  sections.push(createHeading('Asynchronous Flows', 2));
  sections.push(createParagraph('Not all processing occurs within the request-response cycle. The following flows are handled asynchronously:'));
  const asyncFlows = [
    'Background jobs — long-running tasks queued for processing outside the request cycle',
  ];
  if (flags.needs_email) asyncFlows.push('Email dispatch — transactional emails queued and sent asynchronously to avoid blocking the user');
  if (flags.needs_payments) asyncFlows.push('Payment webhooks — inbound payment events processed asynchronously with idempotency guarantees');
  if (flags.needs_n8n) asyncFlows.push('n8n workflows — scheduled and event-driven automation running independently of the main application');
  if (flags.needs_search) asyncFlows.push('Search indexing — content changes propagated to the search index asynchronously');
  asyncFlows.push('Scheduled tasks — cron-based maintenance operations (cleanup, reporting, cache warming)');
  sections.push(...createBulletList(asyncFlows));

  // --- 6. Database Architecture (conditional) ---
  if (flags.needs_database) {
    sections.push(createHeading('Database Architecture', 1));

    sections.push(createHeading('Schema Overview', 2));
    sections.push(createParagraph(`The ${dbTechnology} database schema is designed around the core domain entities. Each entity maps to a single table with clearly defined relationships, constraints, and indexes.`));

    if (reqs.dataModel) {
      sections.push(createParagraph(reqs.dataModel));
    }

    const dbEntities = params['database-entities'] || [];
    if (Array.isArray(dbEntities) && dbEntities.length) {
      sections.push(createHeading('Core Entities', 3));
      sections.push(...createBulletList(dbEntities));
    } else {
      sections.push(createParagraph('[DESCRIBE core database entities — tables, their purpose, and primary keys. Entity list will be populated during detailed design.]'));
    }

    sections.push(createHeading('Relationships', 2));
    sections.push(createParagraph('Referential integrity is enforced at the database level via foreign key constraints. Cascade rules are defined per-relationship to ensure data consistency.'));
    if (params['database-relationships']) {
      sections.push(createParagraph(params['database-relationships']));
    } else {
      sections.push(createParagraph('[DESCRIBE key entity relationships — one-to-many, many-to-many, cascade rules, and any polymorphic associations.]'));
    }

    sections.push(createHeading('Indexing Strategy', 2));
    sections.push(createParagraph('Indexes are created based on query patterns identified during development. The following indexing principles apply:'));
    sections.push(...createBulletList([
      'Primary keys are automatically indexed',
      'Foreign keys are indexed to support JOIN performance',
      'Columns used in WHERE clauses and ORDER BY are indexed based on query frequency',
      'Composite indexes follow the left-prefix rule and are ordered by selectivity',
      'Full-text indexes are created for searchable text columns where applicable',
      'Index usage is monitored in production — unused indexes are removed to reduce write overhead',
    ]));

    sections.push(createHeading('Migration Strategy', 2));
    sections.push(createParagraph('All schema changes are managed through versioned migration files:'));
    sections.push(...createBulletList([
      'Forward-only migrations — no manual schema changes in any environment',
      'Each migration is timestamped and includes both up and down operations',
      'Migrations run automatically as part of the deployment pipeline',
      'Seed data is versioned separately from schema migrations',
      'Destructive changes (column drops, table removals) follow a two-phase approach: deprecate first, remove in a subsequent release',
      'Migration files are tested in CI before deployment to staging',
    ]));
  }

  // --- 7. API Architecture (conditional) ---
  if (flags.needs_api) {
    sections.push(createHeading('API Architecture', 1));

    sections.push(createHeading('Endpoint Patterns', 2));
    sections.push(createParagraph('The API follows RESTful conventions with consistent URL patterns, HTTP methods, and response structures. All endpoints are grouped by resource type.'));

    const apiGroups = params['api-groups'] || [];
    if (Array.isArray(apiGroups) && apiGroups.length) {
      sections.push(...createBulletList(apiGroups));
    } else {
      sections.push(createParagraph('[DESCRIBE API endpoint groups — e.g. /api/v1/users, /api/v1/orders, /api/v1/products. Define during detailed design.]'));
    }

    sections.push(createHeading('URL Convention', 3));
    sections.push(createParagraph('Endpoints follow a consistent naming convention:'));
    sections.push(...createBulletList([
      'Resource names are plural nouns (e.g. /users, /orders, /products)',
      'Nested resources use path nesting (e.g. /users/:id/orders)',
      'Actions that do not map to CRUD use a verb suffix (e.g. /orders/:id/refund)',
      'Query parameters are used for filtering, sorting, and pagination',
      'All IDs in URLs are opaque identifiers (UUIDs preferred over sequential integers)',
    ]));

    sections.push(createHeading('Versioning', 2));
    const apiVersioning = params['api-versioning'] || 'URL path prefix (e.g. /api/v1/)';
    sections.push(createParagraph(`API versioning strategy: ${apiVersioning}. Breaking changes require a new API version. Previous versions are supported for a minimum of 6 months after deprecation notice.`));

    sections.push(createHeading('Error Handling', 2));
    sections.push(createParagraph('All error responses use a consistent JSON structure:'));
    sections.push(createTable(
      ['Field', 'Type', 'Description'],
      [
        ['status', 'number', 'HTTP status code (4xx for client errors, 5xx for server errors)'],
        ['error', 'string', 'Machine-readable error code (e.g. VALIDATION_FAILED, NOT_FOUND)'],
        ['message', 'string', 'Human-readable description of the error'],
        ['details', 'array', 'Optional field-level validation errors'],
        ['requestId', 'string', 'Unique identifier for tracing the request through logs'],
      ]
    ));

    sections.push(createHeading('Rate Limiting', 2));
    const rateLimit = params['rate-limit'] || '100 requests per minute per authenticated user';
    sections.push(createParagraph(`Rate limiting is enforced at the API gateway level: ${rateLimit}. Rate limit headers are included in all responses:`));
    sections.push(...createBulletList([
      'X-RateLimit-Limit — maximum requests allowed in the current window',
      'X-RateLimit-Remaining — requests remaining in the current window',
      'X-RateLimit-Reset — timestamp when the rate limit window resets',
      '429 Too Many Requests response when the limit is exceeded, with a Retry-After header',
    ]));

    sections.push(createHeading('Pagination', 2));
    sections.push(createParagraph('List endpoints use cursor-based or offset-based pagination depending on the use case:'));
    sections.push(...createBulletList([
      'Default page size: 25 items (configurable via query parameter, max 100)',
      'Response includes total count, current page/cursor, and links to next/previous pages',
      'Cursor-based pagination is preferred for large, frequently-changing datasets',
      'Offset-based pagination is used where page number navigation is required',
    ]));
  }

  // --- 8. Authentication & Authorisation (conditional) ---
  if (flags.needs_auth) {
    sections.push(createHeading('Authentication & Authorisation', 1));

    sections.push(createHeading('Authentication Flow', 2));
    const authProvider = params['auth-provider'] || '[Auth provider to be confirmed]';
    sections.push(createParagraph(`Authentication is handled by ${authProvider}. The implementation follows current OWASP authentication guidelines.`));
    sections.push(...createBulletList([
      'User submits credentials (email/password, social login, or SSO)',
      'Server validates credentials against the identity provider',
      'On success, a session token (JWT or opaque) is issued and returned to the client',
      'Client includes the token in subsequent requests via the Authorization header',
      'Server validates the token on every request via middleware',
      'Token refresh occurs transparently before expiry to maintain the session',
    ]));

    sections.push(createHeading('Session Management', 2));
    const sessionStrategy = params['session-strategy'] || 'JWT with short-lived access tokens and long-lived refresh tokens';
    sections.push(createParagraph(`Session strategy: ${sessionStrategy}.`));
    sections.push(...createBulletList([
      'Access tokens expire after 15 minutes (configurable)',
      'Refresh tokens expire after 7 days (configurable)',
      'Tokens are rotated on each refresh to prevent replay attacks',
      'Sessions are invalidated on password change or explicit logout',
      'Concurrent session limits are enforced per user role',
      'Token revocation list (or short TTL + no revocation) based on security requirements',
    ]));

    sections.push(createHeading('Role-Based Access Control', 2));
    sections.push(createParagraph('Authorisation is enforced at the API layer using role-based access control (RBAC). Each endpoint declares the minimum role required for access.'));

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

    sections.push(createHeading('MFA', 2));
    const mfa = params['mfa-strategy'] || 'TOTP-based MFA (e.g. Google Authenticator) available for all users, mandatory for admin roles';
    sections.push(createParagraph(mfa));
    sections.push(...createBulletList([
      'MFA is enforced during login and sensitive operations (password change, payment updates)',
      'Recovery codes are generated at MFA enrolment and stored as hashed values',
      'MFA bypass requires identity verification through a secondary channel',
    ]));
  }

  // --- 9. Payment Integration (conditional) ---
  if (flags.needs_payments) {
    sections.push(createHeading('Payment Integration', 1));

    sections.push(createHeading('Payment Flow', 2));
    const paymentProvider = params['payment-provider'] || 'Stripe';
    sections.push(createParagraph(`Payments are processed through ${paymentProvider}. The application never handles raw card data — all sensitive payment information is collected and tokenised by the provider's client-side SDK.`));
    sections.push(...createBulletList([
      'User initiates checkout from the application',
      `Payment form is rendered by ${paymentProvider}'s embedded UI components`,
      'Card details are tokenised client-side and sent directly to the payment provider',
      'Server receives the token and creates a charge/subscription via the provider API',
      'Payment confirmation is displayed to the user and a receipt email is triggered',
      'Transaction record is stored locally for reporting and reconciliation',
    ]));

    sections.push(createHeading('Webhook Processing', 2));
    sections.push(createParagraph(`${paymentProvider} webhooks notify the application of asynchronous payment events. Webhook processing follows strict reliability patterns:`));
    sections.push(...createBulletList([
      'Webhook endpoint verifies the cryptographic signature using the provider-supplied secret',
      'Events are processed idempotently — duplicate deliveries produce the same result',
      'Failed processing triggers automatic retries with exponential backoff',
      'Critical events (payment_failed, subscription_cancelled) trigger immediate notifications',
      'All webhook events are logged with full payload for audit and debugging',
      'Webhook processing is decoupled from the main request path to avoid blocking',
    ]));

    sections.push(createHeading('Idempotency', 2));
    sections.push(createParagraph('Payment operations use idempotency keys to prevent duplicate charges:'));
    sections.push(...createBulletList([
      'Every payment request includes a unique idempotency key generated by the client',
      'The server stores the key and result — duplicate requests return the stored result',
      'Idempotency keys expire after 24 hours',
      'Retry logic on network failures uses the same idempotency key to prevent double-charging',
    ]));

    sections.push(createHeading('PCI Compliance', 2));
    sections.push(createParagraph(`By using ${paymentProvider}'s tokenisation and never handling raw card data, the application operates under PCI DSS SAQ-A compliance scope:`));
    sections.push(...createBulletList([
      'No storage, processing, or transmission of raw cardholder data',
      'All payment pages served over HTTPS with TLS 1.2+',
      'Content Security Policy headers restrict script sources on payment pages',
      `${paymentProvider} SDK loaded from verified CDN origins only`,
      'Regular review of PCI compliance scope as features evolve',
    ]));
  }

  // --- 10. CMS Architecture (conditional) ---
  if (flags.needs_cms) {
    sections.push(createHeading('CMS Architecture', 1));

    const cmsProvider = params['cms-provider'] || '[CMS platform to be confirmed]';
    sections.push(createParagraph(`Content is managed through ${cmsProvider}, operating as a headless CMS. Content is authored in the CMS interface and consumed by the application via API.`));

    sections.push(createHeading('Content Model', 2));
    sections.push(createParagraph('The content model defines the structure of all managed content types. Each type has a defined schema with required fields, validation rules, and relationships.'));
    const contentTypes = params['content-types'] || [];
    if (Array.isArray(contentTypes) && contentTypes.length) {
      sections.push(...createBulletList(contentTypes));
    } else {
      sections.push(createParagraph('[DESCRIBE content types — e.g. Pages, Blog Posts, Products, FAQs. Define during content modelling phase.]'));
    }

    sections.push(createHeading('Editorial Workflow', 2));
    sections.push(createParagraph('Content follows a structured editorial workflow before publication:'));
    sections.push(...createBulletList([
      'Draft — content is being authored or edited',
      'Review — content is submitted for review by an editor or approver',
      'Scheduled — content is approved and scheduled for future publication',
      'Published — content is live and visible to end users',
      'Archived — content is removed from the live site but retained for reference',
    ]));

    sections.push(createHeading('Content Delivery', 2));
    sections.push(createParagraph(`Content is fetched from ${cmsProvider} via its API and cached at the application level:`));
    sections.push(...createBulletList([
      'Responses are cached with a configurable TTL (default: 60 seconds)',
      'Webhook-triggered cache invalidation ensures near-instant content updates on publish',
      'Preview mode allows editors to see unpublished changes in the context of the live site',
      'Static site generation (SSG) or incremental static regeneration (ISR) where applicable',
    ]));
  }

  // --- 11. Search Architecture (conditional) ---
  if (flags.needs_search) {
    sections.push(createHeading('Search Architecture', 1));

    const searchTech = params['search-technology'] || '[Search technology to be confirmed]';
    sections.push(createParagraph(`Full-text search is powered by ${searchTech}. The search system operates as a secondary data store — the primary database remains the source of truth.`));

    sections.push(createHeading('Indexing Strategy', 2));
    sections.push(createParagraph('Content is indexed asynchronously to avoid impacting write performance on the primary database:'));
    sections.push(...createBulletList([
      'Index updates are triggered by data change events (create, update, delete)',
      'A background worker processes index updates from an event queue',
      'Full re-indexing can be triggered manually for schema changes or recovery',
      'Index schema defines searchable fields, facets, filters, and ranking weights',
      'Synonyms and stop words are configured per content type',
    ]));

    sections.push(createHeading('Query Pipeline', 2));
    sections.push(createParagraph('Search queries pass through a pipeline that transforms user input into optimised search engine queries:'));
    sections.push(...createBulletList([
      'Input sanitisation — strip special characters, normalise whitespace',
      'Query expansion — apply synonyms and stemming rules',
      'Filtering — apply facet filters, access control filters, and content type restrictions',
      'Ranking — apply relevance scoring with configurable boosting rules',
      'Results — return paginated results with highlights, facet counts, and suggestions',
      'Telemetry — log search queries and click-through rates for ranking improvement',
    ]));
  }

  // --- 12. Integration Architecture ---
  const allIntNames = [...new Set([...activeIntegrations, ...ctxIntegrations.map(i => typeof i === 'string' ? i : i.name || '').filter(Boolean)])];
  if (allIntNames.length || activeIntegrations.length) {
    const intCount = allIntNames.length || activeIntegrations.length;
    sections.push(createHeading('Integration Architecture', 1));
    sections.push(createParagraph(`${projectName} integrates with ${intCount} external service(s). Each integration is encapsulated in a dedicated service module following consistent patterns for reliability and maintainability.`));

    sections.push(createHeading('Integration Patterns', 2));
    sections.push(createParagraph('All integrations follow these standard patterns:'));
    sections.push(...createBulletList([
      'Circuit breaker — prevents cascading failures when an external service is unavailable',
      'Retry with exponential backoff — transient failures are retried automatically (max 3 attempts)',
      'Timeout enforcement — all outbound API calls have a configurable timeout (default: 10 seconds)',
      'Credential isolation — API keys and secrets are stored in environment variables, never in code',
      'Graceful degradation — the application remains functional when non-critical integrations are down',
      'Structured logging — all API interactions are logged with request/response metadata for debugging',
    ]));

    for (const integration of activeIntegrations) {
      const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);
      sections.push(createHeading(displayName, 2));
      sections.push(createParagraph(`[DESCRIBE the ${displayName} integration — purpose, data exchanged, sync frequency, and failure impact.]`));
      sections.push(createTable(
        ['Aspect', 'Detail'],
        [
          ['Purpose', `[DESCRIBE what ${displayName} provides to the system]`],
          ['Data Direction', '[Inbound / Outbound / Bidirectional]'],
          ['Protocol', '[REST API / GraphQL / Webhook / SDK]'],
          ['Auth Method', '[API Key / OAuth2 / Bearer Token]'],
          ['Rate Limits', '[DESCRIBE provider rate limits and how they are managed]'],
          ['Failure Impact', '[Critical / Degraded / Cosmetic]'],
        ]
      ));
    }
  }

  // --- 13. Infrastructure ---
  sections.push(createHeading('Infrastructure', 1));

  sections.push(createHeading('Hosting', 2));
  sections.push(createParagraph(`The application is hosted on ${hostingPlatform}. The hosting configuration supports zero-downtime deployments and horizontal scaling as demand requires.`));
  sections.push(...createBulletList([
    `Platform: ${hostingPlatform}`,
    `Region: ${params['hosting-region'] || '[To be confirmed — select closest to target user base]'}`,
    'Auto-scaling: configured based on CPU/memory thresholds and request queue depth',
    'Health checks: HTTP health endpoint polled every 30 seconds',
  ]));

  sections.push(createHeading('CDN', 2));
  const cdn = params['cdn'] || '[CDN provider to be confirmed]';
  sections.push(createParagraph(`Static assets are served via ${cdn}. CDN configuration:`));
  sections.push(...createBulletList([
    'Automatic compression (gzip/brotli) for text-based assets',
    'Image optimisation and responsive image serving where supported',
    'Cache-busting via content-hashed filenames in the build pipeline',
    'Custom cache rules — immutable for hashed files, short TTL for HTML',
  ]));

  sections.push(createHeading('DNS & SSL', 2));
  sections.push(createParagraph('DNS and SSL are configured for security and performance:'));
  sections.push(...createBulletList([
    'DNS managed via [provider to be confirmed] with low TTL during launch, increased after stabilisation',
    'SSL certificates provisioned automatically (Let\'s Encrypt or platform-managed)',
    'HSTS headers enabled with a 1-year max-age after initial verification period',
    'CAA DNS records restrict certificate issuance to authorised certificate authorities',
  ]));

  sections.push(createHeading('Monitoring & Alerting', 2));
  sections.push(createParagraph('Application health is monitored continuously:'));
  sections.push(createTable(
    ['Signal', 'Tool', 'Threshold'],
    [
      ['Uptime', params['monitoring-tool'] || '[To be confirmed]', '99.9% availability target'],
      ['Error Rate', 'Application logs + alerting', '> 1% error rate triggers alert'],
      ['Response Time', 'APM / structured logs', 'p95 > 500ms triggers investigation'],
      ['CPU / Memory', 'Platform metrics', '> 80% sustained triggers scaling event'],
      ['Disk Usage', 'Platform metrics', '> 85% triggers cleanup or expansion'],
      ['SSL Expiry', 'Certificate monitoring', 'Alert 30 days before expiry'],
    ]
  ));

  // --- 14. Scalability & Performance ---
  sections.push(createHeading('Scalability & Performance', 1));

  sections.push(createHeading('Performance Targets', 2));
  sections.push(createTable(
    ['Operation', 'Target', 'Measurement'],
    [
      ['Page Load (initial)', '< 2 seconds', 'First Contentful Paint on 4G connection'],
      ['Page Load (subsequent)', '< 500ms', 'Client-side navigation with cached assets'],
      ['API Response (read)', '< 200ms', 'p95 response time for GET endpoints'],
      ['API Response (write)', '< 500ms', 'p95 response time for POST/PUT/DELETE endpoints'],
      ['Search', '< 300ms', 'p95 response time for search queries'],
      ['Background Jobs', '< 30 seconds', 'p95 completion time for async processing'],
    ]
  ));
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

  sections.push(createHeading('Connection Pooling', 2));
  if (flags.needs_database) {
    sections.push(createParagraph('Database connections are managed through a connection pool to avoid the overhead of establishing new connections on every request:'));
    sections.push(...createBulletList([
      'Pool size is configured based on the hosting platform limits and expected concurrency',
      'Idle connections are reaped after a configurable timeout (default: 30 seconds)',
      'Connection health is verified before checkout from the pool',
      'Pool exhaustion triggers a warning alert and queues requests rather than failing immediately',
    ]));
  } else {
    sections.push(createParagraph('External service connections (HTTP clients, message queues) use connection pooling and keep-alive to reduce latency and resource consumption.'));
  }

  sections.push(createHeading('Scaling Strategy', 2));
  sections.push(createParagraph('The system scales horizontally — additional instances handle increased load:'));
  sections.push(...createBulletList([
    'Application servers are stateless — no in-memory session state between requests',
    'Horizontal scaling via additional container instances behind a load balancer',
    'Database scaling via read replicas (read-heavy) or sharding (write-heavy, if required)',
    'CDN absorbs static asset traffic, reducing load on application servers',
    'Background job processing scales independently of the web tier',
  ]));

  // --- 15. Security Overview ---
  sections.push(createHeading('Security Overview', 1));
  sections.push(createParagraph(`Security is a foundational concern for ${projectName}. Controls are layered (defence in depth) and validated during code review, automated testing, and periodic security audits.`));

  sections.push(createHeading('Threat Model', 2));
  sections.push(createParagraph('The following threat categories are addressed by the architecture:'));
  sections.push(createTable(
    ['Threat', 'Mitigation', 'Layer'],
    [
      ['Injection (SQL, XSS, CSRF)', 'Parameterised queries, output encoding, CSRF tokens, CSP headers', 'Application'],
      ['Broken Authentication', 'Strong password policy, MFA, account lockout, token rotation', 'Authentication'],
      ['Sensitive Data Exposure', 'AES-256 encryption at rest, TLS 1.2+ in transit, minimal data retention', 'Data'],
      ['Broken Access Control', 'RBAC enforced at middleware, principle of least privilege', 'Authorisation'],
      ['Security Misconfiguration', 'Hardened defaults, environment-specific config, no default credentials', 'Infrastructure'],
      ['Vulnerable Dependencies', 'Automated scanning (npm audit/Snyk), regular updates, lockfile pinning', 'Supply Chain'],
      ['DDoS', 'Rate limiting, CDN absorption, WAF rules', 'Network'],
    ]
  ));

  sections.push(createHeading('Encryption', 2));
  sections.push(...createBulletList([
    'Data at rest: sensitive fields encrypted using AES-256-GCM (application-level encryption before storage)',
    'Data in transit: all communication uses TLS 1.2+ (HTTPS enforced, HTTP redirects to HTTPS)',
    'Secrets management: API keys, database credentials, and encryption keys stored in environment variables or a secrets manager',
    'Key rotation: encryption keys have defined rotation schedules with backward-compatible decryption',
  ]));

  sections.push(createHeading('Secrets Management', 2));
  sections.push(createParagraph('Application secrets are managed with the following controls:'));
  sections.push(...createBulletList([
    'Secrets are never stored in source code, configuration files, or logs',
    'Environment variables are the primary mechanism for injecting secrets at runtime',
    'Production secrets are managed via the hosting platform\'s secret store or a dedicated secrets manager',
    '.env files are used in development only and are excluded from version control via .gitignore',
    'Secret rotation is supported without application restarts where possible',
  ]));

  sections.push(createHeading('Security Headers', 2));
  sections.push(createParagraph('The following HTTP security headers are configured on all responses:'));
  sections.push(createTable(
    ['Header', 'Value', 'Purpose'],
    [
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains', 'Enforce HTTPS for 1 year'],
      ['Content-Security-Policy', '[DEFINE per-page CSP policy]', 'Prevent XSS and data injection'],
      ['X-Content-Type-Options', 'nosniff', 'Prevent MIME-type sniffing'],
      ['X-Frame-Options', 'DENY', 'Prevent clickjacking'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin', 'Limit referrer information leakage'],
      ['Permissions-Policy', '[DEFINE based on required browser APIs]', 'Restrict browser feature access'],
    ]
  ));

  // --- 16. Deployment Architecture ---
  sections.push(createHeading('Deployment Architecture', 1));

  sections.push(createHeading('Environments', 2));
  sections.push(createTable(
    ['Environment', 'Purpose', 'Deploy Trigger', 'URL'],
    [
      ['Development', 'Local developer machines, feature branches', 'Manual (local)', 'localhost'],
      ['Staging', 'Pre-production testing, QA, client review', 'Automatic on merge to main', '[STAGING URL]'],
      ['Production', 'Live application serving end users', 'Manual promotion from staging', '[PRODUCTION URL]'],
    ]
  ));
  sections.push(createParagraph('Environment-specific configuration is managed through environment variables. A .env.example file documents all required variables without exposing secrets.'));

  sections.push(createHeading('CI/CD Pipeline', 2));
  const ciPlatform = params['ci-platform'] || 'GitHub Actions';
  sections.push(createParagraph(`Continuous integration and deployment is managed via ${ciPlatform}. The pipeline runs on every push to the main branch and on all pull requests.`));
  sections.push(createParagraph('Pipeline stages:'));
  sections.push(...createBulletList([
    'Lint — code style and formatting checks',
    'Type check — static type analysis (where applicable)',
    'Unit tests — fast, isolated tests for business logic',
    'Integration tests — API and database integration tests',
    'Security scan — dependency vulnerability scanning',
    'Build — production build with optimisation',
    'Deploy (main branch only) — deploy to staging automatically, production with manual approval',
  ]));

  sections.push(createHeading('Rollback Strategy', 2));
  sections.push(createParagraph('Deployments can be rolled back quickly if issues are detected in production:'));
  sections.push(...createBulletList([
    'Previous deployment artifacts are retained for immediate rollback',
    'Database migrations are designed to be backward-compatible (application can run against the previous migration)',
    'Feature flags allow disabling new features without a full rollback',
    'Rollback is triggered manually via the CI/CD platform or hosting dashboard',
    'Rollback target: < 5 minutes from decision to completion',
  ]));

  sections.push(createHeading('Release Process', 2));
  sections.push(createParagraph('The release process follows a controlled flow:'));
  sections.push(...createBulletList([
    'Feature branches are merged to main via pull request with required code review',
    'Main branch deploys automatically to staging for integration testing',
    'Staging is verified (manual or automated smoke tests) before production promotion',
    'Production deploys are triggered manually by an authorised team member',
    'Post-deploy verification confirms the release is healthy (health checks, error rate monitoring)',
    'Release notes are generated from commit messages and PR descriptions',
  ]));

  // --- 17. Assumptions & Constraints ---
  sections.push(createHeading('Assumptions & Constraints', 1));

  sections.push(createHeading('Assumptions', 2));
  const assumptions = params['assumptions'] || [
    `${clientName} will provide all required content, assets, and credentials in a timely manner`,
    'Third-party services (hosting, APIs, payment processors) will remain available and maintain their current API contracts',
    'The project scope is as defined in the accompanying Statement of Work — changes require a formal change request',
    'Development and staging environments will be available throughout the project lifecycle',
    'The target user base and traffic volumes are as documented in the project brief',
  ];
  if (Array.isArray(assumptions) && assumptions.length) {
    sections.push(...createBulletList(assumptions));
  }

  sections.push(createHeading('Technical Constraints', 2));
  const constraints = params['technical-constraints'] || [];
  const defaultConstraints = [
    'The application must run on modern server infrastructure (Node.js 20+ or equivalent)',
    'All third-party dependencies must be actively maintained with no known critical vulnerabilities',
    'The codebase must be deployable from a single Git repository',
    'Browser support: last 2 versions of Chrome, Firefox, Safari, Edge',
    'The system must be operable by a single developer for ongoing maintenance',
  ];
  const allConstraints = Array.isArray(constraints) && constraints.length ? constraints : defaultConstraints;
  sections.push(...createBulletList(allConstraints));

  sections.push(createHeading('Risks & Mitigations', 2));
  sections.push(createParagraph('The following architectural risks have been identified and mitigated:'));
  sections.push(createTable(
    ['Risk', 'Impact', 'Mitigation'],
    [
      ['Third-party service outage', 'Feature degradation', 'Circuit breakers, graceful degradation, cached fallbacks'],
      ['Data loss', 'Critical', 'Automated backups, point-in-time recovery, tested restore procedures'],
      ['Security breach', 'Critical', 'Defence in depth, automated scanning, incident response plan'],
      ['Performance degradation under load', 'User experience', 'Load testing, auto-scaling, performance budgets'],
      ['Vendor lock-in', 'Long-term flexibility', 'Abstraction layers for cloud services, standard protocols'],
      ['Key person dependency', 'Project continuity', 'Comprehensive documentation, infrastructure as code'],
    ]
  ));

  sections.push(createHeading('Document Revision History', 2));
  sections.push(createTable(
    ['Version', 'Date', 'Author', 'Changes'],
    [
      ['v1.0', formatDate(new Date()), company.name || '[AUTHOR]', 'Initial architecture document'],
    ]
  ));

  return createDocument({
    title: 'Architecture Document',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
