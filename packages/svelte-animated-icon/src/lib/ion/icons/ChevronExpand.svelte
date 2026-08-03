<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M136 208L256 104L376 208" stroke="currentColor" fill="none" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/><path d="M136 304L256 408L376 304" stroke="currentColor" fill="none" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		filled: `<g fill="currentColor"><path d="M136 208L256 104L376 208" fill="none" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/><path d="M136 304L256 408L376 304" fill="none" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
