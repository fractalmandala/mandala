<script lang="ts">
	import { useMorphSelectContext } from './select-morph-context.js';
	import type { MorphSelectValueProps } from './select-morph.types.js';
	import './select-morph.sass';

	let { placeholder, class: className }: MorphSelectValueProps = $props();

	const ctx = useMorphSelectContext('MorphSelectValue');

	// Surface the placeholder so the morph header (rendered by content)
	// matches the trigger.
	$effect(() => {
		if (placeholder) ctx.setPlaceholder(placeholder);
	});

	const label = $derived(ctx.labelFor(ctx.value));
</script>

<span
	data-slot="select-morph-value"
	data-empty={label ? undefined : 'true'}
	class={className}
>
	{label ?? placeholder ?? 'Select'}
</span>
