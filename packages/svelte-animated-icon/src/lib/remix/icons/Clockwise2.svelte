<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M10 4V1L15 5L10 9V6H8C6.34315 6 5 7.34315 5 9V13H3V9C3 6.23858 5.23858 4 8 4H10ZM9 11C9 10.4477 9.44772 10 10 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H10C9.44772 22 9 21.5523 9 21V11Z"/></g>`,
		line: `<g fill="currentColor"><path d="M10.5858 4.00003L8.75736 2.1716L10.1716 0.757385L14.4142 5.00003L10.1716 9.24267L8.75736 7.82845L10.5858 6.00003H8C6.34315 6.00003 5 7.34317 5 9.00003V13H3V9.00003C3 6.2386 5.23858 4.00003 8 4.00003H10.5858ZM9 11C9 10.4477 9.44772 10 10 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H10C9.44772 22 9 21.5523 9 21V11ZM11 12V20H19V12H11Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
