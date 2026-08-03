<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		filled: `<g fill="currentColor"><path d="M31.87,30.58H244.7V243.39H31.87Z"/><path d="M266.89,30.58H479.7V243.39H266.89Z"/><path d="M31.87,265.61H244.7v212.8H31.87Z"/><path d="M266.89,265.61H479.7v212.8H266.89Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'filled', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['filled']} viewBox="0 0 512 512" {...rest} />
