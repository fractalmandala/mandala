<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="128" y1="128" x2="224" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M195.88,60.12a95.88,95.88,0,1,0,18.77,26.49" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M161.94,94.06a48,48,0,1,0,14,31.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="128" y1="128" x2="224" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M195.88,60.12a95.88,95.88,0,1,0,18.77,26.49" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M161.94,94.06a48,48,0,1,0,14,31.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M211.2,79.39a8,8,0,0,0-3.77,10.67A88.09,88.09,0,1,1,184.3,60.39L161.53,83.16A56,56,0,0,0,88.4,167.59h0a56,56,0,0,0,95.5-42.79,8,8,0,1,0-16,.9,40,40,0,0,1-62,35.67l23.95-23.95L167.6,99.72h0l62.06-62a8,8,0,0,0-11.32-11.32L195.67,49A104,104,0,0,0,54.46,201.54,104,104,0,0,0,221.87,83.16,8,8,0,0,0,211.2,79.39Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
