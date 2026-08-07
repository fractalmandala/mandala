<script lang="ts">
	import { docsOgCardUrl } from '@docs-kit/og/client';
	import { DocsPage, SearchDialog, SearchTrigger } from '@docs-kit/theme-default';

	import { openSearch } from '$lib/docs/search';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const Content = $derived(data.content);
	let searchOpen = $state(false);
</script>

<DocsPage
	data={{
		page: data.page,
		navigation: data.navigation,
		site: data.site ?? { title: 'Acme Documentation' },
		basePath: '/docs'
	}}
	image={docsOgCardUrl(data.page)}
>
	{#snippet search()}
		<SearchTrigger onopen={() => (searchOpen = true)} />
		<SearchDialog bind:open={searchOpen} client={openSearch} />
	{/snippet}

	<Content />
</DocsPage>
