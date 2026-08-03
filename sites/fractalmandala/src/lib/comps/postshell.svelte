<script lang="ts">

	import type { Snippet } from 'svelte';

	interface Props {
		crumb?: string;
		title?: string;
		description?: string;
		tags?: Snippet;
		articleBody?: Snippet
	}

	let { crumb = "", title = "", description = "", tags, articleBody }: Props = $props()

</script>

<div class="box rgap8 header-panel">
	<a href="/{crumb}" class="tt-u text-xs breadcrumb">{crumb}</a>
	<h1 class="text-4xl">{title}</h1>
	<p class="text-bs col2 padbot8">{description}</p>
	{#if tags}{@render tags()}{/if}
</div>
{#if articleBody}{@render articleBody()}{/if}