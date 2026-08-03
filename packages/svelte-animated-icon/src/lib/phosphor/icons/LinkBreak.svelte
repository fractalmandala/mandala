<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M192,120l12.28-11.72a40,40,0,0,0-56.56-56.56L136,64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M64,136,51.72,147.72a40,40,0,0,0,56.56,56.56L120,192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="192" y1="160" x2="216" y2="160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="40" y1="96" x2="64" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="160" y1="192" x2="160" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="96" y1="40" x2="96" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M192,120l12.28-11.72a40,40,0,0,0-56.56-56.56L136,64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M64,136,51.72,147.72a40,40,0,0,0,56.56,56.56L120,192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="192" y1="160" x2="216" y2="160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="40" y1="96" x2="64" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="160" y1="192" x2="160" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="96" y1="40" x2="96" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM96,64a8,8,0,0,1,16,0V80a8,8,0,0,1-16,0ZM64,96H80a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16Zm64.08,85.66-7.21,7.21a38,38,0,1,1-53.74-53.74l7.21-7.21a8,8,0,1,1,11.32,11.31l-7.22,7.21a22,22,0,0,0,31.12,31.12l7.21-7.22a8,8,0,1,1,11.31,11.32ZM160,192a8,8,0,0,1-16,0V176a8,8,0,0,1,16,0Zm32-32H176a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm-3.13-39.13-7.21,7.21a8,8,0,1,1-11.32-11.31l7.22-7.21a22,22,0,0,0-31.12-31.12l-7.21,7.22a8,8,0,1,1-11.31-11.32l7.21-7.21a38,38,0,1,1,53.74,53.74Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
