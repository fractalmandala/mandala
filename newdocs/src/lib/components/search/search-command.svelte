<script lang="ts">
	import { goto } from "$app/navigation";
	import SearchIcon from "@lucide/svelte/icons/search";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Command from "$lib/components/ui/command/index.js";
	import type { NavItem } from "$lib/docs/types.js";
	import { loadPagefindModule } from "$lib/docs/load-pagefind.js";

	interface PagefindResult {
		url: string;
		meta: { title: string };
		excerpt: string;
	}

	/** Navigation must be passed from layout data — never import content.ts here (client vault leak). */
	let { navigation = [] }: { navigation?: NavItem[] } = $props();

	let open = $state(false);
	let query = $state('');
	let searchResults = $state<PagefindResult[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pagefind: any = $state(null);
	let searching = $state(false);
	let pagefindTried = $state(false);

	async function loadPagefind() {
		if (pagefind || pagefindTried) return;
		pagefindTried = true;
		try {
			// Index lives in static/pagefind after `pnpm build` (or last successful build).
			const mod = await loadPagefindModule(window.location.origin);
			await mod.init();
			pagefind = mod;
		} catch {
			// Dev without a prior build, or index missing — browse nav still works
			pagefind = null;
		}
	}

	let debounceTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const q = query;
		clearTimeout(debounceTimer);
		if (!q || q.length < 2) {
			searchResults = [];
			searching = false;
			return;
		}

		searching = true;
		debounceTimer = setTimeout(async () => {
			if (!pagefind) await loadPagefind();
			if (!pagefind) { searching = false; return; }

			try {
				const search = await pagefind.search(q);
				const results = await Promise.all(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					search.results.slice(0, 8).map((r: any) => r.data())
				);
				searchResults = results;
			} catch {
				searchResults = [];
			}
			searching = false;
		}, 150);

		return () => clearTimeout(debounceTimer);
	});

	function navigate(url: string) {
		open = false;
		query = '';
		searchResults = [];
		goto(url);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			open = !open;
			if (open) loadPagefind();
		}
	}

	function handleOpenChange(isOpen: boolean) {
		if (isOpen) loadPagefind();
		else {
			query = '';
			searchResults = [];
		}
	}

	/** Strip tags from pagefind excerpt HTML for safe display. */
	function excerptText(html: string): string {
		return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function flattenItems(items: NavItem[]): NavItem[] {
		const out: NavItem[] = [];
		for (const item of items) {
			if (item.href) out.push(item);
			if (item.items?.length) out.push(...flattenItems(item.items));
		}
		return out;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Button
	variant="outline"
	class="text-muted-foreground relative h-8 w-full justify-start rounded-md text-sm"
	onclick={() => { open = true; loadPagefind(); }}
>
	<SearchIcon class="mr-2 size-4" />
	<span class="inline-flex">Search docs...</span>
	<kbd
		class="bg-muted text-muted-foreground pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex"
	>
		<span class="text-xs">⌘</span>K
	</kbd>
</Button>

<Command.Dialog bind:open onOpenChange={handleOpenChange}>
	<Command.Input placeholder="Search documentation..." bind:value={query} />
	<Command.List>
		<Command.Empty>
			{#if searching}
				Searching...
			{:else if query.length > 0}
				No results found.
			{:else}
				Type to search...
			{/if}
		</Command.Empty>

		{#if searchResults.length > 0}
			<Command.Group heading="Results">
				{#each searchResults as result (result.url)}
					<Command.Item onSelect={() => navigate(result.url)}>
						<FileTextIcon class="shrink-0" />
						<div class="flex flex-col gap-0.5 overflow-hidden">
							<span class="truncate">{result.meta.title}</span>
							{#if result.excerpt}
								<span class="text-muted-foreground truncate text-xs">
									{excerptText(result.excerpt)}
								</span>
							{/if}
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{:else if !query}
			{#each navigation as section (section.title)}
				{@const leaves = flattenItems(section.items ?? [])}
				{#if leaves.length > 0}
					<Command.Group heading={section.title}>
						{#each leaves as item (item.href)}
							<Command.Item onSelect={() => navigate(item.href ?? '')}>
								<FileTextIcon />
								<span>{item.title}</span>
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			{/each}
		{/if}
	</Command.List>
</Command.Dialog>
