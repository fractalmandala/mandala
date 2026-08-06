<script lang="ts" module>
	// Types live in the module block so consumers can import them for their own wrappers.
	import type { Radius } from '$lib/types.js';
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	// One type per tv() variant axis. Literal unions, not string.
	export type NameVariant = 'default' | 'outline';
	export type NameSize = 'default' | 'sm' | 'lg';

	export type NameProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Visual style. Rendered as data-variant. */
		variant?: NameVariant;
		/** Height, padding and gap. Rendered as data-size. */
		size?: NameSize;
		/** Corner radius. Omit to keep the component's own radius. */
		radius?: Radius;
	};
</script>

<script lang="ts">
	let {
		// Required axes get defaults.
		variant = 'default',
		size = 'default',
		// Override props do NOT — undefined means "no data attribute", so the base rule wins.
		radius,
		ref = $bindable(null),
		children,
		...restProps
	}: NameProps = $props();
</script>

<!--
	data-slot is the styling hook — no class attribute.
	restProps goes last so consumers can override anything.
-->
<div
	bind:this={ref}
	data-slot="name"
	data-variant={variant}
	data-size={size}
	data-radius={radius}
	{...restProps}
>
	{@render children?.()}
</div>
