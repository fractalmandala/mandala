<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M21.7519 15.0021C20.597 15.484 19.3296 15.7501 18 15.7501C12.6152 15.7501 8.25 11.3849 8.25 6.00011C8.25 4.67052 8.51614 3.40308 8.99806 2.24817C5.47566 3.71798 3 7.19493 3 11.2501C3 16.6349 7.36522 21.0001 12.75 21.0001C16.8052 21.0001 20.2821 18.5245 21.7519 15.0021Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.52839 1.71786C9.74339 1.93286 9.80731 2.2564 9.69021 2.53701C9.2458 3.60204 9 4.77143 9 6.00013C9 10.9707 13.0294 15.0001 18 15.0001C19.2287 15.0001 20.3981 14.7543 21.4631 14.3099C21.7437 14.1928 22.0673 14.2567 22.2823 14.4717C22.4973 14.6867 22.5612 15.0103 22.4441 15.2909C20.8618 19.0828 17.1183 21.7501 12.75 21.7501C6.95101 21.7501 2.25 17.0491 2.25 11.2501C2.25 6.88184 4.91735 3.13829 8.70924 1.55603C8.98985 1.43894 9.31338 1.50286 9.52839 1.71786Z" fill="currentColor"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
