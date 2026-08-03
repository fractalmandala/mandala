<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M240,343.31V424a32.28,32.28,0,0,1-21.88,30.65l-21.47,7.23c-25.9,8.71-52.65-10.75-52.65-38.32h0A34.29,34.29,0,0,1,167.25,391l50.87-17.12A32.29,32.29,0,0,0,240,343.24V92a16.13,16.13,0,0,1,12.06-15.66L360.49,48.2A6,6,0,0,1,368,54v57.76a16.13,16.13,0,0,1-12.12,15.67l-91.64,23.13A32.25,32.25,0,0,0,240,181.91V221.3" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M183.83,480a55.2,55.2,0,0,1-32.36-10.55A56.64,56.64,0,0,1,128,423.58a50.26,50.26,0,0,1,34.14-47.73L213,358.73a16.25,16.25,0,0,0,11-15.49V92a32.1,32.1,0,0,1,24.09-31.15L356.48,32.71A22,22,0,0,1,384,54v57.75a32.09,32.09,0,0,1-24.2,31.19l-91.65,23.13A16.24,16.24,0,0,0,256,181.91V424a48.22,48.22,0,0,1-32.78,45.81l-21.47,7.23A56,56,0,0,1,183.83,480Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
