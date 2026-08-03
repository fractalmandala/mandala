<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="352 296 256 200 160 296" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/><path d="M256,64C150,64,64,150,64,256s86,192,192,192,192-86,192-192S362,64,256,64Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,48C141.13,48,48,141.13,48,256s93.13,208,208,208,208-93.13,208-208S370.87,48,256,48ZM363.31,307.31a16,16,0,0,1-22.62,0L256,222.63l-84.69,84.68a16,16,0,0,1-22.62-22.62l96-96a16,16,0,0,1,22.62,0l96,96A16,16,0,0,1,363.31,307.31Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
