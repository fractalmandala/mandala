<script lang="ts" module>
	import { Accordion as AccordionPrimitive } from 'bits-ui';

	export type AccordionItemProps = AccordionPrimitive.ItemProps & {
		/** Extra inset padding around the item. */
		inset?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children,
		...restProps
	}: AccordionItemProps = $props();
</script>

<AccordionPrimitive.Item
	bind:ref
	data-slot="accordion-item"
	data-inset={inset || undefined}
	{...restProps}
>
	{@render children?.()}
</AccordionPrimitive.Item>
