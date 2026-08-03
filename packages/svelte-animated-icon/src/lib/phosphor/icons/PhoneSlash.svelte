<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M120.51,72.19c38.15-2,77,11.23,105.43,39.64,17.29,17.29,18.63,42.29,4,61.12a8,8,0,0,1-9.26,2.47l-9.37-3.32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M114.45,113.09a83.51,83.51,0,0,0-14.18,3.6,7.93,7.93,0,0,0-5.12,6l-5.9,29.51A8,8,0,0,1,84.38,158L35.29,175.42A8,8,0,0,1,26,173c-14.6-18.83-13.26-43.83,4-61.12A135.14,135.14,0,0,1,83.53,79.08" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M120.51,72.19c38.15-2,77,11.23,105.43,39.64,17.29,17.29,18.63,42.29,4,61.12a8,8,0,0,1-9.26,2.47l-9.37-3.32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M114.45,113.09a83.51,83.51,0,0,0-14.18,3.6,7.93,7.93,0,0,0-5.12,6l-5.9,29.51A8,8,0,0,1,84.38,158L35.29,175.42A8,8,0,0,1,26,173c-14.6-18.83-13.26-43.83,4-61.12A135.14,135.14,0,0,1,83.53,79.08" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M236.28,177.85a16,16,0,0,1-18.38,5.07l-24.76-19a3.43,3.43,0,0,1-.53-.48L109.18,71.62a4,4,0,0,1,2.55-6.68c43-4.62,87.74,9.12,119.86,41.24h0C251.58,126.17,253.51,155.64,236.28,177.85ZM53.93,34.62A8,8,0,1,0,42.09,45.38L69.71,75.77a142,142,0,0,0-45.3,30.41c-20,20-21.92,49.46-4.69,71.67a16,16,0,0,0,18.38,5.07l49-17.37.29-.11a16,16,0,0,0,9.75-11.72l5.9-29.51a73.64,73.64,0,0,1,8.57-2.39l90.5,99.56a8,8,0,1,0,11.84-10.76Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
