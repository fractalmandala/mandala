<script lang="ts">
	import type { DocsLocaleSwitcherItem } from '@docs-kit/core';

	let {
		items,
		label = 'Language',
		fallbackNote = 'falls back to another page'
	}: {
		items: DocsLocaleSwitcherItem[];
		label?: string;
		/** Announced for a locale with no translation of the current page. */
		fallbackNote?: string;
	} = $props();

	const current = $derived(items.find((item) => item.current) ?? items.find((item) => item.default));

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
		<label class="docs-switcher__label" for="docs-locale-switcher">{label}</label>
		<select
			id="docs-locale-switcher"
			class="docs-switcher__select"
			value={current?.id}
			onchange={go}
		>
			{#each items as item (item.id)}
				<option
					value={item.id}
					lang={item.id}
					disabled={item.href === undefined}
					title={item.fallback ? `${item.label} — ${fallbackNote}` : undefined}
				>
					{item.label}{item.fallback ? ' ·' : ''}
				</option>
			{/each}
		</select>
	</div>
{/if}
