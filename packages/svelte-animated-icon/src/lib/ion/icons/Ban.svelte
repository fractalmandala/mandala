<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><line x1="108.92" y1="108.92" x2="403.08" y2="403.08" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/></g>`,
		filled: `<g fill="currentColor"><circle fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="48" cx="256" cy="256" r="200"/><line stroke="currentColor" stroke-miterlimit="10" stroke-width="48" x1="114.58" y1="114.58" x2="397.42" y2="397.42"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
