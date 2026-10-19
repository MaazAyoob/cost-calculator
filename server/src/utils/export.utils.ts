import zlib from 'zlib';

/**
 * ==============================================================================
 * Hutty Admin Leads Export Utilities
 * RFC 4180 CSV + Spreadsheet Formula Injection Protection
 * Pure OpenXML (.xlsx) Packaging via standard ZIP container
 * ==============================================================================
 */

/**
 * Sanitizes values to prevent CSV / Spreadsheet formula injection.
 * If a cell begins with '=', '+', '-', '@', tab, or carriage return,
 * it is prepended with a single quote (') so spreadsheet engines treat it as plain text.
 */
export function sanitizeSpreadsheetCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string with formula injection protection.
 */
export function generateCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const escapeCell = (raw: string | number | boolean | null | undefined): string => {
    const sanitized = sanitizeSpreadsheetCell(raw);
    // If the cell contains commas, quotes, or newlines, quote and escape quotes
    if (/[",\n\r]/.test(sanitized)) {
      return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));

  // UTF-8 BOM (\uFEFF) ensures Excel opens the CSV with proper UTF-8 character encoding
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

/**
 * CRC-32 Lookup Table and Calculator
 */
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

export function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  path: string;
  data: Buffer;
}

/**
 * Minimal, standard-compliant in-memory ZIP packager.
 * Compresses data using Node.js built-in deflateRawSync.
 */
export function createZipArchive(files: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let currentOffset = 0;

  for (const file of files) {
    const fileNameBuf = Buffer.from(file.path, 'utf8');
    const uncompressedSize = file.data.length;
    const fileCrc = crc32(file.data);

    let compressedData: Buffer = Buffer.from(zlib.deflateRawSync(file.data));
    let compressionMethod = 8; // Deflate

    // If compressed size is not smaller, store uncompressed
    if (compressedData.length >= uncompressedSize) {
      compressedData = Buffer.from(file.data);
      compressionMethod = 0; // Store
    }

    const compressedSize = compressedData.length;

    // Local Header (30 bytes + fileNameBuf.length + compressedSize)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local file header signature
    localHeader.writeUInt16LE(20, 4); // Version needed to extract (2.0)
    localHeader.writeUInt16LE(0x0800, 6); // General purpose bit flag (UTF-8)
    localHeader.writeUInt16LE(compressionMethod, 8); // Compression method
    localHeader.writeUInt16LE(0, 10); // Last mod time
    localHeader.writeUInt16LE(0, 12); // Last mod date
    localHeader.writeUInt32LE(fileCrc, 14); // CRC-32
    localHeader.writeUInt32LE(compressedSize, 18); // Compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // Uncompressed size
    localHeader.writeUInt16LE(fileNameBuf.length, 26); // File name length
    localHeader.writeUInt16LE(0, 28); // Extra field length

    localHeaders.push(localHeader, fileNameBuf, compressedData);

    // Central Directory Header (46 bytes + fileNameBuf.length)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central file header signature
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed to extract
    centralHeader.writeUInt16LE(0x0800, 8); // UTF-8
    centralHeader.writeUInt16LE(compressionMethod, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(fileCrc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(fileNameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // Extra field length
    centralHeader.writeUInt16LE(0, 32); // File comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number start
    centralHeader.writeUInt16LE(0, 36); // Internal file attributes
    centralHeader.writeUInt32LE(0, 38); // External file attributes
    centralHeader.writeUInt32LE(currentOffset, 42); // Relative offset of local header

    centralHeaders.push(centralHeader, fileNameBuf);

    currentOffset += localHeader.length + fileNameBuf.length + compressedSize;
  }

  const centralDirOffset = currentOffset;
  const centralDirSize = centralHeaders.reduce((sum, b) => sum + b.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Disk with central directory
  eocd.writeUInt16LE(files.length, 8); // Total entries on this disk
  eocd.writeUInt16LE(files.length, 10); // Total entries in central directory
  eocd.writeUInt32LE(centralDirSize, 12); // Size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16); // Offset of start of central directory
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

/**
 * Escapes characters for XML string tags.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a valid OpenXML (.xlsx) file Buffer from tabular data.
 */
export function generateXlsx(
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): Buffer {
  const safeSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '_').slice(0, 31) || 'Leads';

  // Build Sheet1 XML
  let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  sheetXml += `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n`;
  sheetXml += `<sheetData>\n`;

  // Row 1: Headers (styled with bold header format style index 1)
  sheetXml += `  <row r="1">\n`;
  headers.forEach((h, colIdx) => {
    const colLetter = getColumnLetter(colIdx + 1);
    const cellRef = `${colLetter}1`;
    const escaped = escapeXml(sanitizeSpreadsheetCell(h));
    sheetXml += `    <c r="${cellRef}" t="inlineStr" s="1"><is><t>${escaped}</t></is></c>\n`;
  });
  sheetXml += `  </row>\n`;

  // Data Rows
  rows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 2;
    sheetXml += `  <row r="${rowNum}">\n`;
    row.forEach((cell, colIdx) => {
      const colLetter = getColumnLetter(colIdx + 1);
      const cellRef = `${colLetter}${rowNum}`;

      if (cell === null || cell === undefined || cell === '') {
        // empty cell
        return;
      }

      if (typeof cell === 'number') {
        sheetXml += `    <c r="${cellRef}"><v>${cell}</v></c>\n`;
      } else if (typeof cell === 'boolean') {
        sheetXml += `    <c r="${cellRef}" t="b"><v>${cell ? 1 : 0}</v></c>\n`;
      } else {
        const sanitized = sanitizeSpreadsheetCell(cell);
        const escaped = escapeXml(sanitized);
        sheetXml += `    <c r="${cellRef}" t="inlineStr"><is><t>${escaped}</t></is></c>\n`;
      }
    });
    sheetXml += `  </row>\n`;
  });

  sheetXml += `</sheetData>\n`;
  sheetXml += `</worksheet>`;

  // [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  // _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // xl/_rels/workbook.xml.rels
  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // xl/workbook.xml
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(safeSheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  // xl/styles.xml (Font 0: regular 11pt Calibri, Font 1: bold 11pt Calibri)
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;

  const files: ZipEntry[] = [
    { path: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') },
    { path: '_rels/.rels', data: Buffer.from(rootRelsXml, 'utf8') },
    { path: 'xl/_rels/workbook.xml.rels', data: Buffer.from(workbookRelsXml, 'utf8') },
    { path: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf8') },
    { path: 'xl/styles.xml', data: Buffer.from(stylesXml, 'utf8') },
    { path: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml, 'utf8') },
  ];

  return createZipArchive(files);
}

/**
 * Converts 1-based column index to Excel column letters (1 -> A, 27 -> AA)
 */
function getColumnLetter(col: number): string {
  let temp: number;
  let letter = '';
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}
