<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';
	import type { ChatStatus } from './types.js';

	export type PromptInputSubmitProps = Omit<ComponentProps<typeof Button>, 'href' | 'type'> & {
		status?: ChatStatus;
		onStop?: () => void;
	};
</script>

<script lang="ts">
	let {
		status = 'ready',
		onStop,
		variant = 'default',
		size = 'icon-sm',
		children,
		ref = $bindable(null),
		onclick,
		...restProps
	}: PromptInputSubmitProps = $props();

	const isGenerating = $derived(status === 'submitted' || status === 'streaming');
	const buttonType = $derived<'button' | 'submit'>(isGenerating ? 'button' : 'submit');
	const ariaLabel = $derived(isGenerating ? 'Stop' : 'Submit');
	const buttonVariant = $derived(isGenerating ? 'outline' : variant);

	function handleClick(event: MouseEvent) {
		if (isGenerating) {
			event.preventDefault();
			onStop?.();
			return;
		}
		// Button may be anchor or button; forward loosely
		onclick?.(event as never);
	}
</script>

<Button
	bind:ref
	aria-label={ariaLabel}
	data-prompt-input-submit="true"
	data-status={status}
	onclick={handleClick}
	{size}
	type={buttonType}
	variant={buttonVariant}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else if status === 'submitted'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			data-slot="prompt-input-submit-spin"
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	{:else if status === 'streaming'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<rect width="12" height="12" x="6" y="6" rx="1" />
		</svg>
	{:else if status === 'error'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
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
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m22 2-7 20-4-9-9-4Z" />
			<path d="M22 2 11 13" />
		</svg>
	{/if}
</Button>
