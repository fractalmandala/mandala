<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		fill: `<g fill="currentColor"><path d="M17 16H13L18 22L23 16H19V11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11V20H5V11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11V16Z"/></g>`,
		line: `<g fill="currentColor"><path d="M17.0004 18.1716L14.4649 15.636L13.0507 17.0503L18.0004 22L22.9502 17.0503L21.536 15.636L19.0004 18.1716V11C19.0004 6.58172 15.4187 3 11.0004 3C6.58215 3 3.00043 6.58172 3.00043 11V20H5.00043V11C5.00043 7.68629 7.68672 5 11.0004 5C14.3141 5 17.0004 7.68629 17.0004 11V18.1716Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'line', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['line']} viewBox="0 0 24 24" {...rest} />
