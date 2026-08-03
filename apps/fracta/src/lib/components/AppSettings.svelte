<script lang="ts">
	import { prefs, type FontFamily, type ThemePreference } from '$lib/state/prefs.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { entries } from '$lib/state/entries.svelte';
	import { workspace } from '$lib/state/workspace.svelte';

	type Section = 'workspace' | 'appearance' | 'editor' | 'intelligence' | 'shortcuts' | 'about';
	let section = $state<Section>('workspace');
	let modal = $state<HTMLElement>();

	const sections: Array<{ id: Section; label: string; caption: string }> = [
		{ id: 'workspace', label: 'Workspace', caption: 'Files & search' },
		{ id: 'appearance', label: 'Appearance', caption: 'Theme' },
		{ id: 'editor', label: 'Editor', caption: 'Writing defaults' },
		{ id: 'intelligence', label: 'Intelligence', caption: 'Ask & rules' },
		{ id: 'shortcuts', label: 'Shortcuts', caption: 'Keyboard' },
		{ id: 'about', label: 'About', caption: 'Fracta' }
	];

	$effect(() => {
		if (ui.settingsOpen) requestAnimationFrame(() => modal?.querySelector<HTMLButtonElement>('.app-settings__nav-item')?.focus());
	});

	function close() { ui.settingsOpen = false; }
	function openAgent() { close(); ui.openAgent(); }
	function openRules() { close(); ui.rulesOpen = true; }
	async function switchProject() {
		await entries.chooseVault();
		await workspace.init();
	}
	function selectTheme(theme: ThemePreference) { prefs.setTheme(theme); }
	function selectFont(family: FontFamily) { prefs.setFamily(family); }
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && close()} />

<button class="rules-overlay" aria-label="Close settings" onclick={close}></button>

<div bind:this={modal} class="rules-modal app-settings" role="dialog" aria-modal="true" aria-labelledby="app-settings-title">
	<header class="rules-modal__head">
		<div>
			<p class="app-settings__eyebrow">Fracta preferences</p>
			<h2 class="rules-modal__title" id="app-settings-title">Settings</h2>
			<p class="rules-modal__sub">Shape the workspace without placing settings files inside your knowledge folder.</p>
		</div>
		<button class="rules-modal__close" onclick={close} aria-label="Close settings">✕</button>
	</header>

	<div class="app-settings__body">
		<nav class="app-settings__nav" aria-label="Settings sections">
			{#each sections as item}
				<button class:app-settings__nav-item--on={section === item.id} class="app-settings__nav-item" onclick={() => section = item.id}>
					<span>{item.label}</span><small>{item.caption}</small>
				</button>
			{/each}
		</nav>

		<div class="app-settings__content">
			{#if section === 'workspace'}
				<h3>Local workspace</h3>
				<p class="app-settings__intro">Your files remain where you chose to keep them. Fracta’s search index and preferences live separately from the project.</p>
				<div class="app-settings__path"><span>Current project</span><code>{entries.status.path ?? 'No project selected'}</code></div>
				<div class="app-settings__actions"><button class="app-settings__primary" onclick={switchProject}>Choose another folder…</button><button class="app-settings__secondary" onclick={() => workspace.rebuildIndex()}>Rebuild search index</button></div>
				<p class="app-settings__note">File watching is active while Fracta is open. Changes made in Finder or another editor refresh safely without replacing an unsaved edit.</p>
			{:else if section === 'appearance'}
				<h3>Appearance</h3>
				<p class="app-settings__intro">A quiet paper surface with evergreen reserved for connection, focus, and positive state.</p>
				<fieldset class="app-settings__choices"><legend>Color mode</legend><div class="app-settings__option-row">
					{#each [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']] as choice}
						<button class:app-settings__choice--on={prefs.theme === choice[0]} class="app-settings__choice" onclick={() => selectTheme(choice[0] as ThemePreference)}>{choice[1]}</button>
					{/each}
				</div></fieldset>
				<div class="app-settings__preview"><span class="app-settings__preview-mark"></span><div><strong>Quiet, connected writing</strong><p>Forest identifies action. Mint holds gentle selection.</p></div></div>
			{:else if section === 'editor'}
				<h3>Editor defaults</h3>
				<p class="app-settings__intro">These choices apply to the writing surface and are stored only on this device.</p>
				<fieldset class="app-settings__choices"><legend>Reading face</legend><div class="app-settings__option-row">
					{#each [['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']] as choice}
						<button class:app-settings__choice--on={prefs.family === choice[0]} class="app-settings__choice" onclick={() => selectFont(choice[0] as FontFamily)}>{choice[1]}</button>
					{/each}
				</div></fieldset>
				<div class="app-settings__setting"><div><strong>Text size</strong><p>{prefs.size}px in the document editor</p></div><button class="app-settings__secondary" onclick={() => prefs.cycleSize()}>Change size</button></div>
				<p class="app-settings__note">Markdown supports source and rich editing. TXT stays plain text; CSV and JSON use dedicated editing surfaces.</p>
			{:else if section === 'intelligence'}
				<h3>Ask & automation</h3>
				<p class="app-settings__intro">Configure a compatible provider or local GGUF, and decide how source applications contribute tags at capture time.</p>
				<div class="app-settings__setting"><div><strong>Agent</strong><p>Selected text, documents, folders, data files, and retrieved local sources can be added as explicit context.</p></div><button class="app-settings__primary" onclick={openAgent}>Configure agent</button></div>
				<div class="app-settings__setting"><div><strong>Capture rules</strong><p>Review source-app rules and their automatic tags.</p></div><button class="app-settings__secondary" onclick={openRules}>Manage rules</button></div>
				<p class="app-settings__note">Credentials remain in local application storage. Documents are never sent anywhere unless you deliberately use a configured agent.</p>
			{:else if section === 'shortcuts'}
				<h3>Keyboard workflow</h3>
				<div class="app-settings__shortcuts">
					<div><kbd>⌘ N</kbd><span>New Markdown document</span></div><div><kbd>⌘ S</kbd><span>Save active file</span></div><div><kbd>⌘ .</kbd><span>Open or close Ask</span></div><div><kbd>Esc</kbd><span>Close the current panel</span></div>
				</div>
				<p class="app-settings__note">CSV grids, JSON trees, document viewers, and menus all keep their native keyboard navigation.</p>
			{:else}
				<h3>Fracta</h3>
				<p class="app-settings__intro">A local-first workspace for notes, structured files, documents, and the connections between them.</p>
				<dl class="app-settings__facts"><div><dt>Content formats</dt><dd>Markdown, TXT, CSV, TSV, JSON, PDF, DOCX</dd></div><div><dt>Storage model</dt><dd>Ordinary files, YAML frontmatter, relative assets</dd></div><div><dt>Search</dt><dd>Private SQLite FTS index outside your project</dd></div></dl>
			{/if}
		</div>
	</div>
</div>
