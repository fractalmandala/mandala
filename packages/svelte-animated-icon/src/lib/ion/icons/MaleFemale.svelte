<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="216" cy="200" r="136" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="216" y1="352" x2="216" y2="480" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="272" y1="416" x2="160" y2="416" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="432 112 432 32 352 32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="335.28" y1="128.72" x2="432" y2="32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M426,16H352a22,22,0,0,0,0,44h20.89l-37.1,37.09A157.68,157.68,0,0,0,216,42C128.88,42,58,112.88,58,200c0,79.66,59.26,145.72,136,156.46V394H166a22,22,0,0,0,0,44h28v36a22,22,0,0,0,44,0V438h28a22,22,0,0,0,0-44H238V356.46c76.74-10.74,136-76.8,136-156.46a157.15,157.15,0,0,0-14-64.92l44-44V112a22,22,0,0,0,44,0V38A22,22,0,0,0,426,16ZM216,314A114,114,0,1,1,330,200,114.13,114.13,0,0,1,216,314Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
