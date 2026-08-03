<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="196 220 260 220 260 392" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:40"/><line x1="187" y1="396" x2="325" y2="396" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:40"/><path d="M256,160a32,32,0,1,1,32-32A32,32,0,0,1,256,160Z"/></g>`,
		filled: `<g fill="currentColor"><polyline points="196 220 260 220 260 392" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:40"/><line x1="187" y1="396" x2="325" y2="396" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:40"/><path d="M256,160a32,32,0,1,1,32-32A32,32,0,0,1,256,160Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
