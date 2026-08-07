<script lang="ts">
	// Vault List — login entry rows with Fill, copy, TOTP (§3.5/B5)
	//
	// Consumes `vault` for CRUD actions. Accepts entries as a prop so the parent
	// can control which subset to show (matching vs all).

	import { vault } from '../../state/vault.svelte';
	import type { PasswordEntry } from '../../state/vault.svelte';
	import { browserAutofill } from '$lib/ipc';

	interface Props {
		entries?: PasswordEntry[];
		onEdit?: (id: string) => void;
		windowId?: string;
		tabId?: string | null;
	}

	let {
		entries = [],
		onEdit = (_id: string) => {},
		windowId = '',
		tabId = null,
	}: Props = $props();

	function copyUsername(item: PasswordEntry, e: Event) {
		e.stopPropagation();
		navigator.clipboard.writeText(item.login.username);
	}

	function copyPassword(item: PasswordEntry, e: Event) {
		e.stopPropagation();
		navigator.clipboard.writeText(item.login.password);
	}

	function copyTotp(item: PasswordEntry, e: Event) {
		e.stopPropagation();
		navigator.clipboard.writeText(item.login.totp);
	}

	async function fillLogin(item: PasswordEntry, e: Event) {
		e.stopPropagation();
		if (!windowId || !tabId) return;
		await browserAutofill({ windowId, tabId, entryId: item.id });
	}
</script>

{#if entries.length === 0}
	<div class="browser-vault-empty-state">
		<img src="/iconset/inlayGlobe.svg" alt="" class="icon-svg-large" />
		<span>No matching credentials</span>
	</div>
{:else}
	<div class="browser-logins-group">
		{#each entries as entry (entry.id)}
			<div class="browser-login-row">
				<div class="browser-login-row-main">
					<div class="browser-login-avatar">
						{(entry.name || entry.login.username || '?')[0].toUpperCase()}
					</div>
					<div class="browser-login-info">
						<div class="browser-login-name">{entry.name || entry.login.username || 'Unnamed'}</div>
						<div class="browser-login-meta">{entry.login.username}</div>
					</div>
					<div class="browser-login-actions">
						<button class="btn-text" onclick={(e) => fillLogin(entry, e)} disabled={!windowId || !tabId} title="Fill login">Fill</button>
						<button class="btn-text" onclick={(e) => copyUsername(entry, e)} title="Copy username">U</button>
						<button class="btn-text" onclick={(e) => copyPassword(entry, e)} title="Copy password">P</button>
						{#if entry.login.totp}
							<button class="btn-text" onclick={(e) => copyTotp(entry, e)} title="Copy TOTP">T</button>
						{/if}
						<button class="btn-text" onclick={() => onEdit(entry.id)} title="Edit">...</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
