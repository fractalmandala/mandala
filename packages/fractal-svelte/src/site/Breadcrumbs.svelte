<script lang="ts">
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol>{#each items as item, index}<li>{#if item.href}<a href={item.href}>{item.label}</a>{:else}<span aria-current="page">{item.label}</span>{/if}{#if index < items.length - 1}<span aria-hidden="true">/</span>{/if}</li>{/each}</ol>
</nav>
