<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="80" y="112" width="352" height="192" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><rect x="80" y="304" width="352" height="128" rx="32" ry="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M400,112H112A32.09,32.09,0,0,1,80,80h0a32.09,32.09,0,0,1,32-32H400a32.09,32.09,0,0,1,32,32h0A32.09,32.09,0,0,1,400,112Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M144,432v22a10,10,0,0,1-10,10H106a10,10,0,0,1-10-10V432Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M416,432v22a10,10,0,0,1-10,10H378a10,10,0,0,1-10-10V432Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><circle cx="368" cy="368" r="16" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><circle cx="144" cy="368" r="16" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="112" x2="256" y2="304" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="80" y1="80" x2="80" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="432" y1="80" x2="432" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M400,32H112A48,48,0,0,0,64,80V400a47.91,47.91,0,0,0,16,35.74V454a26,26,0,0,0,26,26h28a26,26,0,0,0,26-26v-6H352v6a26,26,0,0,0,26,26h28a26,26,0,0,0,26-26V435.74A47.91,47.91,0,0,0,448,400V80A48,48,0,0,0,400,32ZM147.47,399.82a32,32,0,1,1,28.35-28.35A32,32,0,0,1,147.47,399.82ZM236,288H112a16,16,0,0,1-16-16V144a16,16,0,0,1,16-16H236a4,4,0,0,1,4,4V284A4,4,0,0,1,236,288ZM256,96H112.46c-8.6,0-16-6.6-16.44-15.19A16,16,0,0,1,112,64H399.54c8.6,0,16,6.6,16.44,15.19A16,16,0,0,1,400,96H256Zm20,32H400a16,16,0,0,1,16,16V272a16,16,0,0,1-16,16H276a4,4,0,0,1-4-4V132A4,4,0,0,1,276,128Zm60.18,243.47a32,32,0,1,1,28.35,28.35A32,32,0,0,1,336.18,371.47Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
