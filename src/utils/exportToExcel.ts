/**
 * exportToExcel
 * -------------
 * Exports an array of objects to a .csv file that Excel can open natively.
 * No external dependencies — uses a plain CSV with BOM so Excel reads UTF-8 correctly.
 *
 * @param rows    Array of objects to export
 * @param filename Desired filename (without extension)
 */
export function exportToExcel(rows: Record<string, any>[], filename = 'export') {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const escape = (val: any) => {
    const str = val == null ? '' : String(val);
    // Wrap in quotes if contains comma, quote or newline
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\r\n');

  // UTF-8 BOM so Excel opens it correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
