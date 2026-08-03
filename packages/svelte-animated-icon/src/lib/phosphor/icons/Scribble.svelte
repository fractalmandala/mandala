<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M88,40,46.63,81.37a22.62,22.62,0,0,0,0,32h0a22.62,22.62,0,0,0,32,0l66.74-66.74a22.62,22.62,0,0,1,32,0h0a22.62,22.62,0,0,1,0,32L78.63,177.37a22.62,22.62,0,0,0,0,32h0a22.62,22.62,0,0,0,32,0l66.74-66.74a22.62,22.62,0,0,1,32,0h0a22.62,22.62,0,0,1,0,32L200,184a22.62,22.62,0,0,0,0,32h0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M88,40,46.63,81.37a22.62,22.62,0,0,0,0,32h0a22.62,22.62,0,0,0,32,0l66.74-66.74a22.62,22.62,0,0,1,32,0h0a22.62,22.62,0,0,1,0,32L78.63,177.37a22.62,22.62,0,0,0,0,32h0a22.62,22.62,0,0,0,32,0l66.74-66.74a22.62,22.62,0,0,1,32,0h0a22.62,22.62,0,0,1,0,32L200,184a22.62,22.62,0,0,0,0,32h0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM193.66,169.66l-8,8a9,9,0,0,0,0,12.68l4,4a8,8,0,0,1-11.32,11.32l-4-4a25,25,0,0,1,0-35.32l8-8a9,9,0,0,0,0-12.68,9,9,0,0,0-12.68,0l-48,48a25,25,0,0,1-35.32-35.32l72-72a9,9,0,0,0,0-12.68,9,9,0,0,0-12.68,0l-48,48A25,25,0,0,1,62.34,86.34l28-28a8,8,0,0,1,11.32,11.32l-28,28a9,9,0,0,0,0,12.68,9,9,0,0,0,12.68,0l48-48a25,25,0,0,1,35.32,35.32l-72,72a9,9,0,0,0,0,12.68,9,9,0,0,0,12.68,0l48-48a25,25,0,0,1,35.32,35.32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
