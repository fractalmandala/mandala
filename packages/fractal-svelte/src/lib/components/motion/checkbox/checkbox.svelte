<script lang="ts">
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import './checkbox.sass';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = Omit<HTMLButtonAttributes, 'onchange'> & { checked?: boolean; indeterminate?: boolean; label?: string; onchange?: (checked: boolean) => void };
	let { checked = $bindable(false), indeterminate = false, disabled = false, label, onchange, id = `checkbox-${Math.random().toString(36).slice(2)}`, ...rest }: Props = $props();
	const reduce = useReducedMotion();
	function toggle() { if (!disabled) { checked = !checked; onchange?.(checked); } }
</script>

<label data-slot="checkbox" for={id} data-disabled={disabled}>
	<button {...rest} {id} type="button" data-slot="checkbox-box" role="checkbox" aria-checked={indeterminate ? 'mixed' : checked} {disabled} data-state={indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked'} onclick={toggle}>
		{#if checked || indeterminate}
			<svg data-slot="checkbox-icon" viewBox="0 0 24 24" aria-hidden="true"><path class:reduced={$reduce} d={indeterminate ? 'M6 12h12' : 'M5 13l4 4L19 7'} /></svg>
		{/if}
	</button>
	{#if label}<span data-slot="checkbox-label">{label}</span>{/if}
</label>
