<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M205.14,165.28A80.3,80.3,0,0,0,208,144c0-72-80-128-80-128A242.3,242.3,0,0,0,95.54,44.72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M74.9,69.59C60.11,90.4,48,116,48,144a80,80,0,0,0,141.29,51.42" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M205.14,165.28A80.3,80.3,0,0,0,208,144c0-72-80-128-80-128A242.3,242.3,0,0,0,95.54,44.72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M74.9,69.59C60.11,90.4,48,116,48,144a80,80,0,0,0,141.29,51.42" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M213.92,210.62a8,8,0,1,1-11.84,10.76l-12.9-14.19A87.71,87.71,0,0,1,128,232c-48,0-87.49-38.93-88-86.88-.27-24.34,8.22-49.84,24.73-74.81L42.3,45.63a8.23,8.23,0,0,1,.14-11.38,8,8,0,0,1,11.48.37Zm-10.07-34.86a4,4,0,0,0,6.7-1.27A87.66,87.66,0,0,0,216,144c0-31.4-14.51-64.68-42-96.25a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A251.26,251.26,0,0,0,87.17,42a4,4,0,0,0,0,5.41Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
