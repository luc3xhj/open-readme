// A reversible view of the same table facts; no rewriting or inferred values.
export function comparisonView(block) {
  const layout = block.layout || 'table';
  if (layout === 'definitions')
    return {
      kind: 'definitions',
      label: block.columns[0],
      entries: block.rows.map((row) => ({
        term: row[0],
        fields: row.slice(1).map((value, i) => ({ label: block.columns[i + 1], value })),
      })),
    };
  if (layout === 'reference') {
    const rows = [block.columns, ...block.rows].map((row) =>
        row.map((cell) => cell.replace(/\r?\n/g, ' / ')),
      ),
      widths = block.columns.map((_, i) => Math.max(...rows.map((row) => row[i].length)));
    return {
      kind: 'reference',
      text: rows
        .map((row) =>
          row
            .map((cell, i) => cell.padEnd(widths[i]))
            .join('  ')
            .trimEnd(),
        )
        .join('\n'),
    };
  }
  if (layout === 'matrix')
    return {
      kind: 'table',
      columns: [block.columns[0], ...block.rows.map((row) => row[0])],
      rows: block.columns
        .slice(1)
        .map((column, i) => [column, ...block.rows.map((row) => row[i + 1])]),
    };
  return { kind: 'table', columns: block.columns, rows: block.rows };
}
