<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		filled: `<g fill="currentColor"><path d="M198.626 28.4235L8.00006 484.424H122.376L256 164.779L389.624 484.424H504L313.374 28.4235H198.626Z" />
<path d="M312 346.039C312 376.967 286.928 402.039 256 402.039C225.072 402.039 200 376.967 200 346.039C200 315.111 225.072 290.039 256 290.039C286.928 290.039 312 315.111 312 346.039Z" /></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'filled', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['filled']} viewBox="0 0 512 512" {...rest} />
