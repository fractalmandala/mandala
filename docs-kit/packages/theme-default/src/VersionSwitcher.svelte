<script lang="ts">
	import type { DocsVersionSwitcherItem } from '@docs-kit/core';

	let {
		items,
		label = 'Version',
		fallbackNote = 'not translated on this page'
	}: {
		items: DocsVersionSwitcherItem[];
		label?: string;
		/** Announced for a version that has no equivalent page. */
		fallbackNote?: string;
	} = $props();

	const current = $derived(items.find((item) => item.current) ?? items[0]);

	function go(event: Event) {
		const id = (event.currentTarget as HTMLSelectElement).value;
		const item = items.find((entry) => entry.id === id);

		if (item?.href) {
			window.location.assign(item.href);
		}
	}
</script>

{#if items.length > 1}
	<div class="docs-switcher">
		<label class="docs-switcher__label" for="docs-version-switcher">{label}</label>
		<select
			id="docs-version-switcher"
			class="docs-switcher__select"
			value={current?.id}
			onchange={go}
		>
			{#each items as item (item.id)}
				<option
					value={item.id}
					disabled={item.href === undefined}
					title={item.fallback ? `${item.label} — ${fallbackNote}` : undefined}
				>
					{item.label}{item.fallback ? ' ·' : ''}
				</option>
			{/each}
		</select>
	</div>
{/if}
