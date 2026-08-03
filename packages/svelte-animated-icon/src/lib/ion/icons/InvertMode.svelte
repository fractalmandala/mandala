<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" cx="256" cy="256" r="208"/><path d="M256,176V336a80,80,0,0,1,0-160Z"/><path d="M256,48V176a80,80,0,0,1,0,160V464c114.88,0,208-93.12,208-208S370.88,48,256,48Z"/></g>`,
		filled: `<g fill="currentColor"><circle fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" cx="256" cy="256" r="208"/><path d="M256,176V336a80,80,0,0,0,0-160Z"/><path d="M256,48V176a80,80,0,0,0,0,160V464C141.12,464,48,370.88,48,256S141.12,48,256,48Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
