<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><polyline points="68 96 92 160 116 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M144,136h20a20,20,0,0,0,0-40H144v64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="184" y1="160" x2="169.8" y2="135.15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><polyline points="68 96 92 160 116 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M144,136h20a20,20,0,0,0,0-40H144v64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="184" y1="160" x2="169.8" y2="135.15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M176,48H80a80,80,0,0,0,0,160h96a80,80,0,0,0,0-160ZM123.49,98.81l-24,64a8,8,0,0,1-15,0l-24-64a8,8,0,1,1,15-5.62l16.51,44,16.51-44a8,8,0,1,1,15,5.62ZM191,156a8,8,0,0,1-13.9,7.94l-11.44-20c-.53,0-1.07.05-1.61.05H152v16a8,8,0,0,1-16,0V96a8,8,0,0,1,8-8h20a28,28,0,0,1,16.84,50.35ZM176,116a12,12,0,0,1-12,12H152V104h12A12,12,0,0,1,176,116Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
