<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="128" cy="96" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="256" cy="416" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="256" x2="256" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="384" cy="96" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M128,144c0,74.67,68.92,112,128,112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M384,144c0,74.67-68.92,112-128,112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M448,96a64,64,0,1,0-96.31,55.21c-1.79,20.87-11.47,38.1-28.87,51.29C305.07,216,280.09,224,256,224s-49.07-8-66.82-21.5c-17.4-13.19-27.08-30.42-28.87-51.29a64,64,0,1,0-64.11.29c2.08,40.87,21.17,76.87,54.31,102C171.3,269.26,197,280.19,224,285.09v75.52a64,64,0,1,0,64,0V285.09c27-4.9,52.7-15.83,73.49-31.59,33.14-25.13,52.23-61.13,54.31-102A64,64,0,0,0,448,96ZM128,64A32,32,0,1,1,96,96,32,32,0,0,1,128,64ZM256,448a32,32,0,1,1,32-32A32,32,0,0,1,256,448ZM384,128a32,32,0,1,1,32-32A32,32,0,0,1,384,128Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
