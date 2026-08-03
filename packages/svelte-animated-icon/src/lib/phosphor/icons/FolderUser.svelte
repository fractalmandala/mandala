<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="192" cy="176" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M160,224c3.67-13.8,16.6-24,32-24s28.33,10.2,32,24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,80V56a8,8,0,0,1,8-8H92.69a8,8,0,0,1,5.65,2.34L128,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M120.56,208H39.38A7.4,7.4,0,0,1,32,200.62V80H216a8,8,0,0,1,8,8v32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M160,224c3.67-13.8,16.6-24,32-24s28.33,10.2,32,24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><circle cx="192" cy="176" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M32,80V56a8,8,0,0,1,8-8H92.69a8,8,0,0,1,5.65,2.34L128,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M120.56,208H39.38A7.4,7.4,0,0,1,32,200.62V80H216a8,8,0,0,1,8,8v32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M231.73,221.94A8,8,0,0,1,224,232H160A8,8,0,0,1,152.27,222a40,40,0,0,1,17.11-23.33,32,32,0,1,1,45.24,0A40,40,0,0,1,231.73,221.94ZM232,88v32a8,8,0,0,1-16,0V88H40V200h80.56a8,8,0,0,1,0,16H39.38A15.4,15.4,0,0,1,24,200.62V56A16,16,0,0,1,40,40H92.69A15.86,15.86,0,0,1,104,44.69L131.31,72H216A16,16,0,0,1,232,88ZM108.69,72l-16-16H40V72Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
