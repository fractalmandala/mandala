<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M15 15L21 9M21 9L15 3M21 9H9C5.68629 9 3 11.6863 3 15C3 18.3137 5.68629 21 9 21H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.4697 2.46967C14.7626 2.17678 15.2374 2.17678 15.5303 2.46967L21.5303 8.46967C21.8232 8.76256 21.8232 9.23744 21.5303 9.53033L15.5303 15.5303C15.2374 15.8232 14.7626 15.8232 14.4697 15.5303C14.1768 15.2374 14.1768 14.7626 14.4697 14.4697L19.1893 9.75H9C6.10051 9.75 3.75 12.1005 3.75 15C3.75 17.8995 6.10051 20.25 9 20.25H12C12.4142 20.25 12.75 20.5858 12.75 21C12.75 21.4142 12.4142 21.75 12 21.75H9C5.27208 21.75 2.25 18.7279 2.25 15C2.25 11.2721 5.27208 8.25 9 8.25H19.1893L14.4697 3.53033C14.1768 3.23744 14.1768 2.76256 14.4697 2.46967Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
