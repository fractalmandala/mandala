<script lang="ts">
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import './number.sass';
	type Props = { value: number; pad?: number; duration?: number; stagger?: number; prefix?: string; suffix?: string; blur?: boolean; locale?: boolean; format?: (value: number) => string };
	let { value, pad, duration = 0.9, stagger = 0.04, prefix = '', suffix = '', blur = false, locale = false, format }: Props = $props();
	const reduce = useReducedMotion();
	let text = $derived.by(() => { const rounded = Math.round(value); const formatted = format ? format(rounded) : locale ? rounded.toLocaleString() : rounded.toString(); return pad ? formatted.padStart(pad, '0') : formatted; });
	let readable = $derived(`${prefix}${text}${suffix}`);
</script>

<span data-slot="number-ticker" aria-label={readable}>
	<span aria-hidden="true">{prefix}{#each Array.from(text) as glyph, index}{#if /\d/.test(glyph)}<span data-slot="number-digit"><span data-slot="number-column" class:blur style={`--digit:${Number(glyph)};--digit-duration:${$reduce ? 0 : duration}s;--digit-delay:${$reduce ? 0 : index * stagger}s`}>{#each [0,1,2,3,4,5,6,7,8,9] as digit}<span>{digit}</span>{/each}</span></span>{:else}<span>{glyph}</span>{/if}{/each}{suffix}</span>
</span>
