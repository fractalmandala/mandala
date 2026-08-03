<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M256,80A176,176,0,1,0,432,256,176,176,0,0,0,256,80Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M232,160a72,72,0,1,0,72,72A72,72,0,0,0,232,160Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><line x1="283.64" y1="283.64" x2="336" y2="336" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,64C150.13,64,64,150.13,64,256s86.13,192,192,192,192-86.13,192-192S361.87,64,256,64Zm91.31,283.31a16,16,0,0,1-22.62,0l-42.84-42.83a88.08,88.08,0,1,1,22.63-22.63l42.83,42.84A16,16,0,0,1,347.31,347.31Z"/><circle cx="232" cy="232" r="56"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
