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

	const emblaCtx = getEmblaContext('<Carousel.Previous/>');
</script>

<!-- Keep data-slot="button" for full button skin; data-carousel-nav drives positioning. -->
<Button
	bind:ref
	data-slot="button"
	data-carousel-nav="previous"
	data-orientation={emblaCtx.orientation}
	{variant}
	{size}
	aria-disabled={!emblaCtx.canScrollPrev}
	disabled={!emblaCtx.canScrollPrev}
	onclick={emblaCtx.scrollPrev}
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
			<path d="m15 18-6-6 6-6" />
		</svg>
		<span data-slot="carousel-nav-label">Previous slide</span>
	{/if}
</Button>
