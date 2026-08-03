<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M314.21,482.32,257.44,367.58l-44.89-57.39a72.82,72.82,0,0,1-10.13-37.05V144h15.67a40.22,40.22,0,0,1,40.23,40.22V367.58" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M127.9,293.05V218.53S165.16,144,202.42,144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="370.1" y1="274.42" x2="304" y2="231" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="170.53" y1="478.36" x2="224" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="258.32" cy="69.48" r="37.26" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M312.55,479.9l-56.42-114-44.62-57A72.37,72.37,0,0,1,201.45,272V143.64H217a40,40,0,0,1,40,40V365.85" style="stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M127.38,291.78V217.71s37-74.07,74.07-74.07" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M368.09,291.78a18.49,18.49,0,0,1-10.26-3.11L297.7,250A21.18,21.18,0,0,1,288,232.21v-23.7a5.65,5.65,0,0,1,8.69-4.77l81.65,54.11a18.52,18.52,0,0,1-10.29,33.93Z"/><path d="M171.91,493.47a18.5,18.5,0,0,1-14.83-7.41c-6.14-8.18-4-17.18,3.7-25.92l59.95-74.66a7.41,7.41,0,0,1,10.76,2.06c1.56,2.54,3.38,5.65,5.19,9.09,5.24,9.95,6,16.11-1.68,25.7-8,10-52,67.44-52,67.44C180.38,492.75,175.77,493.47,171.91,493.47Z"/><circle cx="257" cy="69.56" r="37.04" style="stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:16"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
