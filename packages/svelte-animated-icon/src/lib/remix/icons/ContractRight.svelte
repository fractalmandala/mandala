<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M8.99988 4.99976L16.0002 12L8.99988 18.9998V12.9998L2.9999 13.0001L2.99988 11.0001L8.99988 10.9998V4.99976ZM17.9999 18.9999L18 4.99993H20L19.9999 18.9999H17.9999Z"/></g>`,
		line: `<g fill="currentColor"><path d="M12.1715 11L7.51457 6.34311L8.92878 4.92889L15.9999 12L8.92878 19.071L7.51457 17.6568L12.1714 13L2.9996 13.0001L2.99957 11.0001L12.1715 11ZM17.9996 18.9999L17.9996 4.99991H19.9996L19.9996 18.9999H17.9996Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
