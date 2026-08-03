<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PromptInputAttachment as PromptInputAttachmentData } from './types.js';

	export type PromptInputAttachmentProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		data: PromptInputAttachmentData;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Tooltip from '$lib/components/tooltip/index.js';
	import { getAttachmentsContext } from './attachments.svelte.js';
	import PromptInputAttachmentImagePreview from './prompt-input-attachment-image-preview.svelte';

	let {
		data,
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputAttachmentProps = $props();

	const attachmentsContext = getAttachmentsContext();
	const displayUrl = $derived(data.previewUrl ?? data.remoteUrl);
	const mediaType = $derived(
		data.mediaType?.startsWith('image/') && displayUrl ? 'image' : 'file'
	);
	const label = $derived(data.filename || (mediaType === 'image' ? 'Image' : 'File'));
</script>

<div
	bind:this={ref}
	data-slot="prompt-input-attachment"
	data-media={mediaType}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else if mediaType === 'image'}
		<PromptInputAttachmentImagePreview {data} />
	{:else}
		<div data-slot="prompt-input-attachment-file">
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
				<path
					d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
				/>
			</svg>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<span data-slot="prompt-input-attachment-name">{label}</span>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{label}{data.mediaType ? ` · ${data.mediaType}` : ''}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	{/if}

	{#if !children}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						{@const cleaned = (() => {
							const { 'data-slot': _s, ...rest } = (props ?? {}) as Record<string, unknown>;
							return rest;
						})()}
						<Button
							aria-label={mediaType === 'image' ? 'Remove image' : 'Remove file'}
							data-prompt-input-attachment-remove="true"
							onclick={(event) => {
								event.stopPropagation();
								attachmentsContext.remove(data.id);
							}}
							size="icon-sm"
							type="button"
							variant="secondary"
							{...cleaned}
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
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{mediaType === 'image' ? 'Remove image' : 'Remove file'}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/if}
</div>
