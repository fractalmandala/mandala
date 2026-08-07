<script lang="ts">
	import { ideState } from '../state/ide.svelte';
	import { shellState } from '../state/shell.svelte';
	import { appState } from '../state/app.svelte';
	import { TEMPLATES, type AppTemplateId } from '../data/templates';
	import { onMount } from 'svelte';

	function openTemplate(id: AppTemplateId) {
		const template = TEMPLATES.find((candidate) => candidate.id === id);
		if (template) appState.applyTemplate(template);
		shellState.dockOpen = false;
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (ev.key === 'Escape') {
			shellState.dockOpen = false;
		}
	}

	let appdockEl = $state<HTMLDivElement | null>(null);

	onMount(() => {
		function handleClickOutside(ev: MouseEvent) {
			if (!appdockEl || !ideState.dockOpen) return;
			if (!appdockEl.contains(ev.target as Node)) {
				shellState.dockOpen = false;
			}
		}
		window.addEventListener('click', handleClickOutside, false);
		return () => window.removeEventListener('click', handleClickOutside, false);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div bind:this={appdockEl} class="appdock gap1" class:is-active={ideState.dockOpen} aria-hidden={!ideState.dockOpen} inert={!ideState.dockOpen}>
	<button class="dock-button box xcenter ycenter dock-1" onclick={() => ideState.dockOpen ? openTemplate('code') : shellState.dockOpen = true}>
		<img src="/icontheme-allicon/code.svg" alt="code" class="icon-svg-xl"/>
		<span class="dock-label">code</span>
	</button>
	<button class="dock-button box xcenter ycenter dock-2" onclick={() => openTemplate('notes')}>
		<img src="/icontheme-allicon/FolderResourcesClosed.svg" alt="notes" class="icon-svg-xl"/>
		<span class="dock-label">notes</span>
	</button>
	<button class="dock-button box xcenter ycenter dock-3" onclick={() => openTemplate('design')}>
		<img src="/icontheme-allicon/designCanvas.svg" alt="design" class="icon-svg-xl"/>
		<span class="dock-label">create</span>
	</button>
	<button class="dock-button box xcenter ycenter dock-4" onclick={() => { ideState.toggleBrowser(); shellState.dockOpen = false; }}>
		<img src="/icontheme-allicon/webInspector.svg" alt="web" class="icon-svg-xl"/>
		<span class="dock-label">browse</span>
	</button>
</div>
