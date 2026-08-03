<script lang="ts">
	import Button from './button.svelte';

	let {
		strength = 0.25,
		children,
		onclick,
		disabled = false,
		...restProps
	}: {
		strength?: number;
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		pressScale?: number;
		ripple?: boolean;
		children?: import('svelte').Snippet;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		[x: string]: unknown;
	} = $props();

	let offsetX = $state(0);
	let offsetY = $state(0);

	function handleMouseMove(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		offsetX = x * strength;
		offsetY = y * strength;
	}

	function handleMouseLeave() {
		offsetX = 0;
		offsetY = 0;
	}
</script>

<span
	role="presentation"
	style="display: inline-flex; transform: translate({offsetX}px, {offsetY}px); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	<Button {...restProps} {onclick} {disabled}>
		{@render children?.()}
	</Button>
</span>
