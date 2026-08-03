<script lang="ts">
	import './animated-badge.sass';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	type Status = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'loading';
	type Props = HTMLAttributes<HTMLSpanElement> & { status?: Status; size?: 'sm' | 'md'; icon?: Snippet; showIcon?: boolean; pulse?: boolean; contentKey?: string | number; children?: Snippet };
	let { status = 'neutral', size = 'md', icon, showIcon = true, pulse = status === 'loading', contentKey, children, ...rest }: Props = $props();
</script>

<span {...rest} data-slot="badge" data-status={status} data-size={size} data-pulse={pulse}>
	{#if pulse}<span data-slot="badge-pulse" aria-hidden="true"></span>{/if}
	{#if showIcon}<span data-slot="badge-icon" data-key={contentKey ?? status} aria-hidden="true">{#if icon}{@render icon()}{:else if status === 'success'}✓{:else if status === 'warning'}!{:else if status === 'danger'}×{:else if status === 'info'}i{:else if status === 'loading'}◌{:else}●{/if}</span>{/if}
	{#if children}<span data-slot="badge-label" data-key={contentKey ?? status}>{@render children()}</span>{/if}
</span>
