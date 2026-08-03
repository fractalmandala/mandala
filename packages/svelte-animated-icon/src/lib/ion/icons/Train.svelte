<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M344,48H320a16,16,0,0,0-16-16H208a16,16,0,0,0-16,16H168a56.16,56.16,0,0,0-56,56V351c0,35.3,144,65,144,65s144-29.7,144-65V104A56,56,0,0,0,344,48ZM256,352a48,48,0,1,1,48-48A48,48,0,0,1,256,352Zm96-160a16,16,0,0,1-16,16H176a16,16,0,0,1-16-16V128a16,16,0,0,1,16-16H336a16,16,0,0,1,16,16Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="144" y1="464" x2="368" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="336" y1="432" x2="384" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="176" y1="432" x2="128" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><ellipse cx="256" cy="304" rx="32.05" ry="31.94" transform="translate(-139.98 270.06) rotate(-45)"/><path d="M352,32H337a10,10,0,0,1-7.87-3.78A31.94,31.94,0,0,0,304,16H208a32,32,0,0,0-26.11,13.52A6,6,0,0,1,177,32H160c-36.81,0-64,28.84-64,64V351c0,23.27,25.6,42.06,83,60.94a753,753,0,0,0,73.77,19.73,16,16,0,0,0,6.46,0A753,753,0,0,0,333,411.94c57.4-18.88,83-37.67,83-60.94V96A64,64,0,0,0,352,32ZM184,128H328a8,8,0,0,1,8,8v48a8,8,0,0,1-8,8H184a8,8,0,0,1-8-8V136A8,8,0,0,1,184,128Zm76.18,239.87a64,64,0,1,1,59.69-59.69A64.07,64.07,0,0,1,260.18,367.87Z"/><path d="M395.31,468.69,347.63,421c-6.09-6.1-16-6.66-22.38-.86a16,16,0,0,0-.56,23.16l4.68,4.69H182.63l4.36-4.37c6.1-6.09,6.66-16,.86-22.38a16,16,0,0,0-23.16-.56l-48,48a16,16,0,1,0,22.62,22.62L150.63,480H361.37l11.32,11.31a16,16,0,0,0,22.62-22.62Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
