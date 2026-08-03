<script lang="ts">
	import { Button, type ButtonProps } from '../button/index.js';
	import { getEmblaContext } from './context.js';

	let {
		ref = $bindable(null),
		variant = 'outline',
		size = 'icon-sm',
		children,
		...restProps
	}: ButtonProps = $props();

	const emblaCtx = getEmblaContext('<Carousel.Next/>');
</script>

<Button
	bind:ref
	data-slot="button"
	data-carousel-nav="next"
	data-orientation={emblaCtx.orientation}
	{variant}
	{size}
	aria-disabled={!emblaCtx.canScrollNext}
	disabled={!emblaCtx.canScrollNext}
	onclick={emblaCtx.scrollNext}
	onkeydown={emblaCtx.handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
		<span data-slot="carousel-nav-label">Next slide</span>
	{/if}
</Button>
