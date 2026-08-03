<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M480,208H308L256,48,204,208H32l140,96L118,464,256,364,394,464,340,304Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><polygon points="256 48 256 364 118 464 172 304 32 208 204 208 256 48"/></g>`,
		filled: `<g fill="currentColor"><path d="M480,208H308L256,48,204,208H32l140,96L118,464,256,364,394,464,340,304Z" style="fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32"/><polygon points="256 48 256 364 118 464 172 304 32 208 204 208 256 48"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
