<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 8.00003c0-.82843.5-2 2-2m-2 2V10.5c0 .8285-.67157 1.5-1.5 1.5S7 11.3285 7 10.5V7.50003m3 .5-3-.5m5-1.5c1.5 0 2 1.17157 2 2m-2-2v-3m-5 4.5c0-2.48528 2.51472-4.5 5-4.5m0 0c2.4853 0 5 2.01472 5 4.5V19.5c0 .8285-.6716 1.5-1.5 1.5s-1.5-.6715-1.5-1.5V8.00003m0 0h3M14 12h3m-3 4h3"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" d="m11 9.16318-5-.8017V10.5C6 11.8807 7.11929 13 8.5 13s2.5-1.1193 2.5-2.5V9.16318ZM6.1404 6.35844 11 7.13764V2.08771c-1.14494.19988-2.22828.73028-3.08702 1.47474-.83378.72283-1.49585 1.68517-1.77258 2.79599ZM13 2.08771v4.91232h4.9734c-.1477-1.38214-.8959-2.57887-1.8864-3.43758-.8587-.74446-1.9421-1.27485-3.087-1.47474Zm5 6.91232h-5V11h5V9.00003ZM18 13h-5v2h5v-2Zm0 4h-5v2.5c0 1.3807 1.1193 2.5 2.5 2.5s2.5-1.1193 2.5-2.5V17Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
