<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { entries } from '$lib/state/entries.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { workspace } from '$lib/state/workspace.svelte';
	import { isTauri } from '$lib/ipc';
	import AppNav from '$lib/components/app-nav.svelte';
	import Workspace from '$lib/components/Workspace.svelte';
	import RulesPanel from '$lib/components/RulesPanel.svelte';
	import AgentSettings from '$lib/components/AgentSettings.svelte';
	import AppSettings from '$lib/components/AppSettings.svelte';

	onMount(() => {
		ui.setMode('workspace');
		void entries.init();
	});

	function isInteractiveTarget(target: EventTarget | null) {
		return target instanceof Element && Boolean(target.closest('button, a, input, select, textarea'));
	}

	async function dragWindow(event: PointerEvent) {
		if (!isTauri() || event.button !== 0 || isInteractiveTarget(event.target)) return;
		await getCurrentWindow().startDragging();
	}

	async function toggleWindowMaximize(event: MouseEvent) {
		if (!isTauri() || isInteractiveTarget(event.target)) return;
		await getCurrentWindow().toggleMaximize();
	}

	function onKeydown(event: KeyboardEvent) {
		const meta = event.metaKey || event.ctrlKey;
		if (event.key === 'Escape') {
			if (ui.agentOpen) ui.agentOpen = false;
			else if (ui.settingsOpen) ui.settingsOpen = false;
			else if (ui.rulesOpen) ui.rulesOpen = false;
			else if (ui.askOpen) ui.closeAsk();
			return;
		}
		if (!meta) return;
		if (event.key.toLowerCase() === 'n') { event.preventDefault(); void workspace.createMarkdown(); }
		if (event.key.toLowerCase() === 's') { event.preventDefault(); void workspace.save(); }
		if (event.key === '.') { event.preventDefault(); ui.toggleAsk(); }
	}
</script>

<svelte:window onkeydown={onKeydown} />

<section class="fracta-app">
	{#if entries.loading}
		<div class="gate"><p class="gate__hint">Loading workspace…</p></div>
	{:else if !entries.vaultConfigured}
		<div class="gate">
			<h1 class="gate__title">fracta</h1>
			<p class="gate__hint">Choose a local project folder. Fracta keeps Markdown, data files, documents, search, and agent context together without moving your knowledge to a cloud database.</p>
			<button class="gate__button" onclick={() => entries.chooseVault()}>Choose project folder…</button>
		</div>
	{:else}
		<div class="actual-area actual-area--workspace">
			<main class="mainarea mainarea--full">
				<header class="appheader row ycenter w100" onpointerdown={dragWindow} ondblclick={toggleWindowMaximize} role="presentation" aria-label="Fracta workspace header"><AppNav /></header>
				<Workspace />
			</main>
		</div>
		{#if ui.rulesOpen}<RulesPanel />{/if}
		{#if ui.settingsOpen}<AppSettings />{/if}
		{#if ui.agentOpen}<AgentSettings />{/if}
	{/if}
</section>
