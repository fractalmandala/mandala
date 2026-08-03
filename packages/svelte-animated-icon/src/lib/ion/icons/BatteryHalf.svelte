<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="32" y="144" width="400" height="224" rx="45.7" ry="45.7" style="fill:none;stroke:currentColor;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32"/><rect x="85.69" y="198.93" width="154.31" height="114.13" rx="4" ry="4" style="stroke:currentColor;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32"/><line x1="480" y1="218.67" x2="480" y2="293.33" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><rect x="32" y="144" width="400" height="224" rx="45.7" ry="45.7" style="fill:none;stroke:currentColor;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32"/><rect x="85.69" y="198.93" width="154.31" height="114.13" rx="4" ry="4" style="stroke:currentColor;stroke-linecap:square;stroke-miterlimit:10;stroke-width:32"/><line x1="480" y1="218.67" x2="480" y2="293.33" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
