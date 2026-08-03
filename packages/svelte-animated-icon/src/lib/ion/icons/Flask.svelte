<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><line x1="176" y1="48" x2="336" y2="48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="118" y1="304" x2="394" y2="304" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M208,48v93.48a64.09,64.09,0,0,1-9.88,34.18L73.21,373.49C48.4,412.78,76.63,464,123.08,464H388.92c46.45,0,74.68-51.22,49.87-90.51L313.87,175.66A64.09,64.09,0,0,1,304,141.48V48" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M452.32,365,327.4,167.12A48.07,48.07,0,0,1,320,141.48V64h15.56c8.61,0,16-6.62,16.43-15.23A16,16,0,0,0,336,32H176.45c-8.61,0-16,6.62-16.43,15.23A16,16,0,0,0,176,64h16v77.48a47.92,47.92,0,0,1-7.41,25.63L59.68,365a74,74,0,0,0-2.5,75.84C70.44,465.19,96.36,480,124.13,480H387.87c27.77,0,53.69-14.81,66.95-39.21A74,74,0,0,0,452.32,365ZM211.66,184.2A79.94,79.94,0,0,0,224,141.48V68a4,4,0,0,1,4-4h56a4,4,0,0,1,4,4v73.48a79.94,79.94,0,0,0,12.35,42.72l57.8,91.53A8,8,0,0,1,351.37,288H160.63a8,8,0,0,1-6.77-12.27Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
