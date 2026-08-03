<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M320,367.79h76c55,0,100-29.21,100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69,0-113.44,45.79-128,91.2-60,5.7-112,43.88-112,106.4s54,106.4,120,106.4h56" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="320 255.79 256 191.79 192 255.79" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="448.21" x2="256" y2="207.79" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M473.66,210c-14-10.38-31.2-18-49.36-22.11a16.11,16.11,0,0,1-12.19-12.22c-7.8-34.75-24.59-64.55-49.27-87.13C334.15,62.25,296.21,47.79,256,47.79c-35.35,0-68,11.08-94.37,32.05a150.07,150.07,0,0,0-42.06,53,16,16,0,0,1-11.31,8.87c-26.75,5.4-50.9,16.87-69.34,33.12C13.46,197.33,0,227.24,0,261.39c0,34.52,14.49,66,40.79,88.76,25.12,21.69,58.94,33.64,95.21,33.64H240V230.42l-36.69,36.69a16,16,0,0,1-23.16-.56c-5.8-6.37-5.24-16.3.85-22.39l63.69-63.68a16,16,0,0,1,22.62,0L331,244.14c6.28,6.29,6.64,16.6.39,22.91a16,16,0,0,1-22.68.06L272,230.42V383.79H396c31.34,0,59.91-8.8,80.45-24.77,23.26-18.1,35.55-44,35.55-74.83C512,254.25,498.74,228.58,473.66,210Z"/><path d="M240,448.21a16,16,0,1,0,32,0V383.79H240Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
