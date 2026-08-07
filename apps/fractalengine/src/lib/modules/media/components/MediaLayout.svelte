<script lang="ts">
	import { onMount } from 'svelte';
	import { isTauri } from '$lib/ipc';
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import { media } from '../state/media.svelte';
	import MediaSidebar from './MediaSidebar.svelte';
	import MediaToolbar from './MediaToolbar.svelte';
	import MediaGrid from './MediaGrid.svelte';
	import MediaProgressStrip from './MediaProgressStrip.svelte';
	import MediaInspector from './MediaInspector.svelte';

	onMount(() => {
		void media.load();
		let unlisten: (() => void) | undefined;
		if (isTauri()) void import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().onDragDropEvent(event => {
			if (event.payload.type !== 'drop') return;
			const target = document.elementFromPoint(event.payload.position.x, event.payload.position.y)?.closest<HTMLElement>('[data-media-folder]');
			void media.importPaths(event.payload.paths, target?.dataset.mediaFolder ?? (media.activeScope.type === 'folder' ? media.activeScope.path : ''), 'copy');
		}).then(off => unlisten = off));
		return () => { unlisten?.(); media.destroy(); };
	});
</script>

<WorkspaceShell profile="media">
	{#snippet left()}<MediaSidebar />{/snippet}
	{#snippet center()}
		{#if !media.library && !media.loading}
			<section class="media-setup"><img src="/fractalmedia.png" alt="" /><h1>Set up your media library</h1><p>FractalMedia keeps copies in <strong>~/Documents/Gallery/Fracta</strong>, an ordinary folder you always own.</p><button class="btn-app" onclick={() => void media.initialize()}>Create Media Library</button></section>
		{:else}
			<MediaToolbar /><MediaGrid /><MediaProgressStrip />
		{/if}
	{/snippet}
	{#snippet right()}<MediaInspector />{/snippet}
</WorkspaceShell>
