// Template helpers — parameter resolver, key fact resolver, conditional resolver, clause loader
// Used by all document templates to inject data from docs-state.md into templates

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve {{parameter-name}} placeholders in a template string.
 * Missing parameters are left as-is (placeholder preserved).
 */
export function resolveParameters(template, params) {
  if (!template || !params) return template;

  return template.replace(/\{\{([^{}#/]+?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    // Skip fact: and integration: prefixed keys — handled by other resolvers
    if (trimmedKey.startsWith('fact:') || trimmedKey.startsWith('integration:')) {
      return match;
    }
    const value = params[trimmedKey];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match; // Leave placeholder if param not found
  });
}

/**
 * Resolve {{fact:name}} placeholders with values from key facts.
 */
export function resolveKeyFacts(template, keyFacts) {
  if (!template || !keyFacts) return template;

  return template.replace(/\{\{fact:([^{}]+?)\}\}/g, (match, factName) => {
    const trimmedName = factName.trim();
    const value = keyFacts[trimmedName];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match; // Leave placeholder if fact not found
  });
}

/**
 * Process {{#if integration:name}}content{{/if}} conditional blocks.
 * If the named integration is in the integrations list/object, includes the content.
 * Otherwise removes the entire block.
 */
export function resolveConditionals(template, integrations) {
  if (!template) return template;

  // Normalize integrations to a Set of lowercase names
  const integrationSet = new Set();
  if (Array.isArray(integrations)) {
    integrations.forEach(i => integrationSet.add(i.toLowerCase()));
  } else if (integrations && typeof integrations === 'object') {
    for (const [name, status] of Object.entries(integrations)) {
      if (status === 'active') {
        integrationSet.add(name.toLowerCase());
      }
    }
  }

  return template.replace(
    /\{\{#if integration:([^{}]+?)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, integrationName, content) => {
      const trimmedName = integrationName.trim().toLowerCase();
      if (integrationSet.has(trimmedName)) {
        return content;
      }
      return ''; // Remove block if integration not active
    }
  );
}

/**
 * Convenience function — runs all three resolvers in sequence.
 * Takes a template string and a docs-state object.
 */
export function resolveTemplate(template, docsState) {
  if (!template || !docsState) return template;

  let result = template;

  // Resolve conditionals first (they may contain parameters/facts)
  result = resolveConditionals(result, docsState.integrationClauses || {});

  // Resolve parameters
  result = resolveParameters(result, docsState.parameters || {});

  // Resolve key facts
  result = resolveKeyFacts(result, docsState.keyFacts || {});

  return result;
}

/**
 * Format a date for document display.
 * @param {Date|string} date - Date to format
 * @param {'long'|'short'} format - Output format
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'long') {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);

  if (format === 'short') {
    return d.toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // long format
  return d.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format a currency amount.
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: NZD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'NZD') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);

  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Load an integration clause markdown file and parse into sections.
 * @param {string} integrationName - e.g. 'stripe'
 * @returns {Object|null} Parsed clause with sections, or null if file not found
 */
export function loadIntegrationClause(integrationName) {
  const filePath = join(__dirname, '..', 'legal', 'integrations', `${integrationName}.md`);
  if (!existsSync(filePath)) return null;

  const content = readFileSync(filePath, 'utf-8');
  const sections = {};
  let currentSection = null;
  let currentLines = [];

  for (const line of content.split('\n')) {
    const h2Match = line.match(/^## (.+)/);
    const h1Match = line.match(/^# (.+)/);

    if (h1Match) {
      sections.name = h1Match[1].trim();
      continue;
    }

    if (h2Match) {
      if (currentSection) {
        sections[currentSection] = currentLines.join('\n').trim();
      }
      currentSection = h2Match[1].trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      currentLines = [];
      continue;
    }

    if (currentSection) {
      currentLines.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentLines.join('\n').trim();
  }

  return sections;
}

/**
 * Load all active integration clauses for a project.
 * @param {Object} integrationClauses - from docsState.integrationClauses
 * @returns {Array<Object>} Array of { name, clause } objects
 */
/**
 * Safely resolve a value from the enriched docsState context.
 * Tries projectContext first, then chainContext, then parameters, then fallback.
 * @param {Object} docsState - The enriched docsState object
 * @param {string} path - Dot-notation path (e.g. 'client.name', 'dependencies.framework')
 * @param {*} fallback - Default value if not found
 */
export function resolveContext(docsState, path, fallback = '') {
  const pc = docsState.projectContext || {};
  const cc = docsState.chainContext || {};
  const params = docsState.parameters || {};

  // Try projectContext first (deepest/richest)
  let value = getNestedValue(pc, path);
  if (isUsableCtxValue(value)) return value;

  // Try chainContext (from upstream docs)
  value = getNestedValue(cc, path);
  if (isUsableCtxValue(value)) return value;

  // Try flat parameters (legacy/user-curated)
  value = params[path] || params[path.split('.').pop()];
  if (isUsableCtxValue(value)) return value;

  return fallback;
}

function isUsableCtxValue(v) {
  if (v === undefined || v === null || v === '') return false;
  if (typeof v === 'string' && v.startsWith('[') && v.endsWith(']')) return false;
  return true;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

/**
 * Get formatted dependency list for a category from project context.
 * @param {Object} docsState - The enriched docsState object
 * @param {string} category - 'framework', 'database', 'auth', 'payments', 'css', 'testing', 'email', 'all'
 * @returns {string[]} Array of dependency strings (e.g. 'next@16.0.0')
 */
export function listDependencies(docsState, category = 'all') {
  const deps = docsState.projectContext?.dependencies || {};
  if (category === 'all') {
    return Object.values(deps).flat();
  }
  return deps[category] || [];
}

/**
 * Get clean dependency names (without version) for a category.
 */
export function listDependencyNames(docsState, category = 'all') {
  return listDependencies(docsState, category).map(d => d.split('@')[0]);
}

export function loadActiveIntegrationClauses(integrationClauses) {
  if (!integrationClauses || typeof integrationClauses !== 'object') return [];

  const results = [];
  for (const [name, status] of Object.entries(integrationClauses)) {
    if (status !== 'active') continue;
    const clause = loadIntegrationClause(name);
    results.push({ name, clause }); // clause may be null if file missing
  }
  return results;
}
