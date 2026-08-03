<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M320,176a16,16,0,0,0-16,16v53L192.32,177.56A10.78,10.78,0,0,0,176,186.87V325.13a10.78,10.78,0,0,0,16.32,9.31L304,267v53a16,16,0,0,0,32,0V192A16,16,0,0,0,320,176Z"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm80,272a16,16,0,0,1-32,0V267L192.32,334.44A10.78,10.78,0,0,1,176,325.13V186.87a10.78,10.78,0,0,1,16.32-9.31L304,245V192a16,16,0,0,1,32,0Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
