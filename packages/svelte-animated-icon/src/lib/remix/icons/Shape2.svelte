<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M2 2H7V7H2V2ZM2 17H7V22H2V17ZM17 2H22V7H17V2ZM17 17H22V22H17V17ZM8 4H16V6H8V4ZM4 8H6V16H4V8ZM18 8H20V16H18V8ZM8 18H16V20H8V18Z"/></g>`,
		line: `<g fill="currentColor"><path d="M20 16H22V22H16V20H8V22H2V16H4V8H2V2H8V4H16V2H22V8H20V16ZM18 16V8H16V6H8V8H6V16H8V18H16V16H18ZM4 4V6H6V4H4ZM4 18V20H6V18H4ZM18 4V6H20V4H18ZM18 18V20H20V18H18Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
