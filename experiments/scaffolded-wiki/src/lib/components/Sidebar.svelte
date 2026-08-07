<script lang="ts">
	import SidebarNode from './SidebarNode.svelte';
	import type { TreeItem, TagView } from '$lib/server/wiki';

	let {
		tree,
		tags,
		stats,
		currentPath
	}: {
		tree: TreeItem[];
		tags: TagView[];
		stats: { docs: number; tags: number };
		currentPath: string;
	} = $props();

	// Section open state. Chain sections (ancestors of the current page) are
	// open by default; `extra` stores explicit overrides the user makes.
	let extra = $state<Record<string, boolean>>({});

	function onChain(sectionPath: string): boolean {
		return currentPath === sectionPath || currentPath.startsWith(sectionPath + '/');
	}

	function isOpen(sectionPath: string): boolean {
		if (onChain(sectionPath)) return extra[sectionPath] !== false;
		return extra[sectionPath] === true;
	}

	function toggle(sectionPath: string) {
		extra = { ...extra, [sectionPath]: !isOpen(sectionPath) };
	}

	const topTags = $derived(
		tags
			.slice()
			.sort((a, b) => b.count - a.count)
			.slice(0, 14)
	);
</script>

<nav class="side-tree" aria-label="Wiki navigation">
	{#each tree as node (node.path)}
		<SidebarNode {node} depth={0} {currentPath} {isOpen} onToggle={toggle} />
	{/each}
</nav>

<div class="side-foot">
	<p class="label">Top tags</p>
	<div class="side-tags">
		{#each topTags as t (t.slug)}
			<a class="chip" href={`/tag/${t.slug}`}>{t.tag}<span class="n">{t.count}</span></a>
		{/each}
	</div>
	<a class="chip" href="/tags" style="margin-top:8px">All tags…</a>
	<p class="side-stat">{stats.docs} docs · {stats.tags} tags</p>
</div>
