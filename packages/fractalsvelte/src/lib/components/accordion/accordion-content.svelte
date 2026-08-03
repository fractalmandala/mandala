<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Accordion as AccordionPrimitive } from 'bits-ui';

	export type AccordionContentTone = 'default' | 'muted';

	export type AccordionContentProps = WithoutChild<AccordionPrimitive.ContentProps> & {
		tone?: AccordionContentTone;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		tone = 'default',
		children,
		...restProps
	}: AccordionContentProps = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	data-tone={tone}
	{...restProps}
>
	<div data-slot="accordion-content-inner">
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
