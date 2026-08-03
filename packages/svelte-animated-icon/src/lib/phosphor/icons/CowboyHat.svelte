<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><path d="M40,128c40,64,88,64,88,64s48,0,88-64a32,32,0,0,1,0,64H40a32,32,0,0,1,0-64Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M65.47,160.18,85.54,54.53A8,8,0,0,1,98.4,49.76L123,70.25a8,8,0,0,0,10,0l24.6-20.49a8,8,0,0,1,12.86,4.77l20.07,105.65" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="70.06" y1="136" x2="185.94" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M40,128c40,64,88,64,88,64s48,0,88-64a32,32,0,0,1,0,64H40a32,32,0,0,1,0-64Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M65.47,160.18,85.54,54.53A8,8,0,0,1,98.4,49.76L123,70.25a8,8,0,0,0,10,0l24.6-20.49a8,8,0,0,1,12.86,4.77l20.07,105.65" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="70.06" y1="136" x2="185.94" y2="136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M216,120a8,8,0,0,0-6.78,3.76A179.9,179.9,0,0,1,195.41,143l-1.63-8.57v0L178.32,53.07a16,16,0,0,0-25.72-9.55l-.13.1L128,64,103.53,43.62l-.13-.1a16,16,0,0,0-25.72,9.53L62.23,134.38v0L60.59,143a179.27,179.27,0,0,1-13.81-19.25A8,8,0,0,0,40,120a40,40,0,0,0,0,80H216a40,40,0,0,0,0-80ZM76.68,144H179.31l2.54,13.35a113.28,113.28,0,0,1-27.35,19C139.1,183.77,128.06,184,128,184c-.33,0-25.49-.4-53.86-26.6Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
