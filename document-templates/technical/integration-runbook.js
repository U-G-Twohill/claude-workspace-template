// Integration Runbook document template
// Generates a comprehensive per-project integration runbook covering all active integrations

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

/**
 * Known integration details for recognised services.
 * Returns service metadata, setup procedures, auth methods, key endpoints,
 * configuration, error handling, health checks, and troubleshooting.
 */
function getIntegrationDetails(name) {
  const knownIntegrations = {
    stripe: {
      displayName: 'Stripe',
      category: 'Payments',
      purpose: 'Payment processing, subscriptions, invoicing, and financial reporting',
      authMethod: 'API Key (Secret Key + Publishable Key)',
      setupProcedure: [
        'Create a Stripe account at https://dashboard.stripe.com/register',
        'Complete business verification and activate the account',
        'Navigate to Developers > API Keys to retrieve keys',
        'Store the Secret Key (sk_live_...) in environment variables — never expose client-side',
        'Use the Publishable Key (pk_live_...) in frontend code for Stripe Elements/Checkout',
        'Configure webhook endpoints under Developers > Webhooks',
        'Set up a restricted key with minimal permissions for each service that needs Stripe access',
      ],
      keyEndpoints: [
        'POST /v1/payment_intents — create a payment intent for one-time charges',
        'POST /v1/customers — create or update customer records',
        'POST /v1/subscriptions — manage recurring billing subscriptions',
        'POST /v1/refunds — issue full or partial refunds',
        'POST /v1/webhook_endpoints — register webhook listeners',
        'GET /v1/balance — retrieve current account balance',
        'GET /v1/invoices — list and retrieve invoices',
      ],
      configSteps: [
        'Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables',
        'Set STRIPE_WEBHOOK_SECRET for webhook signature verification',
        'Configure webhook events: payment_intent.succeeded, payment_intent.payment_failed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed',
        'Enable Stripe Tax if tax collection is required',
        'Set up Stripe Radar rules for fraud prevention',
        'Configure Stripe billing portal for customer self-service',
      ],
      errorHandling: [
        'Catch StripeCardError for declined cards — display user-friendly message',
        'Catch StripeRateLimitError — implement exponential backoff (max 3 retries)',
        'Catch StripeInvalidRequestError — log full error, return 400 to client',
        'Catch StripeAuthenticationError — alert immediately, likely key rotation issue',
        'Catch StripeAPIConnectionError — retry with backoff, fall back to queued processing',
        'All webhook handlers must be idempotent — use Stripe event ID for deduplication',
        'Verify webhook signatures before processing any event payload',
      ],
      healthCheck: [
        'GET /v1/balance — returns 200 if API key is valid and account is active',
        'Monitor webhook delivery success rate in Stripe Dashboard > Webhooks',
        'Set up Stripe Status page alerts (https://status.stripe.com) for platform incidents',
        'Track payment success/failure ratios as a business health indicator',
      ],
      troubleshooting: [
        'Payments failing silently — check webhook endpoint is reachable and returning 200',
        'Webhook signature verification failing — ensure STRIPE_WEBHOOK_SECRET matches the endpoint secret (not the global signing secret)',
        'Test mode vs live mode confusion — verify environment variables match the intended mode (sk_test_ vs sk_live_)',
        'Idempotency errors — include an Idempotency-Key header for retried POST requests',
        'Currency mismatch — Stripe amounts are in the smallest currency unit (e.g. cents, not dollars)',
        'Subscription webhook storms — use event deduplication and check event.livemode flag',
      ],
      rotationSchedule: '90 days recommended — use restricted keys and rotate via Stripe Dashboard',
    },

    supabase: {
      displayName: 'Supabase',
      category: 'Backend / Database',
      purpose: 'PostgreSQL database, authentication, real-time subscriptions, storage, and edge functions',
      authMethod: 'API Key (anon key for client, service_role key for server)',
      setupProcedure: [
        'Create a Supabase project at https://supabase.com/dashboard',
        'Note the project URL and API keys from Settings > API',
        'The anon key is safe for client-side use (respects Row Level Security)',
        'The service_role key bypasses RLS — use only server-side, never expose to clients',
        'Configure Row Level Security (RLS) policies on all tables',
        'Set up authentication providers under Authentication > Providers',
        'Create database migrations in the supabase/migrations directory',
      ],
      keyEndpoints: [
        'POST /auth/v1/signup — register a new user',
        'POST /auth/v1/token?grant_type=password — sign in with email/password',
        'GET /rest/v1/{table} — query table data (PostgREST)',
        'POST /rest/v1/{table} — insert rows',
        'PATCH /rest/v1/{table}?id=eq.{id} — update rows',
        'POST /storage/v1/object/{bucket}/{path} — upload files',
        'POST /functions/v1/{function-name} — invoke edge functions',
      ],
      configSteps: [
        'Set SUPABASE_URL and SUPABASE_ANON_KEY for client-side access',
        'Set SUPABASE_SERVICE_ROLE_KEY for server-side operations',
        'Enable required auth providers (email, Google, GitHub, etc.)',
        'Configure RLS policies for every table — default deny, explicit allow',
        'Set up database webhooks for event-driven processing if needed',
        'Configure storage buckets with appropriate access policies',
        'Set up Edge Functions for server-side logic that needs to run close to the database',
      ],
      errorHandling: [
        'Auth errors (401) — redirect to login, refresh token if expired',
        'RLS policy violations (403) — log the query context, check policy definitions',
        'Rate limiting (429) — backoff and retry, consider upgrading plan for higher limits',
        'Connection pool exhaustion — use connection pooling mode (transaction or session)',
        'Realtime subscription drops — implement auto-reconnect with state reconciliation',
        'Storage upload failures — validate file size and type client-side before upload',
      ],
      healthCheck: [
        'GET /rest/v1/ — returns API info if project is reachable',
        'Query a lightweight health-check table to verify database connectivity',
        'Monitor Supabase Dashboard for project status and resource usage',
        'Check realtime connection count against plan limits',
        'Monitor database size and connection pool usage',
      ],
      troubleshooting: [
        'Queries returning empty results — check RLS policies, ensure the user has the correct role',
        'Auth tokens not refreshing — verify SUPABASE_URL matches the project URL exactly',
        'Realtime not receiving events — confirm the table has REPLICA IDENTITY FULL enabled',
        'Edge functions timing out — check execution logs in the Supabase Dashboard',
        'Storage CORS errors — configure allowed origins in storage bucket settings',
        'Migration conflicts — use supabase db diff to compare local and remote schemas',
      ],
      rotationSchedule: 'Service role key: 90 days. Anon key: rotate if compromised (requires client update)',
    },

    hubspot: {
      displayName: 'HubSpot',
      category: 'CRM / Marketing',
      purpose: 'Contact management, deal tracking, email marketing, forms, and marketing automation',
      authMethod: 'OAuth 2.0 (recommended) or Private App Access Token',
      setupProcedure: [
        'Create a HubSpot developer account at https://developers.hubspot.com',
        'Create a private app under Settings > Integrations > Private Apps',
        'Select the required scopes (contacts, deals, forms, marketing, etc.)',
        'Copy the access token — this is a long-lived token for server-to-server calls',
        'For OAuth: register an app, configure redirect URIs, implement the OAuth flow',
        'Install the @hubspot/api-client npm package for typed API access',
      ],
      keyEndpoints: [
        'POST /crm/v3/objects/contacts — create or update contacts',
        'GET /crm/v3/objects/contacts/{id} — retrieve contact details',
        'POST /crm/v3/objects/deals — create or update deals',
        'GET /crm/v3/objects/deals — list deals with filters',
        'POST /marketing/v3/transactional/single-email/send — send transactional email',
        'GET /crm/v3/objects/contacts/search — search contacts by property',
        'POST /crm/v3/associations/{fromObjectType}/{toObjectType} — associate records',
      ],
      configSteps: [
        'Set HUBSPOT_ACCESS_TOKEN environment variable',
        'Configure required scopes in the private app settings',
        'Set up webhook subscriptions for contact and deal change events',
        'Map internal data fields to HubSpot contact/deal properties',
        'Create custom properties in HubSpot for project-specific data',
        'Configure lifecycle stage automation rules',
        'Set up HubSpot forms if using embedded web forms',
      ],
      errorHandling: [
        '401 Unauthorized — token expired or revoked, re-authenticate',
        '429 Rate Limit — HubSpot limits to 100 requests per 10 seconds (private apps), implement queuing',
        '409 Conflict — duplicate record, use search-before-create pattern',
        'Association errors — verify object types and association definitions exist',
        'Property validation errors — check property type and option values match HubSpot config',
        'Batch API failures — use partial success handling, retry only failed items',
      ],
      healthCheck: [
        'GET /crm/v3/objects/contacts?limit=1 — verifies API access and token validity',
        'Monitor API usage in HubSpot Settings > Integrations > API Usage',
        'Track sync lag between local database and HubSpot records',
        'Set up alerts for webhook delivery failures in HubSpot',
      ],
      troubleshooting: [
        'Contacts not syncing — verify the access token has the crm.objects.contacts scope',
        'Webhook events not arriving — check the webhook URL is publicly accessible and returning 200',
        'Rate limit exceeded — implement a request queue with rate limiting (max 10 req/sec)',
        'Duplicate contacts — use email as the deduplication key, search before creating',
        'Custom property not found — create the property in HubSpot before setting it via API',
        'OAuth token expired — implement refresh token flow, store refresh token securely',
      ],
      rotationSchedule: 'Private app tokens: no expiry, rotate if compromised. OAuth tokens: auto-refresh via refresh token',
    },

    openai: {
      displayName: 'OpenAI',
      category: 'AI / Machine Learning',
      purpose: 'LLM-powered text generation, embeddings, image generation, and content moderation',
      authMethod: 'API Key (Bearer token)',
      setupProcedure: [
        'Create an OpenAI account at https://platform.openai.com',
        'Navigate to API Keys and create a new secret key',
        'Set a monthly usage limit under Billing > Usage Limits',
        'Create a project-specific API key with restricted permissions if supported',
        'Install the openai npm/Python package for typed API access',
        'Configure organization ID if using a shared organization account',
      ],
      keyEndpoints: [
        'POST /v1/chat/completions — generate text with GPT models',
        'POST /v1/embeddings — generate vector embeddings for search/similarity',
        'POST /v1/images/generations — generate images with DALL-E',
        'POST /v1/moderations — check content against moderation policies',
        'POST /v1/audio/transcriptions — transcribe audio with Whisper',
        'GET /v1/models — list available models',
      ],
      configSteps: [
        'Set OPENAI_API_KEY environment variable',
        'Set OPENAI_ORG_ID if using an organization account',
        'Configure default model (e.g. gpt-4o) and temperature per use case',
        'Set max_tokens limits to control cost and response length',
        'Implement a system prompt strategy — store system prompts as configuration, not hardcoded',
        'Set up usage monitoring and budget alerts in the OpenAI dashboard',
        'Configure rate limit tier based on account level',
      ],
      errorHandling: [
        '401 Unauthorized — invalid API key, check OPENAI_API_KEY',
        '429 Rate Limit — implement exponential backoff with jitter, respect Retry-After header',
        '500/503 Server Error — retry with backoff, fall back to cached response or alternative model',
        'Context length exceeded — truncate input, summarise, or use a model with larger context window',
        'Content filter triggered — log the input, return a safe fallback response to the user',
        'Timeout on long completions — use streaming responses for better UX',
        'Track token usage per request to monitor costs',
      ],
      healthCheck: [
        'GET /v1/models — returns 200 if API key is valid',
        'Monitor daily/monthly token usage against budget in OpenAI Dashboard',
        'Track average response latency per model',
        'Check OpenAI Status page (https://status.openai.com) for platform incidents',
      ],
      troubleshooting: [
        'Responses are too slow — switch to a smaller model, enable streaming, or reduce max_tokens',
        'High costs — audit token usage, check for runaway loops, set hard budget limits',
        'Inconsistent outputs — lower temperature, use a more specific system prompt, add examples',
        'Rate limiting — check your tier limits, implement request queuing',
        'Embedding dimension mismatch — ensure the embedding model matches the vector database configuration',
        'Content moderation flags — review and adjust system prompts, add pre-filtering for user input',
      ],
      rotationSchedule: 'Rotate every 90 days or immediately if exposed. Use project-scoped keys where possible',
    },

    resend: {
      displayName: 'Resend',
      category: 'Email',
      purpose: 'Transactional email delivery, email templates, and delivery tracking',
      authMethod: 'API Key',
      setupProcedure: [
        'Create a Resend account at https://resend.com',
        'Verify your sending domain under Domains — add DNS records (SPF, DKIM, DMARC)',
        'Generate an API key under API Keys with appropriate permissions',
        'Configure a sending identity (from address) using the verified domain',
        'Install the resend npm package for typed API access',
      ],
      keyEndpoints: [
        'POST /emails — send a single email',
        'POST /emails/batch — send multiple emails in one request',
        'GET /emails/{id} — retrieve email delivery status',
        'POST /domains — add and verify a sending domain',
        'GET /domains — list verified domains',
        'POST /api-keys — create a new API key',
      ],
      configSteps: [
        'Set RESEND_API_KEY environment variable',
        'Set RESEND_FROM_ADDRESS to the verified sender address',
        'Configure DNS records (SPF, DKIM, DMARC) for the sending domain',
        'Set up email templates using React Email or HTML',
        'Configure webhook endpoint for delivery events (delivered, bounced, complained)',
        'Set up a suppression list for bounced and unsubscribed addresses',
      ],
      errorHandling: [
        '401 Unauthorized — invalid API key',
        '403 Forbidden — sending domain not verified or sender address not permitted',
        '422 Validation Error — check required fields (to, from, subject)',
        '429 Rate Limit — queue emails and retry with backoff',
        'Bounce handling — remove bounced addresses from mailing lists automatically',
        'Complaint handling — add to suppression list, investigate content',
      ],
      healthCheck: [
        'POST /emails with a test recipient — verifies API key and domain configuration',
        'Monitor delivery rates, bounce rates, and complaint rates in Resend Dashboard',
        'Track email delivery latency',
        'Verify DNS records remain valid (SPF, DKIM, DMARC)',
      ],
      troubleshooting: [
        'Emails going to spam — verify SPF, DKIM, and DMARC records are correctly configured',
        'Emails not sending — confirm the from address uses a verified domain',
        'High bounce rate — clean mailing list, implement email verification on signup',
        'Webhook events not arriving — verify the webhook URL is publicly accessible',
        'Rate limiting — batch emails where possible, implement a send queue',
        'Template rendering issues — test templates with Resend preview before sending',
      ],
      rotationSchedule: 'Rotate every 90 days. Create separate keys per environment (dev/staging/prod)',
    },

    n8n: {
      displayName: 'n8n',
      category: 'Automation',
      purpose: 'Workflow automation, scheduled tasks, data synchronisation, and event-driven processing',
      authMethod: 'Webhook URL (inbound) / API credentials per connected service (outbound)',
      setupProcedure: [
        'Deploy n8n via Docker (self-hosted) or use n8n Cloud',
        'Set up the n8n instance with a persistent data directory for workflow storage',
        'Configure the base URL (N8N_HOST, N8N_PORT, N8N_PROTOCOL) for webhook accessibility',
        'Set N8N_ENCRYPTION_KEY for secure credential storage',
        'Create an admin user account',
        'Configure SMTP settings for email notifications on workflow failures',
      ],
      keyEndpoints: [
        'POST /webhook/{webhook-id} — trigger a workflow via webhook',
        'POST /webhook-test/{webhook-id} — trigger a test execution',
        'GET /api/v1/workflows — list all workflows (API key required)',
        'POST /api/v1/workflows/{id}/activate — activate a workflow',
        'GET /api/v1/executions — list workflow execution history',
      ],
      configSteps: [
        'Set N8N_WEBHOOK_URL to the publicly accessible URL for inbound webhooks',
        'Store credentials for connected services in n8n credential store (encrypted at rest)',
        'Configure execution timeout and retry settings per workflow',
        'Set up error workflows that trigger on any workflow failure',
        'Configure execution data pruning (retention period for execution history)',
        'Set up environment variables for n8n (N8N_BASIC_AUTH_USER, N8N_BASIC_AUTH_PASSWORD for UI access)',
      ],
      errorHandling: [
        'Workflow execution failure — error workflow triggers, logs details, sends notification',
        'Webhook timeout — configure timeout per workflow, return 408 to caller',
        'Credential errors — credential test fails, alert admin to re-authenticate',
        'Memory limits — monitor container memory usage, increase limits for data-heavy workflows',
        'Retry configuration — set max retries and backoff per node',
        'Dead letter queue — failed items logged for manual review',
      ],
      healthCheck: [
        'GET /healthz — returns 200 if n8n instance is running',
        'Monitor active workflow count and execution success/failure rates',
        'Check execution queue depth for processing bottlenecks',
        'Verify webhook accessibility from external services',
        'Monitor container resource usage (CPU, memory)',
      ],
      troubleshooting: [
        'Webhooks not triggering — verify the workflow is active and the webhook URL is publicly accessible',
        'Workflow stuck in running state — check for infinite loops, increase timeout, restart the n8n container',
        'Credentials failing — re-authenticate in n8n UI, check if external service rotated keys',
        'High memory usage — reduce execution history retention, optimise large data workflows',
        'Duplicate executions — implement idempotency in webhook handlers',
        'Time zone issues — set TZ environment variable on the n8n container',
      ],
      rotationSchedule: 'n8n encryption key: rotate annually. Connected service credentials: per service schedule',
    },

    vercel: {
      displayName: 'Vercel',
      category: 'Hosting / Deployment',
      purpose: 'Frontend hosting, serverless functions, edge middleware, and preview deployments',
      authMethod: 'API Token (personal or team-scoped)',
      setupProcedure: [
        'Create a Vercel account at https://vercel.com',
        'Install the Vercel CLI: npm i -g vercel',
        'Link the project: vercel link (follow prompts to connect to Git repo)',
        'Configure environment variables in Vercel Dashboard > Settings > Environment Variables',
        'Set up a custom domain under Domains',
        'Generate an API token under Settings > Tokens for CI/CD integration',
      ],
      keyEndpoints: [
        'POST /v13/deployments — create a new deployment',
        'GET /v6/deployments — list deployments',
        'GET /v6/deployments/{id} — get deployment status',
        'POST /v1/env — set environment variables',
        'GET /v9/projects/{projectId}/domains — list project domains',
        'POST /v2/domains/{domain}/records — manage DNS records',
      ],
      configSteps: [
        'Set VERCEL_TOKEN for API/CLI access in CI environments',
        'Configure vercel.json for build settings, rewrites, headers, and redirects',
        'Set environment variables per environment (Production, Preview, Development)',
        'Configure Git integration for automatic deployments on push',
        'Set up deployment protection (password, Vercel Authentication) for preview URLs',
        'Configure serverless function regions for optimal latency',
      ],
      errorHandling: [
        'Build failures — check build logs in Vercel Dashboard, verify build command and output directory',
        'Serverless function timeout — check function duration against plan limits (10s hobby, 60s pro)',
        'Cold start latency — use edge functions where possible, or configure warm-up pings',
        'Domain configuration errors — verify DNS records and wait for propagation (up to 48h)',
        '429 Rate Limit — API rate limited per token, implement backoff',
        'Environment variable missing — check the variable is set for the correct environment scope',
      ],
      healthCheck: [
        'GET / — verify the deployment is serving the application',
        'Monitor deployment status in Vercel Dashboard',
        'Check Vercel Status page (https://www.vercel-status.com) for platform incidents',
        'Monitor serverless function execution metrics (duration, errors, cold starts)',
      ],
      troubleshooting: [
        'Build succeeding but site not updating — check the production branch and Git integration settings',
        'Environment variables not available — verify scope (Production/Preview/Development) matches the deployment',
        'Serverless function returning 500 — check function logs in Vercel Dashboard > Logs',
        'Custom domain not working — verify DNS records (CNAME to cname.vercel-dns.com or A records)',
        'Preview deployments not generating — check GitHub app permissions and branch protection rules',
        'Image optimisation not working — verify images are served from the correct path',
      ],
      rotationSchedule: 'API tokens: rotate every 90 days. Team tokens: rotate on team membership changes',
    },

    netlify: {
      displayName: 'Netlify',
      category: 'Hosting / Deployment',
      purpose: 'Static site hosting, serverless functions, forms, identity, and deploy previews',
      authMethod: 'Personal Access Token or OAuth',
      setupProcedure: [
        'Create a Netlify account at https://www.netlify.com',
        'Install the Netlify CLI: npm i -g netlify-cli',
        'Link the project: netlify link (connect to existing site or create new)',
        'Configure build settings in netlify.toml or Netlify Dashboard',
        'Set up environment variables in Site Settings > Build & Deploy > Environment',
        'Generate a personal access token under User Settings > Applications > Personal Access Tokens',
      ],
      keyEndpoints: [
        'POST /api/v1/sites/{site_id}/deploys — create a new deploy',
        'GET /api/v1/sites/{site_id}/deploys — list deploys',
        'GET /api/v1/sites/{site_id} — get site info',
        'POST /api/v1/sites/{site_id}/forms — list form submissions',
        'POST /api/v1/hooks — create a webhook notification',
        'PUT /api/v1/sites/{site_id}/env — set environment variables',
      ],
      configSteps: [
        'Set NETLIFY_AUTH_TOKEN for CLI/API access',
        'Configure netlify.toml with build command, publish directory, and redirects',
        'Set environment variables per deploy context (production, deploy-preview, branch-deploy)',
        'Configure custom domain and HTTPS in Domain Management',
        'Set up build hooks for triggering deploys from external services',
        'Configure serverless functions directory (default: netlify/functions)',
        'Add .netlify/ to .gitignore',
      ],
      errorHandling: [
        'Build failures — check deploy log in Netlify Dashboard, verify build command',
        'Function invocation errors — check function logs, verify handler exports',
        'Form submission failures — verify form detection (data-netlify attribute)',
        'DNS propagation delays — allow up to 48h for domain configuration',
        'Bandwidth exceeded — monitor usage, consider upgrading plan',
        'Deploy stuck — cancel and re-deploy, check for large files blocking upload',
      ],
      healthCheck: [
        'GET / — verify the site is serving content',
        'Monitor deploy status in Netlify Dashboard',
        'Check Netlify Status page (https://www.netlifystatus.com) for platform incidents',
        'Monitor bandwidth and build minutes usage',
      ],
      troubleshooting: [
        'Deploy succeeded but changes not visible — check publish directory matches build output',
        'Redirects not working — verify _redirects file or netlify.toml redirect rules',
        'Functions returning 502 — check function logs, verify the handler signature',
        'Custom domain SSL error — re-provision SSL certificate in Domain Management',
        'Environment variables empty in functions — redeploy after adding variables',
        'Build cache causing issues — clear cache and deploy (available in Netlify Dashboard)',
      ],
      rotationSchedule: 'Personal access tokens: rotate every 90 days or on team changes',
    },

    cloudflare: {
      displayName: 'Cloudflare',
      category: 'CDN / Security',
      purpose: 'DNS management, CDN, DDoS protection, WAF, Workers, and SSL/TLS',
      authMethod: 'API Token (scoped) or Global API Key',
      setupProcedure: [
        'Create a Cloudflare account at https://dash.cloudflare.com/sign-up',
        'Add the domain and update nameservers at the registrar to Cloudflare nameservers',
        'Wait for nameserver propagation (can take up to 24h)',
        'Create a scoped API token under Profile > API Tokens (preferred over Global API Key)',
        'Configure SSL/TLS mode (Full Strict recommended if origin has valid SSL)',
        'Enable relevant security features (WAF, bot management, rate limiting)',
      ],
      keyEndpoints: [
        'GET /zones — list zones (domains) on the account',
        'POST /zones/{zone_id}/dns_records — create DNS records',
        'PATCH /zones/{zone_id}/settings — update zone settings',
        'POST /zones/{zone_id}/purge_cache — purge CDN cache',
        'PUT /zones/{zone_id}/workers/routes — configure Workers routes',
        'GET /zones/{zone_id}/analytics/dashboard — retrieve analytics data',
      ],
      configSteps: [
        'Set CLOUDFLARE_API_TOKEN (scoped token) or CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL',
        'Set CLOUDFLARE_ZONE_ID for the target domain',
        'Configure SSL/TLS to Full (Strict) mode',
        'Set up page rules or transform rules for caching behaviour',
        'Configure WAF custom rules for application-specific protection',
        'Set up rate limiting rules to protect API endpoints',
        'Configure cache TTLs per content type',
        'Enable Always Online and Auto Minify if appropriate',
      ],
      errorHandling: [
        '403 Forbidden — API token lacks required permissions, check token scopes',
        '429 Rate Limit — Cloudflare API is rate limited to 1200 requests per 5 minutes',
        'Cache purge failures — verify zone ID and token permissions',
        'DNS propagation delays — allow up to 24h for changes to propagate globally',
        'Worker errors — check Workers logs in the Cloudflare Dashboard',
        'SSL errors — verify SSL mode matches origin configuration',
      ],
      healthCheck: [
        'GET /zones/{zone_id} — verifies API token and zone access',
        'Monitor Cloudflare Analytics for traffic, threats, and cache hit ratio',
        'Check Cloudflare System Status (https://www.cloudflarestatus.com)',
        'Monitor origin health checks if configured',
      ],
      troubleshooting: [
        'Site showing Cloudflare error page — check origin server is running, verify DNS records',
        'SSL errors (525/526) — ensure origin has a valid SSL certificate, check SSL/TLS mode',
        'Cache not working — verify cache headers, check page rules, purge cache',
        'Workers not executing — check route patterns, verify worker is deployed and active',
        'Rate limiting blocking legitimate traffic — review rule thresholds, add IP allowlists',
        'DNS records not resolving — confirm nameservers are set correctly at registrar',
      ],
      rotationSchedule: 'API tokens: rotate every 90 days. Use scoped tokens per integration (not Global API Key)',
    },

    sentry: {
      displayName: 'Sentry',
      category: 'Monitoring / Error Tracking',
      purpose: 'Error tracking, performance monitoring, release health, and alerting',
      authMethod: 'DSN (client) + Auth Token (API)',
      setupProcedure: [
        'Create a Sentry account at https://sentry.io',
        'Create a new project for the application (select the platform/framework)',
        'Copy the DSN from Project Settings > Client Keys',
        'Install the Sentry SDK for your platform (@sentry/node, @sentry/react, etc.)',
        'Initialise the SDK in the application entry point with the DSN',
        'Generate an auth token under Settings > Auth Tokens for API access and release management',
        'Configure source maps upload for readable stack traces',
      ],
      keyEndpoints: [
        'POST /api/0/projects/{org}/{project}/releases/ — create a release',
        'POST /api/0/organizations/{org}/releases/{version}/deploys/ — record a deployment',
        'GET /api/0/projects/{org}/{project}/issues/ — list project issues',
        'PUT /api/0/projects/{org}/{project}/issues/{issue_id}/ — update issue status',
        'POST /api/0/projects/{org}/{project}/keys/ — manage client keys',
      ],
      configSteps: [
        'Set SENTRY_DSN for the client SDK',
        'Set SENTRY_AUTH_TOKEN for release management and source map uploads',
        'Set SENTRY_ORG and SENTRY_PROJECT for CLI commands',
        'Configure environment tag (production, staging, development)',
        'Set sample rates for error (1.0) and performance (0.1-1.0) monitoring',
        'Upload source maps as part of the CI/CD pipeline',
        'Configure alert rules for error thresholds and performance degradation',
        'Set up team notification channels (email, Slack) for alerts',
      ],
      errorHandling: [
        'SDK initialisation failure — application continues without error tracking, log warning',
        'Network errors sending events — events are buffered and retried automatically',
        'Rate limiting — Sentry drops events when rate limit is exceeded, configure client-side sampling',
        'Large payload rejection — configure maxValueLength and beforeSend to trim oversized data',
        'PII in error reports — configure beforeSend to scrub sensitive data',
      ],
      healthCheck: [
        'Check Sentry Dashboard for incoming events after deployment',
        'Verify source maps are uploaded (stack traces should show original source)',
        'Monitor quota usage under Settings > Subscription',
        'Check Sentry Status page (https://status.sentry.io) for platform incidents',
      ],
      troubleshooting: [
        'No events appearing — verify DSN is correct, check network tab for blocked requests',
        'Stack traces showing minified code — verify source maps are uploaded for the release version',
        'Too many events — increase sample rate filtering, configure ignore rules for noisy errors',
        'Alerts not triggering — check alert rule conditions, verify notification channel settings',
        'Performance data missing — verify tracing is enabled and sample rate is > 0',
        'Release tracking not working — ensure release version matches between SDK init and sentry-cli',
      ],
      rotationSchedule: 'Auth tokens: rotate every 90 days. DSN: rotate only if compromised (requires client update)',
    },

    plausible: {
      displayName: 'Plausible',
      category: 'Analytics',
      purpose: 'Privacy-friendly web analytics, page views, referrers, and goal tracking',
      authMethod: 'API Key (for Stats API) + Script embed (for tracking)',
      setupProcedure: [
        'Create a Plausible account at https://plausible.io (or self-host)',
        'Add the site domain under Sites > Add a New Site',
        'Add the Plausible script tag to the site <head>',
        'Verify the script is loading by checking the Plausible Dashboard for initial pageview',
        'Generate an API key under Settings > API Keys for programmatic access',
        'Configure custom goals and events if needed',
      ],
      keyEndpoints: [
        'GET /api/v1/stats/realtime/visitors — current visitor count',
        'GET /api/v1/stats/aggregate — aggregate stats (visitors, pageviews, bounce rate)',
        'GET /api/v1/stats/timeseries — time-series data for charting',
        'GET /api/v1/stats/breakdown — breakdown by property (page, source, country)',
        'PUT /api/v1/sites/goals — create a custom goal',
        'GET /api/v1/sites/{site_id} — get site details',
      ],
      configSteps: [
        'Add <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script> to site <head>',
        'Set PLAUSIBLE_API_KEY for Stats API access',
        'Set PLAUSIBLE_SITE_ID (your domain) for API queries',
        'Configure custom events using plausible() JavaScript function',
        'Set up goal conversions in the Plausible Dashboard',
        'Enable revenue tracking if using e-commerce events',
        'Configure email reports for weekly/monthly traffic summaries',
      ],
      errorHandling: [
        'Script blocked by ad blockers — consider proxying the script through your domain',
        '401 API errors — verify API key is valid and has the correct permissions',
        '429 Rate Limit — Stats API is rate limited, cache responses locally',
        'No data appearing — verify the script is loading (check browser Network tab)',
        'Goal events not tracking — verify the plausible() function call matches the goal name exactly',
      ],
      healthCheck: [
        'Check Plausible Dashboard for real-time visitor count',
        'GET /api/v1/stats/realtime/visitors — returns count if API key is valid',
        'Verify script loading via browser developer tools (Network tab)',
        'Monitor weekly traffic trends for anomalies',
      ],
      troubleshooting: [
        'No data after setup — verify the script src URL and data-domain attribute match exactly',
        'Data missing for some pages — ensure the script is in the <head> of all pages (including SPA route changes)',
        'SPA page views not tracking — use the script.hash.js variant or manual pageview calls',
        'API returning empty results — check the date range and site_id parameters',
        'Ad blockers preventing tracking — proxy the script through your domain or use server-side events',
        'Goal conversions not appearing — verify the goal name in the API call matches the Dashboard configuration exactly',
      ],
      rotationSchedule: 'API keys: rotate every 6 months. Script embed: no rotation needed',
    },
  };

  const details = knownIntegrations[name.toLowerCase()];
  if (details) return details;

  // Sensible defaults for unknown integrations
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    displayName,
    category: 'Third-Party Service',
    purpose: `${displayName} integration — refer to service documentation for details`,
    authMethod: 'API Key or OAuth (refer to service documentation)',
    setupProcedure: [
      `Create an account with ${displayName}`,
      'Generate API credentials from the service dashboard',
      'Store credentials in environment variables',
      'Install the official SDK or client library if available',
      'Configure webhook endpoints if the service supports them',
    ],
    keyEndpoints: [
      'Refer to the official API documentation for endpoint details',
    ],
    configSteps: [
      `Set ${name.toUpperCase().replace(/-/g, '_')}_API_KEY environment variable`,
      'Configure the base URL if using a self-hosted or regional instance',
      'Set up any required webhook endpoints',
      'Test the connection in a development environment before deploying',
    ],
    errorHandling: [
      '401/403 — authentication failure, verify credentials',
      '429 — rate limit exceeded, implement exponential backoff',
      '500/503 — service unavailable, retry with backoff and implement circuit breaker',
      'Timeout — set reasonable timeout values, implement fallback behaviour',
    ],
    healthCheck: [
      'Call a lightweight read endpoint to verify connectivity and credentials',
      `Monitor the ${displayName} status page for platform incidents`,
      'Track API response times and error rates',
    ],
    troubleshooting: [
      'Connection refused — verify the service URL and network access',
      'Authentication errors — verify credentials are current and have required permissions',
      'Unexpected responses — check API version compatibility',
      `Refer to ${displayName} documentation for service-specific troubleshooting`,
    ],
    rotationSchedule: 'Rotate API keys every 90 days or per service recommendation',
  };
}

