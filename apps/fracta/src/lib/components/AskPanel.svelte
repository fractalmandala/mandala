<script lang="ts">
	/**
	 * Ask panel — third column over capture.
	 * Streams from the user-configured OpenAI-compatible provider.
	 */
	import { onMount } from 'svelte';
	import { agent } from '$lib/state/agent.svelte';
	import { ask, type AskBlock } from '$lib/state/ask.svelte';
	import { ui } from '$lib/state/ui.svelte';

	let {
		onclose
	}: {
		onclose?: () => void;
	} = $props();

	let inputEl = $state<HTMLInputElement | null>(null);
	let transcriptEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLElement | null>(null);
	let closeEl = $state<HTMLButtonElement | null>(null);

	const suggestions = [
		'Summarise this note',
		'Extract action items',
		'What are the open questions?'
	] as const;

	/** Splits `inline code` runs out of a line so they can be styled. */
	function parts(text: string) {
		return text
			.split(/(`[^`]+`)/)
			.filter(Boolean)
			.map((chunk) =>
				chunk.startsWith('`') && chunk.endsWith('`')
					? { code: true, text: chunk.slice(1, -1) }
					: { code: false, text: chunk }
			);
	}

	function submit(e?: Event) {
		e?.preventDefault();
		const value = ask.draft.trim();
		if (!value || ask.streaming) return;
		void ask.send(value);
	}

	function useSuggestion(text: string) {
		if (ask.streaming) return;
		void ask.send(text);
	}

	function close() {
		onclose?.();
		ui.closeAsk();
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
		if (event.key !== 'Tab' || !window.matchMedia('(max-width: 900px)').matches) return;
		const focusable = Array.from(panelEl?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute('disabled'));
		if (!focusable.length) return;
		const first = focusable[0], last = focusable.at(-1)!;
		if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}

	const lastIndex = $derived(ask.turns.length - 1);
	const canSend = $derived(ask.draft.trim().length > 0 && !ask.streaming && agent.configured);

	function blockKey(block: AskBlock, b: number): string {
		if (block.type === 'list') return `list-${b}`;
		if (block.type === 'code') return `code-${b}`;
		return `${block.type}-${b}-${'text' in block ? block.text.slice(0, 12) : b}`;
	}

	onMount(() => {
		// Focus composer when the panel opens (frontend focus pattern).
		requestAnimationFrame(() => inputEl?.disabled ? closeEl?.focus() : inputEl?.focus());
	});

	// Keep the latest turn in view while streaming.
	$effect(() => {
		ask.turns.length;
		ask.streaming;
		if (!transcriptEl) return;
		requestAnimationFrame(() => {
			transcriptEl?.scrollTo({ top: transcriptEl.scrollHeight, behavior: 'smooth' });
		});
	});
</script>

<div bind:this={panelEl} class="ask-panel" role="dialog" aria-label="Ask about this note" tabindex="-1" onkeydown={keydown}>
	<header class="ask-panel__head">
		<span class="ask-panel__label" title={agent.configured ? agent.label : undefined}>
			Ask · {ask.title}
			{#if agent.configured}
				<span class="ask-panel__provider"> · {agent.model || agent.providerName}</span>
			{/if}
		</span>
		{#if ask.sourcePath}<span class="ask-panel__provider" title={ask.sourcePath}>Source: {ask.sourcePath}</span>{/if}
		<div class="ask-panel__actions">
			<button
				type="button"
				class="ask-panel__link"
				onclick={() => ui.openAgent()}
				title="Agent settings"
			>
				{agent.configured ? 'Model' : 'Connect'}
			</button>
			{#if ask.turns.length}
				<button type="button" class="ask-panel__link" onclick={() => ask.clear()}>Clear</button>
			{/if}
			<button bind:this={closeEl} type="button" class="ask-panel__link" onclick={close}>Close</button>
		</div>
	</header>

	<div class="ask-panel__transcript" bind:this={transcriptEl}>
		{#if !agent.configured && ask.turns.length === 0}
			<div class="ask-panel__empty">
				<p>
					{#if agent.mode === 'gguf'}
						Load a local GGUF model to ask about this note.
					{:else}
						Connect an API or load a local GGUF to ask about this note.
					{/if}
				</p>
				<p class="ask-panel__hint">
					{#if agent.mode === 'gguf'}
						Choose a .gguf file in Agent settings. Requires llama.cpp on this machine.
					{:else}
						Provider + key, or Local GGUF — credentials and models stay on this machine.
					{/if}
				</p>
				<button type="button" class="ask-panel__cta" onclick={() => ui.openAgent()}>
					Open Agent settings
				</button>
			</div>
		{:else if ask.turns.length === 0}
			<div class="ask-panel__empty">
				<p>Ask about the open note — summarise, extract actions, rephrase.</p>
				<p class="ask-panel__hint">Using {agent.label}. Context is the active local source.</p>
				<div class="ask-panel__suggestions" role="group" aria-label="Suggestions">
					{#each suggestions as s (s)}
						<button type="button" class="ask-panel__chip" onclick={() => useSuggestion(s)}>
							{s}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#each ask.turns as turn, i (i)}
			{#if turn.role === 'user'}
				<div class="ask-panel__ask">
					{#each turn.content as block}
						{#if block.type === 'p'}
							<span>{block.text}</span>
						{/if}
					{/each}
				</div>
			{:else}
				{#if turn.thinking}
					<div class="ask-panel__thinking">
						<div class="ask-panel__label">{turn.thinkingLabel ?? 'Thinking'}</div>
						<p class="ask-panel__thought">{turn.thinking}</p>
					</div>
				{/if}
				<div class="ask-panel__answer" class:ask-panel__answer--error={turn.error}>
					{#each turn.content as block, b (blockKey(block, b))}
						{#if block.type === 'h'}
							<div class="ask-panel__h">{block.text}</div>
						{:else if block.type === 'list'}
							<div class="ask-panel__list">
								{#each block.items as item, n (n)}
									<div class="ask-panel__item">
										<span class="ask-panel__dash" aria-hidden="true">—</span>
										<span>
											{#each parts(item) as part}
												{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
											{/each}
											{#if ask.streaming && i === lastIndex && n === block.items.length - 1}
												<span class="ask-panel__caret" aria-hidden="true"></span>
											{/if}
										</span>
									</div>
								{/each}
							</div>
						{:else if block.type === 'code'}
							<pre class="ask-panel__code">{block.lines.join('\n')}</pre>
						{:else}
							<p class="ask-panel__p">
								{#each parts(block.text) as part}
									{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
								{/each}
								{#if ask.streaming && i === lastIndex && b === turn.content.length - 1}
									<span class="ask-panel__caret" aria-hidden="true"></span>
								{/if}
							</p>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}

		{#if ask.streaming && ask.turns.at(-1)?.role === 'user'}
			<div class="ask-panel__thinking">
				<div class="ask-panel__label">{agent.providerName || 'Agent'}</div>
				<p class="ask-panel__thought">Connecting…</p>
			</div>
		{/if}
	</div>

	<form class="ask-panel__composer" onsubmit={submit}>
		<input
			bind:this={inputEl}
			bind:value={ask.draft}
			placeholder={agent.configured ? 'Ask about this note…' : 'Connect a provider first…'}
			aria-label="Ask about this note"
			disabled={ask.streaming || !agent.configured}
			autocomplete="off"
		/>
		<button
			type="submit"
			class="ask-panel__send"
			disabled={!canSend}
			aria-label="Send"
			title="Send"
		>
			↑
		</button>
	</form>
</div>
