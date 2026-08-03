<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="112" y="32" width="288" height="352" rx="48" ry="48" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="208" y1="80" x2="304" y2="80" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><rect x="112" y="128" width="288" height="96" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="176" cy="320" r="16" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><circle cx="336" cy="320" r="16" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="144" y1="464" x2="368" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="336" y1="432" x2="384" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="176" y1="432" x2="128" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M352,16H160A64.07,64.07,0,0,0,96,80V336a64.07,64.07,0,0,0,64,64H352a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,352,16ZM208,64h96a16,16,0,0,1,0,32H208a16,16,0,0,1,0-32ZM176,352a32,32,0,1,1,32-32A32,32,0,0,1,176,352Zm160,0a32,32,0,1,1,32-32A32,32,0,0,1,336,352Zm48-160a16,16,0,0,1-16,16H144a16,16,0,0,1-16-16V160a16,16,0,0,1,16-16H368a16,16,0,0,1,16,16Z"/><path d="M347.31,420.69a16,16,0,0,0-22.62,22.62l4.68,4.69H182.63l4.68-4.69a16,16,0,0,0-22.62-22.62l-48,48a16,16,0,1,0,22.62,22.62L150.63,480H361.37l11.32,11.31a16,16,0,0,0,22.62-22.62Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
