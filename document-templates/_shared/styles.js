// Shared document style definitions
// Consumed by document templates when generating .docx files (via docx npm package in Phase 3+)
// These are plain style definition objects — no docx dependency required

/**
 * Heading styles — font, size (in half-points), color, spacing (in twips)
 */
export const HEADING_STYLES = {
  h1: {
    font: 'Inter',
    size: 48,       // 24pt
    bold: true,
    color: '1a1a2e',
    spacingBefore: 480,
    spacingAfter: 240,
  },
  h2: {
    font: 'Inter',
    size: 36,       // 18pt
    bold: true,
    color: '16213e',
    spacingBefore: 360,
    spacingAfter: 180,
  },
  h3: {
    font: 'Inter',
    size: 28,       // 14pt
    bold: true,
    color: '0f3460',
    spacingBefore: 240,
    spacingAfter: 120,
  },
  h4: {
    font: 'Inter',
    size: 24,       // 12pt
    bold: true,
    color: '333333',
    spacingBefore: 200,
    spacingAfter: 100,
  }
};

/**
 * Body text styles
 */
export const BODY_STYLES = {
  paragraph: {
    font: 'Inter',
    size: 22,       // 11pt
    color: '333333',
    lineSpacing: 276,  // 1.15 line spacing (240 * 1.15)
    spacingAfter: 120,
  },
  small: {
    font: 'Inter',
    size: 18,       // 9pt
    color: '666666',
    lineSpacing: 240,
    spacingAfter: 80,
  },
  bold: {
    font: 'Inter',
    size: 22,
    bold: true,
    color: '333333',
  },
  italic: {
    font: 'Inter',
    size: 22,
    italic: true,
    color: '555555',
  },
  listItem: {
    font: 'Inter',
    size: 22,
    color: '333333',
    indent: 720,    // 0.5 inch in twips
    spacingAfter: 60,
  },
};

/**
 * Table styles
 */
export const TABLE_STYLES = {
  header: {
    font: 'Inter',
    size: 20,       // 10pt
    bold: true,
    color: 'ffffff',
    background: '1a1a2e',
    alignment: 'center',
    cellPadding: 80,
  },
  cell: {
    font: 'Inter',
    size: 20,
    color: '333333',
    cellPadding: 80,
    borderColor: 'cccccc',
    borderWidth: 1,
  },
  alternateRow: {
    background: 'f5f5f5',
  },
  border: {
    color: 'cccccc',
    width: 1,
    style: 'single',
  }
};

/**
 * Legal document styles — clause numbering, indentation, fine print
 */
export const LEGAL_STYLES = {
  clauseHeading: {
    font: 'Inter',
    size: 24,       // 12pt
    bold: true,
    color: '1a1a2e',
    spacingBefore: 240,
    spacingAfter: 120,
    numbering: true,
  },
  subClause: {
    font: 'Inter',
    size: 22,
    color: '333333',
    indent: 720,
    spacingAfter: 80,
    numbering: true,
    numberingLevel: 1,
  },
  finePrint: {
    font: 'Inter',
    size: 16,       // 8pt
    color: '888888',
    italic: true,
    spacingAfter: 60,
  },
  signature: {
    font: 'Inter',
    size: 22,
    color: '333333',
    spacingBefore: 480,
    underline: true,
  }
};

/**
 * Page layout defaults
 */
export const PAGE_LAYOUT = {
  margins: {
    top: 1440,      // 1 inch in twips
    right: 1440,
    bottom: 1440,
    left: 1440,
  },
  pageSize: {
    width: 12240,   // A4 width in twips
    height: 15840,  // A4 height in twips (approximate for letter, adjust for A4: 16838)
  },
  headerHeight: 720,
  footerHeight: 720,
};
