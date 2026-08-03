<script lang="ts">
	import type { CatalogEntry } from '$lib/catalog/index.js';
	import { componentPath } from './content.js';
	let { entry }: { entry: CatalogEntry } = $props();
</script>

<a class="component-card" href={componentPath(entry)}>
	<span class="component-card__top"
		><strong>{entry.name}</strong><span class="status" data-status={entry.status}
			>{entry.status}</span
		></span
	>
	<span>{entry.description}</span>
	<span class="component-card__meta">Live preview · {entry.exportPath}</span>
</a>
