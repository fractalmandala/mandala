<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M4.5 4.5L19.5 19.5M19.5 19.5V8.25M19.5 19.5H8.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.96967 3.96967C4.26256 3.67678 4.73744 3.67678 5.03033 3.96967L18.75 17.6893V8.25C18.75 7.83579 19.0858 7.5 19.5 7.5C19.9142 7.5 20.25 7.83579 20.25 8.25V19.5C20.25 19.9142 19.9142 20.25 19.5 20.25H8.25C7.83579 20.25 7.5 19.9142 7.5 19.5C7.5 19.0858 7.83579 18.75 8.25 18.75H17.6893L3.96967 5.03033C3.67678 4.73744 3.67678 4.26256 3.96967 3.96967Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
