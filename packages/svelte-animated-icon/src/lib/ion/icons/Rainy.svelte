<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M114.61,162.85A16.07,16.07,0,0,0,128,149.6C140.09,76.17,193.63,32,256,32c57.93,0,96.62,37.75,112.2,77.74a15.84,15.84,0,0,0,12.2,9.87c50,8.15,91.6,41.54,91.6,99.59C472,278.6,423.4,320,364,320H130c-49.5,0-90-24.7-90-79.2C40,192.33,78.67,168.58,114.61,162.85Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="144" y1="384" x2="112" y2="432" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="224" y1="384" x2="160" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="304" y1="384" x2="272" y2="432" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="384" y1="384" x2="320" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M456.26,139.37c-16.77-16.73-39.17-28.41-65.17-34a16,16,0,0,1-11.19-9,142.24,142.24,0,0,0-42.19-53.21C314.48,25.39,286.23,16,256,16a140.24,140.24,0,0,0-93.5,35.32c-24.2,21.56-40.91,51.34-48.43,85.83a16.05,16.05,0,0,1-11.72,12.18c-25,6.3-35.71,12.54-49.21,24.56C34,190.93,24,214.14,24,240.8c0,30.55,11.23,55.64,32.47,72.56C75.08,328.17,100.5,336,130,336H364c33.2,0,64.11-11.46,87-32.28,23.84-21.65,37-51.67,37-84.52C488,187.71,477,160.11,456.26,139.37Z"/><path d="M112,448a16,16,0,0,1-13.3-24.88l32-48a16,16,0,0,1,26.62,17.76l-32,48A16,16,0,0,1,112,448Z"/><path d="M160,496a16,16,0,0,1-13.29-24.88l64-96a16,16,0,0,1,26.62,17.76l-64,96A16,16,0,0,1,160,496Z"/><path d="M272,448a16,16,0,0,1-13.3-24.88l32-48a16,16,0,0,1,26.62,17.76l-32,48A16,16,0,0,1,272,448Z"/><path d="M320,496a16,16,0,0,1-13.3-24.88l64-96a16,16,0,0,1,26.62,17.76l-64,96A16,16,0,0,1,320,496Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
