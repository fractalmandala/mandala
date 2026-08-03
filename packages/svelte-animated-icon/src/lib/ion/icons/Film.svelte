<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="48" y="96" width="416" height="320" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="384" y="336" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="384" y="256" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="384" y="176" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="384" y="96" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="48" y="336" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="48" y="256" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="48" y="176" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="48" y="96" width="80" height="80" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="128" y="96" width="256" height="160" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><rect x="128" y="256" width="256" height="160" rx="28" ry="28" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M436,80H76a44.05,44.05,0,0,0-44,44V388a44.05,44.05,0,0,0,44,44H436a44.05,44.05,0,0,0,44-44V124A44.05,44.05,0,0,0,436,80ZM112,388a12,12,0,0,1-12,12H76a12,12,0,0,1-12-12V364a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H76a12,12,0,0,1-12-12V284a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H76a12,12,0,0,1-12-12V204a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H76a12,12,0,0,1-12-12V124a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12ZM353.68,272H158.32a16,16,0,0,1,0-32H353.68a16,16,0,1,1,0,32ZM448,388a12,12,0,0,1-12,12H412a12,12,0,0,1-12-12V364a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H412a12,12,0,0,1-12-12V284a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H412a12,12,0,0,1-12-12V204a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Zm0-80a12,12,0,0,1-12,12H412a12,12,0,0,1-12-12V124a12,12,0,0,1,12-12h24a12,12,0,0,1,12,12Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
