<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M266.91,327.74V290.42c-57.07,0-84.51,13.47-108.58,38.68-5.4,5.65-15,1.32-14.29-6.43,5.45-61.45,34.14-117.09,122.87-117.09V168.26a8.32,8.32,0,0,1,14-6L365.42,242a8.2,8.2,0,0,1,0,11.94L281,333.71A8.32,8.32,0,0,1,266.91,327.74Z"/><path d="M64,256c0,106,86,192,192,192s192-86,192-192S362,64,256,64,64,150,64,256Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M48,256c0,114.87,93.13,208,208,208s208-93.13,208-208S370.87,48,256,48,48,141.13,48,256Zm96,66.67c5.45-61.45,34.14-117.09,122.87-117.09V168.26a8.32,8.32,0,0,1,14-6L365.42,242a8.2,8.2,0,0,1,0,11.94L281,333.71a8.32,8.32,0,0,1-14-6V290.42c-57.07,0-84.51,13.47-108.58,38.68C152.93,334.75,143.35,330.42,144,322.67Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
