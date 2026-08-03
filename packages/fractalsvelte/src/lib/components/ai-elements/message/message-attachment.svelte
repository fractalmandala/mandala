<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MessageAttachmentData } from './message-context.svelte.js';

	export type MessageAttachmentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		data: MessageAttachmentData;
		onRemove?: () => void;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Tooltip from '$lib/components/tooltip/index.js';
	import MessageAttachmentPreview from './message-attachment-preview.svelte';

	let {
		data,
		onRemove,
		ref = $bindable(null),
		...restProps
	}: MessageAttachmentProps = $props();

	const filename = $derived(data.filename || '');
	const isImage = $derived(!!data.url && !!data.mediaType?.startsWith('image/'));
	const attachmentLabel = $derived(filename || (isImage ? 'Image' : 'Attachment'));

	function handleRemove(event: MouseEvent) {
		event.stopPropagation();
		onRemove?.();
	}
</script>

{#snippet removeButton()}
	<Button
		aria-label="Remove attachment"
		onclick={handleRemove}
		type="button"
		variant="ghost"
		size="icon-sm"
		data-attachment-remove="true"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
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
		<span data-slot="message-action-label">Remove</span>
	</Button>
{/snippet}

<div bind:this={ref} data-slot="message-attachment" {...restProps}>
	{#if isImage}
		<MessageAttachmentPreview {data} />
		{#if onRemove}
			{@render removeButton()}
		{/if}
	{:else}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						{@const cleaned = (() => {
							const { 'data-slot': _s, ...rest } = (props ?? {}) as Record<string, unknown>;
							return rest;
						})()}
						<div {...cleaned} data-slot="message-attachment-file">
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
								<path
									d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
								/>
							</svg>
						</div>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{attachmentLabel}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
		{#if onRemove}
			{@render removeButton()}
		{/if}
	{/if}
</div>
