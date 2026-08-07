export type DocsDiffKind = 'added' | 'removed' | 'unchanged';

export interface DocsDiffLine {
	kind: DocsDiffKind;
	text: string;
	/** 1-based line number in the original text, absent for added lines. */
	beforeLine?: number;
	/** 1-based line number in the new text, absent for removed lines. */
	afterLine?: number;
}

/**
 * Computes a line diff with the standard longest-common-subsequence algorithm.
 *
 * It is implemented here rather than pulled in as a dependency because documentation diffs
 * are small, and a build-time dependency for twenty lines of table-filling is not worth it.
 */
export function diffLines(before: string, after: string): DocsDiffLine[] {
	const left = before.replace(/\n$/, '').split('\n');
	const right = after.replace(/\n$/, '').split('\n');
	const lengths: number[][] = Array.from({ length: left.length + 1 }, () =>
		new Array<number>(right.length + 1).fill(0)
	);

	for (let row = left.length - 1; row >= 0; row -= 1) {
		for (let column = right.length - 1; column >= 0; column -= 1) {
			(lengths[row] as number[])[column] =
				left[row] === right[column]
					? ((lengths[row + 1] as number[])[column + 1] as number) + 1
					: Math.max(
							(lengths[row + 1] as number[])[column] as number,
							(lengths[row] as number[])[column + 1] as number
						);
		}
	}

	const lines: DocsDiffLine[] = [];
	let row = 0;
	let column = 0;

	while (row < left.length && column < right.length) {
		if (left[row] === right[column]) {
			lines.push({
				kind: 'unchanged',
				text: left[row] as string,
				beforeLine: row + 1,
				afterLine: column + 1
			});
			row += 1;
			column += 1;
		} else if (
			((lengths[row + 1] as number[])[column] as number) >=
			((lengths[row] as number[])[column + 1] as number)
		) {
			lines.push({ kind: 'removed', text: left[row] as string, beforeLine: row + 1 });
			row += 1;
		} else {
			lines.push({ kind: 'added', text: right[column] as string, afterLine: column + 1 });
			column += 1;
		}
	}

	while (row < left.length) {
		lines.push({ kind: 'removed', text: left[row] as string, beforeLine: row + 1 });
		row += 1;
	}
	while (column < right.length) {
		lines.push({ kind: 'added', text: right[column] as string, afterLine: column + 1 });
		column += 1;
	}

	return lines;
}
