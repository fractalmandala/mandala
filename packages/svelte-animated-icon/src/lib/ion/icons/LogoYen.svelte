<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		filled: `<g fill="currentColor"><path d="M448,32H368L256,253.13,144,32H64L176.37,240H128v48h73.56L216,319v17H128v48h88v96h80V384h88V336H296V319l14.89-31H384V240H335.71Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'filled', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['filled']} viewBox="0 0 512 512" {...rest} />
