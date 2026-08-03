<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M147.93,34.08a192.17,192.17,0,0,1-27.12,189.65" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32.27,135.19a192.17,192.17,0,0,1,189.65-27.12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M79.25,45.27a191.14,191.14,0,0,1,82.69,48.79,191.14,191.14,0,0,1,48.79,82.69" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M147.93,34.08a192.17,192.17,0,0,1-27.12,189.65" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M32.27,135.19a192.17,192.17,0,0,1,189.65-27.12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M79.25,45.27a191.14,191.14,0,0,1,82.69,48.79,191.14,191.14,0,0,1,48.79,82.69" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm83.44,76A195.88,195.88,0,0,0,165,91,195.88,195.88,0,0,0,156,44.56,88.43,88.43,0,0,1,211.44,100ZM85,51.24a188.27,188.27,0,0,1,67.3,39.21A196.29,196.29,0,0,0,40.08,124.51,88.07,88.07,0,0,1,85,51.24Zm46.48,164.68a196.29,196.29,0,0,0,34.06-112.23A188.27,188.27,0,0,1,204.76,171,88.07,88.07,0,0,1,131.49,215.92Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
