// Brand config loader and injector
// Reads the global brand config and provides processed brand data for document generation

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Load brand configuration from a config.json file.
 * @param {string} configPath - Path to config.json (absolute or relative)
 * @returns {object} Parsed brand configuration
 */
export function loadBrandConfig(configPath) {
  const resolved = resolve(configPath);
  if (!existsSync(resolved)) {
    throw new Error(`Brand config not found: ${resolved}`);
  }
  const content = readFileSync(resolved, 'utf-8');
  return JSON.parse(content);
}

/**
 * Get processed color palette from brand config.
 * Returns hex values and RGB components for use in document styling.
 */
export function getBrandColors(config) {
  const colors = config.colors || {};
  const palette = {};

  for (const [name, hex] of Object.entries(colors)) {
    palette[name] = {
      hex,
      rgb: hexToRgb(hex)
    };
  }

  return palette;
}

/**
 * Get font configuration from brand config.
 */
export function getBrandFonts(config) {
  return {
    heading: config.fonts?.heading || 'Inter',
    body: config.fonts?.body || 'Inter'
  };
}

/**
 * Get company information from brand config.
 */
export function getCompanyInfo(config) {
  return {
    name: config.companyName || '',
    tagline: config.tagline || '',
    location: config.location || '',
    email: config.contact?.email || '',
    phone: config.contact?.phone || '',
    website: config.contact?.website || '',
    nzCompanyNumber: config.nzCompanyNumber || ''
  };
}

/**
 * Get logo paths from brand config, resolved relative to the config file location.
 */
export function getLogoPaths(config, configPath) {
  const configDir = dirname(resolve(configPath));
  return {
    light: config.logo?.light ? resolve(configDir, config.logo.light) : null,
    dark: config.logo?.dark ? resolve(configDir, config.logo.dark) : null
  };
}

// --- Internal helpers ---

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}
