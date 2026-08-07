<script lang="ts">
	let {
		src,
		alt,
		caption,
		closeLabel = 'Close image'
	}: { src: string; alt: string; caption?: string; closeLabel?: string } = $props();

	let dialog = $state<HTMLDialogElement>();
	let open = $state(false);

	/** A modal dialog gives focus trapping and Escape without any custom key handling. */
	$effect(() => {
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});
</script>

<figure class="docs-image-zoom">
	<button
		type="button"
		class="docs-image-zoom__trigger"
		aria-haspopup="dialog"
		onclick={() => (open = true)}
	>
		<img {src} {alt} />
		<span class="docs-image-zoom__hint" aria-hidden="true">Zoom</span>
	</button>
	{#if caption}
		<figcaption class="docs-image-zoom__caption">{caption}</figcaption>
	{/if}
</figure>

<dialog
	class="docs-image-zoom__dialog"
	bind:this={dialog}
	aria-label={alt}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target === dialog) {
			open = false;
		}
	}}
>
	<button type="button" class="docs-image-zoom__close" onclick={() => (open = false)}>
		{closeLabel}
	</button>
	<img {src} {alt} />
</dialog>
