<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256.05,80.65Q263.94,80,272,80c106,0,192,86,192,192S378,464,272,464A192.09,192.09,0,0,1,89.12,330.65" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><path d="M256,48C141.12,48,48,141.12,48,256a207.29,207.29,0,0,0,18.09,85L256,256Z" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M66.1,357a16,16,0,0,1-14.61-9.46A224,224,0,0,1,256,32a16,16,0,0,1,16,16V256a16,16,0,0,1-9.47,14.61L72.63,355.56A15.93,15.93,0,0,1,66.1,357Z"/><path d="M313.59,68.18A8,8,0,0,0,304,76V256a48.07,48.07,0,0,1-28.4,43.82L103.13,377a8,8,0,0,0-3.35,11.81,208.42,208.42,0,0,0,48.46,50.41A206.32,206.32,0,0,0,272,480c114.69,0,208-93.31,208-208C480,171.55,408.42,87.5,313.59,68.18Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
