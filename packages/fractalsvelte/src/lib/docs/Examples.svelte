<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type ExampleItem = {
		title: string;
		/** Rendered live in the preview stage. */
		demo: Snippet;
		/** Shown under the Code tab. */
		code?: string;
		/** Shiki language for the Code tab (default: svelte). */
		lang?: string;
		/** Optional note shown above the stage. */
		description?: string;
		/** Per-example overflow override (e.g. navigation menus). */
		overflow?: 'hidden' | 'visible';
	};
</script>

<script lang="ts">
	import Preview from "./Preview.svelte";

	// One tabbed area for a component's whole Examples section, rather than a long scroll of
	// stacked previews. Items are passed explicitly (title + snippet) so the tab list is
	// statically known — no child-registration ordering to get wrong.
	let {
		items,
		overflow = "hidden",
	}: {
		items: ExampleItem[];
		/** Default overflow for every example preview. */
		overflow?: "hidden" | "visible";
	} = $props();

	let active = $state(0);
	const current = $derived(items[active]);

	let tabEls: HTMLButtonElement[] = $state([]);

	// Roving focus: arrow keys move between tabs, Home/End jump to the ends.
	function onkeydown(event: KeyboardEvent) {
		const last = items.length - 1;
		let next = active;
		if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
		else if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
		else if (event.key === "Home") next = 0;
		else if (event.key === "End") next = last;
		else return;

		event.preventDefault();
		active = next;
		tabEls[next]?.focus();
	}
</script>

<div class="doc-examples">
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- Focus lives on the tabs themselves (roving tabindex), which is the ARIA-correct
	     pattern; the tablist container is not a focus target. -->
	<div class="doc-example-tabs row wrap" role="tablist" aria-label="Examples" {onkeydown}>
		{#each items as item, i (item.title)}
			<button
				bind:this={tabEls[i]}
				type="button"
				role="tab"
				id="ex-tab-{i}"
				class="doc-example-tab"
				data-active={active === i}
				aria-selected={active === i}
				aria-controls="ex-panel-{i}"
				tabindex={active === i ? 0 : -1}
				onclick={() => (active = i)}
			>
				{item.title}
			</button>
		{/each}
	</div>

	{#if current}
		<div id="ex-panel-{active}" role="tabpanel" aria-labelledby="ex-tab-{active}">
			<Preview
				code={current.code}
				lang={current.lang ?? 'svelte'}
				description={current.description}
				overflow={current.overflow ?? overflow}
			>
				{@render current.demo()}
			</Preview>
		</div>
	{/if}
</div>
