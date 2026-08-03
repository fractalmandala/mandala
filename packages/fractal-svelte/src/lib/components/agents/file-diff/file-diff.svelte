<script lang="ts">
	import { untrack } from 'svelte';
	import './file-diff.sass';
	export type FileDiffStatus = 'streaming' | 'complete';
	export type FileDiffLine = {
		id: string;
		type?: 'added' | 'removed' | 'context';
		oldLine?: number;
		newLine?: number;
		content: string;
	};
	let {
		file,
		lines,
		status = 'streaming',
		open,
		defaultOpen = true,
		onOpenChange,
		collapseOnComplete = true,
		maxHeight = 220,
		language = 'typescript',
		copyText,
		onCopy
	}: {
		file: string;
		lines: FileDiffLine[];
		status?: FileDiffStatus;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (v: boolean) => void;
		collapseOnComplete?: boolean;
		maxHeight?: number;
		language?: string;
		copyText?: string;
		onCopy?: () => void | Promise<void>;
	} = $props();
	let internal = $state(untrack(() => defaultOpen)),
		previous = $state(untrack(() => status)),
		copied = $state(false),
		timer: ReturnType<typeof setTimeout>;
	let current = $derived(open ?? internal),
		adds = $derived(lines.filter((x) => x.type === 'added').length),
		dels = $derived(lines.filter((x) => x.type === 'removed').length);
	const id = `diff-${Math.random().toString(36).slice(2)}`;
	function setOpen(v: boolean) {
		if (open === undefined) internal = v;
		onOpenChange?.(v);
	}
	$effect(() => {
		if (previous !== 'streaming' && status === 'streaming') setOpen(true);
		if (previous === 'streaming' && status === 'complete' && collapseOnComplete) setOpen(false);
		previous = status;
		return () => clearTimeout(timer);
	});
	async function copy() {
		if (onCopy) await onCopy();
		else if (copyText) await navigator.clipboard?.writeText(copyText);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}
</script>

<div data-slot="file-diff" data-state={status} aria-busy={status === 'streaming'}>
	<button
		type="button"
		data-slot="file-diff-header"
		aria-expanded={current}
		aria-controls={id}
		onclick={() => setOpen(!current)}
		><span aria-hidden="true">▣</span><span data-slot="file-diff-name">{file}</span><span
			data-slot="diff-add">+{adds}</span
		><span data-slot="diff-del">−{dels}</span><span
			aria-label={status === 'streaming' ? 'Applying changes' : 'Changes applied'}
			>{status === 'streaming' ? '◌' : '✓'}</span
		><span aria-hidden="true">⌄</span></button
	>
	<div
		{id}
		data-slot="file-diff-body"
		role="region"
		aria-hidden={!current}
		inert={!current}
		style={`--max-height:${maxHeight}px`}
	>
		<div data-slot="file-diff-viewport" aria-live="polite">
			<span data-slot="sr-only">File changes</span>{#each lines as line (line.id)}<div
					data-slot="file-diff-line"
					data-type={line.type ?? 'context'}
				>
					<span>{line.oldLine ?? ''}</span><span>{line.newLine ?? ''}</span><span
						>{line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ''}</span
					><code data-language={language}>{line.content}</code>
				</div>{/each}
		</div>
		{#if copyText || onCopy}<button
				type="button"
				data-slot="file-diff-copy"
				aria-label={copied ? 'Copied' : 'Copy diff'}
				onclick={copy}>{copied ? '✓' : '⧉'}</button
			>{/if}
	</div>
</div>
