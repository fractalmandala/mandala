<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { PromptInputAttachment as PromptInputAttachmentData } from './types.js';

	export type PromptInputAttachmentsProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Per-attachment snippet. When omitted, renders default Attachment tiles. */
		children?: Snippet<[PromptInputAttachmentData]>;
	};
</script>

<script lang="ts">
	import { watch } from 'runed';
	import { getAttachmentsContext } from './attachments.svelte.js';
	import PromptInputAttachment from './prompt-input-attachment.svelte';

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputAttachmentsProps = $props();

	const attachmentsContext = getAttachmentsContext();
	let height = $state(0);
	let contentRef = $state<HTMLDivElement | null>(null);

	const nonImageFiles = $derived(
		attachmentsContext.attachments.filter(
			(f) => !(f.mediaType?.startsWith('image/') && (f.previewUrl ?? f.remoteUrl))
		)
	);

	const imageFiles = $derived(
		attachmentsContext.attachments.filter(
			(f) => f.mediaType?.startsWith('image/') && (f.previewUrl ?? f.remoteUrl)
		)
	);

	watch(
		() => contentRef,
		(el) => {
			if (!el) return;
			const ro = new ResizeObserver(() => {
				height = el.getBoundingClientRect().height;
			});
			ro.observe(el);
			height = el.getBoundingClientRect().height;
			return () => ro.disconnect();
		}
	);

	const computedHeight = $derived(attachmentsContext.attachments.length ? height : 0);
</script>

<div
	bind:this={ref}
	aria-live="polite"
	data-slot="prompt-input-attachments"
	style:height="{computedHeight}px"
	{...restProps}
>
	<div data-slot="prompt-input-attachments-inner" bind:this={contentRef}>
		{#if nonImageFiles.length > 0}
			<div data-slot="prompt-input-attachments-row">
				{#each nonImageFiles as file (file.id)}
					{#if children}
						{@render children(file)}
					{:else}
						<PromptInputAttachment data={file} />
					{/if}
				{/each}
			</div>
		{/if}

		{#if imageFiles.length > 0}
			<div data-slot="prompt-input-attachments-row">
				{#each imageFiles as file (file.id)}
					{#if children}
						{@render children(file)}
					{:else}
						<PromptInputAttachment data={file} />
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
