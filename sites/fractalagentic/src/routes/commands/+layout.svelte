<script lang="ts">
	import type { Snippet } from 'svelte';
	import ContextualShell from '$lib/content/themes/docs/ContextualShell.svelte';
	import { listAgents, listBossEntries, listCommands, listDocs, listSkills } from '$lib/content/catalog';

	let { children }: { children: Snippet } = $props();
	const sections = [
		{ key: 'docs', title: 'Docs', items: listDocs().map(({ slug, title, href }) => ({ slug, title, href })) },
		{ key: 'bosses', title: 'Bosses', items: listBossEntries().map(({ slug, title, href }) => ({ slug, title, href })) },
		{ key: 'skills', title: 'Skills', items: listSkills().map(({ slug, title, href }) => ({ slug, title, href })) },
		{ key: 'commands', title: 'Commands', items: listCommands().map(({ slug, title, href }) => ({ slug, title, href })) },
		{ key: 'agents', title: 'Agents', items: listAgents().map(({ slug, title, href }) => ({ slug, title, href })) }
	];
</script>

<ContextualShell {sections}>
	{@render children()}
</ContextualShell>
