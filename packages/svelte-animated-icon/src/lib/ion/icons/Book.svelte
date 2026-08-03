<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256,160c16-63.16,76.43-95.41,208-96a15.94,15.94,0,0,1,16,16V368a16,16,0,0,1-16,16c-128,0-177.45,25.81-208,64-30.37-38-80-64-208-64-9.88,0-16-8.05-16-17.93V80A15.94,15.94,0,0,1,48,64C179.57,64.59,240,96.84,256,160Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="160" x2="256" y2="448" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M202.24,74C166.11,56.75,115.61,48.3,48,48h0a31.36,31.36,0,0,0-17.92,5.33A32,32,0,0,0,16,79.9V366c0,19.34,13.76,33.93,32,33.93,71.07,0,142.36,6.64,185.06,47a4.11,4.11,0,0,0,6.94-3V106.82a15.89,15.89,0,0,0-5.46-12A143,143,0,0,0,202.24,74Z"/><path d="M481.92,53.3A31.33,31.33,0,0,0,464,48h0c-67.61.3-118.11,8.71-154.24,26a143.31,143.31,0,0,0-32.31,20.78,15.93,15.93,0,0,0-5.45,12V443.91a3.93,3.93,0,0,0,6.68,2.81c25.67-25.5,70.72-46.82,185.36-46.81a32,32,0,0,0,32-32v-288A32,32,0,0,0,481.92,53.3Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
