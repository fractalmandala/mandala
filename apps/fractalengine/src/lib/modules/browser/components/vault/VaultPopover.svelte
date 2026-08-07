<script lang="ts">
	// Vault Popover — popover shell with tabs (Matching / All / Add-Edit) (§3.5/B5)
	//
	// Consumes `vault` from state/vault.svelte.ts (C1/C2).
	// Uses the overlay coordinator to manage chrome overlay state.

	import { vault } from '../../state/vault.svelte';
	import { incrementOverlay, decrementOverlay } from '../../state/overlayCoordinator.svelte';
	import VaultList from './VaultList.svelte';
	import VaultForm from './VaultForm.svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
		currentUrl?: string;
		windowId?: string;
		tabId?: string | null;
	}

	let {
		open = false,
		onClose = () => {},
		currentUrl = '',
		windowId = '',
		tabId = null,
	}: Props = $props();

	let activeTab = $state<'matching' | 'all' | 'add' | 'edit'>('matching');
	let editingEntryId = $state<string | null>(null);

	// Track overlay state
	$effect(() => {
		if (open) incrementOverlay();
		return () => { if (open) decrementOverlay(); };
	});

	$effect(() => {
		if (open && !vault.loaded) vault.load();
	});

	function triggerAdd() {
		activeTab = 'add';
		editingEntryId = null;
	}

	function triggerEdit(id: string) {
		editingEntryId = id;
		activeTab = 'edit';
	}

	async function triggerImport() {
		try {
			await vault.importFromBitwarden();
		} catch { /* import error handled by vault.error state */ }
	}

	async function triggerExport() {
		try {
			await vault.exportBitwarden();
		} catch { /* export error is reported through the app log */ }
	}

	function handleSaved() {
		activeTab = 'matching';
		editingEntryId = null;
	}

	function handleCancelled() {
		if (activeTab === 'add' || activeTab === 'edit') {
			activeTab = 'matching';
			editingEntryId = null;
		}
	}

	let matchingLogins = $derived(currentUrl ? vault.matchesFor(currentUrl) : []);
	let allLogins = $derived(vault.entries);
</script>

{#if open}
	<div class="browser-vault-popover" role="dialog" aria-label="Password Vault">
		<div class="browser-vault-head">
			<div class="browser-vault-title">
				<img src="/iconset/blueKey.svg" alt="" class="icon-svg-sm" />
				<div class="browser-vault-title-text">
					<span class="browser-vault-name">Password Vault</span>
					<span class="browser-vault-stats">{vault.entries.length} logins</span>
				</div>
			</div>
			<button class="browser-vault-import-btn" onclick={triggerImport} title="Import Bitwarden JSON">
				<img src="/iconset/import.svg" alt="" class="icon-svg-xs" />
				Import
			</button>
			<button class="browser-vault-import-btn" onclick={triggerExport} title="Export Bitwarden-compatible JSON">
				Export
			</button>
		</div>

		<div class="browser-vault-tabs">
			<button class="browser-vault-tab" class:is-active={activeTab === 'matching'} onclick={() => activeTab = 'matching'}>
				Matching ({matchingLogins.length})
			</button>
			<button class="browser-vault-tab" class:is-active={activeTab === 'all'} onclick={() => activeTab = 'all'}>
				All Vault ({allLogins.length})
			</button>
			<button class="browser-vault-tab browser-vault-add-tab" class:is-active={activeTab === 'add'} onclick={triggerAdd}>
				+ Add
			</button>
		</div>

		<div class="browser-vault-tab-content">
			{#if activeTab === 'matching'}
				<VaultList entries={matchingLogins} onEdit={triggerEdit} {windowId} {tabId} />
			{:else if activeTab === 'all'}
				<VaultList entries={allLogins} onEdit={triggerEdit} {windowId} {tabId} />
			{:else if activeTab === 'add'}
				<VaultForm mode="add" entryId={null} onSaved={handleSaved} onCancel={handleCancelled} />
			{:else if activeTab === 'edit'}
				<VaultForm mode="edit" entryId={editingEntryId} onSaved={handleSaved} onCancel={handleCancelled} />
			{/if}
		</div>
	</div>
{/if}
