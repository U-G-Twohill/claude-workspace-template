// Core document generation engine
// Wraps the docx package with brand-aware defaults

import {
  Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, Header, Footer, PageNumber,
  NumberFormat, Packer, Tab, TabStopType, TabStopPosition,
} from 'docx';
import { writeFileSync } from 'node:fs';
import { HEADING_STYLES, BODY_STYLES, TABLE_STYLES, LEGAL_STYLES, PAGE_LAYOUT } from './styles.js';

/**
 * Create a docx Document with standard structure.
 * @param {Object} options
 * @param {string} options.title - Document title
 * @param {string} options.subtitle - Optional subtitle
 * @param {string} options.clientName - Client name for cover page
 * @param {Object} options.brandConfig - Brand configuration
 * @param {Array} options.sections - Array of section objects (paragraphs, tables, etc.)
 * @param {string} options.version - Document version (e.g. "v1")
 * @returns {Document}
 */
export function createDocument({ title, subtitle, clientName, brandConfig, sections, version = 'v1' }) {
  const company = brandConfig?.companyName || 'ICU Media Design';
  const today = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

  // Cover page section
  const coverSection = {
    properties: {
      page: {
        margin: PAGE_LAYOUT.margins,
      },
    },
    headers: { default: createHeader(company, title) },
    footers: { default: createFooter() },
    children: [
      new Paragraph({ spacing: { before: 4000 } }),
      new Paragraph({
        children: [new TextRun({ text: company, font: HEADING_STYLES.h3.font, size: HEADING_STYLES.h3.size, color: HEADING_STYLES.h3.color })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({
        children: [new TextRun({ text: title, font: HEADING_STYLES.h1.font, size: HEADING_STYLES.h1.size, bold: true, color: HEADING_STYLES.h1.color })],
        alignment: AlignmentType.CENTER,
      }),
      ...(subtitle ? [new Paragraph({
        children: [new TextRun({ text: subtitle, font: BODY_STYLES.italic.font, size: BODY_STYLES.italic.size, italics: true, color: BODY_STYLES.italic.color })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      })] : []),
      new Paragraph({ spacing: { before: 600 } }),
      ...(clientName ? [new Paragraph({
        children: [new TextRun({ text: `Prepared for: ${clientName}`, font: BODY_STYLES.paragraph.font, size: BODY_STYLES.paragraph.size, color: BODY_STYLES.paragraph.color })],
        alignment: AlignmentType.CENTER,
      })] : []),
      new Paragraph({
        children: [new TextRun({ text: `Date: ${today}`, font: BODY_STYLES.paragraph.font, size: BODY_STYLES.paragraph.size, color: BODY_STYLES.paragraph.color })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Version: ${version}`, font: BODY_STYLES.small.font, size: BODY_STYLES.small.size, color: BODY_STYLES.small.color })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
      }),
      new Paragraph({ pageBreakBefore: true }),
      ...sections,
    ],
  };

  return new Document({ sections: [coverSection] });
}

/**
 * Serialize a Document to a .docx file.
 */
export async function saveDocument(document, outputPath) {
  const buffer = await Packer.toBuffer(document);
  writeFileSync(outputPath, buffer);
  return outputPath;
}

/**
 * Create a styled heading paragraph.
 */
export function createHeading(text, level = 1) {
  const style = level === 1 ? HEADING_STYLES.h1 : level === 2 ? HEADING_STYLES.h2 : level === 3 ? HEADING_STYLES.h3 : HEADING_STYLES.h4;
  const headingLevel = level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4;

  return new Paragraph({
    heading: headingLevel,
    children: [new TextRun({ text, font: style.font, size: style.size, bold: style.bold, color: style.color })],
    spacing: { before: style.spacingBefore, after: style.spacingAfter },
  });
}

/**
 * Create a styled body paragraph.
 */
export function createParagraph(text, options = {}) {
  const style = BODY_STYLES.paragraph;
  return new Paragraph({
    children: [new TextRun({
      text,
      font: style.font,
      size: style.size,
      color: style.color,
      bold: options.bold || false,
      italics: options.italic || false,
    })],
    spacing: { after: style.spacingAfter },
    alignment: options.alignment,
  });
}

/**
 * Create a bullet list from items.
 */
export function createBulletList(items) {
  return items.map(text => new Paragraph({
    children: [new TextRun({ text: `  ${text}`, font: BODY_STYLES.listItem.font, size: BODY_STYLES.listItem.size, color: BODY_STYLES.listItem.color })],
    bullet: { level: 0 },
    spacing: { after: BODY_STYLES.listItem.spacingAfter },
  }));
}

/**
 * Create a styled table.
 */
export function createTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, font: TABLE_STYLES.header.font, size: TABLE_STYLES.header.size, bold: true, color: TABLE_STYLES.header.color })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { fill: TABLE_STYLES.header.background },
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  });

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: String(cell || ''), font: TABLE_STYLES.cell.font, size: TABLE_STYLES.cell.size, color: TABLE_STYLES.cell.color })],
      })],
      ...(idx % 2 === 1 ? { shading: { fill: TABLE_STYLES.alternateRow.background } } : {}),
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/**
 * Create signature block with date lines.
 */
export function createSignatureBlock(parties) {
  const blocks = [];
  for (const party of parties) {
    blocks.push(new Paragraph({ spacing: { before: 600 } }));
    blocks.push(new Paragraph({
      children: [new TextRun({ text: party.role || party.name, font: BODY_STYLES.bold.font, size: BODY_STYLES.bold.size, bold: true, color: BODY_STYLES.bold.color })],
    }));
    blocks.push(new Paragraph({ spacing: { before: 400 } }));
    blocks.push(new Paragraph({
      children: [new TextRun({ text: 'Signature: ____________________________', font: BODY_STYLES.paragraph.font, size: BODY_STYLES.paragraph.size, color: BODY_STYLES.paragraph.color })],
    }));
    blocks.push(new Paragraph({
      children: [new TextRun({ text: `Name: ${party.name || '____________________________'}`, font: BODY_STYLES.paragraph.font, size: BODY_STYLES.paragraph.size, color: BODY_STYLES.paragraph.color })],
      spacing: { before: 200 },
    }));
    blocks.push(new Paragraph({
      children: [new TextRun({ text: 'Date: ____________________________', font: BODY_STYLES.paragraph.font, size: BODY_STYLES.paragraph.size, color: BODY_STYLES.paragraph.color })],
      spacing: { before: 200 },
    }));
  }
  return blocks;
}

// --- Internal helpers ---

function createHeader(companyName, docTitle) {
  return new Header({
    children: [new Paragraph({
      children: [
        new TextRun({ text: companyName, font: BODY_STYLES.small.font, size: BODY_STYLES.small.size, color: BODY_STYLES.small.color }),
        new TextRun({ text: `\t${docTitle}`, font: BODY_STYLES.small.font, size: BODY_STYLES.small.size, color: BODY_STYLES.small.color }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    })],
  });
}

function createFooter() {
  return new Footer({
    children: [new Paragraph({
      children: [
        new TextRun({ text: 'Confidential', font: BODY_STYLES.small.font, size: BODY_STYLES.small.size, italics: true, color: BODY_STYLES.small.color }),
        new TextRun({ text: '\tPage ' }),
        new TextRun({ children: [PageNumber.CURRENT] }),
        new TextRun({ text: ' of ' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    })],
  });
}
