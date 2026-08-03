<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M10.0001 19.0001L19 19.0002L19 17.0002L12.0001 17.0001L12 9.41405H17.4142L11 2.99985L4.58578 9.41405L10 9.41406L10.0001 19.0001Z"/></g>`,
		line: `<g fill="currentColor"><path d="M10.0001 19.0001L19 19.0002L19 17.0002L12.0001 17.0001L12 6.8283L15.9498 10.778L17.364 9.36381L11 2.99985L4.63605 9.36381L6.05026 10.778L10 6.82825L10.0001 19.0001Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
