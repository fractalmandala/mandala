<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="96" y1="56" x2="96" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="160" y1="56" x2="160" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="32" y1="104" x2="224" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="32" y1="152" x2="224" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="96" y1="56" x2="96" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="160" y1="56" x2="160" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="32" y1="104" x2="224" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="32" y1="152" x2="224" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M84,52V92H28a4,4,0,0,1-4-4V64A16,16,0,0,1,40,48H80A4,4,0,0,1,84,52Zm16,152a4,4,0,0,0,4,4h48a4,4,0,0,0,4-4V164H100ZM24,168v24a16,16,0,0,0,16,16H80a4,4,0,0,0,4-4V164H28A4,4,0,0,0,24,168Zm0-56v32a4,4,0,0,0,4,4H84V108H28A4,4,0,0,0,24,112ZM152,48H104a4,4,0,0,0-4,4V92h56V52A4,4,0,0,0,152,48Zm76,60H172v40h56a4,4,0,0,0,4-4V112A4,4,0,0,0,228,108ZM100,148h56V108H100ZM216,48H176a4,4,0,0,0-4,4V92h56a4,4,0,0,0,4-4V64A16,16,0,0,0,216,48Zm12,116H172v40a4,4,0,0,0,4,4h40a16,16,0,0,0,16-16V168A4,4,0,0,0,228,164Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
