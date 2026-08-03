<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><polygon points="127.2 24 112 88 168 113.14 72.8 216 88 152 32 126.86 127.2 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="232 216 196 144 160 216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="220" y1="192" x2="172" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><polygon points="127.2 24 112 88 168 113.14 72.8 216 88 152 32 126.86 127.2 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><polyline points="232 216 196 144 160 216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="220" y1="192" x2="172" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M173.87,118.58,78.67,221.43A8,8,0,0,1,65,214.15l13.67-57.56-50-22.44a8,8,0,0,1-2.59-12.73l95.2-102.85A8,8,0,0,1,135,25.85L121.31,83.41l50,22.43a8,8,0,0,1,2.59,12.74Zm61.71,104.57A7.91,7.91,0,0,1,232,224a8,8,0,0,1-7.16-4.42L215.05,200H176.94l-9.79,19.58a8,8,0,0,1-14.31-7.16l36-72a8,8,0,0,1,14.31,0l36,72A8,8,0,0,1,235.58,223.15ZM207.05,184,196,161.89,184.94,184Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
