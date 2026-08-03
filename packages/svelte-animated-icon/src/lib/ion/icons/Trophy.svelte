<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><line x1="176" y1="464" x2="336" y2="464" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="464" x2="256" y2="336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M384,224c0-50.64-.08-134.63-.12-160a16,16,0,0,0-16-16l-223.79.26a16,16,0,0,0-16,15.95c0,30.58-.13,129.17-.13,159.79,0,64.28,83,112,128,112S384,288.28,384,224Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M128,96H48v16c0,55.22,33.55,112,80,112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M384,96h80v16c0,55.22-33.55,112-80,112" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M464,80H403.9a4,4,0,0,1-4-4c0-4.89,0-9,0-12.08A32,32,0,0,0,367.9,32h0l-223.79.26a32,32,0,0,0-31.94,31.93c0,3.23,0,7.22,0,11.81a4,4,0,0,1-4,4H48A16,16,0,0,0,32,96v16c0,54.53,30,112.45,76.52,125.35a7.82,7.82,0,0,1,5.55,5.9c5.77,26.89,23.52,52.5,51.41,73.61,20.91,15.83,45.85,27.5,68.27,32.48a8,8,0,0,1,6.25,7.8V444a4,4,0,0,1-4,4H176.45c-8.61,0-16,6.62-16.43,15.23A16,16,0,0,0,176,480H335.55c8.61,0,16-6.62,16.43-15.23A16,16,0,0,0,336,448H276a4,4,0,0,1-4-4V357.14a8,8,0,0,1,6.25-7.8c22.42-5,47.36-16.65,68.27-32.48,27.89-21.11,45.64-46.72,51.41-73.61a7.82,7.82,0,0,1,5.55-5.9C450,224.45,480,166.53,480,112V96A16,16,0,0,0,464,80ZM112,198.22a4,4,0,0,1-6,3.45c-10.26-6.11-17.75-15.37-22.14-21.89-11.91-17.69-19-40.67-19.79-63.63a4,4,0,0,1,4-4.15h40a4,4,0,0,1,4,4C112.05,143.45,112,174.87,112,198.22Zm316.13-18.44c-4.39,6.52-11.87,15.78-22.13,21.89a4,4,0,0,1-6-3.46c0-26.51,0-56.63-.05-82.21a4,4,0,0,1,4-4h40a4,4,0,0,1,4,4.15C447.16,139.11,440.05,162.09,428.14,179.78Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
