<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		line: `<g fill="currentColor"><path d="M7 14V3H3C2.44772 3 2 3.44772 2 4V14H7ZM15 14V3H9V14H15ZM22 14V4C22 3.44772 21.5523 3 21 3H17V14H22ZM21 21C21.5523 21 22 20.5523 22 20V16H2V20C2 20.5523 2.44772 21 3 21H21Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
