import * as XLSX from 'xlsx';

function cellToString(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
}

function sheetToMarkdown(worksheet: XLSX.WorkSheet, sheetName: string): string | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',   // fill every empty cell — fixes sparse arrays
    raw: false,   // format numbers/dates as display strings
  }) as unknown[][];

  const nonEmpty = rows.filter(row =>
    row.some(cell => cell !== '' && cell !== null && cell !== undefined)
  );

  if (nonEmpty.length === 0) return null;

  // Normalize all rows to the same column count
  const colCount = Math.max(...nonEmpty.map(row => row.length));
  const normalized = nonEmpty.map(row => {
    const padded = [...row];
    while (padded.length < colCount) padded.push('');
    return padded.map(cellToString);
  });

  const header = normalized[0];
  const separator = header.map(() => '---');
  const lines = [
    `## ${sheetName}`,
    '',
    '| ' + header.join(' | ') + ' |',
    '| ' + separator.join(' | ') + ' |',
    ...normalized.slice(1).map(row => '| ' + row.join(' | ') + ' |'),
  ];

  return lines.join('\n');
}

export async function excelToMd(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sections = workbook.SheetNames
    .map(name => sheetToMarkdown(workbook.Sheets[name], name))
    .filter((s): s is string => s !== null);

  return sections.length > 0 ? sections.join('\n\n') : '(No data found)';
}
