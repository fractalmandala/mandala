<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="128" y="16" width="256" height="480" rx="48" ry="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M176,16h24a8,8,0,0,1,8,8h0a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16h0a8,8,0,0,1,8-8h24" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M336,0H176a64,64,0,0,0-64,64V448a64,64,0,0,0,64,64H336a64,64,0,0,0,64-64V64A64,64,0,0,0,336,0Zm32,448a32,32,0,0,1-32,32H176a32,32,0,0,1-32-32V64a32,32,0,0,1,32-32h11.35a7.94,7.94,0,0,1,7.3,4.75A32,32,0,0,0,224,56h64a32,32,0,0,0,29.35-19.25,7.94,7.94,0,0,1,7.3-4.75H336a32,32,0,0,1,32,32Z"/><path d="M336,48h0a11.88,11.88,0,0,0-9.53,4.69A48,48,0,0,1,288,72H224a48,48,0,0,1-38.47-19.31A11.88,11.88,0,0,0,176,48h0a16,16,0,0,0-16,16V448a16,16,0,0,0,16,16H336a16,16,0,0,0,16-16V64A16,16,0,0,0,336,48Z"/><path d="M336,0H176a64,64,0,0,0-64,64V448a64,64,0,0,0,64,64H336a64,64,0,0,0,64-64V64A64,64,0,0,0,336,0Zm32,448a32,32,0,0,1-32,32H176a32,32,0,0,1-32-32V64a32,32,0,0,1,32-32h11.35a7.94,7.94,0,0,1,7.3,4.75A32,32,0,0,0,224,56h64a32,32,0,0,0,29.35-19.25,7.94,7.94,0,0,1,7.3-4.75H336a32,32,0,0,1,32,32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
