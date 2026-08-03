<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 14 6-6H4l6 6Zm0 0v6m-3.00004 0H13m.0354-12C13.0121 7.8367 13 7.66976 13 7.5 13 5.567 14.567 4 16.5 4S20 5.567 20 7.5 18.433 11 16.5 11c-.9537 0-1.8183-.3814-2.4495-1"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" fill-rule="evenodd" d="M4.00003 7h8.02747c.2487-2.24998 2.1562-4 4.4725-4C18.9853 3 21 5.01472 21 7.5S18.9853 12 16.5 12c-.8801 0-1.702-.2533-2.3956-.6902L11 14.4142V19h2c.5523 0 1 .4477 1 1s-.4477 1-1 1H6.99999c-.55228 0-1-.4477-1-1s.44772-1 1-1h2.00004v-4.5858L3.29292 8.70711c-.286-.286-.37155-.71612-.21677-1.08979C3.23093 7.24364 3.59557 7 4.00003 7ZM16 7h-1.95c.2316-1.14112 1.2405-2 2.45-2C17.8807 5 19 6.11929 19 7.5S17.8807 10 16.5 10c-.3228 0-.6308-.06086-.9138-.17198l1.1209-1.12091c.286-.286.3716-.71612.2168-1.08979C16.7691 7.24364 16.4045 7 16 7Z" clip-rule="evenodd"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
