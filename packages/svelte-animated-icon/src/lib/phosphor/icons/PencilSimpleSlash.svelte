<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="136" y1="64" x2="192" y2="120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M154.67,157.33,98.34,213.66A8,8,0,0,1,92.69,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65l59-59" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M124,76l41.67-41.67a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31l-44.34,44.34" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="136" y1="64" x2="192" y2="120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M154.67,157.33,98.34,213.66A8,8,0,0,1,92.69,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65l59-59" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M124,76l41.67-41.67a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31l-44.34,44.34" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L115.64,73.05a4,4,0,0,0-.14,5.52l58.73,64.6a4,4,0,0,0,5.79.13L227.32,96A16,16,0,0,0,227.32,73.37ZM192,108.69,147.32,64l24-24L216,84.69Zm21.92,101.93a8,8,0,1,1-11.84,10.76L154.4,168.92,104,219.31A15.86,15.86,0,0,1,92.69,224H48a16,16,0,0,1-16-16V163.31A15.89,15.89,0,0,1,36.68,152l53.6-53.6-48-52.82a8.18,8.18,0,0,1-.37-10.75,8,8,0,0,1,12-.21Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
