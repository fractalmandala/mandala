<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="32" y="112" width="448" height="352" rx="48" ry="48" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M144,112V80a32,32,0,0,1,32-32H336a32,32,0,0,1,32,32v32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="208" x2="256" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="336" y1="288" x2="176" y2="288" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M336,64H176a16,16,0,0,0-16,16V96H352V80A16,16,0,0,0,336,64Z" style="fill:none"/><path d="M432,96H384V80a48.05,48.05,0,0,0-48-48H176a48.05,48.05,0,0,0-48,48V96H80a64.07,64.07,0,0,0-64,64V416a64,64,0,0,0,64,64H432a64,64,0,0,0,64-64V160A64.07,64.07,0,0,0,432,96ZM336,304H272v64a16,16,0,0,1-32,0V304H176a16,16,0,0,1,0-32h64V208a16,16,0,0,1,32,0v64h64a16,16,0,0,1,0,32ZM352,96H160V80a16,16,0,0,1,16-16H336a16,16,0,0,1,16,16Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
