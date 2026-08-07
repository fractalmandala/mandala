<script lang="ts">
	import type { DocsNavigationNode } from '@docs-kit/core';

	import NavigationList from './NavigationList.svelte';

	let {
		navigation,
		pathname,
		label = 'Documentation'
	}: { navigation: DocsNavigationNode[]; pathname: string; label?: string } = $props();
</script>

<nav class="docs-sidebar" aria-label={label}>
	<NavigationList nodes={navigation} {pathname} />
</nav>
