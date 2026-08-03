<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="129" cy="96" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="129" cy="416" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="129" y1="144" x2="129" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="385" cy="288" r="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M129,144c0,96,112,144,208,144" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M385,224a64,64,0,0,0-55.33,31.89c-42.23-1.21-85.19-12.72-116.21-31.33-32.2-19.32-49.71-44-52.15-73.35a64,64,0,1,0-64.31.18V360.61a64,64,0,1,0,64,0V266.15c44.76,34,107.28,52.38,168.56,53.76A64,64,0,1,0,385,224ZM129,64A32,32,0,1,1,97,96,32,32,0,0,1,129,64Zm0,384a32,32,0,1,1,32-32A32,32,0,0,1,129,448ZM385,320a32,32,0,1,1,32-32A32,32,0,0,1,385,320Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
