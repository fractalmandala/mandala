<script lang="ts">
	import type { TokenUsage } from '../../../ipc';

	let {
		usage = null,
		maxTokens,
		modelId = '',
		compact = false
	}: { usage?: TokenUsage | null; maxTokens: number; modelId?: string; compact?: boolean } = $props();

	let total = $derived(usage ? usage.inputTokens + usage.outputTokens : 0);
	let pct = $derived(maxTokens > 0 ? Math.min(100, Math.round((total / maxTokens) * 100)) : 0);
	let open = $state(false);

	function fmt(n: number): string {
		if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
		return String(n);
	}
</script>

<div class="ctx-meter" class:ctx-compact={compact}>
	<button
		class="btn-icon"
		aria-label="Token usage"
		onmouseenter={() => (open = true)}
		onmouseleave={() => (open = false)}
		onfocus={() => (open = true)}
		onblur={() => (open = false)}
	>
		<span class="ctx-ring" style="--ctx-pct: {pct}"></span>
		<span class="ctx-pct">{usage ? pct + '%' : '—'}</span>
	</button>

	{#if open}
		<div class="ctx-popover" role="tooltip">
			<div class="ctx-pop-title">Context Usage</div>
			{#if usage}
				<div class="ctx-row"><span>Input</span><span>{fmt(usage.inputTokens)}</span></div>
				<div class="ctx-row"><span>Output</span><span>{fmt(usage.outputTokens)}</span></div>
				<div class="ctx-row ctx-total"><span>Total</span><span>{fmt(total)} / {fmt(maxTokens)}</span></div>
			{:else}
				<div class="ctx-row ctx-muted"><span>No usage yet — send a message</span></div>
				<div class="ctx-row ctx-muted"><span>Window</span><span>{fmt(maxTokens)}</span></div>
			{/if}
			{#if modelId}<div class="ctx-model">{modelId}</div>{/if}
		</div>
	{/if}
</div>
