<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256,48C192,48,96,171.69,96,286.55S160,464,256,464s160-62.59,160-177.45S320,48,256,48Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,480c-52.57,0-96.72-17.54-127.7-50.73C96.7,395.4,80,346.05,80,286.55,80,230.5,101.48,168,138.93,115,175.65,63,219.41,32,256,32s80.35,31,117.07,83C410.52,168,432,230.5,432,286.55c0,59.5-16.7,108.85-48.3,142.72C352.72,462.46,308.57,480,256,480Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
