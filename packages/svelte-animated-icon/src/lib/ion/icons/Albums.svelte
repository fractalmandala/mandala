<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="64" y="176" width="384" height="256" rx="28.87" ry="28.87" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><line x1="144" y1="80" x2="368" y2="80" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/><line x1="112" y1="128" x2="400" y2="128" style="stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M368,96H144a16,16,0,0,1,0-32H368a16,16,0,0,1,0,32Z"/><path d="M400,144H112a16,16,0,0,1,0-32H400a16,16,0,0,1,0,32Z"/><path d="M419.13,448H92.87A44.92,44.92,0,0,1,48,403.13V204.87A44.92,44.92,0,0,1,92.87,160H419.13A44.92,44.92,0,0,1,464,204.87V403.13A44.92,44.92,0,0,1,419.13,448Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
