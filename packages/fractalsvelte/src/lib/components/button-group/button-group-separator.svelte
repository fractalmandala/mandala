<script lang="ts" module>
	import type { SeparatorProps } from '$lib/components/separator/index.js';
	import { Separator } from '$lib/components/separator/index.js';

	export type ButtonGroupSeparatorProps = SeparatorProps;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		orientation = 'vertical',
		...restProps
	}: ButtonGroupSeparatorProps = $props();
</script>

<Separator bind:ref data-slot="button-group-separator" {orientation} {...restProps} />
