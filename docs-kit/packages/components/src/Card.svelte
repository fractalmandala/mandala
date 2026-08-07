<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		href,
		icon,
		children
	}: { title: string; href?: string; icon?: string; children?: Snippet } = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	class="docs-card"
	href={href ?? undefined}
	role={href ? undefined : 'group'}
>
	{#if icon}
		<span class="docs-card__icon" aria-hidden="true">{icon}</span>
	{/if}
	<span class="docs-card__title">{title}</span>
	{#if children}
		<span class="docs-card__body">{@render children()}</span>
	{/if}
</svelte:element>
