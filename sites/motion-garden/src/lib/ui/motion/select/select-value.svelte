<script lang="ts">
	import { useSelectContext } from './select.context.js';
	import type { SelectValueProps } from './select.types.js';
	import './select.sass';

	let { placeholder, class: className }: SelectValueProps = $props();

	const ctx = useSelectContext('SelectValue');
	const label = $derived(ctx.labelFor(ctx.value));
</script>

<span data-slot="select-value" data-empty={label ? undefined : 'true'} class={className}>
	{label ?? placeholder ?? 'Select'}
</span>
