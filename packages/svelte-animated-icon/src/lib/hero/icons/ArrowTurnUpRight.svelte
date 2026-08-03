<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="none"><path d="M16.4899 11.9994L20.2397 8.24902M20.2397 8.24902L16.4899 4.49866M20.2397 8.24902L3.74023 8.24902L3.74023 19.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		solid: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.73927 20.25C4.15349 20.25 4.48928 19.9142 4.48928 19.5L4.48928 8.99902L18.4282 8.99902L15.9585 11.469C15.6656 11.7619 15.6657 12.2368 15.9586 12.5297C16.2515 12.8226 16.7264 12.8226 17.0193 12.5297L20.7691 8.77932C21.062 8.48642 21.062 8.01156 20.7691 7.71866L17.0193 3.9683C16.7264 3.67538 16.2515 3.67535 15.9586 3.96825C15.6657 4.26114 15.6656 4.73603 15.9585 5.02896L18.4282 7.49895L3.73927 7.49895C3.32505 7.49895 2.98926 7.83476 2.98926 8.24899L2.98926 19.5C2.98926 19.9142 3.32505 20.25 3.73927 20.25Z" fill="black"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 24 24" {...rest} />
