<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M16.4899 11.9996L20.2397 15.75M20.2397 15.75L16.4899 19.5004M20.2397 15.75H3.74023V4.49902" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.73927 3.74902C4.15349 3.74902 4.48928 4.08483 4.48928 4.49906V15H18.4282L15.9585 12.53C15.6656 12.2371 15.6657 11.7622 15.9586 11.4693C16.2515 11.1764 16.7264 11.1764 17.0193 11.4693L20.7691 15.2197C21.062 15.5126 21.062 15.9875 20.7691 16.2804L17.0193 20.0307C16.7264 20.3236 16.2515 20.3237 15.9586 20.0308C15.6657 19.7379 15.6656 19.263 15.9585 18.9701L18.4282 16.5001H3.73927C3.32505 16.5001 2.98926 16.1643 2.98926 15.75V4.49906C2.98926 4.08483 3.32505 3.74902 3.73927 3.74902Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
