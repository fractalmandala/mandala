<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><polyline points="144 352 368 160 256 48 256 464 368 352 144 160" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32"/></g>`,
		filled: `<g fill="currentColor"><path d="M388,160.77a20,20,0,0,0-5.85-14.91l-112-112A20,20,0,0,0,236,48V212.52l-79-67.71a20,20,0,0,0-26,30.38L225.27,256,131,336.81a20,20,0,1,0,26,30.38l79-67.71V464a20,20,0,0,0,34.14,14.14l112-112A20,20,0,0,0,381,336.81L286.73,256,381,175.19A20,20,0,0,0,388,160.77ZM338.58,353.13,276,415.72V299.49ZM276,212.52V96.28l62.59,62.59Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
