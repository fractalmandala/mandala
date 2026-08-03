<script lang="ts" module>
	import { Separator } from '$lib/components/separator/index.js';
	import type { SeparatorProps } from '$lib/components/separator/index.js';

	export type SelectSeparatorProps = SeparatorProps;
</script>

<script lang="ts">
	let { ref = $bindable(null), ...restProps }: SelectSeparatorProps = $props();
</script>

<Separator bind:ref data-slot="select-separator" {...restProps} />
