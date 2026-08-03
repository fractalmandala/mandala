<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="48" y="96" width="416" height="304" rx="32.14" ry="32.14" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="16" y1="416" x2="496" y2="416" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M496,400H467.66A47.92,47.92,0,0,0,480,367.86V128.14A48.2,48.2,0,0,0,431.86,80H80.14A48.2,48.2,0,0,0,32,128.14V367.86A47.92,47.92,0,0,0,44.34,400H16a16,16,0,0,0,0,32H496a16,16,0,0,0,0-32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
