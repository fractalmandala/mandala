<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M3.99966 19.0001 3.9998 10.0002 9.58585 10.0002V4.58588L16.0001 11.0001 9.58585 17.4143V12.0002L5.99977 12.0002 5.99966 19.0001 3.99966 19.0001ZM13.8363 6.05023 15.2505 4.63601 21.6144 11 15.2505 17.3639 13.8363 15.9497 18.786 11 13.8363 6.05023Z"/></g>`,
		line: `<g fill="currentColor"><path d="M4.00001 10.0003L3.99988 19.0001L5.99988 19.0002L5.99998 12.0002L12.1718 12.0002L8.22209 15.9499L9.63631 17.3641L16.0003 11.0001L9.63631 4.63617L8.22209 6.05038L12.1719 10.0002L4.00001 10.0003ZM15.2504 4.63617L13.8362 6.05038L18.786 11.0001L13.8362 15.9499L15.2504 17.3641L21.6144 11.0001L15.2504 4.63617Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
