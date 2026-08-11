<script lang="ts">
	import type { Snippet } from 'svelte';
	import './Button.sass';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		loading?: boolean;
		href?: string;
		target?: string;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		href,
		target,
		type = 'button',
		ariaLabel,
		onclick,
		children
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
	const tagName = $derived(href ? 'a' : 'button');
</script>

{#snippet content()}
	{#if loading}
		<span class="btn-spinner" aria-hidden="true"></span>
	{/if}
	{#if children}
		<span class="btn-label">
			{@render children()}
		</span>
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		{target}
		class="btn btn-{variant} btn-{size}"
		class:btn-disabled={isDisabled}
		aria-label={ariaLabel}
		aria-busy={loading}
	>
		{@render content()}
	</a>
{:else}
	<button
		{type}
		class="btn btn-{variant} btn-{size}"
		class:btn-disabled={isDisabled}
		disabled={isDisabled}
		aria-label={ariaLabel}
		aria-busy={loading}
		{onclick}
	>
		{@render content()}
	</button>
{/if}
