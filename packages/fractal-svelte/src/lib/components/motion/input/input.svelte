<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import './input.sass';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';
	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & { value?: string; defaultValue?: string; label?: string; error?: string | boolean; success?: boolean; leftIcon?: Snippet; rightIcon?: Snippet; onchange?: (value: string) => void };
	let { value = $bindable(), defaultValue = '', label, error = false, success = false, leftIcon, rightIcon, onchange, oninput, onfocus, onblur, id = `input-${Math.random().toString(36).slice(2)}`, disabled = false, ...rest }: Props = $props();
	const reduce = useReducedMotion();
	let internal = $state(untrack(() => defaultValue));
	$effect(() => { internal = defaultValue; });
	let focused = $state(false);
	let current = $derived(value ?? internal);
	let message = $derived(typeof error === 'string' ? error : '');
	function input(event: Event) { const next = (event.currentTarget as HTMLInputElement).value; if (value === undefined) internal = next; else value = next; onchange?.(next); oninput?.(event as Event & { currentTarget: EventTarget & HTMLInputElement }); }
</script>

<div data-slot="input" data-state={error ? 'error' : success ? 'success' : focused ? 'focused' : 'idle'}>
	{#if label}<label data-slot="input-label" for={id}>{label}</label>{/if}
	<div data-slot="input-wrapper">
		{#if leftIcon}<span data-slot="input-left-icon">{@render leftIcon()}</span>{/if}
		<input {...rest} {id} {disabled} data-slot="input-field" class:has-left={leftIcon} class:has-right={rightIcon || success} value={current} aria-invalid={error ? 'true' : undefined} aria-describedby={message ? `${id}-error` : undefined} oninput={input} onfocus={(event) => { focused = true; onfocus?.(event); }} onblur={(event) => { focused = false; onblur?.(event); }} />
		{#if success}<svg data-slot="input-success" viewBox="0 0 24 24" aria-hidden="true"><path class:reduced={$reduce} d="M5 12.5l4.5 4.5L19 7.5" /></svg>{:else if rightIcon}<span data-slot="input-right-icon">{@render rightIcon()}</span>{/if}
	</div>
	<AnimatePresence>{#if message}<motion.p id={`${id}-error`} data-slot="input-error" role="alert" initial={$reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{message}</motion.p>{/if}</AnimatePresence>
</div>
