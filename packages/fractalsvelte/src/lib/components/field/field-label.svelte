<script lang="ts" module>
	import { Label, type LabelProps } from '$lib/components/label/index.js';

	export type FieldLabelWeight = 'medium' | 'normal';

	export type FieldLabelProps = LabelProps & {
		/** Label weight. Use normal for checkbox/radio option labels. */
		weight?: FieldLabelWeight;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		weight = 'medium',
		children,
		...restProps
	}: FieldLabelProps = $props();
</script>

<Label bind:ref data-slot="field-label" data-weight={weight} {...restProps}>
	{@render children?.()}
</Label>
