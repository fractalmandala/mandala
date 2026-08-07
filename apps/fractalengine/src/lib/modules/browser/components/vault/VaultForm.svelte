<script lang="ts">
	// Vault Form — add/edit credential form (§3.5/B5)
	//
	// Consumes `vault` for CRUD. Accepts entryId for edit mode.
	// On save/cancel, calls the parent callback so VaultPopover can switch tabs.

	import { generatePassword, vault } from '../../state/vault.svelte';

	interface Props {
		mode?: 'add' | 'edit';
		entryId?: string | null;
		onSaved?: () => void;
		onCancel?: () => void;
	}

	let {
		mode = 'add',
		entryId = null,
		onSaved = () => {},
		onCancel = () => {},
	}: Props = $props();

	let name = $state('');
	let username = $state('');
	let password = $state('');
	let totp = $state('');
	let uri = $state('');

	// Load existing entry for edit mode
	$effect(() => {
		if (mode === 'edit' && entryId) {
			const entry = vault.entries.find(e => e.id === entryId);
			if (entry) {
				name = entry.name;
				username = entry.login.username;
				password = entry.login.password;
				totp = entry.login.totp;
				uri = entry.login.uris[0]?.uri || '';
			}
		} else {
			resetForm();
		}
	});

	function resetForm() {
		name = '';
		username = '';
		password = '';
		totp = '';
		uri = '';
	}

	function generateSecurePassword() {
		password = generatePassword();
	}

	async function handleSave() {
		try {
			if (mode === 'add') {
				await vault.add({
					name,
					username,
					password,
					totp,
					uri: uri || undefined,
				});
			} else if (entryId) {
				await vault.update(entryId, {
					name,
					username,
					password,
					totp,
					uri: uri || undefined,
				});
			}
			onSaved();
		} catch (e) {
			// error handled by vault.error state
		}
	}
</script>

<div class="browser-vault-form">
	<span class="browser-vault-form-title">
		{mode === 'add' ? 'Add New Credential' : 'Edit Credential'}
	</span>

	<div class="browser-vault-form-field">
		<label class="text-xs" for="frm-name">Name</label>
		<input id="frm-name" type="text" class="input-text" bind:value={name} placeholder="My Login" />
	</div>

	<div class="browser-vault-form-field">
		<label class="text-xs" for="frm-username">Username</label>
		<input id="frm-username" type="text" class="input-text" bind:value={username} placeholder="user@example.com" />
	</div>

	<div class="browser-vault-form-field">
		<label class="text-xs" for="frm-password">Password</label>
		<input id="frm-password" type="text" class="input-text" bind:value={password} placeholder="••••••••" />
		<button class="btn-text" onclick={generateSecurePassword}>Generate secure password</button>
	</div>

	<div class="browser-vault-form-field">
		<label class="text-xs" for="frm-totp">TOTP (optional)</label>
		<input id="frm-totp" type="text" class="input-text" bind:value={totp} placeholder="otpauth://..." />
	</div>

	<div class="browser-vault-form-field">
		<label class="text-xs" for="frm-uri">Website URL</label>
		<input id="frm-uri" type="text" class="input-text" bind:value={uri} placeholder="https://example.com" />
	</div>

	<div class="browser-vault-form-actions">
		<button class="btn-app" onclick={handleSave}>
			{mode === 'add' ? 'Add' : 'Save'}
		</button>
		<button class="btn-text" onclick={onCancel}>Cancel</button>
	</div>
</div>
