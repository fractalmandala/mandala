<script lang="ts">
	import type { Snippet } from 'svelte';

	import Tabs from './Tabs.svelte';

	let { labels = [], children }: { labels?: string[]; children: Snippet } = $props();
</script>

<div class="docs-code-group">
	<Tabs {labels}>{@render children()}</Tabs>
</div>
