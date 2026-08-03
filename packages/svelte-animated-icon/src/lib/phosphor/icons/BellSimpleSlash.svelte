<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="224" x2="160" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M186.18,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104A71.65,71.65,0,0,1,68.85,62.94" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M92.48,41.36A72,72,0,0,1,200,104c0,29.1,5.48,53.56,11.07,67.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="96" y1="224" x2="160" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M186.18,192H48a8,8,0,0,1-6.88-12C47.71,168.6,56,139.81,56,104A71.65,71.65,0,0,1,68.85,62.94" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M92.48,41.36A72,72,0,0,1,200,104c0,29.1,5.48,53.56,11.07,67.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M221.84,192v0a1.85,1.85,0,0,1-3,.28L83.27,43.19a4,4,0,0,1,.8-6A79.55,79.55,0,0,1,129.17,24C173,24.66,207.8,61.1,208,104.92c.14,34.88,8.31,61.54,13.82,71A15.89,15.89,0,0,1,221.84,192ZM160,216H96.22A8.19,8.19,0,0,0,88,223.47,8,8,0,0,0,96,232h63.74a8.19,8.19,0,0,0,8.26-7.47A8,8,0,0,0,160,216ZM53.84,34.62A8,8,0,1,0,42,45.38L58.79,63.85A79.42,79.42,0,0,0,47.93,104c0,35.09-8.15,62-13.7,71.73a16.42,16.42,0,0,0,.09,16.68A15.78,15.78,0,0,0,47.91,200H182.62l19.45,21.38a8,8,0,0,0,11.85-10.76Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
