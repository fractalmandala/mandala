<script lang="ts">
	import { onMount } from 'svelte';
	import WorkspaceShell from '$lib/components/shell/WorkspaceShell.svelte';
	import AiSidebar from './AiSidebar.svelte';
	import ChatColumn from './ChatColumn.svelte';
	import WorkPanel from './WorkPanel.svelte';
	import { aiWorkspace } from '../state/ai.svelte';

	onMount(() => {
		void aiWorkspace.refreshSessions();
	});
</script>

<WorkspaceShell profile="agent">
	{#snippet left()}<AiSidebar />{/snippet}
	{#snippet center()}<ChatColumn />{/snippet}
	{#snippet right()}<WorkPanel />{/snippet}
</WorkspaceShell>
