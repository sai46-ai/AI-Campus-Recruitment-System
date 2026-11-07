/**
 * CSV Formatting and Sanitization Utilities
 * Defends against CSV / Formula Injection attacks (CWE-1236)
 */

/**
 * Sanitizes a single cell value for CSV output.
 * 1. Formula Injection Mitigation: Prepends a single quote (') if the value starts with '=', '+', '-', '@', '\t', or '\r'.
 * 2. RFC 4180 Escaping: Doubles internal quotes and wraps the field in double quotes if it contains commas, quotes, or newlines.
 */
export const sanitizeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Neutralize CSV Formula Injection characters
  if (/^[\s]*[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180: If string contains commas, double quotes, or newlines, enclose in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

/**
 * Converts an array of headers and row objects into a formatted CSV string with UTF-8 BOM.
 */
export const buildCsvString = (
  headers: { key: string; label: string }[],
  records: Record<string, any>[]
): string => {
  const headerRow = headers.map((h) => sanitizeCsvCell(h.label)).join(',');
  const dataRows = records.map((record) =>
    headers.map((h) => sanitizeCsvCell(record[h.key])).join(',')
  );

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) to ensure correct character rendering in Excel
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n') + '\r\n';
};

