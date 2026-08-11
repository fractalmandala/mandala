<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import './Card.sass';

	interface Props {
		title?: string;
		subtitle?: string;
		href?: string;
		expandable?: boolean;
		defaultExpanded?: boolean;
		ariaLabel?: string;
		onclick?: () => void;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		subtitle,
		href,
		expandable = false,
		defaultExpanded = false,
		ariaLabel,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	let isExpanded = $state(untrack(() => defaultExpanded));

	const interactive = $derived(!!(href || onclick));
	const hasHeader = $derived(!!(title || subtitle || expandable));

	function toggle() {
		isExpanded = !isExpanded;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		if (expandable) toggle();
		else onclick?.();
	}
</script>

{#if href}
	<a {href} class="card {className}" {onclick} onkeydown={handleKeydown} aria-label={ariaLabel}>
		{@render body()}
	</a>
{:else if interactive}
	<button type="button" class="card {className} card-interactive" {onclick} aria-label={ariaLabel}>
		{@render body()}
	</button>
{:else}
	<div class="card {className}">
		{@render body()}
	</div>
{/if}

{#snippet body()}
	{#if hasHeader}
		{#if expandable}
			<button
				type="button"
				class="card-header card-header-toggle"
				onclick={toggle}
				aria-expanded={isExpanded}
				aria-controls="card-body"
			>
				<div class="card-titles">
					{#if title}
						<h3 class="card-title">{title}</h3>
					{/if}
					{#if subtitle}
						<p class="card-subtitle">{subtitle}</p>
					{/if}
				</div>
				<svg
					class="card-chevron"
					class:card-chevron-open={isExpanded}
					aria-hidden="true"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
		{:else}
			<div class="card-header">
				<div class="card-titles">
					{#if title}
						<h3 class="card-title">{title}</h3>
					{/if}
					{#if subtitle}
						<p class="card-subtitle">{subtitle}</p>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
	{#if expandable}
		{#if isExpanded}
			<div id="card-body" class="card-body">
				{#if children}
					{@render children()}
				{/if}
			</div>
		{/if}
	{:else}
		<div class="card-body">
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
{/snippet}
