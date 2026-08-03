<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M229.73,45.88,37.53,327.79a31.79,31.79,0,0,0,11.31,46L241,476.26a31.77,31.77,0,0,0,29.92,0l192.2-102.51a31.79,31.79,0,0,0,11.31-46L282.27,45.88A31.8,31.8,0,0,0,229.73,45.88Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><line x1="256" y1="32" x2="256" y2="480" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></g>`,
		filled: `<g fill="currentColor"><path d="M487.83,319.44,295.63,36.88a48,48,0,0,0-79.26,0L24.17,319.44A47.1,47.1,0,0,0,41.1,387.57L233.3,490.32a48.05,48.05,0,0,0,45.4,0L470.9,387.57a47.1,47.1,0,0,0,16.93-68.13Zm-431.26,41a16.12,16.12,0,0,1-8-10.38,16.8,16.8,0,0,1,2.37-13.62L232.66,69.26c2.18-3.21,7.34-1.72,7.34,2.13v374c0,5.9-6.54,9.63-11.87,6.78Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
