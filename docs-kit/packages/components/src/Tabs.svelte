<script lang="ts">
	import { setContext, type Snippet } from 'svelte';

	import { tabsContextKey, type TabsContext } from './tabs-context.js';

	let {
		labels = [],
		children
	}: { labels?: string[]; children: Snippet } = $props();

	// `selected` is only set by interaction, so the first tab stays the default even when
	// the set of labels changes.
	let selected = $state<string | undefined>(undefined);
	const active = $derived(
		selected !== undefined && labels.includes(selected) ? selected : (labels[0] ?? '')
	);

	const context: TabsContext = {
		get active() {
			return active;
		}
	};
	setContext(tabsContextKey, context);

	function onkeydown(event: KeyboardEvent, index: number) {
		const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (offset === 0) {
			return;
		}

		event.preventDefault();
		const nextIndex = (index + offset + labels.length) % labels.length;
		const next = labels[nextIndex];
		if (next === undefined) {
			return;
		}

		selected = next;
		const list = (event.currentTarget as HTMLElement).parentElement;
		list?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus();
	}
</script>

<div class="docs-tabs">
	<div class="docs-tabs__list" role="tablist">
		{#each labels as label, index (label)}
			<button
				type="button"
				role="tab"
				data-tab={label}
				id="tab-{label}"
				aria-selected={active === label}
				aria-controls="panel-{label}"
				tabindex={active === label ? 0 : -1}
				onclick={() => (selected = label)}
				onkeydown={(event) => onkeydown(event, index)}
			>
				{label}
			</button>
		{/each}
	</div>

	{@render children()}
</div>
