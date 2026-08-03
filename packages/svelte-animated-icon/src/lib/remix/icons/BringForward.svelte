<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		line: `<g fill="currentColor"><path d="M14 3C14.5523 3 15 3.44772 15 4V9H20C20.5523 9 21 9.44772 21 10V20C21 20.5523 20.5523 21 20 21H10C9.44772 21 9 20.5523 9 20V15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H14ZM13 5H5V13H13V5Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
