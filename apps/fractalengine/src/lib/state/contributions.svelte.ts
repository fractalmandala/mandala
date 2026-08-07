import type { AppTemplateId } from '$lib/data/templates';

export type ContributionScope = AppTemplateId | 'global';

export interface CommandContribution {
	id: string;                // '<module>.<action>', e.g. 'notes.openVault'
	label: string;             // EXACT current palette label — e2e selects on this
	category: string;          // EXACT current palette category
	icon: string;              // EXACT current icon path
	shortcutLabel?: string;    // display-only string, e.g. 'Cmd+Alt+O'
	scope: ContributionScope;
	run: (payload?: unknown) => void | Promise<void>;
}

export interface KeybindingContribution {
	combo: string;             // normalized via comboFromEvent(), e.g. 'cmd+alt+o'
	scope: ContributionScope;
	commandId: string;
}

export interface HeaderActionContribution {
	scope: ContributionScope;
	kind: 'strip' | 'icon';    // .btn-icon-text vs .btn-icon rendering
	ariaLabel: string;         // EXACT current aria-label
	title?: string;
	icon: string;
	commandId: string;
	order: number;             // ascending; preserves current visual order
}

export interface MenuActionContribution {
	menuActionId: string;      // the string arriving from the native Tauri menu
	commandId: string;
}

export interface ContextMenuContribution {
	id: string;
	label: string;
	commandId: string;
	scope: ContributionScope;
	visible: (payload: unknown) => boolean;
}

// Normalizes a KeyboardEvent to a combo string. 'cmd' means metaKey OR ctrlKey —
// identical to the existing isCmdOrCtrl semantics in +layout.svelte.
export function comboFromEvent(e: KeyboardEvent): string {
	const parts: string[] = [];
	if (e.metaKey || e.ctrlKey) parts.push('cmd');
	if (e.altKey) parts.push('alt');
	if (e.shiftKey) parts.push('shift');
	parts.push(e.code === 'Space' ? 'space' : e.key.toLowerCase());
	return parts.join('+');
}

class ContributionRegistry {
	private commands = new Map<string, CommandContribution>();
	private keybindings: KeybindingContribution[] = [];
	private headerActions: HeaderActionContribution[] = [];
	private menuActions = new Map<string, MenuActionContribution>();
	private contextMenuActions: ContextMenuContribution[] = [];
	// Bumped on every registration so $derived consumers re-evaluate.
	private version = $state(0);

	registerCommands(items: CommandContribution[]): void {
		for (const item of items) {
			if (this.commands.has(item.id)) throw new Error(`Duplicate command id: ${item.id}`);
			this.commands.set(item.id, item);
		}
		this.version++;
	}
	registerKeybindings(items: KeybindingContribution[]): void {
		this.keybindings.push(...items);
		this.version++;
	}
	registerHeaderActions(items: HeaderActionContribution[]): void {
		this.headerActions.push(...items);
		this.version++;
	}
	registerMenuActions(items: MenuActionContribution[]): void {
		for (const item of items) {
			if (this.menuActions.has(item.menuActionId)) throw new Error(`Duplicate menu action: ${item.menuActionId}`);
			this.menuActions.set(item.menuActionId, item);
		}
		this.version++;
	}
	registerContextMenuActions(items: ContextMenuContribution[]): void {
		for (const item of items) {
			if (this.contextMenuActions.some(existing => existing.id === item.id)) throw new Error(`Duplicate context menu id: ${item.id}`);
			this.contextMenuActions.push(item);
		}
		this.version++;
	}

	commandsFor(scope: AppTemplateId): CommandContribution[] {
		void this.version;
		return [...this.commands.values()].filter(c => c.scope === 'global' || c.scope === scope);
	}
	async run(commandId: string, payload?: unknown): Promise<void> {
		const command = this.commands.get(commandId);
		if (!command) throw new Error(`Unknown command id: ${commandId}`);
		await command.run(payload);
	}
	// Returns the matching command id for a key event in the given scope, or null.
	matchKeybinding(e: KeyboardEvent, scope: AppTemplateId): string | null {
		void this.version;
		const combo = comboFromEvent(e);
		const hit = this.keybindings.find(k => k.combo === combo && (k.scope === 'global' || k.scope === scope));
		return hit ? hit.commandId : null;
	}
	headerActionsFor(scope: AppTemplateId): HeaderActionContribution[] {
		void this.version;
		return this.headerActions
			.filter(a => a.scope === 'global' || a.scope === scope)
			.sort((a, b) => a.order - b.order);
	}
	menuCommandFor(menuActionId: string): string | null {
		void this.version;
		return this.menuActions.get(menuActionId)?.commandId ?? null;
	}
	contextMenuActionsFor(scope: AppTemplateId, payload: unknown): ContextMenuContribution[] {
		void this.version;
		return this.contextMenuActions.filter(action => (action.scope === 'global' || action.scope === scope) && action.visible(payload));
	}
	// For the contract test only — not for UI use.
	snapshot(): { commands: CommandContribution[]; keybindings: KeybindingContribution[]; headerActions: HeaderActionContribution[]; menuActions: MenuActionContribution[]; contextMenuActions: ContextMenuContribution[] } {
		return {
			commands: [...this.commands.values()],
			keybindings: [...this.keybindings],
			headerActions: [...this.headerActions],
			menuActions: [...this.menuActions.values()],
			contextMenuActions: [...this.contextMenuActions],
		};
	}
}

export const contributions = new ContributionRegistry();
