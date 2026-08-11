<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT, SPRING_PRESS } from '$lib/ui/lib/ease.js';
	import { useId } from '$lib/ui/lib/use-id.js';
	import './checkbox.sass';

	const CHECK_PATH = 'M5 13l4 4L19 7';
	const INDETERMINATE_PATH = 'M6 12h12';

	let {
		checked,
		onCheckedChange,
		disabled = false,
		indeterminate = false,
		label,
		class: className,
		id: idProp,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedBy
	}: {
		checked: boolean;
		onCheckedChange: (checked: boolean) => void;
		disabled?: boolean;
		indeterminate?: boolean;
		label?: string;
		class?: string;
		id?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
	} = $props();

	const reduce = useReducedMotion();
	const id = $derived(idProp ?? useId());
	const showMark = $derived(checked || indeterminate);
	const path = $derived(indeterminate ? INDETERMINATE_PATH : CHECK_PATH);
	const state = $derived(checked ? 'checked' : indeterminate ? 'indeterminate' : 'unchecked');

	function toggle() {
		if (!disabled) onCheckedChange(!checked);
	}
</script>

<label for={id} data-slot="checkbox" data-disabled={disabled} class={className}>
	<motion.button
		{id}
		type="button"
		role="checkbox"
		aria-checked={indeterminate ? 'mixed' : checked}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedBy}
		{disabled}
		onclick={toggle}
		whileTap={$reduce || disabled ? undefined : { scale: 0.92 }}
		transition={SPRING_PRESS}
		data-slot="checkbox-control"
		data-state={state}
	>
		<AnimatePresence initial={false}>
			{#if showMark}
				<motion.svg
					key={indeterminate ? 'indeterminate' : 'checked'}
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width={3}
					stroke-linecap="round"
					stroke-linejoin="round"
					initial={$reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
					animate={$reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
					exit={$reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
					transition={$reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
					aria-hidden="true"
				>
					<title>{indeterminate ? 'Partially selected' : 'Selected'}</title>
					<motion.path
						d={path}
						initial={$reduce ? { pathLength: 1 } : { pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={
							$reduce
								? { duration: 0 }
								: { duration: indeterminate ? 0.2 : 0.3, ease: EASE_OUT, delay: 0.04 }
						}
					/>
				</motion.svg>
			{/if}
		</AnimatePresence>
	</motion.button>
	{#if label}
		<span data-slot="checkbox-label" data-disabled={disabled}>{label}</span>
	{/if}
</label>
