import { ideState } from './ide.svelte';
import { appState } from './app.svelte';
import { canvas } from './canvas.svelte';
import { workspaceLayout } from './workspaceLayout.svelte';
import { compositeUndoDomain } from './undoHistory.svelte';
import type { AppTemplateId } from '../data/templates';

// Matches what ideState/designcanvas actually implement (their own internal undo/redo
// stacks), not a snapshot-based shape — no domain in this codebase does snapshotting
// through the coordinator itself.
export interface UndoDomain {
	id: string;
	undo: () => void;
	redo: () => void;
	pushUndo: () => void;
}

const DEFAULT_DOMAIN_ID = 'ide';

// Which registered domain owns undo/redo for a given active template. Templates not listed
// here fall back to the default ('ide') domain.
const TEMPLATE_DOMAIN: Partial<Record<AppTemplateId, string>> = {
	design: 'design',
	notes: 'notes',
	ai: 'ai',
	bookmarks: 'bookmarks',
	media: 'media',
	docs: 'docs',
	dev: 'dev',
	tester: 'newdesign',
	blank: 'canvas',
};

class UndoCoordinator {
	private domains = new Map<string, UndoDomain>();

	registerUndoDomain(domain: UndoDomain): void {
		this.domains.set(domain.id, domain);
	}

	unregisterUndoDomain(id: string): void {
		this.domains.delete(id);
	}

	private activeDomain(): UndoDomain | undefined {
		const id = TEMPLATE_DOMAIN[appState.activeTemplateId] ?? DEFAULT_DOMAIN_ID;
		return this.domains.get(id) ?? this.domains.get(DEFAULT_DOMAIN_ID);
	}

	pushUndo(domainId = DEFAULT_DOMAIN_ID): void {
		this.domains.get(domainId)?.pushUndo();
	}

	undo(): void {
		if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('fractalengine:before-undo'));
		this.activeDomain()?.undo();
	}

	redo(): void {
		if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('fractalengine:before-redo'));
		this.activeDomain()?.redo();
	}
}

export const undoCoordinator = new UndoCoordinator();
export const registerUndoDomain = (domain: UndoDomain) => undoCoordinator.registerUndoDomain(domain);
export const pushUndo = (domainId?: string) => undoCoordinator.pushUndo(domainId);
export const undo = () => undoCoordinator.undo();
export const redo = () => undoCoordinator.redo();

undoCoordinator.registerUndoDomain({
	id: 'canvas',
	undo: () => canvas.undo(),
	redo: () => canvas.redo(),
	pushUndo: () => canvas.pushUndo(),
});
undoCoordinator.registerUndoDomain(compositeUndoDomain('ide', [ideState.historyForUndo, workspaceLayout.historyForUndo('code')], ideState.historyForUndo));
