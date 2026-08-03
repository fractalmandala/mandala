<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		line: `<g fill="currentColor"><path d="M8 21V19H11V5H8V3H16V5H13V19H16V21H8ZM18.0503 7.05025L23 12L18.0503 16.9497L16.636 15.5355L20.1716 12L16.636 8.46447L18.0503 7.05025ZM5.94975 7.05025L7.36396 8.46447L3.82843 12L7.36396 15.5355L5.94975 16.9497L1 12L5.94975 7.05025Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
