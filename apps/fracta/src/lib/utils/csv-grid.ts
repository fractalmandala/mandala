export type CsvRows = string[][];

/** Mutate a parsed CSV grid and return the row that should receive focus. */
export function insertCsvRow(rows: CsvRows, selectedRow: number): number {
	const row = Array.from({ length: Math.max(1, rows[0]?.length ?? 1) }, () => '');
	const insertAt = selectedRow > 0 ? Math.min(selectedRow + 1, rows.length) : rows.length;
	rows.splice(insertAt, 0, row);
	return insertAt;
}

/** Header row (zero) is structural and is deliberately not removable. */
export function removeCsvRow(rows: CsvRows, selectedRow: number): number | null {
	if (selectedRow <= 0 || selectedRow >= rows.length) return null;
	rows.splice(selectedRow, 1);
	return Math.min(selectedRow, rows.length - 1);
}

/** Insert after the active column, or append when no column is active. */
export function insertCsvColumn(rows: CsvRows, selectedColumn: number): number {
	const insertAt = selectedColumn >= 0 ? Math.min(selectedColumn + 1, rows[0]?.length ?? 0) : rows[0]?.length ?? 0;
	for (const [index, row] of rows.entries()) row.splice(insertAt, 0, index === 0 ? `column_${insertAt + 1}` : '');
	return insertAt;
}

/** Keep at least one column so the grid always has a stable editing target. */
export function removeCsvColumn(rows: CsvRows, selectedColumn: number): number | null {
	if (selectedColumn < 0 || (rows[0]?.length ?? 0) <= 1) return null;
	for (const row of rows) row.splice(selectedColumn, 1);
	return Math.min(selectedColumn, (rows[0]?.length ?? 1) - 1);
}
