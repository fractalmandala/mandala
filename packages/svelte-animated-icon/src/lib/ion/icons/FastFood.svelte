<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M322,416c0,35.35-20.65,64-56,64H134c-35.35,0-56-28.65-56-64" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M336,336c17.67,0,32,17.91,32,40h0c0,22.09-14.33,40-32,40H64c-17.67,0-32-17.91-32-40h0c0-22.09,14.33-40,32-40" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M344,336H179.31a8,8,0,0,0-5.65,2.34l-26.83,26.83a4,4,0,0,1-5.66,0l-26.83-26.83a8,8,0,0,0-5.65-2.34H56a24,24,0,0,1-24-24h0a24,24,0,0,1,24-24H344a24,24,0,0,1,24,24h0A24,24,0,0,1,344,336Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M64,276v-.22c0-55,45-83.78,100-83.78h72c55,0,100,29,100,84v-.22" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="241" y1="112" x2="248.44" y2="175.97" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M256,480H395.31a32,32,0,0,0,31.91-29.61L463,112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><polyline points="368 112 384 48 431 32" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="224" y1="112" x2="480" y2="112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M368,128h.09"/><path d="M479.55,96H388.49l8.92-35.66,38.32-13.05c8.15-2.77,13-11.43,10.65-19.71a16,16,0,0,0-20.54-10.73l-47,16a16,16,0,0,0-10.36,11.27L355.51,96H224.45c-8.61,0-16,6.62-16.43,15.23A16,16,0,0,0,224,128h2.75l1,8.66A8.3,8.3,0,0,0,236,144h0c39,0,73.66,10.9,100.12,31.52A121.9,121.9,0,0,1,371,218.07a123.4,123.4,0,0,1,10.12,29.51,7.83,7.83,0,0,0,3.29,4.88,72,72,0,0,1,26.38,86.43,7.92,7.92,0,0,0-.15,5.53A96,96,0,0,1,416,376c0,22.34-7.6,43.63-21.4,59.95a80.12,80.12,0,0,1-28.78,21.67,8,8,0,0,0-4.21,4.37,108.19,108.19,0,0,1-17.37,29.86l0,0a2.5,2.5,0,0,0,1.9,4.11h49.21a48.22,48.22,0,0,0,47.85-44.14L477.4,128H480a16,16,0,0,0,16-16.77C495.58,102.62,488.16,96,479.55,96Z"/><path d="M108.69,320a23.87,23.87,0,0,1,17,7l15.51,15.51a4,4,0,0,0,5.66,0L162.34,327a23.87,23.87,0,0,1,17-7H375.92a8,8,0,0,0,8.08-7.92V312a40.07,40.07,0,0,0-32-39.2c-.82-29.69-13-54.54-35.51-72C295.67,184.56,267.85,176,236,176H164c-68.22,0-114.43,38.77-116,96.8A40.07,40.07,0,0,0,16,312h0a8,8,0,0,0,8,8Z"/><path d="M185.94,352a8,8,0,0,0-5.66,2.34l-22.14,22.15a20,20,0,0,1-28.28,0l-22.14-22.15a8,8,0,0,0-5.66-2.34H32.66A15.93,15.93,0,0,0,16.9,365.17,65.22,65.22,0,0,0,16,376c0,30.59,21.13,55.51,47.26,56,2.43,15.12,8.31,28.78,17.16,39.47C93.51,487.28,112.54,496,134,496H266c21.46,0,40.49-8.72,53.58-24.55,8.85-10.69,14.73-24.35,17.16-39.47,26.13-.47,47.26-25.39,47.26-56a65.22,65.22,0,0,0-.9-10.83A15.93,15.93,0,0,0,367.34,352Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
