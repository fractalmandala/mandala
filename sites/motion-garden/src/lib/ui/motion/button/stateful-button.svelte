<script lang="ts">
	import { Check, LoaderCircle, X } from '@lucide/svelte';
	import { AnimatePresence } from '@humanspeak/svelte-motion';
	import Button from './button.svelte';
	import StateIcon from './state-icon.svelte';
	import TextSlot from './text-slot.svelte';
	import type { StatefulButtonProps } from './button.types.js';
	import './stateful-button.sass';

	let {
		state = 'idle',
		children,
		loadingText,
		successText,
		errorText,
		icon,
		label,
		disabled = false,
		...rest
	}: StatefulButtonProps = $props();

	const isBusy = $derived(state === 'loading');

	// The key that drives text swaps — includes the label so the roll re-runs
	// when a string state's copy changes; snippet states key on state alone.
	const textKey = $derived(label !== undefined ? `${state}-${label}` : state);
</script>

{#snippet loadingGlyph()}
	<LoaderCircle data-slot="stateful-spin" />
{/snippet}

{#snippet successGlyph()}
	<Check />
{/snippet}

{#snippet errorGlyph()}
	<X />
{/snippet}

{#snippet stateContent()}
	{#if state === 'idle'}
		{@render children()}
	{:else if state === 'loading'}
		{#if loadingText}{@render loadingText()}{:else}Loading{/if}
	{:else if state === 'success'}
		{#if successText}{@render successText()}{:else}Done{/if}
	{:else}
		{#if errorText}{@render errorText()}{:else}Try again{/if}
	{/if}
{/snippet}

<Button
	{...rest}
	disabled={disabled || isBusy}
	aria-busy={isBusy}
	whileHover={null}
>
	<span aria-live="polite" data-slot="stateful">
		<AnimatePresence initial={false}>
			{#if state === 'loading'}
				<StateIcon keyId="loading-icon" glyph={loadingGlyph} />
			{/if}
			{#if state === 'success'}
				<StateIcon keyId="success-icon" glyph={successGlyph} />
			{/if}
			{#if state === 'error'}
				<StateIcon keyId="error-icon" glyph={errorGlyph} />
			{/if}
		</AnimatePresence>

		<TextSlot value={textKey} label={label ?? null}>
			{@render stateContent()}
		</TextSlot>

		<AnimatePresence initial={false}>
			{#if state === 'idle' && icon}
				<StateIcon keyId="idle-icon" glyph={icon} />
			{/if}
		</AnimatePresence>
	</span>
</Button>
