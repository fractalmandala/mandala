<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="128" y1="176" x2="128" y2="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="32" x2="152" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M24,116A52,52,0,0,1,76,64c28.72,0,52,19.28,52,48,0-28.72,23.28-48,52-48a52,52,0,0,1,52,52c0,52-48,68-48,68v24a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V184S24,168,24,116Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="128" y1="176" x2="128" y2="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="104" y1="32" x2="152" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M24,116A52,52,0,0,1,76,64c28.72,0,52,19.28,52,48,0-28.72,23.28-48,52-48a52,52,0,0,1,52,52c0,52-48,68-48,68v24a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V184S24,168,24,116Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M128,83.22a53.86,53.86,0,0,0-8-10.06V40H104a8,8,0,0,1,0-16h16V8a8,8,0,0,1,16,0V24h16a8,8,0,0,1,0,16H136V73.16A53.86,53.86,0,0,0,128,83.22ZM180,56c-17.74,0-33.21,6.48-44,17.16V176a8,8,0,0,1-16,0V73.16C109.21,62.48,93.74,56,76,56a60.07,60.07,0,0,0-60,60c0,29.86,14.54,48.85,26.73,59.52A90.48,90.48,0,0,0,64,189.34V208a16,16,0,0,0,16,16h96a16,16,0,0,0,16-16V189.34a90.48,90.48,0,0,0,21.27-13.82C225.46,164.85,240,145.86,240,116A60.07,60.07,0,0,0,180,56Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
