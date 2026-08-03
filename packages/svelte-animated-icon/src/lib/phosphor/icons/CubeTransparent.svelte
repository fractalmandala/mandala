<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		regular: `<g fill="currentColor"><line x1="160" y1="40" x2="216" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="40" y1="40" x2="96" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="40" y1="160" x2="96" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="160" y1="160" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></g>`,
		light: `<g fill="currentColor"><line x1="160" y1="40" x2="216" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="40" y1="40" x2="96" y2="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="40" y1="160" x2="96" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/><line x1="160" y1="160" x2="216" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/></g>`,
		fill: `<g fill="currentColor"><path d="M104,152V104h48v48ZM32,53v95a4,4,0,0,0,4,4H88V99.31L38.83,50.14A4,4,0,0,0,32,53Zm188,51H168v52.69l49.17,49.17A4,4,0,0,0,224,203V108A4,4,0,0,0,220,104ZM152,36a4,4,0,0,0-4-4H53a4,4,0,0,0-2.83,6.83L99.31,88H152Zm60.49,45.17L174.83,43.51A4,4,0,0,0,168,46.34V88h41.66A4,4,0,0,0,212.49,81.17ZM156.69,168H104v52a4,4,0,0,0,4,4h95a4,4,0,0,0,2.83-6.83ZM43.51,174.83l37.66,37.66A4,4,0,0,0,88,209.66V168H46.34A4,4,0,0,0,43.51,174.83Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['regular']} viewBox="0 0 256 256" {...rest} />
