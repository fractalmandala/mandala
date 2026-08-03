<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MessageRole } from './message-context.svelte.js';

	export type MessageProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Sender role — drives alignment and bubble chrome. */
		from: MessageRole;
	};
</script>

<script lang="ts">
	let {
		from,
		children,
		ref = $bindable(null),
		...restProps
	}: MessageProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="message"
	data-role={from}
	{...restProps}
>
	{@render children?.()}
</div>
