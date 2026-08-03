<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import './switch.sass';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = Omit<HTMLButtonAttributes, 'onchange'> & { checked?: boolean; disabled?: boolean; label?: string; ariaLabel?: string; onchange?: (checked: boolean) => void };
	let { checked = $bindable(false), disabled = false, label, ariaLabel, onchange, id = `switch-${Math.random().toString(36).slice(2)}`, ...rest }: Props = $props();
	const reduce = useReducedMotion();
	let pressed = $state(false);
	function toggle() { if (!disabled) { checked = !checked; onchange?.(checked); } }
</script>

<span data-slot="switch-root" data-disabled={disabled}>
	<button {...rest} {id} type="button" data-slot="switch" data-state={checked ? 'checked' : 'unchecked'} role="switch" aria-checked={checked} aria-label={ariaLabel} {disabled} onclick={toggle} onpointerdown={() => pressed = true} onpointerup={() => pressed = false} onpointerleave={() => pressed = false}>
		<motion.span data-slot="switch-thumb" animate={{ x: checked ? 20 : 0, scale: !$reduce && pressed && !disabled ? 0.9 : 1 }} transition={$reduce ? { duration: 0 } : { type: 'spring', stiffness: 800, damping: 80, mass: 4 }} />
	</button>
	{#if label}<label data-slot="switch-label" for={id}>{label}</label>{/if}
</span>
