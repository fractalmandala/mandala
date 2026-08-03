<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M11.9899 7.4994L15.7402 3.74952M15.7402 3.74952L19.4906 7.4994M15.7402 3.74952L15.7402 20.249L4.48926 20.249" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.73828 20.249C3.73828 19.8348 4.07408 19.499 4.48832 19.499L14.9893 19.499L14.9893 5.56007L12.5193 8.02975C12.2263 8.32263 11.7514 8.32261 11.4585 8.0297C11.1657 7.73678 11.1657 7.2619 11.4586 6.96902L15.209 3.21915C15.5019 2.92628 15.9767 2.92628 16.2696 3.21915L20.02 6.96902C20.3129 7.2619 20.3129 7.73678 20.02 8.0297C19.7271 8.32261 19.2522 8.32263 18.9593 8.02975L16.4893 5.56007L16.4893 20.249C16.4893 20.6632 16.1535 20.999 15.7393 20.999L4.48832 20.999C4.07408 20.999 3.73828 20.6632 3.73828 20.249Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
