import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LargeFileState from './LargeFileState.svelte';
import {
	DOCUMENT_OPEN_BYTE_LIMIT,
	formatFileSize,
	isDocumentOverOpenByteLimit,
	largeFileState,
} from '$lib/editor/large-file';

describe('large-file logic', () => {
	it('formats byte sizes in binary units, trimming trailing .0', () => {
		expect(formatFileSize(512)).toBe('512 B');
		expect(formatFileSize(768 * 1024)).toBe('768 KiB');
		expect(formatFileSize(DOCUMENT_OPEN_BYTE_LIMIT)).toBe('512 KiB');
		expect(formatFileSize(1_258_291)).toBe('1.2 MiB');
		expect(formatFileSize(Number.NaN)).toBe('');
	});

	it('flags documents strictly over the limit', () => {
		expect(isDocumentOverOpenByteLimit(DOCUMENT_OPEN_BYTE_LIMIT)).toBe(false);
		expect(isDocumentOverOpenByteLimit(DOCUMENT_OPEN_BYTE_LIMIT + 1)).toBe(true);
		expect(isDocumentOverOpenByteLimit(null)).toBe(false);
		expect(isDocumentOverOpenByteLimit(undefined)).toBe(false);
	});

	it('derives display state, normalising missing sizes to zero', () => {
		const state = largeFileState(768 * 1024);
		expect(state.isLargeFile).toBe(true);
		expect(state.formattedSize).toBe('768 KiB');
		expect(state.formattedLimit).toBe('512 KiB');

		const empty = largeFileState(null);
		expect(empty.size).toBe(0);
		expect(empty.isLargeFile).toBe(false);
	});
});

describe('LargeFileState', () => {
	it('renders the blocked-open copy with formatted sizes', () => {
		render(LargeFileState, {
			docName: 'big-note',
			size: 768 * 1024,
			limit: DOCUMENT_OPEN_BYTE_LIMIT,
		});

		expect(screen.getByRole('status').getAttribute('data-slot')).toBe('large-file-editor-state');
		expect(screen.getByRole('heading', { name: /file too large to open/i })).toBeTruthy();
		const detail = screen.getByText(/big-note/);
		expect(detail.textContent).toContain('768 KiB');
		expect(detail.textContent).toContain('512 KiB');
	});

	it('emits onViewReadOnly when the read-only action is used', async () => {
		const onViewReadOnly = vi.fn();
		render(LargeFileState, { docName: 'big-note', size: 768 * 1024, onViewReadOnly });

		await fireEvent.click(screen.getByRole('button', { name: /view read-only/i }));
		expect(onViewReadOnly).toHaveBeenCalledOnce();
	});

	it('hides the back action unless canGoBack is set', () => {
		render(LargeFileState, { docName: 'big-note', size: 768 * 1024 });
		expect(screen.queryByRole('button', { name: /go back/i })).toBeNull();
	});

	it('routes the back action to the previous document', async () => {
		const onGoBack = vi.fn();
		render(LargeFileState, {
			docName: 'big-note',
			size: 768 * 1024,
			canGoBack: true,
			previousDocName: 'small-note',
			onGoBack,
		});

		await fireEvent.click(screen.getByRole('button', { name: /go back/i }));
		expect(onGoBack).toHaveBeenCalledWith('small-note');
	});

	it('moves focus to the read-only action on mount', async () => {
		render(LargeFileState, { docName: 'big-note', size: 768 * 1024 });
		const view = screen.getByRole('button', { name: /view read-only/i });
		await waitFor(() => expect(document.activeElement).toBe(view));
	});
});
