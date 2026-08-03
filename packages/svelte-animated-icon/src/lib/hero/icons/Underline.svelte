<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M17.9953 3.74414V11.2449C17.9953 14.5589 15.3091 17.2454 11.9954 17.2454C8.6818 17.2454 5.99556 14.5589 5.99556 11.2449V3.74414M3.74561 20.2457H20.2453" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.99509 2.99414C6.40931 2.99414 6.74511 3.32994 6.74511 3.74418V11.2449C6.74511 14.1448 9.09561 16.4954 11.995 16.4954C14.8943 16.4954 17.2448 14.1448 17.2448 11.2449V3.74418C17.2448 3.32994 17.5806 2.99414 17.9949 2.99414C18.4091 2.99414 18.7449 3.32994 18.7449 3.74418V11.2449C18.7449 14.9731 15.7229 17.9955 11.995 17.9955C8.26705 17.9955 5.24507 14.9731 5.24507 11.2449V3.74418C5.24507 3.32994 5.58087 2.99414 5.99509 2.99414ZM2.99512 20.2458C2.99512 19.8315 3.33091 19.4957 3.74514 19.4957H20.2448C20.659 19.4957 20.9948 19.8315 20.9948 20.2458C20.9948 20.66 20.659 20.9958 20.2448 20.9958H3.74514C3.33091 20.9958 2.99512 20.66 2.99512 20.2458Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
