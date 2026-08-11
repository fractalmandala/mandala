<script lang="ts">
	import { AnimatePresence, animate, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { untrack } from 'svelte';
	import { useId } from '$lib/ui/lib/use-id.js';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import './input.sass';

	type InputClassNames = {
		root?: string;
		label?: string;
		field?: string;
		input?: string;
		leftIcon?: string;
		rightIcon?: string;
		successIcon?: string;
		errorMessage?: string;
	};

	type Props = Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'onChange'> & {
		label?: string;
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		/** Truthy error triggers a shake, red border and (if a string) a message. */
		error?: string | boolean;
		success?: boolean;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
		class?: string;
		classNames?: InputClassNames;
	};

	let {
		label,
		value: valueProp,
		defaultValue = '',
		onChange,
		oninput,
		onfocus,
		onblur,
		error = false,
		success = false,
		leftIcon,
		rightIcon,
		class: className,
		classNames,
		disabled = false,
		id: idProp,
		type = 'text',
		...rest
	}: Props = $props();

	const reduce = useReducedMotion();

	let internal = $state(untrack(() => defaultValue));
	let focused = $state(false);
	const controlled = $derived(valueProp !== undefined);
	const value = $derived(controlled ? valueProp : internal);
	let fieldRef: HTMLDivElement | null = null;
	const id = $derived(idProp ?? useId());

	const hasError = $derived(Boolean(error));
	const errorMessage = $derived(typeof error === 'string' ? error : null);

	// Right edge shows the success check, otherwise the caller's right icon.
	const rightSlot = $derived(success ? null : rightIcon);
	// fieldState (not `state`): svelte2tsx treats $state calls as store
	// accesses, and a variable named `state` then shadows the rune shim.
	const fieldState = $derived(hasError ? 'error' : success ? 'success' : focused ? 'focused' : 'idle');

	// Shake the field when an error appears.
	$effect(() => {
		if (!fieldRef || $reduce || !hasError) return;
		animate(fieldRef, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.45 });
	});

	// Svelte event props widen currentTarget; the handler prop expects it typed
	// to the input, so derive the parameter type from the prop.
	type InputHandler = Parameters<NonNullable<typeof oninput>>[0];
	function handleInput(event: InputHandler) {
		const next = event.currentTarget.value;
		if (!controlled) internal = next;
		onChange?.(next);
		oninput?.(event);
	}
</script>

<div data-slot="input" class={`${className ?? ''} ${classNames?.root ?? ''}`.trim()}>
	{#if label}
		<label for={id} data-slot="input-label" class={classNames?.label}>
			{label}
		</label>
	{/if}

	<div bind:this={fieldRef} data-slot="input-field" data-state={fieldState} data-disabled={disabled} class={classNames?.field}>
		{#if leftIcon}
			<span data-slot="input-icon-left" class={classNames?.leftIcon}>
				{@render leftIcon()}
			</span>
		{/if}

		<input
			{...rest}
			{id}
			{type}
			{disabled}
			{value}
			aria-invalid={hasError || undefined}
			aria-describedby={errorMessage ? `${id}-error` : undefined}
			data-icon-left={leftIcon ? true : false}
			data-icon-right={rightSlot || success ? true : false}
			oninput={handleInput}
			onfocus={(event) => {
				focused = true;
				onfocus?.(event);
			}}
			onblur={(event) => {
				focused = false;
				onblur?.(event);
			}}
			data-slot="input-control"
			class={classNames?.input}
		/>

		{#if success}
			<motion.svg
				data-slot="input-success"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				class={classNames?.successIcon}
			>
				<motion.path
					d="M5 12.5l4.5 4.5L19 7.5"
					stroke="currentColor"
					stroke-width={2.5}
					stroke-linecap="round"
					stroke-linejoin="round"
					initial={$reduce ? { pathLength: 1 } : { pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.35, ease: 'easeOut' }}
				/>
			</motion.svg>
		{:else if rightSlot}
			<span data-slot="input-icon-right" class={classNames?.rightIcon}>
				{@render rightSlot()}
			</span>
		{/if}
	</div>

	<AnimatePresence initial={false}>
		{#if errorMessage}
			<motion.p
				key="error"
				id={`${id}-error`}
				role="alert"
				initial={$reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }}
				animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
				exit={$reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }}
				transition={{ duration: 0.2 }}
				data-slot="input-error"
				class={classNames?.errorMessage}
			>
				{errorMessage}
			</motion.p>
		{/if}
	</AnimatePresence>
</div>
