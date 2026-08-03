<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><rect x="64" y="64" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="216" y="64" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="368" y="64" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="64" y="216" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="216" y="216" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="368" y="216" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="64" y="368" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="216" y="368" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/><rect x="368" y="368" width="80" height="80" rx="40" ry="40" style="fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M104,160a56,56,0,1,1,56-56A56.06,56.06,0,0,1,104,160Z"/><path d="M256,160a56,56,0,1,1,56-56A56.06,56.06,0,0,1,256,160Z"/><path d="M408,160a56,56,0,1,1,56-56A56.06,56.06,0,0,1,408,160Z"/><path d="M104,312a56,56,0,1,1,56-56A56.06,56.06,0,0,1,104,312Z"/><path d="M256,312a56,56,0,1,1,56-56A56.06,56.06,0,0,1,256,312Z"/><path d="M408,312a56,56,0,1,1,56-56A56.06,56.06,0,0,1,408,312Z"/><path d="M104,464a56,56,0,1,1,56-56A56.06,56.06,0,0,1,104,464Z"/><path d="M256,464a56,56,0,1,1,56-56A56.06,56.06,0,0,1,256,464Z"/><path d="M408,464a56,56,0,1,1,56-56A56.06,56.06,0,0,1,408,464Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
