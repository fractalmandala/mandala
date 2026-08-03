<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M351.82,271.87v-16A96.15,96.15,0,0,0,184.09,192m-24.2,48.17v16A96.22,96.22,0,0,0,327.81,320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="135.87 256 159.46 232.4 184.13 256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><polyline points="376.13 256 352.54 279.6 327.87 256" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,48C141.13,48,48,141.13,48,256s93.13,208,208,208,208-93.13,208-208S370.87,48,256,48Zm83.69,282.65a112.24,112.24,0,0,1-195-61.29,16,16,0,0,1-20.13-24.67l23.6-23.6a16,16,0,0,1,22.37-.25l24.67,23.6a16,16,0,0,1-18,26,80.25,80.25,0,0,0,138.72,38.83,16,16,0,0,1,23.77,21.41Zm47.76-63.34-23.6,23.6a16,16,0,0,1-22.37.25l-24.67-23.6a16,16,0,0,1,17.68-26.11A80.17,80.17,0,0,0,196,202.64a16,16,0,1,1-23.82-21.37,112.17,112.17,0,0,1,194.88,61.57,16,16,0,0,1,20.39,24.47Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
