<script lang="ts">
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { untrack } from 'svelte';
	import './number.sass';
	type Props = { value: number; duration?: number; prefix?: string; suffix?: string; decimals?: number; format?: (value: number) => string; startOnView?: boolean };
	let { value, duration = 1.2, prefix = '', suffix = '', decimals = 0, format, startOnView = false }: Props = $props();
	const reduce = useReducedMotion();
	let display = $state(0);
	let node: HTMLSpanElement;
	let visible = $state(untrack(() => !startOnView));
	$effect(() => { if (!startOnView || !node || typeof IntersectionObserver === 'undefined') { visible = true; return; } const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { visible = true; observer.disconnect(); } }, { threshold: 0.6 }); observer.observe(node); return () => observer.disconnect(); });
	$effect(() => { if (!visible) return; if ($reduce) { display = value; return; } const from = display; const started = performance.now(); let frame = 0; const tick = (now: number) => { const progress = Math.min((now - started) / (duration * 1000), 1); display = from + (value - from) * (1 - Math.pow(1 - progress, 3)); if (progress < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); });
	let rendered = $derived(format ? format(display) : `${prefix}${display.toFixed(decimals)}${suffix}`);
</script>
<span bind:this={node} data-slot="number">{rendered}</span>
