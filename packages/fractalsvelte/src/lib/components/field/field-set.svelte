<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';

	export type FieldSetProps = WithElementRef<HTMLFieldsetAttributes, HTMLFieldSetElement>;
</script>

<script lang="ts">
	let { ref = $bindable(null), children, ...restProps }: FieldSetProps = $props();
</script>

<fieldset bind:this={ref} data-slot="field-set" {...restProps}>
	{@render children?.()}
</fieldset>
