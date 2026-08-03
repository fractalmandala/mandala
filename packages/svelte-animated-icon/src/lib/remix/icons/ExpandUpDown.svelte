<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M18 9 12 3 6 9H18ZM18 15 12 21 6 15H18Z"/></g>`,
		line: `<g fill="currentColor"><path d="M18.2072 9.0428 12.0001 2.83569 5.79297 9.0428 7.20718 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79282 14.9572 11.9999 21.1643 18.207 14.9572 16.7928 13.543 11.9999 18.3359 7.20703 13.543 5.79282 14.9572Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
