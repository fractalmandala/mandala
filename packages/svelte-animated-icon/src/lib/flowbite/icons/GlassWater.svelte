<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.31531 7c1.41852 0 1.41852 1.5 2.83703 1.5C10.5709 8.5 10.5709 7 11.9894 7s1.4185 1.5 2.837 1.5S17.6635 7 17.6635 7M6 3l1.07554 16.133C7.14558 20.1836 8.01818 21 9.07111 21h5.85779c1.0529 0 1.9255-.8164 1.9956-1.867L18 3H6Z"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" fill-rule="evenodd" d="M6 2c-.27677 0-.54116.11471-.73024.31682-.18909.20211-.28595.47354-.26754.7497L6.07775 19.1996C6.18281 20.7755 7.49172 22 9.07111 22h5.85779c1.5794 0 2.8883-1.2246 2.9934-2.8004l1.0755-16.13308c.0184-.27616-.0785-.54759-.2676-.7497C18.5412 2.11471 18.2768 2 18 2H6Zm1.2124 4.15264L7.06889 4h9.86221l-.1651 2.47714-.0179.0163c-.133.12056-.3226.28077-.5474.43924-.4853.34209-.9823.56732-1.3743.56732-.2473 0-.3394-.06433-.6919-.4371l-.0272-.02876C13.7466 6.65192 13.1314 6 11.9894 6c-1.1421 0-1.7573.65192-2.11794 1.03414l-.02716.02876c-.35252.37277-.44468.4371-.69195.4371-.24728 0-.33944-.06433-.69196-.4371l-.02716-.02876c-.25189-.26693-.62791-.66541-1.22083-.8815Z" clip-rule="evenodd"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
