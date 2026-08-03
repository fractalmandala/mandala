<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="96" y="48" width="320" height="416" rx="48" ry="48" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="176" y1="128" x2="336" y2="128" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="176" y1="208" x2="336" y2="208" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="176" y1="288" x2="256" y2="288" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M368,32H144A64.07,64.07,0,0,0,80,96V416a64.07,64.07,0,0,0,64,64H368a64.07,64.07,0,0,0,64-64V96A64.07,64.07,0,0,0,368,32ZM256,304H176a16,16,0,0,1,0-32h80a16,16,0,0,1,0,32Zm80-80H176a16,16,0,0,1,0-32H336a16,16,0,0,1,0,32Zm0-80H176a16,16,0,0,1,0-32H336a16,16,0,0,1,0,32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
