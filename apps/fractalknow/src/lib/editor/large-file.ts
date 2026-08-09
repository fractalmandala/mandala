/**
 * Large-file open guard.
 *
 * Ports the reference behaviour from
 * `open-knowledge-main/packages/core/src/constants/document-open.ts` and
 * `.../utils/file-size.ts`: a document whose byte size strictly exceeds
 * `DOCUMENT_OPEN_BYTE_LIMIT` is too large to open in the rich editor. The
 * `largeFileState` helper turns a raw `(size, limit)` pair into the display
 * state the `LargeFileState.svelte` notice renders, so callers can drive it
 * from a `$derived` without duplicating the threshold/formatting rules.
 */

/** Maximum document size (bytes) the editor will open. Mirrors the source's 512 KiB cap. */
export const DOCUMENT_OPEN_BYTE_LIMIT = 512 * 1024;

/**
 * Format a byte count as a binary-unit size string (B / KiB / MiB / GiB /
 * TiB), one decimal of precision with a trailing `.0` trimmed. Matches the
 * reference `formatFileSize` exactly:
 *
 *   formatFileSize(512)        → "512 B"
 *   formatFileSize(786_432)    → "768 KiB"
 *   formatFileSize(1_258_291)  → "1.2 MiB"
 *   formatFileSize(NaN)        → ""
 */
export function formatFileSize(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return '';
	if (bytes < 1024) return `${bytes} B`;
	const units = ['KiB', 'MiB', 'GiB', 'TiB'];
	let value = bytes / 1024;
	let unitIdx = 0;
	while (value >= 1024 && unitIdx < units.length - 1) {
		value /= 1024;
		unitIdx += 1;
	}
	const formatted = value.toFixed(1).replace(/\.0$/, '');
	return `${formatted} ${units[unitIdx]}`;
}

/**
 * Whether a document of `bytes` size exceeds the open limit. Non-finite or
 * missing sizes are treated as openable (not large), matching the source.
 */
export function isDocumentOverOpenByteLimit(
	bytes: number | null | undefined,
	limit: number = DOCUMENT_OPEN_BYTE_LIMIT,
): boolean {
	return typeof bytes === 'number' && Number.isFinite(bytes) && bytes > limit;
}

/** Display state for the large-file notice, derived from a raw size + limit. */
export type LargeFileState = {
	/** True when the document is over the open limit and should be blocked. */
	isLargeFile: boolean;
	/** Raw document size in bytes (as supplied). */
	size: number;
	/** The limit compared against, in bytes. */
	limit: number;
	/** `size` rendered via {@link formatFileSize}. */
	formattedSize: string;
	/** `limit` rendered via {@link formatFileSize}. */
	formattedLimit: string;
};

/**
 * Derive the {@link LargeFileState} for a document size. Pure — safe to call
 * inside a Svelte `$derived`. `size` of `null`/`undefined` normalises to `0`.
 */
export function largeFileState(
	size: number | null | undefined,
	limit: number = DOCUMENT_OPEN_BYTE_LIMIT,
): LargeFileState {
	const normalizedSize = typeof size === 'number' && Number.isFinite(size) ? size : 0;
	return {
		isLargeFile: isDocumentOverOpenByteLimit(normalizedSize, limit),
		size: normalizedSize,
		limit,
		formattedSize: formatFileSize(normalizedSize),
		formattedLimit: formatFileSize(limit),
	};
}
