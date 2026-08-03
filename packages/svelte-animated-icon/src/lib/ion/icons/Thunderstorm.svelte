<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><line x1="120" y1="352" x2="96" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="136" y1="432" x2="120" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="400" y1="352" x2="376" y2="400" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="416" y1="432" x2="400" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="208 304 192 400 240 400 240 480 320 368 272 368 288 304" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M404.33,152.89H392.2C384.71,84.85,326.14,32,256,32a136.39,136.39,0,0,0-128.63,90.67H122.8c-49.94,0-90.8,40.8-90.8,90.66h0C32,263.2,72.86,304,122.8,304H404.33C446,304,480,270,480,228.44h0C480,186.89,446,152.89,404.33,152.89Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M96,416a16,16,0,0,1-14.3-23.16l24-48a16,16,0,0,1,28.62,14.32l-24,48A16,16,0,0,1,96,416Z"/><path d="M120,480a16,16,0,0,1-14.3-23.16l16-32a16,16,0,0,1,28.62,14.32l-16,32A16,16,0,0,1,120,480Z"/><path d="M376,416a16,16,0,0,1-14.3-23.16l24-48a16,16,0,0,1,28.62,14.32l-24,48A16,16,0,0,1,376,416Z"/><path d="M400,480a16,16,0,0,1-14.3-23.16l16-32a16,16,0,0,1,28.62,14.32l-16,32A16,16,0,0,1,400,480Z"/><path d="M405.84,136.9A151.25,151.25,0,0,0,358.24,55a153,153,0,0,0-241.81,51.86C60.5,110.16,16,156.65,16,213.33,16,272.15,63.91,320,122.8,320h66.31l-12.89,77.37A16,16,0,0,0,192,416h32v64a16,16,0,0,0,29,9.3l80-112A16,16,0,0,0,320,352H292.49l8-32H404.33a91.56,91.56,0,0,0,1.51-183.1Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
