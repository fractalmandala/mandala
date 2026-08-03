<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M32,96V56a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V200a8,8,0,0,1-8,8H144" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,192a16,16,0,0,1,16,16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,160a48,48,0,0,1,48,48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M32,128a80,80,0,0,1,80,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M32,96V56a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V200a8,8,0,0,1-8,8H144" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M32,192a16,16,0,0,1,16,16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M32,160a48,48,0,0,1,48,48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M32,128a80,80,0,0,1,80,80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M56,208a8,8,0,0,1-8.24,8A8.28,8.28,0,0,1,40,207.76,8,8,0,0,0,32.24,200,8.28,8.28,0,0,1,24,192.24,8,8,0,0,1,32,184,24,24,0,0,1,56,208ZM32,152a8,8,0,0,0-8,8.65A8.17,8.17,0,0,0,32.24,168,40,40,0,0,1,72,207.76,8.17,8.17,0,0,0,79.36,216,8,8,0,0,0,88,208,56.06,56.06,0,0,0,32,152Zm0-32a8,8,0,0,0-8,8.6,8.22,8.22,0,0,0,8.3,7.4A72.08,72.08,0,0,1,104,207.68a8.22,8.22,0,0,0,7.4,8.3,8,8,0,0,0,8.6-8A88.1,88.1,0,0,0,32,120ZM216,40H40A16,16,0,0,0,24,56v44.08a4,4,0,0,0,4.15,4A104.11,104.11,0,0,1,135.93,211.85a4,4,0,0,0,4,4.15H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
