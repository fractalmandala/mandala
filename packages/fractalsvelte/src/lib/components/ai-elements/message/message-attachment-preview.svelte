<script lang="ts" module>
	import type { MessageAttachmentData } from './message-context.svelte.js';

	export type MessageAttachmentPreviewProps = {
		data: MessageAttachmentData;
	};
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/dialog/index.js';

	let { data }: MessageAttachmentPreviewProps = $props();

	let ratio = $state(1);
	const src = $derived(data.url ?? '');
	const previewFrameStyle = $derived.by(() => {
		const safeRatio = ratio > 0 ? ratio : 1;
		if (safeRatio >= 1) {
			return `width: min(94vw, 1100px); max-width: min(94vw, 1100px); max-height: min(85vh, 900px); aspect-ratio: ${safeRatio};`;
		}
		return `height: min(85vh, 900px); max-width: min(94vw, 1100px); max-height: min(85vh, 900px); aspect-ratio: ${safeRatio};`;
	});

	function handleImageLoad(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		if (image.naturalWidth > 0 && image.naturalHeight > 0) {
			ratio = image.naturalWidth / image.naturalHeight;
		}
	}
</script>

<Dialog.Root>
	<Dialog.Trigger
		aria-label={`Preview ${data.filename || 'image attachment'}`}
		type="button"
		data-slot="message-attachment-preview-trigger"
	>
		<img
			alt={data.filename || 'attachment'}
			data-slot="message-attachment-preview-thumb"
			height={96}
			onload={handleImageLoad}
			{src}
			width={96}
		/>
	</Dialog.Trigger>

	<!-- Keep dialog-content slot for positioning/chrome; flag for transparent preview shell. -->
	<Dialog.Content showCloseButton={false} data-message-attachment-preview="true">
		<Dialog.Header>
			<div data-slot="message-attachment-preview-sr">
				<Dialog.Title>{data.filename || 'Image attachment'}</Dialog.Title>
				<Dialog.Description>Preview image attachment</Dialog.Description>
			</div>
		</Dialog.Header>

		<div data-slot="message-attachment-preview-body">
			<div data-slot="message-attachment-preview-frame" style={previewFrameStyle}>
				<img
					alt={data.filename || 'attachment preview'}
					data-slot="message-attachment-preview-full"
					onload={handleImageLoad}
					{src}
				/>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
