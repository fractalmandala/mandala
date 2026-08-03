<script lang="ts" module>
	import type { ComponentProps, Snippet } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type CopyButtonProps = Omit<ComponentProps<typeof Button>, 'href'> & {
		/** Text written to the clipboard. */
		text: string;
		/** Custom idle icon; defaults to an inline copy glyph. */
		icon?: Snippet;
		/** Scale-in duration for status icons, in ms. Default `500`. */
		animationDuration?: number;
		/** Called with the transient clipboard status after each attempt. */
		onCopy?: (status: 'success' | 'failure' | undefined) => void;
	};
</script>

<script lang="ts">
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte.js';
	import { scale } from 'svelte/transition';

	let {
		text,
		icon,
		animationDuration = 500,
		variant = 'ghost',
		size = 'icon',
		onCopy,
		children,
		ref = $bindable(null),
		tabindex = -1,
		...restProps
	}: CopyButtonProps = $props();

	// Icon-only default; grow to default size when a text label is provided.
	const effectiveSize = $derived(size === 'icon' && children ? 'default' : size);
	const clipboard = new UseClipboard();

	async function handleClick() {
		const status = await clipboard.copy(text);
		onCopy?.(status);
	}
</script>

<!-- Keep data-slot=button so button.sass skin applies; chrome via data-copy-button. -->
<Button
	bind:ref
	{variant}
	size={effectiveSize}
	type="button"
	name="copy"
	{tabindex}
	data-copy-button="true"
	data-status={clipboard.status}
	onclick={handleClick}
	{...restProps}
>
	{#if clipboard.status === 'success'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }} data-slot="copy-status-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M20 6 9 17l-5-5" />
			</svg>
			<span class="sr-only">Copied</span>
		</div>
	{:else if clipboard.status === 'failure'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }} data-slot="copy-status-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
			<span class="sr-only">Failed to copy</span>
		</div>
	{:else}
		<div in:scale={{ duration: animationDuration, start: 0.85 }} data-slot="copy-status-icon">
			{#if icon}
				{@render icon()}
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
			{/if}
			<span class="sr-only">Copy</span>
		</div>
	{/if}
	{@render children?.()}
</Button>
