<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		filled: `<g fill="currentColor"><polygon points="408 103.28 408 16 407.97 16 318.69 16 309.79 24.78 267.64 103.26 254.39 112 104 112 104 231.85 186.68 231.85 194.04 240.56 104 408.72 104 496 104.02 496 193.3 496 202.21 487.21 244.35 408.73 257.61 400 408 400 408 280.13 325.32 280.13 317.96 271.38 408 103.28"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'filled', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['filled']} viewBox="0 0 512 512" {...rest} />
