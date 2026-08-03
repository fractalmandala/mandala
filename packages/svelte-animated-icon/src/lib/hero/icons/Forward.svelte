<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M3 8.68867C3 7.82487 3.93317 7.28334 4.68316 7.7119L11.7906 11.7733C12.5464 12.2052 12.5464 13.295 11.7906 13.7269L4.68316 17.7883C3.93317 18.2169 3 17.6753 3 16.8115V8.68867Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.75 8.68867C12.75 7.82487 13.6832 7.28334 14.4332 7.7119L21.5406 11.7733C22.2964 12.2052 22.2964 13.295 21.5406 13.7269L14.4332 17.7883C13.6832 18.2169 12.75 17.6753 12.75 16.8115V8.68867Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path d="M5.05526 7.06061C3.80528 6.34633 2.25 7.24889 2.25 8.68856V16.8114C2.25 18.2511 3.80528 19.1536 5.05526 18.4394L12 14.4709V16.8114C12 18.2511 13.5553 19.1536 14.8053 18.4394L21.9128 14.3779C23.1724 13.6581 23.1724 11.8418 21.9128 11.122L14.8053 7.06061C13.5553 6.34633 12 7.24889 12 8.68856V11.029L5.05526 7.06061Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
