<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M13.9999 19.0001L5.00003 19.0002L5 17.0002L11.9999 17.0001L12 9.41405H6.58581L13 2.99985L19.4142 9.41405L14 9.41406L13.9999 19.0001Z"/></g>`,
		line: `<g fill="currentColor"><path d="M13.9999 19.0001L5.00003 19.0002L5 17.0002L11.9999 17.0001L12 6.8283L8.05027 10.778L6.63606 9.36381L13 2.99985L19.364 9.36381L17.9498 10.778L14 6.82825L13.9999 19.0001Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
