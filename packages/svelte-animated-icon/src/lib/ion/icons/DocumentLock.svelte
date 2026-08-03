<script lang="ts">
	import AnimatedIcon from '../../core/AnimatedIcon.svelte';

	const VARIANTS: Record<string, string> = {
		outline: `<g fill="currentColor"><path d="M288,304V286c0-16.63-14.26-30-32-30s-32,13.37-32,30v18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M304,416H208a32,32,0,0,1-32-32V336a32,32,0,0,1,32-32h96a32,32,0,0,1,32,32v48A32,32,0,0,1,304,416Z"/><path d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><path d="M256,50.88V176a32,32,0,0,0,32,32H413.12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></g>`,
		filled: `<g fill="currentColor"><path d="M288,192H417.81a2,2,0,0,0,1.41-3.41L275.41,44.78A2,2,0,0,0,272,46.19V176A16,16,0,0,0,288,192Z"/><path d="M256,272c-8.82,0-16,6.28-16,14v18h32V286C272,278.28,264.82,272,256,272Z"/><path d="M428,224H288a48,48,0,0,1-48-48V36a4,4,0,0,0-4-4H144A64,64,0,0,0,80,96V416a64,64,0,0,0,64,64H368a64,64,0,0,0,64-64V228A4,4,0,0,0,428,224ZM336,384a32,32,0,0,1-32,32H208a32,32,0,0,1-32-32V336a32,32,0,0,1,32-32V286c0-25.36,21.53-46,48-46s48,20.64,48,46v18a32,32,0,0,1,32,32Z"/></g>`
	};

	interface Props {
		variant?: string;
		[key: string]: unknown;
	}

	let { variant = 'outline', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant] ?? VARIANTS['outline']} viewBox="0 0 512 512" {...rest} />
