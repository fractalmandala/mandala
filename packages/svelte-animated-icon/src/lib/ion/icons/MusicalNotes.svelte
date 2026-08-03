<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M192,218v-6c0-14.84,10-27,24.24-30.59l174.59-46.68A20,20,0,0,1,416,154V176" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M416,295.94v80c0,13.91-8.93,25.59-22,30l-22,8c-25.9,8.72-52-10.42-52-38h0a33.37,33.37,0,0,1,23-32l51-18.15c13.07-4.4,22-15.94,22-29.85V58a10,10,0,0,0-12.6-9.61L204,102a16.48,16.48,0,0,0-12,16v226c0,13.91-8.93,25.6-22,30l-52,18c-13.88,4.68-22,17.22-22,32h0c0,27.58,26.52,46.55,52,38l22-8c13.07-4.4,22-16.08,22-30v-80" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M421.84,37.37a25.86,25.86,0,0,0-22.6-4.46L199.92,86.49A32.3,32.3,0,0,0,176,118v226c0,6.74-4.36,12.56-11.11,14.83l-.12.05-52,18C92.88,383.53,80,402,80,423.91a55.54,55.54,0,0,0,23.23,45.63A54.78,54.78,0,0,0,135.34,480a55.82,55.82,0,0,0,17.75-2.93l.38-.13L175.31,469A47.84,47.84,0,0,0,208,423.91v-212c0-7.29,4.77-13.21,12.16-15.07l.21-.06L395,150.14a4,4,0,0,1,5,3.86V295.93c0,6.75-4.25,12.38-11.11,14.68l-.25.09-50.89,18.11A49.09,49.09,0,0,0,304,375.92a55.67,55.67,0,0,0,23.23,45.8,54.63,54.63,0,0,0,49.88,7.35l.36-.12L399.31,421A47.83,47.83,0,0,0,432,375.92V58A25.74,25.74,0,0,0,421.84,37.37Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
