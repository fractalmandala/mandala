<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12c0 4.9706-4.0294 9-9 9m9-9c0-4.97056-4.0294-9-9-9m9 9h-5m-4 9c-4.97056 0-9-4.0294-9-9m9 9v-5m-9-4c0-4.97056 4.02944-9 9-9m-9 9h5m4-9v5M8 3.93552V8m0 0v4m0-4H3.93552M8 8h4m-4 4v4m0-4h4m-4 4v4.0645M8 16H3.93552M8 16h4m0-8v4m0-4h4m-4 4v4m0-4h4m-4 4h4m0-12.06448V8m0 0v4m0-4h4.0645M16 12v4m0 0v4.0645M16 16h4.0645"/></g>`,
		solid: `<g fill="none"><path fill="currentColor" d="M10.9999 2.04938c-.6896.06847-1.35872.20702-1.99996.40842V7h1.99996V2.04938ZM6.99994 3.33782C5.4818 4.21602 4.21596 5.48186 3.33776 7h3.66218V3.33782ZM2.45774 9c-.2014.64124-.33995 1.3103-.40842 2h4.95062V9h-4.5422Zm-.40842 4c.06847.6897.20702 1.3588.40842 2h4.5422v-2H2.04932Zm1.28844 4c.8782 1.5181 2.14404 2.784 3.66218 3.6622V17H3.33776Zm5.66218 4.5422c.64124.2014 1.31036.34 1.99996.4084V17H8.99994v4.5422Zm3.99996.4084c.6897-.0684 1.3588-.207 2-.4084V17h-2v4.9506Zm4-1.2884c1.5182-.8782 2.784-2.1441 3.6622-3.6622h-3.6622v3.6622ZM21.5421 15c.2014-.6412.34-1.3103.4085-2h-4.9507v2h4.5422Zm.4085-4c-.0685-.6897-.2071-1.35876-.4085-2h-4.5422v2h4.9507Zm-1.2885-4c-.8782-1.51814-2.144-2.78398-3.6622-3.66218V7h3.6622Zm-5.6622-4.5422c-.6412-.2014-1.3103-.33995-2-.40842V7h2V2.4578ZM8.99994 9h1.99996v2H8.99994V9Zm0 4h1.99996v2H8.99994v-2Zm3.99996 0v2h2v-2h-2Zm0-2h2V9h-2v2Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
