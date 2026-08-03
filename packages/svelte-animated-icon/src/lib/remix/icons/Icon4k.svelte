<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM11.5 13.5V12H10.5V9H9V12H7.5V9H6V13.5H9V15H10.5V13.5H11.5ZM18 15L15.75 12L18 9H16.25L14.5 11.25V9H13V15H14.5V12.75L16.25 15H18Z"/></g>`,
		line: `<g fill="currentColor"><path d="M4 5V19H20V5H4ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM11.5 13.5H10.5V15H9V13.5H6V9H7.5V12H9V9H10.5V12H11.5V13.5ZM18 15H16.25L14.5 12.75V15H13V9H14.5V11.25L16.25 9H18L15.75 12L18 15Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
