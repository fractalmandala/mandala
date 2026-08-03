<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M20.0003 19.0001 20.0002 10.0002 14.4141 10.0002V4.58588L7.99994 11.0001 14.4141 17.4143V12.0002L18.0002 12.0002 18.0003 19.0001 20.0003 19.0001ZM10.1637 6.05023 8.74951 4.63601 2.38554 11 8.7495 17.3639 10.1637 15.9497 5.21397 11 10.1637 6.05023Z"/></g>`,
		line: `<g fill="currentColor"><path d="M20 10.0003L20.0001 19.0001L18.0001 19.0002L18 12.0002L11.8282 12.0002L15.7779 15.9499L14.3637 17.3641L7.99973 11.0001L14.3637 4.63617L15.7779 6.05038L11.8281 10.0002L20 10.0003ZM8.74955 4.63617L10.1638 6.05038L5.21402 11.0001L10.1638 15.9499L8.74955 17.3641L2.38559 11.0001L8.74955 4.63617Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
