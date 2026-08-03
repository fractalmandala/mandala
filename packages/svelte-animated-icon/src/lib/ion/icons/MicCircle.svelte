<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="224" y1="368" x2="288" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M336,224.3v23.92c0,39.42-40.58,71.48-80,71.48h0c-39.42,0-80-32.06-80-71.48V224.3" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><line x1="256" y1="320" x2="256" y2="368" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><rect x="208" y="128" width="96" height="160" rx="48" ry="48"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48ZM208,176a48.14,48.14,0,0,1,48-48h0a48.14,48.14,0,0,1,48,48v64a48.14,48.14,0,0,1-48,48h0a48.14,48.14,0,0,1-48-48Zm144,72.22c0,23.36-10.94,45.61-30.79,62.66A103.71,103.71,0,0,1,272,334.26V352h16a16,16,0,0,1,0,32H224a16,16,0,0,1,0-32h16V334.26a103.71,103.71,0,0,1-49.21-23.38C170.94,293.83,160,271.58,160,248.22V224.3a16,16,0,0,1,32,0v23.92c0,25.66,28,55.48,64,55.48,29.6,0,64-24.23,64-55.48V224.3a16,16,0,1,1,32,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
