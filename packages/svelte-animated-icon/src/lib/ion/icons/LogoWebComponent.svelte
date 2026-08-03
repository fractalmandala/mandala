<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		filled: `<g fill="currentColor"><polygon points="179.9 388 179.9 388 103.74 256 179.9 388" style="fill:none"/><polygon points="179.9 388 332.11 388 408.26 256 332.11 124 179.9 124 103.74 256 179.9 388" style="fill:none"/><polygon points="103.74 256 179.9 124 179.9 124 103.74 256" style="fill:none"/><polygon points="496 256 376 48 239.74 48 195.9 124 332.11 124 408.26 256 332.11 388 195.9 388 239.74 464 376 464 496 256"/><polygon points="179.9 388 103.74 256 179.9 124 179.9 124 223.74 48 136 48 16 256 136 464 223.74 464 179.9 388 179.9 388"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'filled', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['filled']} viewBox="0 0 512 512" {...rest} />
