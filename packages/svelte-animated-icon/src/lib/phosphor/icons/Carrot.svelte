<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="224" y1="32" x2="183.6" y2="72.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M43.81,223A8,8,0,0,1,33,212.19S64,112,104.4,72.4a56,56,0,0,1,79.2,79.2C144,192,43.81,223,43.81,223Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="232" y1="72" x2="183.19" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="184" y1="72.81" x2="184" y2="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="112" y1="152" x2="141.7" y2="181.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104.4" y1="72.4" x2="144" y2="112" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="224" y1="32" x2="183.6" y2="72.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><path d="M43.81,223A8,8,0,0,1,33,212.19S64,112,104.4,72.4a56,56,0,0,1,79.2,79.2C144,192,43.81,223,43.81,223Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="232" y1="72" x2="183.19" y2="72" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="184" y1="72.81" x2="184" y2="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="112" y1="152" x2="141.7" y2="181.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="104.4" y1="72.4" x2="144" y2="112" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M232,80H199.44a64,64,0,0,1-10.19,77.26c-8.52,8.69-19.61,16.92-31.85,24.51a4,4,0,0,1-4.91-.59l-34.84-34.84a8,8,0,0,0-11.49.18,8.23,8.23,0,0,0,.41,11.38l29.88,29.88a4,4,0,0,1-1,6.39C95.74,214.79,53,228.54,46.78,230.48a16,16,0,0,1-21.26-21.26c2.73-8.71,29-90.27,64.86-133.35a4,4,0,0,1,5.9-.26l42.05,42.06a8,8,0,0,0,11.71-.43,8.19,8.19,0,0,0-.6-11.1L108.08,64.78a4,4,0,0,1,.63-6.18,64,64,0,0,1,67.28-2V24a8,8,0,0,1,8.54-8A8.18,8.18,0,0,1,192,24.27V52.69l26.34-26.35a8,8,0,0,1,11.32,11.32L203.31,64h28.42A8.18,8.18,0,0,1,240,71.47,8,8,0,0,1,232,80Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
