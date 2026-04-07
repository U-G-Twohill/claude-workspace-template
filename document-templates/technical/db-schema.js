// Database Schema Documentation template
// Generates a comprehensive database schema reference from docs-state parameters and module flags

import { createDocument, createHeading, createParagraph, createBulletList, createTable } from '../_shared/generator.js';
import { resolveContext, listDependencies } from '../_shared/helpers.js';
import { getCompanyInfo } from '../_shared/brand.js';

export function generate(docsState, brandConfig, options = {}) {
  const params = docsState.parameters || {};
  const flags = docsState.moduleFlags || {};
  const meta = docsState.meta || {};
  const reqs = docsState.requirementsSummary || {};

  const clientName = params['client-name'] || meta['client-name'] || '[CLIENT NAME]';
  const projectName = meta['project-slug']?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '[PROJECT NAME]';
  const dbTechnology = resolveContext(docsState, 'dependencies.database', '')
    ? listDependencies(docsState, 'database').join(', ')
    : (params['database-technology'] || '[Database technology — to be confirmed]');
  const dbVersion = params['database-version'] || '[Version — to be confirmed]';
  const hostingPlatform = params['hosting-platform'] || '[Hosting platform — to be confirmed]';
  const dbHost = params['database-host'] || hostingPlatform;

  const integrations = Object.keys(docsState.integrationClauses || {}).filter(k => docsState.integrationClauses[k] === 'active');
  const company = getCompanyInfo(brandConfig || {});
  const ctx = docsState.projectContext || {};

  // Enrich from harvested context
  const ctxDbDeps = listDependencies(docsState, 'database');
  const ctxFramework = ctx.framework || '';

  const sections = [];

  // --- 1. Overview ---
  sections.push(createHeading('Overview', 1));
  sections.push(createParagraph(`This document defines the database schema for ${projectName}, developed for ${clientName}. It serves as the authoritative reference for all data structures, relationships, conventions, and data management practices used throughout the project.`));

  sections.push(createTable(
    ['Property', 'Value'],
    [
      ['Database Technology', dbTechnology],
      ['Version', dbVersion],
      ['Hosting', dbHost],
      ['Character Set', params['database-charset'] || 'UTF-8 (utf8mb4 where applicable)'],
      ['Collation', params['database-collation'] || 'Case-insensitive, accent-sensitive (default locale)'],
      ['Connection Pooling', params['connection-pooling'] || 'Yes — pool size configured per environment'],
    ]
  ));

  sections.push(createParagraph('The schema is designed for maintainability, referential integrity, and query performance. All structural changes are managed through versioned migrations — no manual schema modifications are permitted in any environment.'));

  // --- 2. Schema Design Principles ---
  sections.push(createHeading('Schema Design Principles', 1));
  sections.push(createParagraph('The following principles govern all schema design decisions. Consistency across the entire schema reduces cognitive overhead and prevents classes of bugs that arise from ad-hoc naming or structural choices.'));

  sections.push(createHeading('Naming Conventions', 2));
  const namingConvention = params['naming-convention'] || 'snake_case';
  sections.push(...createBulletList([
    `All table and column names use ${namingConvention}`,
    'Table names are plural (e.g. users, orders, products)',
    'Primary keys are named id on every table',
    'Foreign keys follow the pattern {singular_table_name}_id (e.g. user_id, order_id)',
    'Junction/join tables are named {table_a}_{table_b} in alphabetical order (e.g. product_tags)',
    'Boolean columns use is_ or has_ prefix (e.g. is_active, has_verified_email)',
    'Timestamp columns use _at suffix (e.g. created_at, updated_at, deleted_at)',
    'Index names follow idx_{table}_{column(s)} convention',
    'Unique constraint names follow uq_{table}_{column(s)} convention',
  ]));

  sections.push(createHeading('Normalisation', 2));
  sections.push(createParagraph('The schema targets third normal form (3NF) as the baseline. Controlled denormalisation is permitted where query performance demands it, documented with a clear rationale.'));
  sections.push(...createBulletList([
    '1NF — all columns contain atomic values; no repeating groups',
    '2NF — all non-key columns depend on the full primary key',
    '3NF — no transitive dependencies between non-key columns',
    'Denormalised fields are marked with a comment explaining the performance rationale',
    'Computed/cached columns are refreshed via triggers or application logic with documented staleness tolerance',
  ]));

  sections.push(createHeading('Soft Deletes', 2));
  const softDeleteStrategy = params['soft-delete-strategy'] || 'deleted_at timestamp column (NULL = active, non-NULL = soft-deleted)';
  sections.push(createParagraph(`Soft delete strategy: ${softDeleteStrategy}. Soft deletes are used on all user-facing entities to support data recovery and audit trails. Hard deletes are reserved for ephemeral data (sessions, temporary tokens).`));
  sections.push(...createBulletList([
    'All queries on soft-deletable tables include a WHERE deleted_at IS NULL filter by default',
    'Application-level scopes/filters enforce soft delete visibility automatically',
    'Soft-deleted records are excluded from unique constraint checks via partial indexes',
    'A scheduled job permanently purges soft-deleted records after the retention period expires',
  ]));

  sections.push(createHeading('Common Columns', 2));
  sections.push(createParagraph('The following columns appear on every table unless explicitly excluded:'));
  sections.push(createTable(
    ['Column', 'Type', 'Purpose'],
    [
      ['id', params['primary-key-type'] || 'UUID / BIGINT AUTO_INCREMENT', 'Primary key'],
      ['created_at', 'TIMESTAMP', 'Record creation time (set once, never updated)'],
      ['updated_at', 'TIMESTAMP', 'Last modification time (updated on every write)'],
      ['deleted_at', 'TIMESTAMP (nullable)', 'Soft delete marker (NULL = active)'],
    ]
  ));

  // --- 3. Entity-Relationship Summary ---
  sections.push(createHeading('Entity-Relationship Summary', 1));
  sections.push(createParagraph('The following table provides an overview of all entities in the schema, their purpose, and key relationships. Refer to subsequent sections for full column definitions.'));

  const entityRows = [];

  if (flags.needs_auth) {
    entityRows.push(['users', 'User accounts and profiles', 'Has many: sessions, audit_logs, [PLACEHOLDER]']);
    entityRows.push(['roles', 'Role definitions for RBAC', 'Has many: user_roles']);
    entityRows.push(['user_roles', 'User-to-role assignments', 'Belongs to: users, roles']);
  }

  if (flags.needs_cms) {
    entityRows.push(['pages', 'CMS-managed page content', 'Belongs to: users (author). Has many: page_revisions']);
    entityRows.push(['page_revisions', 'Content version history', 'Belongs to: pages, users']);
    entityRows.push(['media', 'Uploaded files and images', 'Belongs to: users. Used by: pages, [PLACEHOLDER]']);
  }

  if (flags.needs_payments) {
    entityRows.push(['products', 'Purchasable items or plans', 'Has many: order_items, prices']);
    entityRows.push(['orders', 'Customer purchase orders', 'Belongs to: users. Has many: order_items, payments']);
    entityRows.push(['order_items', 'Line items within an order', 'Belongs to: orders, products']);
    entityRows.push(['payments', 'Payment transaction records', 'Belongs to: orders']);
  }

  entityRows.push(['config', 'Application configuration key-value pairs', 'Standalone']);
  entityRows.push(['audit_logs', 'System-wide audit trail', 'Belongs to: users (actor)']);

  if (integrations.length) {
    entityRows.push(['integration_logs', 'Third-party API call logs', 'Belongs to: [PLACEHOLDER]']);
  }

  entityRows.push(['[PLACEHOLDER]', '[Additional project-specific entities]', '[Relationships to be defined]']);

  sections.push(createTable(['Table', 'Purpose', 'Key Relationships'], entityRows));

  // --- 4. Core Tables ---
  sections.push(createHeading('Core Tables', 1));
  sections.push(createParagraph('Core tables represent the primary domain entities. These tables carry the highest data integrity requirements and are the most frequently queried.'));

  // Users table
  if (flags.needs_auth) {
    sections.push(createHeading('users', 2));
    sections.push(createParagraph('Stores user account data, authentication credentials, and profile information. One row per registered user.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique user identifier'],
        ['email', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'Login email address (lowercase, trimmed)'],
        ['password_hash', 'VARCHAR(255)', 'NOT NULL', 'Bcrypt/Argon2 hashed password'],
        ['display_name', 'VARCHAR(100)', 'NOT NULL', 'User-facing display name'],
        ['avatar_url', 'VARCHAR(500)', 'NULLABLE', 'Profile image URL'],
        ['email_verified_at', 'TIMESTAMP', 'NULLABLE', 'Email verification timestamp'],
        ['is_active', 'BOOLEAN', 'DEFAULT TRUE', 'Account active flag'],
        ['last_login_at', 'TIMESTAMP', 'NULLABLE', 'Most recent successful login'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Account creation time'],
        ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last profile update'],
        ['deleted_at', 'TIMESTAMP', 'NULLABLE', 'Soft delete marker'],
      ]
    ));
    sections.push(createParagraph('[PLACEHOLDER — add project-specific user columns such as phone, address, preferences, subscription tier, etc.]'));

    sections.push(createHeading('roles', 2));
    sections.push(createParagraph('Defines the available roles for role-based access control. Roles are assigned to users via the user_roles junction table.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique role identifier'],
        ['name', 'VARCHAR(50)', 'UNIQUE, NOT NULL', 'Role name (e.g. admin, editor, viewer)'],
        ['description', 'VARCHAR(255)', 'NULLABLE', 'Human-readable role description'],
        ['permissions', 'JSON', 'NULLABLE', 'Permission set for this role'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Role creation time'],
        ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last modification'],
      ]
    ));

    sections.push(createHeading('user_roles', 2));
    sections.push(createParagraph('Junction table linking users to roles. Supports multiple roles per user.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['user_id', params['primary-key-type'] || 'UUID', 'PK, FK -> users.id', 'Reference to user'],
        ['role_id', params['primary-key-type'] || 'UUID', 'PK, FK -> roles.id', 'Reference to role'],
        ['granted_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'When the role was assigned'],
        ['granted_by', params['primary-key-type'] || 'UUID', 'FK -> users.id, NULLABLE', 'Admin who granted the role'],
      ]
    ));
  }

  // CMS tables
  if (flags.needs_cms) {
    sections.push(createHeading('pages', 2));
    sections.push(createParagraph('CMS-managed content pages. Supports draft/published workflow, revision history, and SEO metadata.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique page identifier'],
        ['title', 'VARCHAR(255)', 'NOT NULL', 'Page title'],
        ['slug', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'URL-friendly identifier'],
        ['content', 'TEXT', 'NULLABLE', 'Page body content (HTML or Markdown)'],
        ['excerpt', 'VARCHAR(500)', 'NULLABLE', 'Short summary for listings and SEO'],
        ['status', 'ENUM(draft, review, published, archived)', 'NOT NULL, DEFAULT draft', 'Publication status'],
        ['author_id', params['primary-key-type'] || 'UUID', 'FK -> users.id', 'Content author'],
        ['published_at', 'TIMESTAMP', 'NULLABLE', 'Publication timestamp'],
        ['meta_title', 'VARCHAR(70)', 'NULLABLE', 'SEO meta title override'],
        ['meta_description', 'VARCHAR(160)', 'NULLABLE', 'SEO meta description'],
        ['featured_image_id', params['primary-key-type'] || 'UUID', 'FK -> media.id, NULLABLE', 'Hero/featured image'],
        ['sort_order', 'INTEGER', 'DEFAULT 0', 'Display ordering'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Record creation'],
        ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last modification'],
        ['deleted_at', 'TIMESTAMP', 'NULLABLE', 'Soft delete marker'],
      ]
    ));
    sections.push(createParagraph('[PLACEHOLDER — add project-specific content columns such as template, category_id, parent_id for hierarchical pages, custom fields, etc.]'));

    sections.push(createHeading('page_revisions', 2));
    sections.push(createParagraph('Stores content version history for pages. Every save creates a new revision, enabling rollback to any previous version.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique revision identifier'],
        ['page_id', params['primary-key-type'] || 'UUID', 'FK -> pages.id, NOT NULL', 'Parent page'],
        ['content', 'TEXT', 'NOT NULL', 'Page content at this revision'],
        ['title', 'VARCHAR(255)', 'NOT NULL', 'Page title at this revision'],
        ['revision_number', 'INTEGER', 'NOT NULL', 'Sequential revision counter per page'],
        ['editor_id', params['primary-key-type'] || 'UUID', 'FK -> users.id', 'User who made the change'],
        ['change_summary', 'VARCHAR(255)', 'NULLABLE', 'Brief description of changes'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Revision timestamp'],
      ]
    ));
  }

  // E-commerce tables
  if (flags.needs_payments) {
    sections.push(createHeading('products', 2));
    sections.push(createParagraph('Purchasable items, plans, or services. Supports both one-time purchases and recurring subscriptions.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique product identifier'],
        ['name', 'VARCHAR(255)', 'NOT NULL', 'Product display name'],
        ['slug', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'URL-friendly identifier'],
        ['description', 'TEXT', 'NULLABLE', 'Full product description'],
        ['price_cents', 'INTEGER', 'NOT NULL', 'Price in smallest currency unit (cents)'],
        ['currency', 'VARCHAR(3)', 'NOT NULL, DEFAULT NZD', 'ISO 4217 currency code'],
        ['type', 'ENUM(one_time, recurring)', 'NOT NULL, DEFAULT one_time', 'Pricing model'],
        ['is_active', 'BOOLEAN', 'DEFAULT TRUE', 'Available for purchase'],
        ['stripe_product_id', 'VARCHAR(255)', 'NULLABLE', 'External payment provider product reference'],
        ['metadata', 'JSON', 'NULLABLE', 'Flexible key-value metadata'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Record creation'],
        ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last modification'],
        ['deleted_at', 'TIMESTAMP', 'NULLABLE', 'Soft delete marker'],
      ]
    ));
    sections.push(createParagraph('[PLACEHOLDER — add project-specific product columns such as sku, weight, dimensions, inventory_count, category_id, etc.]'));

    sections.push(createHeading('orders', 2));
    sections.push(createParagraph('Represents a customer purchase. Orders progress through a defined lifecycle: pending, confirmed, fulfilled, cancelled.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique order identifier'],
        ['user_id', params['primary-key-type'] || 'UUID', 'FK -> users.id, NOT NULL', 'Purchasing user'],
        ['status', 'ENUM(pending, confirmed, processing, fulfilled, cancelled, refunded)', 'NOT NULL, DEFAULT pending', 'Order lifecycle status'],
        ['total_cents', 'INTEGER', 'NOT NULL', 'Order total in smallest currency unit'],
        ['currency', 'VARCHAR(3)', 'NOT NULL, DEFAULT NZD', 'ISO 4217 currency code'],
        ['stripe_payment_intent_id', 'VARCHAR(255)', 'NULLABLE', 'External payment reference'],
        ['notes', 'TEXT', 'NULLABLE', 'Internal notes on the order'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Order placed timestamp'],
        ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last status change'],
        ['deleted_at', 'TIMESTAMP', 'NULLABLE', 'Soft delete marker'],
      ]
    ));

    sections.push(createHeading('order_items', 2));
    sections.push(createParagraph('Line items within an order. Each row represents a single product and quantity within the parent order.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique line item identifier'],
        ['order_id', params['primary-key-type'] || 'UUID', 'FK -> orders.id, NOT NULL', 'Parent order'],
        ['product_id', params['primary-key-type'] || 'UUID', 'FK -> products.id, NOT NULL', 'Purchased product'],
        ['quantity', 'INTEGER', 'NOT NULL, DEFAULT 1', 'Number of units'],
        ['unit_price_cents', 'INTEGER', 'NOT NULL', 'Price per unit at time of purchase'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Record creation'],
      ]
    ));

    sections.push(createHeading('payments', 2));
    sections.push(createParagraph('Payment transaction records. Tracks all payment attempts, successes, and refunds against orders.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique payment identifier'],
        ['order_id', params['primary-key-type'] || 'UUID', 'FK -> orders.id, NOT NULL', 'Associated order'],
        ['amount_cents', 'INTEGER', 'NOT NULL', 'Payment amount in smallest currency unit'],
        ['currency', 'VARCHAR(3)', 'NOT NULL, DEFAULT NZD', 'ISO 4217 currency code'],
        ['status', 'ENUM(pending, succeeded, failed, refunded)', 'NOT NULL', 'Payment status'],
        ['provider', 'VARCHAR(50)', 'NOT NULL', 'Payment provider (e.g. stripe)'],
        ['provider_transaction_id', 'VARCHAR(255)', 'NULLABLE', 'External transaction reference'],
        ['failure_reason', 'VARCHAR(255)', 'NULLABLE', 'Reason for failed payment'],
        ['refunded_at', 'TIMESTAMP', 'NULLABLE', 'Refund timestamp if applicable'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Transaction timestamp'],
      ]
    ));
  }

  // --- 5. Supporting Tables ---
  sections.push(createHeading('Supporting Tables', 1));
  sections.push(createParagraph('Supporting tables provide infrastructure for authentication, auditing, and application configuration. These tables are critical for operational concerns but are not part of the core business domain.'));

  if (flags.needs_auth) {
    sections.push(createHeading('sessions', 2));
    sections.push(createParagraph('Active user sessions. Used for session management, concurrent session tracking, and forced logout capability.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique session identifier'],
        ['user_id', params['primary-key-type'] || 'UUID', 'FK -> users.id, NOT NULL', 'Session owner'],
        ['token_hash', 'VARCHAR(255)', 'UNIQUE, NOT NULL', 'Hashed session/refresh token'],
        ['ip_address', 'VARCHAR(45)', 'NULLABLE', 'Client IP at session creation'],
        ['user_agent', 'VARCHAR(500)', 'NULLABLE', 'Client user agent string'],
        ['expires_at', 'TIMESTAMP', 'NOT NULL', 'Session expiry timestamp'],
        ['last_active_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last activity timestamp'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Session creation'],
      ]
    ));
    sections.push(createParagraph('Expired sessions are purged by a scheduled cleanup job. Sessions do not use soft deletes — expired or revoked sessions are hard-deleted.'));
  }

  sections.push(createHeading('audit_logs', 2));
  sections.push(createParagraph('Immutable audit trail for security-relevant and business-critical events. Append-only — rows are never updated or deleted.'));
  sections.push(createTable(
    ['Column', 'Type', 'Constraints', 'Description'],
    [
      ['id', 'BIGINT AUTO_INCREMENT', 'PK', 'Sequential audit log identifier'],
      ['actor_id', params['primary-key-type'] || 'UUID', 'FK -> users.id, NULLABLE', 'User who performed the action (NULL for system events)'],
      ['action', 'VARCHAR(100)', 'NOT NULL', 'Action performed (e.g. user.login, order.created, role.granted)'],
      ['entity_type', 'VARCHAR(50)', 'NOT NULL', 'Target entity table name'],
      ['entity_id', 'VARCHAR(255)', 'NOT NULL', 'Target entity primary key'],
      ['changes', 'JSON', 'NULLABLE', 'Before/after snapshot of changed fields'],
      ['ip_address', 'VARCHAR(45)', 'NULLABLE', 'Client IP address'],
      ['user_agent', 'VARCHAR(500)', 'NULLABLE', 'Client user agent'],
      ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Event timestamp'],
    ]
  ));
  sections.push(createParagraph('Audit logs are retained according to the data retention policy defined in the Data Retention section. Logs are indexed by actor_id, action, entity_type, and created_at for efficient querying.'));

  sections.push(createHeading('config', 2));
  sections.push(createParagraph('Application configuration stored in the database. Used for runtime-configurable settings that do not require a deployment to change.'));
  sections.push(createTable(
    ['Column', 'Type', 'Constraints', 'Description'],
    [
      ['key', 'VARCHAR(100)', 'PK', 'Configuration key (dot-notation, e.g. app.maintenance_mode)'],
      ['value', 'TEXT', 'NOT NULL', 'Configuration value (JSON-encoded for complex types)'],
      ['description', 'VARCHAR(255)', 'NULLABLE', 'Human-readable description of the setting'],
      ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last modification'],
      ['updated_by', params['primary-key-type'] || 'UUID', 'FK -> users.id, NULLABLE', 'User who last changed the value'],
    ]
  ));

  // --- 6. Integration Tables ---
  if (integrations.length) {
    sections.push(createHeading('Integration Tables', 1));
    sections.push(createParagraph('These tables support data exchange with third-party services. Each integration stores its operational data, sync state, and webhook event logs.'));

    for (const integration of integrations) {
      const displayName = integration.charAt(0).toUpperCase() + integration.slice(1);

      sections.push(createHeading(`${displayName} Integration`, 2));
      sections.push(createParagraph(`Data storage for the ${displayName} integration. Maintains sync state and caches external references to reduce API calls.`));
      sections.push(createTable(
        ['Column', 'Type', 'Constraints', 'Description'],
        [
          ['id', params['primary-key-type'] || 'UUID', 'PK', 'Unique record identifier'],
          ['external_id', 'VARCHAR(255)', 'UNIQUE, NOT NULL', `${displayName} external reference ID`],
          ['entity_type', 'VARCHAR(50)', 'NOT NULL', 'Local entity type this maps to'],
          ['entity_id', 'VARCHAR(255)', 'NOT NULL', 'Local entity primary key'],
          ['sync_status', 'ENUM(synced, pending, error)', 'NOT NULL, DEFAULT pending', 'Current sync state'],
          ['last_synced_at', 'TIMESTAMP', 'NULLABLE', 'Last successful sync timestamp'],
          ['metadata', 'JSON', 'NULLABLE', `Cached ${displayName} response data`],
          ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Record creation'],
          ['updated_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'Last modification'],
        ]
      ));
      sections.push(createParagraph(`[PLACEHOLDER — define ${displayName}-specific columns based on the data exchanged with this integration]`));
    }

    sections.push(createHeading('integration_logs', 2));
    sections.push(createParagraph('Logs all API calls to and from third-party integrations. Used for debugging sync issues and monitoring API usage against rate limits.'));
    sections.push(createTable(
      ['Column', 'Type', 'Constraints', 'Description'],
      [
        ['id', 'BIGINT AUTO_INCREMENT', 'PK', 'Sequential log identifier'],
        ['integration', 'VARCHAR(50)', 'NOT NULL', 'Integration name (e.g. stripe, xero)'],
        ['direction', 'ENUM(inbound, outbound)', 'NOT NULL', 'API call direction'],
        ['endpoint', 'VARCHAR(500)', 'NOT NULL', 'API endpoint called'],
        ['method', 'VARCHAR(10)', 'NOT NULL', 'HTTP method (GET, POST, etc.)'],
        ['status_code', 'INTEGER', 'NULLABLE', 'HTTP response status code'],
        ['request_body', 'JSON', 'NULLABLE', 'Request payload (sensitive fields redacted)'],
        ['response_body', 'JSON', 'NULLABLE', 'Response payload (truncated if large)'],
        ['duration_ms', 'INTEGER', 'NULLABLE', 'Request duration in milliseconds'],
        ['error', 'TEXT', 'NULLABLE', 'Error message if the call failed'],
        ['created_at', 'TIMESTAMP', 'NOT NULL, DEFAULT NOW()', 'API call timestamp'],
      ]
    ));
  } else {
    sections.push(createHeading('Integration Tables', 1));
    sections.push(createParagraph('[PLACEHOLDER — no active integrations detected. Add integration-specific tables here when third-party services are configured. Each integration typically requires a mapping table (local ID to external ID) and an API call log table.]'));
  }

  // --- 7. Data Types & Conventions ---
  sections.push(createHeading('Data Types & Conventions', 1));
  sections.push(createParagraph('Consistent data type usage across the schema prevents implicit type coercion bugs and ensures predictable storage behaviour.'));

  sections.push(createHeading('Timestamps', 2));
  sections.push(...createBulletList([
    'All timestamps are stored in UTC — timezone conversion happens at the application/presentation layer',
    'TIMESTAMP WITH TIME ZONE is used where the database supports it (PostgreSQL); DATETIME in UTC otherwise (MySQL/SQLite)',
    'created_at is set once on insert and never modified',
    'updated_at is refreshed on every UPDATE via trigger or application logic',
    'Application code uses ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) for all timestamp serialisation',
  ]));

  sections.push(createHeading('Identifiers', 2));
  const pkType = params['primary-key-type'] || 'UUID';
  sections.push(createParagraph(`Primary key strategy: ${pkType}.`));
  if (pkType.toLowerCase().includes('uuid')) {
    sections.push(...createBulletList([
      'UUIDs are generated at the application layer (UUIDv4 or UUIDv7 for sortability)',
      'Stored as a native UUID type where supported (PostgreSQL), or CHAR(36)/BINARY(16) otherwise',
      'UUIDs prevent enumeration attacks and allow distributed ID generation without coordination',
      'For tables requiring high-volume inserts, UUIDv7 (time-ordered) is preferred for index performance',
    ]));
  } else {
    sections.push(...createBulletList([
      'Auto-incrementing BIGINT provides compact, sortable identifiers',
      'External-facing IDs are obfuscated or supplemented with a public_id column to prevent enumeration',
      'Sequence gaps are expected and acceptable — no business logic depends on contiguous IDs',
    ]));
  }

  sections.push(createHeading('Enums', 2));
  sections.push(createParagraph('Enumerated types are used for columns with a fixed, small set of valid values (e.g. status, type, role). The implementation approach depends on the database technology:'));
  sections.push(...createBulletList([
    'PostgreSQL — native ENUM types or CHECK constraints',
    'MySQL — ENUM column type with defined values',
    'SQLite — VARCHAR with CHECK constraint',
    'All enum values are lowercase with underscores (e.g. in_progress, pending_review)',
    'Adding new enum values requires a migration — application code must handle unknown values gracefully during rollout',
  ]));

  sections.push(createHeading('JSON Columns', 2));
  sections.push(createParagraph('JSON columns are used for flexible, semi-structured data that does not warrant its own table (e.g. metadata, preferences, configuration). Usage guidelines:'));
  sections.push(...createBulletList([
    'JSON columns are validated at the application layer before insertion',
    'Avoid querying deeply nested JSON paths in WHERE clauses — extract frequently-queried fields into dedicated columns',
    'JSON columns have a defined schema documented in this document or in application-level type definitions',
    'PostgreSQL: use JSONB for indexable, binary-stored JSON. MySQL: use native JSON type',
    'Maximum JSON column size is bounded by application validation (recommended: 64KB unless explicitly justified)',
  ]));

  // --- 8. Indexes ---
  sections.push(createHeading('Indexes', 1));
  sections.push(createParagraph('Indexes are defined to support the query patterns documented in the Query Patterns section. Every index has a clear justification — unnecessary indexes slow writes and consume storage.'));

  sections.push(createHeading('Indexing Strategy', 2));
  sections.push(...createBulletList([
    'Primary keys are automatically indexed (clustered index)',
    'All foreign key columns are indexed to support JOIN performance',
    'Columns used in WHERE, ORDER BY, or GROUP BY clauses are indexed based on query frequency',
    'Unique constraints create implicit unique indexes',
    'Partial indexes are used for soft-deleted records (e.g. WHERE deleted_at IS NULL) to exclude inactive data',
    'Index-only scans (covering indexes) are used for high-frequency read patterns',
    'Index usage is monitored — unused indexes are dropped during periodic review',
  ]));

  sections.push(createHeading('Composite Indexes', 2));
  sections.push(createParagraph('Composite (multi-column) indexes are defined for queries that filter or sort on multiple columns simultaneously. Column order in composite indexes follows the selectivity principle — most selective column first.'));
  const compositeExamples = [
    'idx_audit_logs_entity: (entity_type, entity_id, created_at) — entity history lookups',
    'idx_orders_user_status: (user_id, status, created_at) — user order listing with status filter',
  ];
  if (flags.needs_auth) {
    compositeExamples.unshift('idx_users_email_active: (email, is_active) — login queries on active accounts');
  }
  if (flags.needs_cms) {
    compositeExamples.push('idx_pages_status_published: (status, published_at) — published content listing');
  }
  sections.push(...createBulletList(compositeExamples));
  sections.push(createParagraph('[PLACEHOLDER — add project-specific composite indexes based on actual query patterns identified during development]'));

  if (flags.needs_search) {
    sections.push(createHeading('Full-Text Indexes', 2));
    const searchTech = params['search-technology'] || '[Full-text search technology — to be confirmed]';
    sections.push(createParagraph(`Full-text search is implemented using ${searchTech}. The following content is indexed for search:`));
    const searchTargets = [];
    if (flags.needs_cms) {
      searchTargets.push('pages.title, pages.content, pages.excerpt — site content search');
    }
    if (flags.needs_payments) {
      searchTargets.push('products.name, products.description — product catalogue search');
    }
    searchTargets.push('[PLACEHOLDER — additional searchable fields based on project requirements]');
    sections.push(...createBulletList(searchTargets));
    sections.push(...createBulletList([
      'Full-text indexes are rebuilt on content changes (real-time or near-real-time)',
      'Search queries support stemming, fuzzy matching, and relevance scoring',
      'Search results are filtered by the same access control rules as direct queries',
      'Search index size and rebuild times are monitored as part of operational health checks',
    ]));
  }

  // --- 9. Migrations ---
  sections.push(createHeading('Migrations', 1));
  sections.push(createParagraph('All schema changes are managed through versioned migration files. Migrations are the single source of truth for database structure — the schema is never modified directly.'));

  sections.push(createHeading('Migration Strategy', 2));
  // Detect ORM/migration tool from harvested dependencies
  const ormFromDeps = ctxDbDeps.find(d => /prisma|drizzle|typeorm|knex|sequelize|mongoose|alembic|sqlalchemy/i.test(d)) || '';
  const migrationTool = ormFromDeps || params['migration-tool'] || '[Migration tool — e.g. Knex, Prisma, TypeORM, Drizzle, Alembic]';
  sections.push(createParagraph(`Migrations are managed using ${migrationTool}. Each migration is a self-contained, atomic operation that transforms the schema from one version to the next.`));
  sections.push(...createBulletList([
    'Migrations are timestamped and run in chronological order',
    'Each migration file contains both up (apply) and down (rollback) operations',
    'Migrations are immutable once merged — corrections require a new migration',
    'Migration files are committed to version control alongside application code',
    'Schema changes are reviewed in pull requests with the same rigour as application code',
  ]));

  sections.push(createHeading('Versioning', 2));
  sections.push(...createBulletList([
    'Migration filenames follow the pattern: {timestamp}_{description}.{ext} (e.g. 20260312_create_users_table.sql)',
    'A migrations tracking table records which migrations have been applied to each environment',
    'Running migrations is idempotent — re-running an already-applied migration has no effect',
    'Schema version can be queried at runtime for health checks and compatibility validation',
  ]));

  sections.push(createHeading('Rollback', 2));
  sections.push(createParagraph('Every migration must have a working rollback (down) operation. Rollback procedures:'));
  sections.push(...createBulletList([
    'Rollbacks are tested in CI before merge — both up and down must succeed',
    'Data-destructive migrations (column drops, type changes) include a data backup step in the up migration',
    'Rollbacks in production require explicit approval and are preceded by a database snapshot',
    'Two-phase migrations are used for breaking changes: phase 1 adds the new structure, phase 2 (next release) removes the old',
    'Emergency rollback procedure: restore from the most recent automated snapshot if migration rollback is insufficient',
  ]));

  // --- 10. Seed Data ---
  sections.push(createHeading('Seed Data', 1));
  sections.push(createParagraph('Seed data provides the initial state required for the application to function. Seeds are versioned and repeatable — running seeds on an already-seeded database updates existing records without creating duplicates.'));

  sections.push(createHeading('Initial Data', 2));
  sections.push(createParagraph('The following data is seeded on first deployment:'));
  const seedData = [];
  if (flags.needs_auth) {
    seedData.push('Default roles: admin, [PLACEHOLDER — project-specific roles]');
    seedData.push('Initial admin user account (credentials provided via environment variable, not hardcoded)');
  }
  seedData.push('Application config defaults (config table initial entries)');
  seedData.push('[PLACEHOLDER — project-specific seed data such as categories, regions, default content]');
  sections.push(...createBulletList(seedData));

  sections.push(createHeading('Lookup Tables', 2));
  sections.push(createParagraph('Lookup tables contain reference data that rarely changes and is used for validation, dropdowns, and categorisation:'));
  sections.push(...createBulletList([
    '[PLACEHOLDER — e.g. countries, currencies, timezones, status types, category hierarchies]',
    'Lookup data is seeded from JSON or CSV files stored alongside migration files',
    'Lookup tables use a code column (short, stable identifier) in addition to id for application-level references',
    'Changes to lookup data follow the same migration process as schema changes',
  ]));

  sections.push(createHeading('Test/Development Data', 2));
  sections.push(createParagraph('A separate seed file provides realistic test data for development and staging environments:'));
  sections.push(...createBulletList([
    'Test seeds are clearly separated from production seeds and never run in production',
    'Test data uses realistic but fictional values (no real customer data)',
    'Test seeds create a complete scenario covering all major workflows and edge cases',
    'Seed data volume is configurable — small for local development, larger for load testing',
  ]));

  // --- 11. Query Patterns ---
  sections.push(createHeading('Query Patterns', 1));
  sections.push(createParagraph('This section documents the most common and performance-critical query patterns. These patterns inform index design and caching strategy.'));

  sections.push(createHeading('Common Queries', 2));
  const queryPatterns = [];
  if (flags.needs_auth) {
    queryPatterns.push('User lookup by email (login flow) — single row, indexed on email');
    queryPatterns.push('User with roles (authorisation check) — JOIN users + user_roles + roles, cached per session');
  }
  if (flags.needs_cms) {
    queryPatterns.push('Published pages listing — filtered by status=published, ordered by published_at DESC, paginated');
    queryPatterns.push('Single page by slug — single row lookup, indexed on slug');
  }
  if (flags.needs_payments) {
    queryPatterns.push('User order history — filtered by user_id, ordered by created_at DESC, paginated');
    queryPatterns.push('Order with items — JOIN orders + order_items + products, single order context');
    queryPatterns.push('Revenue reporting — aggregate SUM on payments by date range, grouped by period');
  }
  queryPatterns.push('Audit log by entity — filtered by entity_type + entity_id, ordered by created_at DESC');
  queryPatterns.push('[PLACEHOLDER — add project-specific query patterns as they are identified during development]');
  sections.push(...createBulletList(queryPatterns));

  sections.push(createHeading('N+1 Prevention', 2));
  sections.push(createParagraph('N+1 query problems are a common source of performance degradation. The following practices prevent them:'));
  sections.push(...createBulletList([
    'Use eager loading (JOIN or subquery) for related data that is always displayed together',
    'Batch loading for collections — fetch all related records in a single IN() query rather than one query per parent',
    'DataLoader pattern (or equivalent) for GraphQL resolvers to batch and deduplicate database calls',
    'ORM/query builder configured to warn on N+1 patterns in development mode',
    'Query logging in development highlights queries exceeding a per-request threshold (default: 10 queries)',
    'Performance tests include query count assertions for critical endpoints',
  ]));

  sections.push(createHeading('Pagination', 2));
  sections.push(createParagraph('All list endpoints use cursor-based or keyset pagination for consistent performance on large datasets:'));
  sections.push(...createBulletList([
    'Cursor-based pagination is preferred over offset-based for large tables (avoids OFFSET performance degradation)',
    'Page size is capped at a maximum (e.g. 100 records) with a sensible default (e.g. 20)',
    'Pagination metadata includes: cursor/next_cursor, has_more, and total_count (where practical)',
    'Sorting is always on an indexed column to prevent full table scans',
  ]));

  // --- 12. Backup & Recovery ---
  sections.push(createHeading('Backup & Recovery', 1));
  sections.push(createParagraph('Data durability is a critical operational requirement. The backup strategy is designed to minimise data loss and recovery time in all failure scenarios.'));

  sections.push(createHeading('Backup Schedule', 2));
  const backupSchedule = params['backup-schedule'] || '[Backup schedule — to be confirmed based on hosting platform]';
  sections.push(createParagraph(`Backup schedule: ${backupSchedule}.`));
  sections.push(createTable(
    ['Backup Type', 'Frequency', 'Retention', 'Storage'],
    [
      ['Full snapshot', 'Daily', '30 days', 'Offsite/cloud object storage'],
      ['Incremental', 'Hourly', '7 days', 'Same region, separate storage'],
      ['Transaction log', 'Continuous (WAL/binlog)', '72 hours', 'Local + replicated'],
      ['Pre-deployment', 'Every deployment', '14 days', 'Offsite/cloud object storage'],
    ]
  ));

  sections.push(createHeading('Point-in-Time Recovery', 2));
  sections.push(createParagraph('Point-in-time recovery (PITR) allows restoring the database to any moment within the transaction log retention window:'));
  sections.push(...createBulletList([
    'PITR is supported via continuous transaction log archival (WAL archiving for PostgreSQL, binlog for MySQL)',
    'Recovery target can be specified as a timestamp, transaction ID, or named restore point',
    'Recovery procedure is documented in the operations runbook and tested quarterly',
    'Recovery time objective (RTO): [PLACEHOLDER — e.g. 1 hour]',
    'Recovery point objective (RPO): [PLACEHOLDER — e.g. 5 minutes of data loss maximum]',
  ]));

  sections.push(createHeading('Disaster Recovery', 2));
  sections.push(...createBulletList([
    'Database replicas run in a separate availability zone for failover',
    'Backup integrity is verified via automated restore tests (weekly)',
    'Recovery procedures are documented step-by-step in the operations runbook',
    'Disaster recovery drill is conducted at least once per quarter',
    'Backups are encrypted at rest using AES-256 with keys managed by the hosting platform',
  ]));

  // --- 13. Data Retention ---
  sections.push(createHeading('Data Retention', 1));
  sections.push(createParagraph('Data retention policies balance operational needs, legal requirements, and storage costs. All policies comply with applicable privacy legislation (including the NZ Privacy Act 2020 and GDPR where applicable).'));

  sections.push(createHeading('Retention Policies', 2));
  sections.push(createTable(
    ['Data Category', 'Retention Period', 'Action After Expiry'],
    [
      ['User accounts (active)', 'Indefinite while active', 'N/A'],
      ['User accounts (soft-deleted)', params['deleted-user-retention'] || '90 days', 'Hard delete all user data'],
      ['Audit logs', params['audit-log-retention'] || '2 years', 'Archive to cold storage, then purge'],
      ['Session data', '30 days after expiry', 'Hard delete'],
      ['Integration logs', '90 days', 'Hard delete'],
      ['Transaction/payment records', '7 years', 'Archive to cold storage (financial compliance)'],
      ['Temporary files/uploads', '24 hours', 'Hard delete'],
      ['[PLACEHOLDER]', '[PLACEHOLDER]', '[PLACEHOLDER]'],
    ]
  ));

  sections.push(createHeading('Archival', 2));
  sections.push(createParagraph('Data that exceeds its active retention period but has legal or compliance value is archived:'));
  sections.push(...createBulletList([
    'Archived data is moved to cold storage (e.g. S3 Glacier, Azure Archive) to reduce costs',
    'Archived data retains its original encryption and access controls',
    'Archived data can be restored on request within [PLACEHOLDER — e.g. 24 hours]',
    'A scheduled job runs the archival process and logs all actions to the audit trail',
    'Archival does not affect application functionality — all queries operate on active data only',
  ]));

  sections.push(createHeading('GDPR & Privacy Compliance', 2));
  sections.push(createParagraph('The schema supports privacy compliance requirements through the following mechanisms:'));
  sections.push(...createBulletList([
    'Data subject access requests (DSAR): a query can export all data associated with a user ID across all tables',
    'Right to erasure: a deletion cascade removes or anonymises all personal data for a given user',
    'Data minimisation: only data required for the application\'s purpose is collected and stored',
    'Consent tracking: user consent decisions are recorded with timestamps and version references',
    'Data processing records: the audit_logs table provides a complete record of data access and modification',
    'Cross-border transfers: data residency constraints are enforced at the hosting/infrastructure level',
    '[PLACEHOLDER — add project-specific privacy requirements based on jurisdiction and data types]',
  ]));

  return createDocument({
    title: 'Database Schema Documentation',
    subtitle: projectName,
    clientName,
    brandConfig,
    sections,
  version: options.version ? `v${options.version}` : undefined,
  });
}
