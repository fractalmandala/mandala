<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 10h-4v-.5C17.0989 8.46711 19.75 7 19.75 6V4.99989c0-.55228-.4477-.99989-1-.99989H17c-.5523 0-1 .44772-1 1M4 7.30341l9.1221 11.39319m0-11.39319L4 18.6966"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
