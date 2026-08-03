<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="112" y="112" width="288" height="288" rx="64" ry="64" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M176,112V40a8,8,0,0,1,8-8H328a8,8,0,0,1,8,8v72" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><path d="M336,400v72a8,8,0,0,1-8,8H184a8,8,0,0,1-8-8V400" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><rect x="136" y="136" width="240" height="240" rx="56" ry="56"/><path d="M336,96V32a16,16,0,0,0-16-16H192a16,16,0,0,0-16,16V96a80.09,80.09,0,0,0-80,80V336a80.09,80.09,0,0,0,80,80v64a16,16,0,0,0,16,16H320a16,16,0,0,0,16-16V416a80.09,80.09,0,0,0,80-80V176A80.09,80.09,0,0,0,336,96Zm56,224a72.08,72.08,0,0,1-72,72H192a72.08,72.08,0,0,1-72-72V192a72.08,72.08,0,0,1,72-72H320a72.08,72.08,0,0,1,72,72Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
