<script lang="ts" module>
	import type { PromptInputAttachment } from './types.js';

	export type PromptInputAttachmentImagePreviewProps = {
		data: PromptInputAttachment;
	};
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/dialog/index.js';
	import { getAttachmentsContext } from './attachments.svelte.js';

	let { data }: PromptInputAttachmentImagePreviewProps = $props();

	const attachmentsContext = getAttachmentsContext();
	let open = $state(false);
	let currentImageId = $state('');

	$effect.pre(() => {
		if (!currentImageId) currentImageId = data.id;
	});

	const getDisplayUrl = (attachment: PromptInputAttachment) =>
		attachment.previewUrl ?? attachment.remoteUrl;

	const imageFiles = $derived(
		attachmentsContext.attachments.filter(
			(file) => file.mediaType?.startsWith('image/') && getDisplayUrl(file)
		)
	);

	const currentIndex = $derived(
		Math.max(
			0,
			imageFiles.findIndex((file) => file.id === currentImageId)
		)
	);

	const currentImage = $derived(imageFiles[currentIndex] ?? data);

	function syncCurrentImage(id: string) {
		currentImageId = id;
	}

	function showPreviousImage() {
		if (imageFiles.length <= 1) return;
		const nextIndex = (currentIndex - 1 + imageFiles.length) % imageFiles.length;
		syncCurrentImage(imageFiles[nextIndex].id);
	}

	function showNextImage() {
		if (imageFiles.length <= 1) return;
		const nextIndex = (currentIndex + 1) % imageFiles.length;
		syncCurrentImage(imageFiles[nextIndex].id);
	}

	function handleDialogKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			showPreviousImage();
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			showNextImage();
		}
	}

	$effect(() => {
		if (!open) {
			currentImageId = data.id;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		aria-label={`Preview ${data.filename || 'image attachment'}`}
		data-slot="prompt-input-attachment-preview-trigger"
		onclick={() => syncCurrentImage(data.id)}
		type="button"
	>
		<img
			alt={data.filename || 'attachment'}
			data-slot="prompt-input-attachment-preview-thumb"
			height={64}
			src={getDisplayUrl(data)}
			width={64}
		/>
	</Dialog.Trigger>

	<Dialog.Content
		data-slot="dialog-content"
		data-prompt-input-attachment-preview="true"
		onkeydown={handleDialogKeydown}
	>
		<div data-slot="prompt-input-attachment-preview-body">
			<div data-slot="prompt-input-attachment-preview-frame">
				<img
					alt={currentImage.filename || 'attachment preview'}
					data-slot="prompt-input-attachment-preview-full"
					src={getDisplayUrl(currentImage)}
				/>
			</div>
			{#if imageFiles.length > 1}
				<p data-slot="prompt-input-attachment-preview-index">
					{currentIndex + 1} / {imageFiles.length}
				</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
