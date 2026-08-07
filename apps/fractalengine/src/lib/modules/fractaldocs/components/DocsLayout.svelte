<script lang="ts">
	import { onDestroy } from 'svelte';
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import { docsState } from '../state/docs.svelte';
	import { ideState } from '$lib/state/ide.svelte';
	import DocsSidebarLeft from './DocsSidebarLeft.svelte';
	import DocsContent from './DocsContent.svelte';
	import DocsSidebarRight from './DocsSidebarRight.svelte';

	let initializedRoot = $state<string | null>(null);
	$effect(() => {
		const rootPath = ideState.rootPath;
		if (rootPath === initializedRoot) return;
		initializedRoot = rootPath;
		void docsState.init(rootPath);
	});
	onDestroy(() => docsState.cancelPending());
</script>

<WorkspaceShell profile="docs">
	{#snippet left()}<DocsSidebarLeft />{/snippet}
	{#snippet center()}<DocsContent />{/snippet}
	{#snippet right()}<DocsSidebarRight />{/snippet}
</WorkspaceShell>
