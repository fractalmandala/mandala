<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import './prompt-input.sass';
	export type PromptModel = { value: string; label: string; icon?: Snippet; disabled?: boolean };
	export type PromptAction = {
		value: string;
		label: string;
		description?: string;
		icon?: Snippet;
		disabled?: boolean;
	};
	let {
		value,
		defaultValue = '',
		onValueChange,
		models = [],
		model,
		defaultModel,
		onModelChange,
		actions = [],
		onAction,
		onSubmit,
		loading = false,
		onStop,
		minRows = 2,
		maxRows = 8,
		leadingAction,
		disabled = false,
		placeholder = 'Ask the agent to do something…',
		ariaLabel = 'Prompt'
	}: {
		value?: string;
		defaultValue?: string;
		onValueChange?: (v: string) => void;
		models?: PromptModel[];
		model?: string;
		defaultModel?: string;
		onModelChange?: (v: string) => void;
		actions?: PromptAction[];
		onAction?: (v: string) => void;
		onSubmit?: (v: string, m?: string) => void | Promise<void>;
		loading?: boolean;
		onStop?: () => void;
		minRows?: number;
		maxRows?: number;
		leadingAction?: Snippet;
		disabled?: boolean;
		placeholder?: string;
		ariaLabel?: string;
	} = $props();
	let internal = $state(untrack(() => defaultValue)),
		internalModel = $state(untrack(() => defaultModel ?? models[0]?.value)),
		actionsOpen = $state(false),
		textarea = $state<HTMLTextAreaElement>();
	let current = $derived(value ?? internal),
		currentModel = $derived(model ?? internalModel);
	function setValue(v: string) {
		if (value === undefined) internal = v;
		onValueChange?.(v);
	}
	function submit(e?: Event) {
		e?.preventDefault();
		const prompt = current.trim();
		if (!prompt || disabled || loading) return;
		onSubmit?.(prompt, currentModel);
		if (value === undefined) internal = '';
		textarea?.focus();
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			submit();
		}
	}
	$effect(() => {
		if (!textarea) return;
		textarea.style.height = 'auto';
		const line = 24;
		textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, minRows * line), maxRows * line)}px`;
	});
</script>

<form data-slot="prompt-input" onsubmit={submit} data-disabled={disabled || undefined}>
	<textarea
		bind:this={textarea}
		data-slot="prompt-input-field"
		value={current}
		rows={minRows}
		{disabled}
		{placeholder}
		aria-label={ariaLabel}
		oninput={(e) => setValue(e.currentTarget.value)}
		onkeydown={key}
	></textarea>
	<div data-slot="prompt-input-toolbar">
		{#if actions.length}<div data-slot="prompt-input-actions">
				<button
					type="button"
					data-slot="prompt-input-tool"
					aria-label="Add to prompt"
					aria-expanded={actionsOpen}
					onclick={() => (actionsOpen = !actionsOpen)}
					disabled={disabled || loading}>＋</button
				>{#if actionsOpen}<div data-slot="prompt-input-menu" role="menu">
						{#each actions as action}<button
								type="button"
								role="menuitem"
								disabled={action.disabled}
								onclick={() => {
									onAction?.(action.value);
									actionsOpen = false;
								}}
								><span>{action.label}</span>{#if action.description}<small
										>{action.description}</small
									>{/if}</button
							>{/each}
					</div>{/if}
			</div>{/if}{@render leadingAction?.()}{#if models.length}<label
				data-slot="prompt-input-model"
				><span data-slot="sr-only">Model</span><select
					value={currentModel}
					onchange={(e) => {
						if (model === undefined) internalModel = e.currentTarget.value;
						onModelChange?.(e.currentTarget.value);
					}}
					disabled={disabled || loading}
					>{#each models as option}<option value={option.value} disabled={option.disabled}
							>{option.label}</option
						>{/each}</select
				></label
			>{/if}<button
			type={loading ? 'button' : 'submit'}
			data-slot="prompt-input-submit"
			aria-label={loading ? 'Stop generating' : 'Send prompt'}
			disabled={loading ? !onStop : !current.trim() || disabled}
			onclick={loading ? onStop : undefined}>{loading ? '■' : '↑'}</button
		>
	</div>
</form>
