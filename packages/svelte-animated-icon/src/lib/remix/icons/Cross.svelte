<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M14 2H10V8H4V12H10V22H14V12H20V8H14V2Z"/></g>`,
		line: `<g fill="currentColor"><path d="M9 2H15V7H20V13H15V22H9V13H4V7H9V2ZM11 4V9H6V11H11V20H13V11H18V9H13V4H11Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
