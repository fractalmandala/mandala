export type HookMigrationKind =
	| 'pure-service'
	| 'svelte-store'
	| 'component-lifecycle'
	| 'bridge-adapter';

export type HookMigrationOwner =
	| 'shared-stores'
	| 'desktop-bridge'
	| 'app-shell'
	| 'editor-surfaces'
	| 'dialogs-sidebar'
	| 'cross-cutting';

export type HookMigrationStatus = 'ported' | 'partial' | 'pending' | 'deferred';

export type HookMigrationEntry = {
	source: string;
	kind: HookMigrationKind;
	owner: HookMigrationOwner;
	status: HookMigrationStatus;
	notes: string;
};

export const hookMigrationInventory: HookMigrationEntry[] = [
	{
		source: 'packages/app/src/components/handoff/useHandoffDispatch.ts',
		kind: 'bridge-adapter',
		owner: 'dialogs-sidebar',
		status: 'pending',
		notes: 'Requires handoff dialog and desktop/agent bridge parity.',
	},
	{
		source: 'packages/app/src/components/handoff/useInstalledAgents.ts',
		kind: 'bridge-adapter',
		owner: 'shared-stores',
		status: 'pending',
		notes: 'Port as agent/tool config and installed-agent store.',
	},
	{
		source: 'packages/app/src/editor/hooks/use-block-selection.ts',
		kind: 'component-lifecycle',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Depends on the rich editor selection layer.',
	},
	{
		source: 'packages/app/src/editor/table-controls/useTableDragReorder.tsx',
		kind: 'component-lifecycle',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Depends on table editing controls.',
	},
	{
		source: 'packages/app/src/editor/useDocDiagnostics.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Port with document diagnostics and validation surfaces.',
	},
	{
		source: 'packages/app/src/editor/useLintConfigViewMode.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'partial',
		notes: 'Validation config store now owns lint toggles; file-specific rule browser state remains.',
	},
	{
		source: 'packages/app/src/hooks/use-conflict-footer-height.ts',
		kind: 'component-lifecycle',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Layout measurement belongs with diff/conflict surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-conflicts.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Needs sync-status and conflict API parity.',
	},
	{
		source: 'packages/app/src/hooks/use-current-branch.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'pending',
		notes: 'Should derive from sync/collaboration config and git status store.',
	},
	{
		source: 'packages/app/src/hooks/use-document-stats.ts',
		kind: 'pure-service',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Move computation to pure document stats service with Svelte lifecycle subscription.',
	},
	{
		source: 'packages/app/src/hooks/use-editor-footer-identity.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Depends on editor footer and git identity surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-enable-sync-with-confirm.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'partial',
		notes: 'Sync config store now models sync mode; confirmation UX remains dialog-owned.',
	},
	{
		source: 'packages/app/src/hooks/use-feedback-nudge.ts',
		kind: 'svelte-store',
		owner: 'dialogs-sidebar',
		status: 'pending',
		notes: 'Belongs with feedback dialog and nudge presentation.',
	},
	{
		source: 'packages/app/src/hooks/use-folder-config.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'pending',
		notes: 'Needs folder config API store and templates refresh channel.',
	},
	{
		source: 'packages/app/src/hooks/use-git-sync-status.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'partial',
		notes: 'Sync/collaboration config exists; live git status fetch channel remains.',
	},
	{
		source: 'packages/app/src/hooks/use-installed-clis.ts',
		kind: 'bridge-adapter',
		owner: 'shared-stores',
		status: 'pending',
		notes: 'Port as an installed tool capability store once terminal bridge supports probing.',
	},
	{
		source: 'packages/app/src/hooks/use-is-embedded.ts',
		kind: 'pure-service',
		owner: 'app-shell',
		status: 'pending',
		notes: 'Move browser host detection to a plain shell service.',
	},
	{
		source: 'packages/app/src/hooks/use-lifecycle-status.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Depends on document lifecycle/event channels.',
	},
	{
		source: 'packages/app/src/hooks/use-no-push-permission-toast.ts',
		kind: 'component-lifecycle',
		owner: 'dialogs-sidebar',
		status: 'pending',
		notes: 'Toast lifecycle should port with notification/dialog surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-onboarding-card-visible.ts',
		kind: 'svelte-store',
		owner: 'app-shell',
		status: 'pending',
		notes: 'Persisted launcher state belongs with shell onboarding surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-onboarding-file-completion.ts',
		kind: 'svelte-store',
		owner: 'app-shell',
		status: 'pending',
		notes: 'Depends on app shell onboarding and file completion state.',
	},
	{
		source: 'packages/app/src/hooks/use-reconcile-skill-tabs.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Requires skill tabs and document tab reconciliation.',
	},
	{
		source: 'packages/app/src/hooks/use-selection-context.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Selection state ports with editor surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-selection-stats.ts',
		kind: 'pure-service',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Pure selection stat computation plus editor lifecycle binding.',
	},
	{
		source: 'packages/app/src/hooks/use-semantic-search-status.ts',
		kind: 'svelte-store',
		owner: 'dialogs-sidebar',
		status: 'pending',
		notes: 'Search status belongs with command/sidebar search surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-sidebar-resize.ts',
		kind: 'component-lifecycle',
		owner: 'dialogs-sidebar',
		status: 'ported',
		notes: 'Sidebar width persistence and keyboard/pointer resize are implemented in Svelte.',
	},
	{
		source: 'packages/app/src/hooks/use-skill-targets.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Requires skill/document target store parity.',
	},
	{
		source: 'packages/app/src/hooks/use-skills.ts',
		kind: 'svelte-store',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Requires skill metadata API and editor skill surfaces.',
	},
	{
		source: 'packages/app/src/hooks/use-terminal-enabled.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'partial',
		notes: 'Agent/tool config models terminal permission; project-local config binding remains.',
	},
	{
		source: 'packages/app/src/hooks/use-theme-bridge.ts',
		kind: 'bridge-adapter',
		owner: 'desktop-bridge',
		status: 'partial',
		notes: 'Theme source and reduced-transparency stores exist; native signal is bridge-owned.',
	},
	{
		source: 'packages/app/src/hooks/use-update-channel.ts',
		kind: 'bridge-adapter',
		owner: 'desktop-bridge',
		status: 'pending',
		notes: 'Requires updater state command parity.',
	},
	{
		source: 'packages/app/src/hooks/use-worktree-autosync-notice.tsx',
		kind: 'component-lifecycle',
		owner: 'dialogs-sidebar',
		status: 'pending',
		notes: 'Notification lifecycle tied to sync dialog/toast UX.',
	},
	{
		source: 'packages/app/src/hooks/use-worktrees.ts',
		kind: 'svelte-store',
		owner: 'shared-stores',
		status: 'pending',
		notes: 'Needs worktree API-backed store.',
	},
	{
		source: 'packages/app/src/hooks/useActiveHeading.ts',
		kind: 'component-lifecycle',
		owner: 'editor-surfaces',
		status: 'pending',
		notes: 'Depends on source editor scroll/heading lifecycle.',
	},
];

export const hookMigrationSummary = {
	total: hookMigrationInventory.length,
	ported: hookMigrationInventory.filter((entry) => entry.status === 'ported').length,
	partial: hookMigrationInventory.filter((entry) => entry.status === 'partial').length,
	pending: hookMigrationInventory.filter((entry) => entry.status === 'pending').length,
	deferred: hookMigrationInventory.filter((entry) => entry.status === 'deferred').length,
};

export function hooksByOwner(owner: HookMigrationOwner): HookMigrationEntry[] {
	return hookMigrationInventory.filter((entry) => entry.owner === owner);
}

export function hooksByKind(kind: HookMigrationKind): HookMigrationEntry[] {
	return hookMigrationInventory.filter((entry) => entry.kind === kind);
}
