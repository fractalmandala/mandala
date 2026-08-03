<script lang="ts" module>
	export interface FeedbackData { message: string }
	type FeedbackStatus = 'idle' | 'open' | 'sending' | 'sent' | 'error';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import './feedback-widget.sass';
	let { onSubmit, position = 'bottom-right', title = 'Help us improve', placeholder = 'Share an idea or report a bug', icon }:
		{ onSubmit?: (data: FeedbackData) => void | Promise<void>; position?: 'bottom-right' | 'bottom-left'; title?: string; placeholder?: string; icon?: Snippet } = $props();
	let status = $state<FeedbackStatus>('idle'); let message = $state(''); let root: HTMLDivElement; let textarea = $state<HTMLTextAreaElement>(); let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const open = $derived(status !== 'idle'); const busy = $derived(status === 'sending');
	function close() { if (busy) return; clearTimeout(closeTimer); status = 'idle'; message = ''; }
	async function submit() { if (busy || !message.trim()) return; status = 'sending'; try { await onSubmit?.({ message: message.trim() }); status = 'sent'; closeTimer = setTimeout(close, 1600); } catch { status = 'error'; } }
	function show() { status = 'open'; queueMicrotask(() => textarea?.focus()); }
	$effect(() => {
		if (!open) return; const key = (e: KeyboardEvent) => e.key === 'Escape' && close(); const outside = (e: PointerEvent) => { if (!root.contains(e.target as Node)) close(); };
		window.addEventListener('keydown', key); window.addEventListener('pointerdown', outside); return () => { window.removeEventListener('keydown', key); window.removeEventListener('pointerdown', outside); };
	});
	$effect(() => () => clearTimeout(closeTimer));
</script>

<div bind:this={root} data-slot="feedback-widget" data-position={position} data-status={status}>
	{#if !open}
		<button type="button" data-slot="feedback-trigger" aria-label={title} aria-haspopup="dialog" onclick={show}>
			{#if icon}{@render icon()}{:else}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>{/if}
		</button>
	{:else}
		<div data-slot="feedback-panel" role="dialog" aria-modal="false" aria-labelledby="feedback-title">
			{#if status === 'sent'}
				<div data-slot="feedback-result" role="status"><strong>Thanks!</strong><span>Your feedback helps us build something better.</span></div>
			{:else if status === 'error'}
				<div data-slot="feedback-result" role="alert"><strong>Something went wrong</strong><span>We couldn't send your feedback. Please try again.</span><button type="button" onclick={submit}>Try again</button></div>
			{:else}
				<header><h2 id="feedback-title">{title}</h2><button type="button" aria-label="Close" disabled={busy} onclick={close}>×</button></header>
				<textarea bind:this={textarea} bind:value={message} {placeholder} disabled={busy} rows="3"></textarea>
				<footer><button type="button" disabled={busy} onclick={close}>Cancel</button><button type="button" disabled={busy || !message.trim()} aria-busy={busy} onclick={submit}>{busy ? 'Sending' : 'Submit'}</button></footer>
			{/if}
		</div>
	{/if}
</div>
