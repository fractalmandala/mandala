<script lang="ts">
	import { DocsPage } from '@docs-kit/theme-default';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const Content = $derived(data.content);
</script>

<DocsPage
	data={{
		page: data.page,
		navigation: data.navigation,
		site: data.site,
		basePath: "/docs"
	}}
>
	<Content />
</DocsPage>
