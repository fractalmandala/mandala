<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	export type ConversationScrollButtonProps = ComponentProps<typeof Button>;
</script>

<script lang="ts">
	import { getStickToBottomContext } from './stick-to-bottom-context.svelte.js';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let {
		onclick,
		ref = $bindable(null),
		children,
		...restProps
	}: ConversationScrollButtonProps = $props();

	const context = getStickToBottomContext();

	const handleScrollToBottom = (event: MouseEvent) => {
		context.scrollToBottom();
		if (onclick) {
			onclick(
				event as MouseEvent & {
					currentTarget: EventTarget & HTMLButtonElement;
				}
			);
		}
	};
</script>

{#if !context.isAtBottom}
	<div
		in:fly={{
			duration: 300,
			y: 10,
			easing: backOut
		}}
		out:fly={{
			duration: 200,
			y: 10,
			easing: backOut
		}}
		data-slot="conversation-scroll-button-container"
	>
		<!-- Keep data-slot=button so button.sass applies; data-conversation-scroll-button for chrome. -->
		<Button
			bind:ref
			onclick={handleScrollToBottom}
			size="icon"
			type="button"
			variant="outline"
			aria-label="Scroll to bottom"
			data-conversation-scroll-button="true"
			{...restProps}
		>
			{#if children}
				{@render children()}
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
					<path d="M12 5v14" />
					<path d="m19 12-7 7-7-7" />
				</svg>
			{/if}
		</Button>
	</div>
{/if}
