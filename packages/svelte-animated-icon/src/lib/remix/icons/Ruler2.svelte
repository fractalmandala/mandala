<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M15 21H13V18H11V21H9V19H7V21H4C3.44772 21 3 20.5523 3 20V17H5V15H3V13H6V11H3V9H5V7H3V4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4V13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H17V19H15V21Z"/></g>`,
		line: `<g fill="currentColor"><path d="M17 19H19V14H10V5H5V7H7V9H5V11H8V13H5V15H7V17H5V19H7V17H9V19H11V16H13V19H15V17H17V19ZM12 12H20C20.5523 12 21 12.4477 21 13V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H11C11.5523 3 12 3.44772 12 4V12Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
