<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/button/index.js';

	/** Ghost icon action; keeps full Button skin via data-slot=button. */
	export type QueueItemActionProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size'> & {
		variant?: ComponentProps<typeof Button>['variant'];
		size?: ComponentProps<typeof Button>['size'];
	};
</script>

<script lang="ts">
	let {
		variant = 'ghost',
		size = 'icon',
		children,
		ref = $bindable(null),
		...restProps
	}: QueueItemActionProps = $props();
</script>

<!-- Keep data-slot=button so button.sass applies; chrome via data-queue-item-action. -->
<Button
	bind:ref
	{variant}
	{size}
	type="button"
	data-queue-item-action="true"
	{...restProps}
>
	{@render children?.()}
</Button>
