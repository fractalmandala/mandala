<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><rect width="256" height="256" fill="#a0a0a0" opacity="0"/><path d="M32,120c50.38,0,93.51,31.28,111.3,75.08a8,8,0,0,0,7.42,4.92H240a8,8,0,0,0,8-8v-4.73A23.92,23.92,0,0,0,229.21,164L176,152,64,40C44.59,61.22,32,89,32,120Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M80,130v62a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><path d="M32,120c50.38,0,93.51,31.28,111.3,75.08a8,8,0,0,0,7.42,4.92H240a8,8,0,0,0,8-8v-4.73A23.92,23.92,0,0,0,229.21,164L176,152,64,40C44.59,61.22,32,89,32,120Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M80,130v62a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M32,144a95.28,95.28,0,0,1,37.53,7.67,4,4,0,0,1,2.47,3.7V192a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V148a4,4,0,0,1,4-4Zm199,12.19L180,144.71,69.66,34.34a8,8,0,0,0-11.56.26C36.11,58.64,24,89,24,120a8,8,0,0,0,8,8,111.2,111.2,0,0,1,63.34,19.7,112.45,112.45,0,0,1,40.55,50.39A15.9,15.9,0,0,0,150.72,208H240a16,16,0,0,0,16-16v-4.73A31.72,31.72,0,0,0,231,156.19Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
