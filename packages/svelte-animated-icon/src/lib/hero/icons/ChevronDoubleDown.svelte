<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M4.5 5.25L12 12.75L19.5 5.25M4.5 11.25L12 18.75L19.5 11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.4697 13.2803C11.7626 13.5732 12.2374 13.5732 12.5303 13.2803L20.0303 5.78033C20.3232 5.48744 20.3232 5.01256 20.0303 4.71967C19.7374 4.42678 19.2626 4.42678 18.9697 4.71967L12 11.6893L5.03033 4.71967C4.73744 4.42678 4.26256 4.42678 3.96967 4.71967C3.67678 5.01256 3.67678 5.48744 3.96967 5.78033L11.4697 13.2803Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.4697 19.2803C11.7626 19.5732 12.2374 19.5732 12.5303 19.2803L20.0303 11.7803C20.3232 11.4874 20.3232 11.0126 20.0303 10.7197C19.7374 10.4268 19.2626 10.4268 18.9697 10.7197L12 17.6893L5.03033 10.7197C4.73744 10.4268 4.26256 10.4268 3.96967 10.7197C3.67678 11.0126 3.67678 11.4874 3.96967 11.7803L11.4697 19.2803Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
