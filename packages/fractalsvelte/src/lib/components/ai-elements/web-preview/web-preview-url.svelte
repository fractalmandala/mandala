<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type WebPreviewUrlProps = WithElementRef<HTMLInputAttributes>;
</script>

<script lang="ts">
	import { getWebPreviewContext } from "./web-preview-context.svelte.js";

	let {
		value = $bindable(""),
		onchange,
		onkeydown,
		ref = $bindable(null),
		...restProps
	}: WebPreviewUrlProps = $props();

	let context = getWebPreviewContext();

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.key === "Enter") {
			let target = event.target as HTMLInputElement;
			context.setUrl(target.value);
			if (value !== undefined) {
				value = target.value;
			}
		}
		onkeydown?.(event);
	}

	function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		let target = event.target as HTMLInputElement;
		if (value !== undefined) {
			value = target.value;
		}
		onchange?.(event);
	}

	let displayValue = $derived(value ?? context.url);
</script>

<input
	bind:this={ref}
	data-slot="web-preview-url"
	onchange={handleChange}
	onkeydown={handleKeyDown}
	placeholder="Enter URL..."
	value={displayValue}
	{...restProps}
/>
