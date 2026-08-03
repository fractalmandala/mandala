<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="448" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="256" cy="320" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><path d="M288,192a32,32,0,1,1-32-32A32,32,0,0,1,288,192Z" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="256" cy="64" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="384" cy="320" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="384" cy="192" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="384" cy="64" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="128" cy="320" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="128" cy="192" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><circle cx="128" cy="64" r="32" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M256,400a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M256,272a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M256,144a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M256,16a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M384,272a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M384,144a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M384,16a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M128,272a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M128,144a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/><path d="M128,16a48,48,0,1,0,48,48,48,48,0,0,0-48-48Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
