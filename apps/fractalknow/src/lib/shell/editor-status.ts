import { writable } from 'svelte/store';

export type RichEditorStatus = {
	activePath: string | null;
	bold: boolean;
	italic: boolean;
	strike: boolean;
	code: boolean;
	link: boolean;
	heading: boolean;
	bulletList: boolean;
	orderedList: boolean;
	blockquote: boolean;
	codeBlock: boolean;
	selectionEmpty: boolean;
	characterCount: number;
	canUndo: boolean;
	canRedo: boolean;
};

const initialStatus: RichEditorStatus = {
	activePath: null,
	bold: false,
	italic: false,
	strike: false,
	code: false,
	link: false,
	heading: false,
	bulletList: false,
	orderedList: false,
	blockquote: false,
	codeBlock: false,
	selectionEmpty: true,
	characterCount: 0,
	canUndo: false,
	canRedo: false,
};

export const richEditorStatus = writable<RichEditorStatus>(initialStatus);

export function resetRichEditorStatus(activePath: string | null = null): void {
	richEditorStatus.set({ ...initialStatus, activePath });
}

export function setRichEditorStatus(status: RichEditorStatus): void {
	richEditorStatus.set(status);
}
