<script lang="ts">
	import { onDestroy } from 'svelte';
	import { readWorkspaceDocxImage } from '$lib/ipc';

	let { path, archivePath }: { path: string; archivePath: string } = $props();
	let url = $state<string>();
	let error = $state(false);
	let revision = 0;

	$effect(() => {
		path; archivePath;
		const id = ++revision;
		error = false;
		if (url) URL.revokeObjectURL(url);
		url = undefined;
		void readWorkspaceDocxImage(path, archivePath).then((asset) => {
			if (id !== revision) return;
			url = URL.createObjectURL(new Blob([new Uint8Array(asset.bytes)], { type: asset.mime }));
		}).catch(() => { if (id === revision) error = true; });
	});

	onDestroy(() => { if (url) URL.revokeObjectURL(url); });
</script>

{#if url}
	<img class="workspace__docx-image" src={url} alt={`Embedded document image: ${archivePath.split('/').at(-1) ?? 'image'}`} />
{:else if error}
	<p class="workspace__docx-image-error">An embedded image could not be displayed.</p>
{:else}
	<p class="workspace__docx-image-loading">Loading embedded image…</p>
{/if}
