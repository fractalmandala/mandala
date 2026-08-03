<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M193.89,200.49A79.66,79.66,0,0,1,160,208H72A56,56,0,1,1,85.92,97.74" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M112.63,63.52A80,80,0,0,1,219.68,181.28" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M80,128A79.68,79.68,0,0,1,91.07,87.37" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M193.89,200.49A79.66,79.66,0,0,1,160,208H72A56,56,0,1,1,85.92,97.74" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M112.63,63.52A80,80,0,0,1,219.68,181.28" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M80,128A79.68,79.68,0,0,1,91.07,87.37" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M248,128.72A87.74,87.74,0,0,1,222.41,190a4,4,0,0,1-5.77-.16L103.78,65.67a4,4,0,0,1,.39-5.76A87.82,87.82,0,0,1,160.87,40C209.15,40.47,248.38,80.43,248,128.72ZM53.92,34.62A8,8,0,1,0,42.08,45.38L81.33,88.56l-.06.11A64,64,0,0,0,8,153c.53,35.12,29.84,63,65,63h87a87.65,87.65,0,0,0,31.78-5.95l10.3,11.33a8,8,0,0,0,11.33.52,8.32,8.32,0,0,0,.29-11.52Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
