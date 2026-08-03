<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M445.2,48.05,398,48H128C73.7,48,64,83.7,64,96c30.3,4.2,48,8,48,40V400A64,64,0,0,0,176,464H368a64,64,0,0,0,64-64V96c0-19,11.5-38.35,12.6-40,1.2-1.9,3.4-4.4,3.4-5.5S447.7,48.05,445.2,48.05Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="112" y1="176" x2="432" y2="176" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M444,32H128c-19.38,0-45.9,4.34-64.11,24.77C52.17,69.92,48,85.66,48,96a16,16,0,0,0,13.8,15.85C91.7,116,96,117.79,96,136V400A80.07,80.07,0,0,0,176,480H368a80.11,80.11,0,0,0,80-80V96c0-12.55,7.46-27.25,10-31.36l.1-.14c.22-.35.5-.72.78-1.1,2-2.79,5.09-7,5.09-12.95C464,39.79,454.89,32,444,32ZM84.11,83.08c5.24-8.87,17.17-19,44.29-19H422.83C419.3,72.87,416,84.27,416,96v64H128V136C128,98.68,106.65,87.86,84.11,83.08Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
