<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M320,336h76c55,0,100-21.21,100-75.6s-53-73.47-96-75.6C391.11,99.74,329,48,256,48c-69,0-113.44,45.79-128,91.2-60,5.7-112,35.88-112,98.4S70,336,136,336h56" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="192 400.1 256 464 320 400.1" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="224" x2="256" y2="448.03" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M472.7,189.5c-13.26-8.43-29.83-14.56-48.08-17.93A16,16,0,0,1,412,159.28c-7.86-34.51-24.6-64.13-49.15-86.58C334.15,46.45,296.21,32,256,32c-35.35,0-68,11.08-94.37,32a150.13,150.13,0,0,0-41.95,52.83A16.05,16.05,0,0,1,108,125.8c-27.13,4.9-50.53,14.68-68.41,28.7C13.7,174.83,0,203.56,0,237.6,0,305,55.93,352,136,352H240V224.45c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,272,224V352H396c72.64,0,116-34.24,116-91.6C512,230.35,498.41,205.83,472.7,189.5Z"/><path d="M240,425.42l-36.7-36.64a16,16,0,0,0-22.6,22.65l64,63.89a16,16,0,0,0,22.6,0l64-63.89a16,16,0,0,0-22.6-22.65L272,425.42V352H240Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
