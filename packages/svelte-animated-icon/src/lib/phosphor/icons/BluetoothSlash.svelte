<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="64" y1="176" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="56" y1="40" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="128 71.63 128 32 192 80 158.47 105.15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="184.65 181.51 128 224 128 128 153.14 146.86" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="64" y1="176" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="56" y1="40" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="128 71.63 128 32 192 80 158.47 105.15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="184.65 181.51 128 224 128 128 153.14 146.86" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M221.38,221.92a8,8,0,0,1-11.3-.54l-26.45-29.1L132.8,230.4a8,8,0,0,1-8.89.47,8.29,8.29,0,0,1-3.91-7.18V144L68.8,182.4a8,8,0,0,1-11.16-1.55,8.26,8.26,0,0,1,1.81-11.43l61.47-46.11L50.08,45.38A8,8,0,0,1,61.92,34.62l160,176A8,8,0,0,1,221.38,221.92ZM155,113.22a4,4,0,0,0,5.36.51L196.8,86.4a8,8,0,0,0,0-12.8l-64-48a8,8,0,0,0-10,.29A8.25,8.25,0,0,0,120,32.24V73.18a4,4,0,0,0,1,2.69Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