/**
 * Determine cross-integration dependencies for known services.
 */
function getCrossDependencies(activeNames) {
  const dependencies = [];

  const active = new Set(activeNames.map(n => n.toLowerCase()));

  if (active.has('stripe') && active.has('supabase')) {
    dependencies.push({
      from: 'Stripe',
      to: 'Supabase',
      relationship: 'Stripe webhook events update payment/subscription records in Supabase. Stripe customer IDs are stored as foreign references in the users table.',
    });
  }
  if (active.has('stripe') && active.has('resend')) {
    dependencies.push({
      from: 'Stripe',
      to: 'Resend',
      relationship: 'Successful payments trigger transactional emails (receipts, confirmations) via Resend. Failed payment events trigger dunning emails.',
    });
  }
  if (active.has('stripe') && active.has('n8n')) {
    dependencies.push({
      from: 'Stripe',
      to: 'n8n',
      relationship: 'Stripe webhook events can trigger n8n workflows for post-payment processing, CRM updates, or notification routing.',
    });
  }
  if (active.has('hubspot') && active.has('resend')) {
    dependencies.push({
      from: 'HubSpot',
      to: 'Resend',
      relationship: 'HubSpot contact data informs email personalisation. Contact lifecycle changes may trigger Resend transactional emails.',
    });
  }
  if (active.has('hubspot') && active.has('n8n')) {
    dependencies.push({
      from: 'HubSpot',
      to: 'n8n',
      relationship: 'n8n workflows sync data between HubSpot and the application database. Contact/deal updates trigger automated workflows.',
    });
  }
  if (active.has('supabase') && active.has('resend')) {
    dependencies.push({
      from: 'Supabase',
      to: 'Resend',
      relationship: 'Supabase auth events (signup, password reset) trigger emails via Resend. Database webhooks can trigger notification emails.',
    });
  }
  if (active.has('supabase') && active.has('openai')) {
    dependencies.push({
      from: 'Supabase',
      to: 'OpenAI',
      relationship: 'OpenAI embeddings are stored in Supabase pgvector columns for semantic search. Supabase Edge Functions may call OpenAI APIs.',
    });
  }
  if (active.has('vercel') && active.has('supabase')) {
    dependencies.push({
      from: 'Vercel',
      to: 'Supabase',
      relationship: 'Vercel serverless functions connect to Supabase for data access. Supabase environment variables are configured in Vercel project settings.',
    });
  }
  if (active.has('netlify') && active.has('supabase')) {
    dependencies.push({
      from: 'Netlify',
      to: 'Supabase',
      relationship: 'Netlify serverless functions connect to Supabase for data access. Supabase environment variables are configured in Netlify site settings.',
    });
  }
  if (active.has('cloudflare') && (active.has('vercel') || active.has('netlify'))) {
    const host = active.has('vercel') ? 'Vercel' : 'Netlify';
    dependencies.push({
      from: 'Cloudflare',
      to: host,
      relationship: `Cloudflare provides DNS and CDN in front of ${host}. DNS records must point to ${host} origin. Disable Cloudflare proxy (orange cloud) if ${host} manages SSL.`,
    });
  }
  if (active.has('sentry') && (active.has('vercel') || active.has('netlify'))) {
    const host = active.has('vercel') ? 'Vercel' : 'Netlify';
    dependencies.push({
      from: 'Sentry',
      to: host,
      relationship: `Sentry release tracking is integrated into the ${host} deployment pipeline. Source maps are uploaded during the build step.`,
    });
  }
  if (active.has('n8n') && active.has('openai')) {
    dependencies.push({
      from: 'n8n',
      to: 'OpenAI',
      relationship: 'n8n workflows use OpenAI nodes for content generation, classification, or summarisation tasks in automated pipelines.',
    });
  }
  if (active.has('plausible') && active.has('cloudflare')) {
    dependencies.push({
      from: 'Plausible',
      to: 'Cloudflare',
      relationship: 'Plausible tracking script may be proxied through Cloudflare Workers to avoid ad blocker interference.',
    });
  }

  return dependencies;
}

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const integrations = docsState.integrationClauses || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const company = getCompanyInfo(brandConfig || {});

  // Filter to active integrations only
  const activeIntegrations = Object.keys(integrations).filter(k => integrations[k] === 'active');
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxIntegrations = ctx.integrations || [];
  const ctxEnvVars = ctx.envVars || [];
  const ctxDeps = ctx.dependencies || {};

  // Merge harvested integrations with declared ones (deduplicated)
  const harvestedIntegrationNames = ctxIntegrations
    .map(i => (typeof i === 'string' ? i : i.name || '').toLowerCase())
    .filter(Boolean);
  const allIntegrationNames = [...new Set([...activeIntegrations, ...harvestedIntegrationNames])];

  const sections = [];

  // ──────────────────────────────────────────────
  // 1. Overview
  // ──────────────────────────────────────────────
  sections.push(createHeading('Integration Overview', 1));
  sections.push(createParagraph(`This runbook documents all active third-party integrations for ${projectName}. It provides setup procedures, configuration details, error handling strategies, and troubleshooting guides for each integration. This is the authoritative reference for maintaining, debugging, and onboarding team members to the project's integration layer.`));

  if (activeIntegrations.length === 0 && allIntegrationNames.length === 0) {
    sections.push(createParagraph('No active integrations are currently configured for this project. Add integrations to the project configuration to populate this runbook.'));
    return createDocument({
      title: 'Integration Runbook',
      subtitle: projectName,
      clientName,
      brandConfig,
      sections,
    });
  }

  sections.push(createParagraph(`${projectName} currently has ${allIntegrationNames.length || activeIntegrations.length} active integration${(allIntegrationNames.length || activeIntegrations.length) === 1 ? '' : 's'}:`));

  // Summary table of all active integrations, enriched with harvested data
  const overviewRows = (allIntegrationNames.length ? allIntegrationNames : activeIntegrations).map(name => {
    const details = getIntegrationDetails(name);
    // Find matching harvested integration for extra context
    const harvested = ctxIntegrations.find(i => (typeof i === 'string' ? i : i.name || '').toLowerCase() === name.toLowerCase());
    const purpose = (harvested && typeof harvested === 'object' && harvested.purpose) || details.purpose;
    return [details.displayName, details.category, purpose, 'Active'];
  });
  sections.push(createTable(['Integration', 'Category', 'Purpose', 'Status'], overviewRows));

  // Show integration-related env vars if available
  const integrationEnvVars = ctxEnvVars.filter(v => {
    const varName = (typeof v === 'object' ? v.name : String(v)).toLowerCase();
    return allIntegrationNames.some(name => varName.includes(name.toLowerCase()));
  });
  if (integrationEnvVars.length) {
    sections.push(createHeading('Integration Environment Variables', 2));
    sections.push(createParagraph('The following environment variables were detected for configured integrations:'));
    const envRows = integrationEnvVars.map(v => {
      if (typeof v === 'object') return [v.name, v.description || '', v.example || v.defaultValue || ''];
      return [String(v), '', ''];
    });
    sections.push(createTable(['Variable', 'Description', 'Example'], envRows));
  }

  // Show integration-related packages if available
  const allDepsList = listDependencies(docsState, 'all');
  const integrationPkgs = allDepsList.filter(dep => {
    const depLower = dep.toLowerCase();
    return allIntegrationNames.some(name => depLower.includes(name.toLowerCase()));
  });
  if (integrationPkgs.length) {
    sections.push(createHeading('Integration Packages', 2));
    sections.push(createParagraph('The following packages provide SDK or client support for configured integrations:'));
    sections.push(...createBulletList(integrationPkgs));
  }

  // ──────────────────────────────────────────────
  // 2. Per-Integration Sections
  // ──────────────────────────────────────────────
  for (const name of activeIntegrations) {
    const details = getIntegrationDetails(name);

    sections.push(createHeading(details.displayName, 1));

    // Service overview
    sections.push(createHeading('Service Overview', 2));
    sections.push(createParagraph(`${details.displayName} is used in ${projectName} for: ${details.purpose}.`));
    sections.push(createParagraph(`Category: ${details.category}`));

    // Account setup procedure
    sections.push(createHeading('Account Setup Procedure', 2));
    sections.push(createParagraph('Follow these steps to set up or verify the integration account:'));
    sections.push(...createBulletList(details.setupProcedure));

    // Authentication method
    sections.push(createHeading('Authentication Method', 2));
    sections.push(createParagraph(`Authentication type: ${details.authMethod}`));
    sections.push(createParagraph('Credentials must be stored in environment variables and never committed to source control. See the Credentials Management section for storage and rotation details.'));

    // Key API endpoints
    sections.push(createHeading('Key API Endpoints and Operations', 2));
    sections.push(createParagraph(`The following ${details.displayName} endpoints and operations are used in this project:`));
    sections.push(...createBulletList(details.keyEndpoints));

    // Configuration steps
    sections.push(createHeading('Configuration', 2));
    sections.push(createParagraph(`Complete the following configuration steps to connect ${details.displayName} to the application:`));
    sections.push(...createBulletList(details.configSteps));

    // Error handling and retry strategy
    sections.push(createHeading('Error Handling and Retry Strategy', 2));
    sections.push(createParagraph(`The following error handling patterns apply to all ${details.displayName} interactions:`));
    sections.push(...createBulletList(details.errorHandling));

    // Health check / monitoring
    sections.push(createHeading('Health Check and Monitoring', 2));
    sections.push(createParagraph(`Monitor ${details.displayName} integration health using:`));
    sections.push(...createBulletList(details.healthCheck));

    // Troubleshooting common issues
    sections.push(createHeading('Troubleshooting', 2));
    sections.push(createParagraph(`Common issues and resolutions for ${details.displayName}:`));
    sections.push(...createBulletList(details.troubleshooting));
  }

  // ──────────────────────────────────────────────
  // 3. Cross-Integration Dependencies
  // ──────────────────────────────────────────────
  sections.push(createHeading('Cross-Integration Dependencies', 1));

  const dependencies = getCrossDependencies(activeIntegrations);

  if (dependencies.length === 0) {
    sections.push(createParagraph('No direct dependencies have been identified between the active integrations. Each integration operates independently.'));
  } else {
    sections.push(createParagraph(`The following dependencies exist between active integrations. When troubleshooting issues, consider these relationships — a failure in one integration may cascade to dependent services.`));

    const depRows = dependencies.map(dep => [dep.from, dep.to, dep.relationship]);
    sections.push(createTable(['Source', 'Depends On', 'Relationship'], depRows));

    sections.push(createHeading('Dependency Impact Analysis', 2));
    sections.push(createParagraph('When an integration experiences an outage, the following downstream effects should be anticipated:'));

    const impactItems = dependencies.map(dep =>
      `${dep.from} outage affects ${dep.to}: ${dep.relationship.split('.')[0]}.`
    );
    sections.push(...createBulletList(impactItems));
  }

  // ──────────────────────────────────────────────
  // 4. Credentials Management
  // ──────────────────────────────────────────────
  sections.push(createHeading('Credentials Management', 1));

  sections.push(createHeading('Storage', 2));
  sections.push(createParagraph('All integration credentials are stored according to the following rules:'));
  sections.push(...createBulletList([
    'Environment variables — primary storage for all API keys and tokens',
    'Never committed to source control — .env files are in .gitignore',
    '.env.example documents required variables without exposing values',
    'Production credentials are managed through the hosting platform (Vercel, Netlify, etc.) or a secrets manager',
    'Local development uses .env.local with development/test credentials',
    'Credentials are never logged, included in error messages, or exposed in API responses',
  ]));

  sections.push(createHeading('Rotation Schedule', 2));
  sections.push(createParagraph('The following rotation schedule applies to all integration credentials. Set calendar reminders for upcoming rotations.'));

  const rotationRows = activeIntegrations.map(name => {
    const details = getIntegrationDetails(name);
    const envVar = getEnvVarName(name);
    return [details.displayName, details.authMethod, envVar, details.rotationSchedule || '90 days'];
  });
  sections.push(createTable(['Integration', 'Credential Type', 'Environment Variable', 'Rotation Schedule'], rotationRows));

  sections.push(createHeading('Rotation Procedure', 2));
  sections.push(createParagraph('When rotating credentials, follow this procedure to avoid downtime:'));
  sections.push(...createBulletList([
    'Generate the new credential in the service dashboard (do not revoke the old one yet)',
    'Update the environment variable in all environments (development, staging, production)',
    'Deploy the application with the new credential',
    'Verify the integration is working correctly with the new credential',
    'Revoke the old credential in the service dashboard',
    'Update the rotation log with the date and the team member who performed the rotation',
    'Set a calendar reminder for the next rotation date',
  ]));

  // ──────────────────────────────────────────────
  // 5. Emergency Procedures
  // ──────────────────────────────────────────────
  sections.push(createHeading('Emergency Procedures', 1));

  sections.push(createHeading('Integration Failure Response', 2));
  sections.push(createParagraph('When an integration fails in production, follow this escalation procedure:'));
  sections.push(...createBulletList([
    'Step 1: Identify — determine which integration is failing from error logs and monitoring alerts',
    'Step 2: Assess impact — determine if the failure is blocking core functionality or a non-critical feature',
    'Step 3: Check service status — visit the integration provider\'s status page to confirm if it\'s a platform-wide outage',
    'Step 4: Verify credentials — confirm API keys are valid and have not expired or been revoked',
    'Step 5: Check rate limits — verify the application is not exceeding API rate limits',
    'Step 6: Enable graceful degradation — if the integration supports it, activate fallback behaviour',
    'Step 7: Communicate — notify the client and stakeholders of the issue and estimated resolution time',
    'Step 8: Resolve — fix the root cause, deploy the fix, and verify the integration is healthy',
    'Step 9: Post-mortem — document the incident, root cause, resolution, and preventive measures',
  ]));

  sections.push(createHeading('Credential Compromise Response', 2));
  sections.push(createParagraph('If an integration credential is suspected to be compromised:'));
  sections.push(...createBulletList([
    'Immediately revoke the compromised credential in the service dashboard',
    'Generate a new credential and update all environments',
    'Review access logs in the service dashboard for unauthorised usage',
    'Check for unusual activity (unexpected charges, data access, configuration changes)',
    'Audit the source of the compromise (committed to repo, exposed in logs, phishing, etc.)',
    'Rotate all credentials that may have been exposed through the same vector',
    'Notify the client if their data may have been affected',
    'Document the incident and update security procedures to prevent recurrence',
  ]));

  sections.push(createHeading('Rollback Procedure', 2));
  sections.push(createParagraph('If an integration update or configuration change causes failures:'));
  sections.push(...createBulletList([
    'Revert environment variables to the previous working values',
    'Redeploy the previous application version if code changes are involved',
    'Verify the rollback has restored normal integration behaviour',
    'Investigate the root cause before attempting the change again',
    'Test the change in staging before re-deploying to production',
  ]));

  sections.push(createHeading('Contact Information', 2));
  sections.push(createParagraph('For integration support escalation:'));

  const contactRows = activeIntegrations.map(name => {
    const details = getIntegrationDetails(name);
    const supportUrl = getSupportUrl(name);
    return [details.displayName, supportUrl, 'Refer to service dashboard for support options'];
  });
  sections.push(createTable(['Integration', 'Support URL', 'Notes'], contactRows));

  return createDocument({
    title: 'Integration Runbook',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}

/**
 * Map integration name to its primary environment variable.
 */
function getEnvVarName(name) {
  const envVarMap = {
    stripe: 'STRIPE_SECRET_KEY',
    supabase: 'SUPABASE_SERVICE_ROLE_KEY',
    hubspot: 'HUBSPOT_ACCESS_TOKEN',
    openai: 'OPENAI_API_KEY',
    resend: 'RESEND_API_KEY',
    n8n: 'N8N_WEBHOOK_URL',
    vercel: 'VERCEL_TOKEN',
    netlify: 'NETLIFY_AUTH_TOKEN',
    cloudflare: 'CLOUDFLARE_API_TOKEN',
    sentry: 'SENTRY_DSN',
    plausible: 'PLAUSIBLE_API_KEY',
  };
  return envVarMap[name.toLowerCase()] || `${name.toUpperCase().replace(/-/g, '_')}_API_KEY`;
}

/**
 * Map integration name to its support URL.
 */
function getSupportUrl(name) {
  const supportUrls = {
    stripe: 'https://support.stripe.com',
    supabase: 'https://supabase.com/docs',
    hubspot: 'https://knowledge.hubspot.com',
    openai: 'https://help.openai.com',
    resend: 'https://resend.com/docs',
    n8n: 'https://docs.n8n.io',
    vercel: 'https://vercel.com/docs',
    netlify: 'https://docs.netlify.com',
    cloudflare: 'https://developers.cloudflare.com',
    sentry: 'https://docs.sentry.io',
    plausible: 'https://plausible.io/docs',
  };
  return supportUrls[name.toLowerCase()] || `https://${name.toLowerCase()}.com/docs`;
}
