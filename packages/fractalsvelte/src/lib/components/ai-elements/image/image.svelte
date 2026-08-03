<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLImgAttributes } from 'svelte/elements';

	/** Shape produced by AI SDK experimental image generation helpers. */
	export type Experimental_GeneratedImage = {
		/** Raw base64 payload, or a full `data:` URI. */
		base64: string;
		/** Optional binary form (not rendered; kept for API parity). */
		uint8Array?: Uint8Array;
		/** MIME type used when `base64` is bare (no data: prefix). Default `image/png`. */
		mediaType?: string;
	};

	export type ImageProps = WithElementRef<HTMLImgAttributes, HTMLImageElement> &
		Experimental_GeneratedImage;
</script>

<script lang="ts">
	let {
		base64,
		uint8Array: _uint8Array,
		mediaType = 'image/png',
		alt = 'Generated image',
		ref = $bindable(null),
		...restProps
	}: ImageProps = $props();

	const src = $derived(
		base64.startsWith('data:') ? base64 : `data:${mediaType};base64,${base64}`
	);
</script>

<img
	bind:this={ref}
	{alt}
	{src}
	data-slot="ai-image"
	{...restProps}
/>
