<script lang="ts">
	import SearchCommand from "$lib/components/search/search-command.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { toc } from "$lib/docs/toc.svelte";
	import type { NavItem, TableOfContentsItem } from "$lib/docs/types.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		navigation = [],
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { navigation?: NavItem[] } = $props();

	interface TocSection {
		parent: TableOfContentsItem;
		children: TableOfContentsItem[];
	}

	function buildTree(items: TableOfContentsItem[]): TocSection[] {
		const sections: TocSection[] = [];
		let current: TocSection | null = null;

		for (const item of items) {
			if (item.depth === 2) {
				current = { parent: item, children: [] };
				sections.push(current);
			} else if (current) {
				current.children.push(item);
			} else {
				sections.push({ parent: item, children: [] });
			}
		}

		return sections;
	}

	function handleClick(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
			toc.activeId = id;
		}
	}

	$effect(() => {
		const items = toc.items;
		if (items.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						toc.activeId = entry.target.id;
					}
				}
			},
			{ rootMargin: "-80px 0px -80% 0px" }
		);

		for (const item of items) {
			const el = document.getElementById(item.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	});
</script>

<Sidebar.Root
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-s lg:flex"
	{...restProps}
>
	<Sidebar.Header class="p-3">
		<SearchCommand {navigation} />
	</Sidebar.Header>
	<Sidebar.Content>
		{#if toc.items.length > 0}
			<div class="docs-toc pad16">
				<p class="docs-toc-title">On this page</p>
				<nav class="docs-toc-nav" aria-label="Table of contents">
					{#each buildTree(toc.items) as section (section.parent.id)}
						<button
							type="button"
							class="docs-toc-link"
							class:is-active={toc.activeId === section.parent.id}
							onclick={() => handleClick(section.parent.id)}
						>
							{section.parent.text}
						</button>
						{#each section.children as subItem (subItem.id)}
							<button
								type="button"
								class="docs-toc-link docs-toc-link-sub"
								class:is-active={toc.activeId === subItem.id}
								onclick={() => handleClick(subItem.id)}
							>
								{subItem.text}
							</button>
						{/each}
					{/each}
				</nav>
			</div>
		{/if}
	</Sidebar.Content>
</Sidebar.Root>
