<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><polyline points="24 72 76 200 128 72 180 200 232 72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="16" y1="136" x2="240" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="16" y1="136" x2="240" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="24 72 76 200 128 72 180 200 232 72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm72,120H181.42l-14,35a8,8,0,0,1-14.86,0L128,117.54,103.43,179a8,8,0,0,1-14.86,0l-14-35H56a8,8,0,0,1,0-16H68.18L56.57,99A8,8,0,1,1,71.43,93L96,154.46,120.57,93a8,8,0,0,1,14.86,0L160,154.46,184.57,93A8,8,0,1,1,199.43,99l-11.61,29H200a8,8,0,0,1,0,16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
