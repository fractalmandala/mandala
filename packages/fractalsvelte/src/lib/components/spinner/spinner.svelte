<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";

	// Exception to "icons are children": Spinner IS an icon. The source delegates to whichever
	// icon library the project configured; we have no icon dependency, so the artwork ships
	// inline. `size` accepts any CSS length.
	let {
		ref = $bindable(null),
		size,
		role = "status",
		"aria-label": ariaLabel = "Loading",
		...restProps
	}: SVGAttributes<SVGSVGElement> & {
		ref?: SVGSVGElement | null;
		size?: string;
	} = $props();
</script>

<svg
	bind:this={ref}
	data-slot="spinner"
	{role}
	aria-label={ariaLabel}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	style={size ? `width:${size};height:${size}` : undefined}
	{...restProps}
>
	<path d="M21 12a9 9 0 1 1-6.219-8.56" />
</svg>
