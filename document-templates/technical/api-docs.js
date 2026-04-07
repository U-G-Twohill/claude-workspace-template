// API Documentation template
// Generates a comprehensive API reference document from docs-state parameters and module flags

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
  const baseUrl = params['api-base-url'] || `https://api.${meta['project-slug'] || '[PLACEHOLDER]'}.com`;
  const apiVersion = params['api-version'] || 'v1';
  const authMethod = params['api-auth-strategy'] || 'Bearer token (JWT)';
  const rateLimit = params['rate-limit'] || '100 requests per minute per authenticated user';
  const company = getCompanyInfo(brandConfig || {});

  const activeIntegrations = Object.keys(integrations).filter(k => integrations[k] === 'active');
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxFramework = ctx.framework || '';
  const ctxScripts = ctx.scripts || {};
  const ctxApiDeps = listDependencies(docsState, 'api').length
    ? listDependencies(docsState, 'api')
    : listDependencies(docsState, 'framework');

  const sections = [];

  // --- 1. Overview ---
  sections.push(createHeading('Overview', 1));
  sections.push(createParagraph(`This document provides the complete API reference for ${projectName}. It covers authentication, available endpoints, request/response formats, error handling, and integration details.`));
  const frameworkDesc = ctxFramework
    ? `This API is built with ${ctxFramework} and follows RESTful design principles with consistent URL patterns, standard HTTP methods, and predictable response structures across all resources.`
    : 'This API follows RESTful design principles with consistent URL patterns, standard HTTP methods, and predictable response structures across all resources.';
  sections.push(createParagraph(frameworkDesc));

  // Include discovered API-related packages if available
  if (ctxApiDeps.length) {
    sections.push(createHeading('Key Packages', 3));
    sections.push(createParagraph('The API layer uses the following packages:'));
    sections.push(...createBulletList(ctxApiDeps));
  }

  // Include dev/test scripts if available
  if (Object.keys(ctxScripts).length) {
    const scriptEntries = Object.entries(ctxScripts)
      .filter(([name]) => /dev|start|test|lint|build/i.test(name))
      .map(([name, cmd]) => `${name}: ${cmd}`);
    if (scriptEntries.length) {
      sections.push(createHeading('Development Commands', 3));
      sections.push(...createBulletList(scriptEntries));
    }
  }

  sections.push(createHeading('Base URL', 2));
  sections.push(createParagraph(`All API requests are made to the following base URL:`));
  sections.push(createParagraph(`${baseUrl}/${apiVersion}`, { bold: true }));

  sections.push(createHeading('Environments', 3));
  sections.push(createTable(
    ['Environment', 'Base URL', 'Purpose'],
    [
      ['Production', `${baseUrl}/${apiVersion}`, 'Live API serving end users'],
      ['Staging', `${baseUrl.replace('api.', 'staging-api.')}/${apiVersion}`, 'Pre-production testing and QA'],
      ['Development', `http://localhost:${params['dev-port'] || '3000'}/api/${apiVersion}`, 'Local development'],
    ]
  ));

  sections.push(createHeading('Versioning Strategy', 2));
  sections.push(createParagraph(`The API uses URL path versioning (e.g. /${apiVersion}/). Breaking changes are introduced in new API versions. Non-breaking additions (new fields, new endpoints) are added to the current version without incrementing.`));
  sections.push(...createBulletList([
    'The current stable version is ' + apiVersion,
    'Deprecated versions receive security patches only for 6 months after deprecation notice',
    'The API version is required in all request URLs',
    'Clients should handle unknown response fields gracefully (forward-compatible parsing)',
  ]));

  sections.push(createHeading('Content Type', 2));
  sections.push(createParagraph('All requests and responses use JSON. Include the following headers on all requests:'));
  sections.push(...createBulletList([
    'Content-Type: application/json (for request bodies)',
    'Accept: application/json',
  ]));

  // --- 2. Authentication ---
  sections.push(createHeading('Authentication', 1));
  sections.push(createParagraph(`The API uses ${authMethod} for authentication. All endpoints except those explicitly marked as public require a valid authentication token.`));

  sections.push(createHeading('Obtaining a Token', 2));
  sections.push(createParagraph('Authenticate by sending credentials to the token endpoint:'));
  sections.push(createTable(
    ['Field', 'Value'],
    [
      ['Endpoint', `POST ${baseUrl}/${apiVersion}/auth/token`],
      ['Content-Type', 'application/json'],
      ['Body', '{ "email": "[USER_EMAIL]", "password": "[USER_PASSWORD]" }'],
    ]
  ));
  sections.push(createParagraph('A successful response returns:'));
  sections.push(...createBulletList([
    'access_token — short-lived token for API requests (default: 15 minutes)',
    'refresh_token — long-lived token for obtaining new access tokens (default: 7 days)',
    'expires_in — access token lifetime in seconds',
    'token_type — always "Bearer"',
  ]));

  sections.push(createHeading('Using the Token', 2));
  sections.push(createParagraph('Include the access token in the Authorization header on all authenticated requests:'));
  sections.push(createParagraph('Authorization: Bearer [ACCESS_TOKEN]', { bold: true }));

  sections.push(createHeading('Refreshing Tokens', 2));
  sections.push(createParagraph('When an access token expires, use the refresh token to obtain a new pair:'));
  sections.push(createTable(
    ['Field', 'Value'],
    [
      ['Endpoint', `POST ${baseUrl}/${apiVersion}/auth/refresh`],
      ['Body', '{ "refresh_token": "[REFRESH_TOKEN]" }'],
    ]
  ));
  sections.push(...createBulletList([
    'Refresh tokens are single-use — a new refresh token is issued with each access token',
    'If the refresh token is expired or invalid, the user must re-authenticate',
    'Refresh tokens are invalidated on logout or password change',
  ]));

  sections.push(createHeading('Revoking Tokens', 2));
  sections.push(createParagraph('To log out or invalidate a session:'));
  sections.push(createTable(
    ['Field', 'Value'],
    [
      ['Endpoint', `POST ${baseUrl}/${apiVersion}/auth/revoke`],
      ['Body', '{ "refresh_token": "[REFRESH_TOKEN]" }'],
    ]
  ));

  // --- 3. Common Patterns ---
  sections.push(createHeading('Common Patterns', 1));

  sections.push(createHeading('Pagination', 2));
  sections.push(createParagraph('All list endpoints support cursor-based pagination. Include the following query parameters:'));
  sections.push(createTable(
    ['Parameter', 'Type', 'Default', 'Description'],
    [
      ['limit', 'integer', '20', 'Number of items per page (max 100)'],
      ['cursor', 'string', '(none)', 'Opaque cursor from a previous response'],
      ['order', 'string', 'desc', 'Sort order: asc or desc'],
    ]
  ));
  sections.push(createParagraph('Paginated responses include a meta object:'));
  sections.push(...createBulletList([
    'meta.has_more — boolean indicating if more results exist',
    'meta.next_cursor — cursor value for the next page (null if no more results)',
    'meta.total — total count of matching items (included when cost is acceptable)',
  ]));

  sections.push(createHeading('Filtering', 2));
  sections.push(createParagraph('List endpoints accept filter parameters as query strings. Common filters include:'));
  sections.push(createTable(
    ['Parameter', 'Type', 'Example', 'Description'],
    [
      ['status', 'string', '?status=active', 'Filter by resource status'],
      ['created_after', 'ISO 8601', '?created_after=2026-01-01T00:00:00Z', 'Items created after this date'],
      ['created_before', 'ISO 8601', '?created_before=2026-12-31T23:59:59Z', 'Items created before this date'],
      ['q', 'string', '?q=search+term', 'Full-text search across searchable fields'],
    ]
  ));
  sections.push(createParagraph('Multiple filters can be combined. All filters use AND logic.'));

  sections.push(createHeading('Sorting', 2));
  sections.push(createParagraph('Sorting is controlled via query parameters:'));
  sections.push(...createBulletList([
    'sort — field name to sort by (e.g. ?sort=created_at)',
    'order — sort direction: asc or desc (default: desc)',
    'Available sort fields are documented per endpoint',
  ]));

  sections.push(createHeading('Response Envelope', 2));
  sections.push(createParagraph('All successful responses follow a consistent envelope structure:'));
  sections.push(...createBulletList([
    'data — the requested resource or array of resources',
    'meta — pagination info, request metadata (for list endpoints)',
    'Single-resource endpoints return { "data": { ... } }',
    'List endpoints return { "data": [ ... ], "meta": { ... } }',
  ]));

  sections.push(createHeading('Error Response Format', 2));
  sections.push(createParagraph('All error responses use a consistent JSON structure:'));
  sections.push(...createBulletList([
    'status — HTTP status code',
    'error — machine-readable error code (e.g. VALIDATION_FAILED)',
    'message — human-readable description',
    'details — array of field-level errors (for validation failures)',
    'request_id — unique identifier for tracing and support',
  ]));

  // --- 4. Error Codes ---
  sections.push(createHeading('Error Codes', 1));

  sections.push(createHeading('HTTP Status Codes', 2));
  sections.push(createTable(
    ['Status', 'Meaning', 'When Returned'],
    [
      ['200', 'OK', 'Successful GET, PUT, PATCH, or DELETE request'],
      ['201', 'Created', 'Successful POST request that created a resource'],
      ['204', 'No Content', 'Successful DELETE with no response body'],
      ['400', 'Bad Request', 'Invalid request body, missing required fields, malformed JSON'],
      ['401', 'Unauthorised', 'Missing or invalid authentication token'],
      ['403', 'Forbidden', 'Valid token but insufficient permissions for the requested action'],
      ['404', 'Not Found', 'Requested resource does not exist'],
      ['409', 'Conflict', 'Resource state conflict (e.g. duplicate email, version mismatch)'],
      ['422', 'Unprocessable Entity', 'Request is well-formed but fails business validation rules'],
      ['429', 'Too Many Requests', 'Rate limit exceeded'],
      ['500', 'Internal Server Error', 'Unexpected server-side error'],
      ['502', 'Bad Gateway', 'Upstream service unavailable'],
      ['503', 'Service Unavailable', 'API is temporarily down for maintenance'],
    ]
  ));

  sections.push(createHeading('Application Error Codes', 2));
  sections.push(createParagraph('In addition to HTTP status codes, the error field in error responses contains a machine-readable application error code:'));
  sections.push(createTable(
    ['Error Code', 'HTTP Status', 'Description'],
    [
      ['VALIDATION_REQUIRED', '400', 'A required field is missing'],
      ['VALIDATION_FORMAT', '400', 'A field value does not match the expected format'],
      ['VALIDATION_RANGE', '400', 'A numeric value is outside the acceptable range'],
      ['AUTH_TOKEN_MISSING', '401', 'No Authorization header provided'],
      ['AUTH_TOKEN_EXPIRED', '401', 'The access token has expired'],
      ['AUTH_TOKEN_INVALID', '401', 'The token is malformed or has been revoked'],
      ['AUTH_INSUFFICIENT_SCOPE', '403', 'The token does not have the required permissions'],
      ['RESOURCE_NOT_FOUND', '404', 'The requested resource does not exist'],
      ['RESOURCE_CONFLICT', '409', 'A conflicting resource already exists'],
      ['RATE_LIMIT_EXCEEDED', '429', 'Too many requests — retry after the specified interval'],
      ['INTERNAL_ERROR', '500', 'An unexpected error occurred on the server'],
      ['SERVICE_UNAVAILABLE', '503', 'A dependent service is temporarily unavailable'],
    ]
  ));

  // --- 5. Rate Limiting ---
  sections.push(createHeading('Rate Limiting', 1));
  sections.push(createParagraph(`API requests are rate-limited to ensure fair usage and system stability. The default limit is ${rateLimit}.`));

  sections.push(createHeading('Rate Limit Tiers', 2));
  sections.push(createTable(
    ['Tier', 'Limit', 'Applies To'],
    [
      ['Standard', rateLimit, 'All authenticated API users'],
      ['Unauthenticated', '20 requests per minute per IP', 'Public endpoints without authentication'],
      ['Webhook', '10 requests per second per endpoint', 'Inbound webhook receivers'],
      ['Bulk Operations', '10 requests per minute', 'Bulk import/export endpoints'],
    ]
  ));

  sections.push(createHeading('Rate Limit Headers', 2));
  sections.push(createParagraph('Every API response includes rate limit information in the response headers:'));
  sections.push(createTable(
    ['Header', 'Description', 'Example'],
    [
      ['X-RateLimit-Limit', 'Maximum requests allowed in the current window', '100'],
      ['X-RateLimit-Remaining', 'Requests remaining in the current window', '87'],
      ['X-RateLimit-Reset', 'Unix timestamp when the rate limit window resets', '1711843200'],
      ['Retry-After', 'Seconds to wait before retrying (only on 429 responses)', '30'],
    ]
  ));

  sections.push(createHeading('Backoff Strategy', 2));
  sections.push(createParagraph('When you receive a 429 response, implement exponential backoff:'));
  sections.push(...createBulletList([
    'Read the Retry-After header to determine the minimum wait time',
    'First retry: wait Retry-After seconds (or 1 second if header absent)',
    'Subsequent retries: double the wait time (2s, 4s, 8s, ...)',
    'Maximum backoff: 60 seconds between retries',
    'Maximum retry attempts: 5 before failing the request',
    'Add jitter (random 0-500ms) to prevent thundering herd on recovery',
  ]));

  // --- 6. Resource Endpoints ---
  sections.push(createHeading('Resource Endpoints', 1));
  sections.push(createParagraph(`The following sections detail the available API endpoints, grouped by resource. All endpoints use the base URL: ${baseUrl}/${apiVersion}`));

  // 6a. User Management (conditional on needs_auth)
  if (flags.needs_auth) {
    sections.push(createHeading('User Management', 2));
    sections.push(createParagraph('Endpoints for managing user accounts, profiles, and roles. All endpoints require authentication unless noted.'));

    sections.push(createHeading('List Users', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/users`],
        ['Auth', 'Required (admin or manager role)'],
        ['Description', 'Retrieve a paginated list of users'],
      ]
    ));
    sections.push(createParagraph('Query Parameters:'));
    sections.push(createTable(
      ['Parameter', 'Type', 'Required', 'Description'],
      [
        ['role', 'string', 'No', 'Filter by user role'],
        ['status', 'string', 'No', 'Filter by account status (active, suspended, pending)'],
        ['q', 'string', 'No', 'Search by name or email'],
        ['limit', 'integer', 'No', 'Items per page (default: 20, max: 100)'],
        ['cursor', 'string', 'No', 'Pagination cursor'],
      ]
    ));
    sections.push(createParagraph('Response: Array of user objects with id, email, name, role, status, created_at, updated_at.'));

    sections.push(createHeading('Get User', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/users/:id`],
        ['Auth', 'Required (own profile or admin)'],
        ['Description', 'Retrieve a single user by ID'],
      ]
    ));

    sections.push(createHeading('Create User', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/users`],
        ['Auth', 'Required (admin role)'],
        ['Description', 'Create a new user account'],
      ]
    ));
    sections.push(createParagraph('Request Body:'));
    sections.push(createTable(
      ['Field', 'Type', 'Required', 'Description'],
      [
        ['email', 'string', 'Yes', 'Unique email address'],
        ['name', 'string', 'Yes', 'Display name'],
        ['role', 'string', 'No', 'User role (default: user)'],
        ['password', 'string', 'Yes', 'Minimum 12 characters'],
      ]
    ));

    sections.push(createHeading('Update User', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'PATCH'],
        ['Path', `/${apiVersion}/users/:id`],
        ['Auth', 'Required (own profile or admin)'],
        ['Description', 'Update user fields (partial update)'],
      ]
    ));

    sections.push(createHeading('Delete User', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'DELETE'],
        ['Path', `/${apiVersion}/users/:id`],
        ['Auth', 'Required (admin role)'],
        ['Description', 'Soft-delete a user account'],
      ]
    ));
  }

  // 6b. Content / CMS (conditional on needs_cms)
  if (flags.needs_cms) {
    sections.push(createHeading('Content Management', 2));
    sections.push(createParagraph('Endpoints for managing content items. Supports create, read, update, delete, and publish workflows.'));

    sections.push(createHeading('List Content', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/content`],
        ['Auth', 'Required'],
        ['Description', 'Retrieve a paginated list of content items'],
      ]
    ));
    sections.push(createParagraph('Query Parameters:'));
    sections.push(createTable(
      ['Parameter', 'Type', 'Required', 'Description'],
      [
        ['type', 'string', 'No', 'Filter by content type (page, post, article)'],
        ['status', 'string', 'No', 'Filter by publish status (draft, published, archived)'],
        ['author_id', 'string', 'No', 'Filter by author'],
        ['q', 'string', 'No', 'Full-text search across title and body'],
        ['limit', 'integer', 'No', 'Items per page (default: 20, max: 100)'],
        ['cursor', 'string', 'No', 'Pagination cursor'],
      ]
    ));

    sections.push(createHeading('Get Content Item', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/content/:id`],
        ['Auth', 'Required (published items available to all roles; drafts require editor role)'],
        ['Description', 'Retrieve a single content item by ID'],
      ]
    ));

    sections.push(createHeading('Create Content', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/content`],
        ['Auth', 'Required (editor or admin role)'],
        ['Description', 'Create a new content item (starts in draft status)'],
      ]
    ));
    sections.push(createParagraph('Request Body:'));
    sections.push(createTable(
      ['Field', 'Type', 'Required', 'Description'],
      [
        ['title', 'string', 'Yes', 'Content title'],
        ['type', 'string', 'Yes', 'Content type (page, post, article)'],
        ['body', 'string', 'Yes', 'Content body (Markdown or HTML)'],
        ['slug', 'string', 'No', 'URL slug (auto-generated from title if omitted)'],
        ['tags', 'string[]', 'No', 'Array of tag identifiers'],
      ]
    ));

    sections.push(createHeading('Update Content', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'PATCH'],
        ['Path', `/${apiVersion}/content/:id`],
        ['Auth', 'Required (editor or admin role)'],
        ['Description', 'Update content fields (partial update)'],
      ]
    ));

    sections.push(createHeading('Publish Content', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/content/:id/publish`],
        ['Auth', 'Required (editor or admin role)'],
        ['Description', 'Transition content from draft to published'],
      ]
    ));

    sections.push(createHeading('Delete Content', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'DELETE'],
        ['Path', `/${apiVersion}/content/:id`],
        ['Auth', 'Required (admin role)'],
        ['Description', 'Soft-delete a content item'],
      ]
    ));
  }

  // 6c. Payments (conditional on needs_payments)
  if (flags.needs_payments) {
    const paymentProvider = params['payment-provider'] || 'Stripe';
    sections.push(createHeading('Payments', 2));
    sections.push(createParagraph(`Payment endpoints wrap the ${paymentProvider} API. The application never handles raw card data — tokenisation is performed client-side.`));

    sections.push(createHeading('Create Payment Intent', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/payments/intents`],
        ['Auth', 'Required'],
        ['Description', 'Create a payment intent for a new transaction'],
      ]
    ));
    sections.push(createParagraph('Request Body:'));
    sections.push(createTable(
      ['Field', 'Type', 'Required', 'Description'],
      [
        ['amount', 'integer', 'Yes', 'Amount in smallest currency unit (e.g. cents)'],
        ['currency', 'string', 'Yes', 'ISO 4217 currency code (e.g. NZD, USD)'],
        ['description', 'string', 'No', 'Payment description'],
        ['metadata', 'object', 'No', 'Key-value metadata attached to the payment'],
      ]
    ));

    sections.push(createHeading('List Payments', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/payments`],
        ['Auth', 'Required (own payments or admin)'],
        ['Description', 'List payment history with pagination and filtering'],
      ]
    ));

    sections.push(createHeading('Get Payment', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/payments/:id`],
        ['Auth', 'Required (own payment or admin)'],
        ['Description', 'Retrieve payment details by ID'],
      ]
    ));

    sections.push(createHeading('Create Refund', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/payments/:id/refund`],
        ['Auth', 'Required (admin role)'],
        ['Description', 'Initiate a full or partial refund'],
      ]
    ));
    sections.push(createParagraph('Request Body:'));
    sections.push(createTable(
      ['Field', 'Type', 'Required', 'Description'],
      [
        ['amount', 'integer', 'No', 'Partial refund amount (omit for full refund)'],
        ['reason', 'string', 'Yes', 'Reason for refund (customer_request, duplicate, fraudulent)'],
      ]
    ));
  }

  // 6d. Search (conditional on needs_search)
  if (flags.needs_search) {
    sections.push(createHeading('Search', 2));
    sections.push(createParagraph('Full-text search across indexed resources. Returns ranked results with relevance scoring.'));

    sections.push(createHeading('Search Resources', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'GET'],
        ['Path', `/${apiVersion}/search`],
        ['Auth', 'Required'],
        ['Description', 'Search across all indexed resources'],
      ]
    ));
    sections.push(createParagraph('Query Parameters:'));
    sections.push(createTable(
      ['Parameter', 'Type', 'Required', 'Description'],
      [
        ['q', 'string', 'Yes', 'Search query string'],
        ['type', 'string', 'No', 'Limit search to a specific resource type'],
        ['limit', 'integer', 'No', 'Results per page (default: 20, max: 50)'],
        ['cursor', 'string', 'No', 'Pagination cursor'],
      ]
    ));
    sections.push(createParagraph('Response includes data array with: id, type, title, excerpt (highlighted match), score, and the matched resource object.'));

    sections.push(createHeading('Reindex', 3));
    sections.push(createTable(
      ['Field', 'Value'],
      [
        ['Method', 'POST'],
        ['Path', `/${apiVersion}/search/reindex`],
        ['Auth', 'Required (admin role)'],
        ['Description', 'Trigger a full reindex of all searchable resources'],
      ]
    ));
  }

  // 6e. Custom Resources (always included)
  sections.push(createHeading('Custom Resources', 2));
  sections.push(createParagraph(`The following resource endpoints are specific to ${projectName}. Replace [PLACEHOLDER] values with actual resource names and fields during implementation.`));

  sections.push(createHeading('[RESOURCE_NAME] Endpoints', 3));
  sections.push(createTable(
    ['Method', 'Path', 'Auth', 'Description'],
    [
      ['GET', `/${apiVersion}/[resources]`, 'Required', 'List [RESOURCE_NAME] items with pagination'],
      ['GET', `/${apiVersion}/[resources]/:id`, 'Required', 'Get a single [RESOURCE_NAME] by ID'],
      ['POST', `/${apiVersion}/[resources]`, 'Required', 'Create a new [RESOURCE_NAME]'],
      ['PATCH', `/${apiVersion}/[resources]/:id`, 'Required', 'Update a [RESOURCE_NAME] (partial update)'],
      ['DELETE', `/${apiVersion}/[resources]/:id`, 'Required (admin)', 'Delete a [RESOURCE_NAME]'],
    ]
  ));
  sections.push(createParagraph('[PLACEHOLDER] — Define request body fields, response shape, and query parameters for each custom resource during implementation.'));

  // --- 7. Webhooks ---
  sections.push(createHeading('Webhooks', 1));
  sections.push(createParagraph('The API can send webhook notifications to registered URLs when specific events occur. Webhooks are delivered as HTTP POST requests with a JSON payload.'));

  sections.push(createHeading('Registering a Webhook', 2));
  sections.push(createTable(
    ['Field', 'Value'],
    [
      ['Method', 'POST'],
      ['Path', `/${apiVersion}/webhooks`],
      ['Auth', 'Required (admin role)'],
      ['Description', 'Register a new webhook endpoint'],
    ]
  ));
  sections.push(createParagraph('Request Body:'));
  sections.push(createTable(
    ['Field', 'Type', 'Required', 'Description'],
    [
      ['url', 'string', 'Yes', 'HTTPS URL to receive webhook payloads'],
      ['events', 'string[]', 'Yes', 'Array of event types to subscribe to'],
      ['secret', 'string', 'No', 'Shared secret for payload signing (auto-generated if omitted)'],
    ]
  ));

  sections.push(createHeading('Available Events', 2));
  const webhookEvents = [
    ['resource.created', 'A new resource was created'],
    ['resource.updated', 'A resource was modified'],
    ['resource.deleted', 'A resource was deleted'],
  ];
  if (flags.needs_auth) {
    webhookEvents.push(
      ['user.created', 'A new user account was created'],
      ['user.updated', 'A user profile was modified'],
      ['user.deleted', 'A user account was deleted'],
    );
  }
  if (flags.needs_payments) {
    webhookEvents.push(
      ['payment.completed', 'A payment was successfully processed'],
      ['payment.failed', 'A payment attempt failed'],
      ['payment.refunded', 'A refund was issued'],
    );
  }
  if (flags.needs_cms) {
    webhookEvents.push(
      ['content.published', 'Content was published'],
      ['content.unpublished', 'Content was unpublished'],
    );
  }
  sections.push(createTable(['Event', 'Description'], webhookEvents));

  sections.push(createHeading('Payload Format', 2));
  sections.push(createParagraph('All webhook payloads follow a consistent structure:'));
  sections.push(...createBulletList([
    'id — unique event identifier (UUID)',
    'type — event type string (e.g. resource.created)',
    'created_at — ISO 8601 timestamp of when the event occurred',
    'data — the affected resource object',
    'webhook_id — the registered webhook that triggered this delivery',
  ]));

  sections.push(createHeading('Signature Verification', 2));
  sections.push(createParagraph('Each webhook delivery includes an X-Webhook-Signature header containing an HMAC-SHA256 signature of the request body, signed with the webhook secret. Always verify this signature before processing the payload.'));

  sections.push(createHeading('Retry Policy', 2));
  sections.push(createParagraph('Failed webhook deliveries (non-2xx response or timeout) are retried with exponential backoff:'));
  sections.push(...createBulletList([
    'Attempt 1: immediate',
    'Attempt 2: 1 minute after failure',
    'Attempt 3: 5 minutes after previous attempt',
    'Attempt 4: 30 minutes after previous attempt',
    'Attempt 5: 2 hours after previous attempt',
    'After 5 failed attempts, the webhook is marked as failing and an alert is raised',
    'Webhooks that fail consecutively for 7 days are automatically disabled',
  ]));

  // --- 8. Integration Endpoints ---
  if (activeIntegrations.length) {
    sections.push(createHeading('Integration Endpoints', 1));
    sections.push(createParagraph(`${projectName} exposes dedicated endpoints for each active third-party integration. These endpoints handle inbound data, synchronisation, and integration-specific operations.`));

    for (const integration of activeIntegrations) {
      const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);
      sections.push(createHeading(displayName, 2));
      sections.push(createParagraph(`Endpoints for the ${displayName} integration.`));

      sections.push(createTable(
        ['Method', 'Path', 'Auth', 'Description'],
        [
          ['GET', `/${apiVersion}/integrations/${integration}/status`, 'Required (admin)', `Check ${displayName} connection status`],
          ['POST', `/${apiVersion}/integrations/${integration}/sync`, 'Required (admin)', `Trigger a manual sync with ${displayName}`],
          ['POST', `/${apiVersion}/integrations/${integration}/webhook`, 'Webhook signature', `Receive inbound events from ${displayName}`],
        ]
      ));
      sections.push(...createBulletList([
        `Credentials for ${displayName} are stored as encrypted environment variables`,
        `Sync operations are idempotent — safe to retry on failure`,
        `Inbound webhooks verify the ${displayName}-provided signature before processing`,
        `[PLACEHOLDER] — Add ${displayName}-specific endpoints as integration requirements are defined`,
      ]));
    }
  }

  // --- 9. Changelog ---
  sections.push(createHeading('Changelog', 1));
  sections.push(createParagraph('All API changes are documented here in reverse chronological order. Breaking changes are highlighted and announced in advance.'));

  const today = new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
  sections.push(createTable(
    ['Date', 'Version', 'Change', 'Type'],
    [
      [today, apiVersion, 'Initial API documentation published', 'Documentation'],
      ['[PLACEHOLDER]', '[PLACEHOLDER]', '[PLACEHOLDER] — Document future API changes here', 'Feature / Breaking / Deprecation / Fix'],
    ]
  ));

  sections.push(createParagraph('Change types: Feature (new endpoint or field), Breaking (requires client changes), Deprecation (advance notice of removal), Fix (bug fix with no breaking change).'));

  return createDocument({
    title: 'API Documentation',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
