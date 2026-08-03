<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M87,35.3A80,80,0,0,1,208,104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M160,216c-8.07,9.77-18.34,16-32,16a44,44,0,0,1-44-44c0-41.49-36-28-36-84A79.63,79.63,0,0,1,63.34,56.88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M91.43,87.77A39.76,39.76,0,0,0,88,104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M164,120a34,34,0,0,0,4-16,40,40,0,0,0-53-37.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M169.07,173.18A16,16,0,0,1,144,160a33.16,33.16,0,0,1,2.2-12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="48" y1="40" x2="208" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M87,35.3A80,80,0,0,1,208,104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M160,216c-8.07,9.77-18.34,16-32,16a44,44,0,0,1-44-44c0-41.49-36-28-36-84A79.63,79.63,0,0,1,63.34,56.88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M91.43,87.77A39.76,39.76,0,0,0,88,104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M164,120a34,34,0,0,0,4-16,40,40,0,0,0-53-37.85" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M169.07,173.18A16,16,0,0,1,144,160a33.16,33.16,0,0,1,2.2-12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M213.92,210.62a8,8,0,1,1-11.84,10.76L191.8,210.07a103.18,103.18,0,0,0,11.83-10.77ZM64.2,45.93,53.92,34.62A8,8,0,1,0,42.08,45.38L52.37,56.7A103.18,103.18,0,0,1,64.2,45.93ZM203.63,199.3,64.2,45.93A103.94,103.94,0,0,1,203.63,199.3ZM159,104a32,32,0,0,0-20.08-22.09,8,8,0,0,0-5.45,15,16,16,0,0,1,10,11,8,8,0,0,0,7.74,6,7.68,7.68,0,0,0,2-.26A8,8,0,0,0,159,104Zm33,8a64,64,0,0,0-85.89-60.16,8,8,0,0,0,5.47,15A48,48,0,0,1,176,112a8,8,0,0,0,16,0Zm-44,56a20,20,0,0,1-20-20,24.11,24.11,0,0,1,1-7l-20.45-22.5A7.91,7.91,0,0,1,104,120a8,8,0,0,1-8-8,32,32,0,0,1,.68-6.56L84.39,91.92A47.59,47.59,0,0,0,80,112c0,11.9,6.71,20.5,13.82,29.6,7,8.92,14.18,18.15,14.18,30.4a20,20,0,0,0,34,14.29,8,8,0,1,1,11.19,11.42A36,36,0,0,1,92,172c0-6.74-5-13.14-10.79-20.55C73.54,141.63,64,129.41,64,112a63.5,63.5,0,0,1,9-32.66L52.37,56.7A103.94,103.94,0,0,0,191.8,210.07L153,167.37A19.82,19.82,0,0,1,148,168Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
