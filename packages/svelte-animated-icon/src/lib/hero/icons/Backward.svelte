<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M21 16.8115C21 17.6753 20.0668 18.2169 19.3169 17.7883L12.2094 13.7269C11.4536 13.295 11.4536 12.2052 12.2094 11.7733L19.3169 7.7119C20.0668 7.28334 21 7.82487 21 8.68867V16.8115Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.25 16.8115C11.25 17.6753 10.3168 18.2169 9.56685 17.7883L2.45936 13.7269C1.70357 13.295 1.70357 12.2052 2.45936 11.7733L9.56685 7.7119C10.3168 7.28334 11.25 7.82487 11.25 8.68867L11.25 16.8115Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path d="M9.19475 18.4394C10.4447 19.1536 12 18.2511 12 16.8114V14.4709L18.9447 18.4394C20.1947 19.1536 21.75 18.2511 21.75 16.8114L21.75 8.68856C21.75 7.24889 20.1947 6.34633 18.9447 7.06061L12 11.029V8.68856C12 7.24889 10.4447 6.34633 9.19475 7.06061L2.08726 11.122C0.827605 11.8418 0.827603 13.6581 2.08726 14.3779L9.19475 18.4394Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
