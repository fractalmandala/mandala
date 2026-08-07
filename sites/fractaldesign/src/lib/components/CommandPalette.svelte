<script lang="ts">
	export type Command = {
		id: string;
		title: string;
		group: string;
		shortcut?: string;
		enabled?: boolean;
		run: () => void;
	};

	let { commands, onclose }: { commands: Command[]; onclose: () => void } = $props();

	let query = $state('');
	let activeIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);

	// Subsequence fuzzy score: rewards contiguous + word-boundary matches.
	function fuzzyScore(q: string, text: string): number {
		if (!q) return 1;
		const t = text.toLowerCase();
		let qi = 0;
		let score = 0;
		let streak = 0;
		let prev = -1;
		for (let i = 0; i < t.length && qi < q.length; i++) {
			if (t[i] === q[qi]) {
				streak = i === prev + 1 ? streak + 1 : 1;
				score += streak * 2;
				if (i === 0 || /[\s/:-]/.test(t[i - 1])) score += 5; // word boundary
				prev = i;
				qi++;
			}
		}
		return qi === q.length ? score : -1;
	}

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return commands;
		return commands
			.map((c) => ({ c, s: fuzzyScore(q, c.title) }))
			.filter((r) => r.s >= 0)
			.sort((a, b) => b.s - a.s)
			.map((r) => r.c);
	});

	$effect(() => {
		// Keep the active index in range as results change.
		results;
		if (activeIndex >= results.length) activeIndex = Math.max(0, results.length - 1);
	});

	$effect(() => {
		inputEl?.focus();
	});

	function runIndex(i: number) {
		const cmd = results[i];
		if (!cmd || cmd.enabled === false) return;
		onclose();
		cmd.run();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(results.length - 1, activeIndex + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(0, activeIndex - 1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			runIndex(activeIndex);
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="cmdk-backdrop" onclick={onclose} onkeydown={onKeydown}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cmdk-panel" onclick={(e) => e.stopPropagation()} onkeydown={onKeydown}>
		<div class="cmdk-search">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<circle cx="11" cy="11" r="7"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				placeholder="Search actions…"
				spellcheck="false"
				autocomplete="off"
			/>
			<kbd>esc</kbd>
		</div>
		<div class="cmdk-list">
			{#if results.length === 0}
				<div class="cmdk-empty">No matching actions</div>
			{:else}
				{#each results as cmd, i (cmd.id)}
					{@const showGroup = !query.trim() && (i === 0 || results[i - 1].group !== cmd.group)}
					{#if showGroup}
						<div class="cmdk-group">{cmd.group}</div>
					{/if}
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
						class="cmdk-item"
						class:active={i === activeIndex}
						disabled={cmd.enabled === false}
						onmousemove={() => (activeIndex = i)}
						onclick={() => runIndex(i)}
					>
						<span class="cmdk-item-title">{cmd.title}</span>
						{#if cmd.shortcut}<kbd class="cmdk-shortcut">{cmd.shortcut}</kbd>{/if}
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
