<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M6 3H13C16.3137 3 19 5.68629 19 9C19 12.3137 16.3137 15 13 15H10V21H6V3ZM10 7V11H13C14.1046 11 15 10.1046 15 9C15 7.89543 14.1046 7 13 7H10Z"/></g>`,
		line: `<g fill="currentColor"><path d="M6 3H13C16.3137 3 19 5.68629 19 9C19 12.3137 16.3137 15 13 15H8V21H6V3ZM8 5V13H13C15.2091 13 17 11.2091 17 9C17 6.79086 15.2091 5 13 5H8Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
