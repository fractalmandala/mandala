<script lang="ts">
	import {
		SCALING_RANGE,
		SCALING_VAR,
		SEMANTIC_GROUPS,
		SLATE_STEPS,
		STORAGE_KEY,
		TEXT_SAMPLES,
		TYPE_LEVELS,
		applyOverrides,
		currentTheme,
		loadOverrides,
		persistOverrides,
		readVar,
		removeAllOverrides,
		resolveVar,
		setTheme,
		OverrideHistory,
		type Overrides,
		type Theme
	} from './styler-preview';

	let {
		title = 'fractals-styler',
		subtitle = 'Live token showcase — tweak and watch the theme react. Overrides persist in your browser.'
	}: { title?: string; subtitle?: string } = $props();

	const history = new OverrideHistory();
	let undoSize: number = $state(0);

	let overrides: Overrides = $state(loadOverrides());
	let theme: Theme = $state(currentTheme());
	let scaling: number = $state(defaultScaling());

	const fonts = $state<Record<string, string>>({});
	const palette = $state<Record<string, string>>({});

	let host: HTMLElement;

	/* ------------------------------------------------------------------ */
	/* Local helpers                                                        */
	/* ------------------------------------------------------------------ */
	function defaultScaling(): number {
		const f = parseFloat(readVar(SCALING_VAR));
		return Number.isFinite(f) ? f : SCALING_RANGE.default;
	}

	function allColorTokens(): string[] {
		const set = new Set<string>();
		for (const g of SEMANTIC_GROUPS) for (const t of g.tokens) set.add(t);
		for (const step of SLATE_STEPS) set.add(`--slate-${step}`);
		return [...set];
	}

	function getSwatchColor(token: string): string {
		return overrides[token] || palette[token] || resolveVar(token) || '#888888';
	}

	function measureFonts(): void {
		if (!host) return;
		for (const lvl of TYPE_LEVELS) {
			const el = host.querySelector(`[data-fs="${lvl.var}"]`);
			if (el) fonts[lvl.var] = getComputedStyle(el as HTMLElement).fontSize;
		}
	}

	function updatePalette(): void {
		if (typeof document === 'undefined') return;
		for (const name of allColorTokens()) palette[name] = resolveVar(name);
	}

	/** Commit a token change to history + persistence. */
	function commit(token: string, value: string): void {
		const before = overrides[token] ?? null;
		if (before === value) return;
		overrides = { ...overrides, [token]: value };
		persistOverrides(overrides);
		history.pushOverride(token, before, value);
		undoSize = history.size();
	}

	/** Live preview (no commit) for the scaling slider. */
	function liveScaling(v: number): void {
		scaling = v;
		overrides[SCALING_VAR] = String(v);
	}

	function commitScaling(): void {
		commit(SCALING_VAR, String(scaling));
	}

	function undo(): void {
		const entry = history.popEntry();
		if (!entry) return;
		if (entry.before === null) {
			const next = { ...overrides };
			delete next[entry.token];
			overrides = next;
		} else {
			overrides = { ...overrides, [entry.token]: entry.before };
		}
		persistOverrides(overrides);
		if (entry.token === SCALING_VAR) scaling = parseFloat(overrides[SCALING_VAR] || String(SCALING_RANGE.default));
		undoSize = history.size();
	}

	function reset(): void {
		removeAllOverrides();
		overrides = {};
		persistOverrides(overrides);
		history.clearHistory();
		undoSize = 0;
		scaling = defaultScaling();
		updatePalette();
		measureFonts();
	}

	function toggleTheme(): void {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	/* ------------------------------------------------------------------ */
	/* Effects                                                              */
	/* ------------------------------------------------------------------ */
	$effect(() => {
		overrides;
		applyOverrides(overrides);
		updatePalette();
		measureFonts();
	});

	$effect(() => {
		theme;
		setTheme(theme);
		updatePalette();
		measureFonts();
	});
</script>

<div bind:this={host} class="styler-preview">
	<header class="sp-head">
		<div class="sp-head-text">
			<h2 class="sp-title">{title}</h2>
			<p class="sp-sub">{subtitle}</p>
		</div>
		<div class="sp-tools">
			<button class="sp-btn" onclick={undo} disabled={undoSize === 0}>Undo</button>
			<button class="sp-btn" onclick={reset}>Reset</button>
			<button class="sp-btn sp-theme" onclick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
		</div>
	</header>

	<section class="sp-section">
		<h3 class="sp-h3">Typography</h3>
		{#each TYPE_LEVELS as lvl, i}
			<p class="sp-row {lvl.class}" data-fs={lvl.var}>
				<span class="sp-tag">{lvl.label}</span>
				<span class="sp-sample">The quick brown fox jumps over the lazy dog</span>
				<span class="sp-meta">{fonts[lvl.var] ?? '—'}</span>
			</p>
		{/each}

		<div class="sp-scale">
			<label class="sp-scale-label" for="sp-scale">scaling</label>
			<input
				id="sp-scale"
				class="sp-range"
				type="range"
				min={SCALING_RANGE.min}
				max={SCALING_RANGE.max}
				step={SCALING_RANGE.step}
				value={scaling}
				oninput={(e) => liveScaling(parseFloat(e.currentTarget.value))}
				onchange={() => commitScaling()}
			/>
			<span class="sp-scale-val">{scaling.toFixed(2)}</span>
			<span class="sp-scale-live">{fonts['--text-5xl'] ?? '—'}</span>
		</div>
	</section>

	<section class="sp-section">
		<h3 class="sp-h3">Slate palette</h3>
		<div class="sp-swatches">
			{#each SLATE_STEPS as step}
				{@const token = `--slate-${step}`}
				<div class="sp-swatch">
					<input
						class="sp-swatch-input"
						type="color"
						value={getSwatchColor(token)}
						aria-label={token}
						onchange={(e) => commit(token, e.currentTarget.value)}
					/>
					<span class="sp-swatch-label">{step}</span>
					<span class="sp-swatch-hex">{getSwatchColor(token)}</span>
				</div>
			{/each}
		</div>
	</section>

	{#each SEMANTIC_GROUPS as group}
		<section class="sp-section">
			<h3 class="sp-h3">{group.title}</h3>
			<div class="sp-swatches">
				{#each group.tokens as token}
					<div class="sp-swatch">
						<input
							class="sp-swatch-input"
							type="color"
							value={getSwatchColor(token)}
							aria-label={token}
							onchange={(e) => commit(token, e.currentTarget.value)}
						/>
						<span class="sp-swatch-label">{token.replace('--', '')}</span>
						<span class="sp-swatch-hex">{getSwatchColor(token)}</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}

	<section class="sp-section">
		<h3 class="sp-h3">Text colors</h3>
		{#each TEXT_SAMPLES as sample}
			<div class="sp-row">
				<span class="sp-tag">{sample.label}</span>
				<input
					class="sp-swatch-input"
					type="color"
					value={getSwatchColor(sample.var)}
					aria-label={sample.var}
					onchange={(e) => commit(sample.var, e.currentTarget.value)}
				/>
				<span class="sp-sample" style={`color: var(${sample.var})` + (sample.inverse ? '; background: var(--bg-overlay)' : '')}>{sample.label} Text</span>
			</div>
		{/each}
	</section>

	<section class="sp-section">
		<h3 class="sp-h3">Buttons</h3>
		<div class="sp-row">
			<button class="button">Button</button>
			<button class="button-primary inverse fw500">Primary</button>
			<button class="button-quiet">Quiet</button>
			<button class="blank">Blank</button>
		</div>
	</section>

	<footer class="sp-foot">
		Overrides stored to <code>{STORAGE_KEY}</code> in localStorage — <code>Reset</code> clears them.
		{undoSize} pending undo
	</footer>
</div>

<style>
	.styler-preview {
		background: var(--bg-app);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		font-family: var(--font-sans, system-ui, sans-serif);
		width: 100%;
	}
	.sp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
	.sp-title { margin: 0; font-size: 1.35rem; color: var(--text-primary); }
	.sp-sub { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.875rem; }
	.sp-tools { display: flex; gap: 0.5rem; align-items: center; }
	.sp-btn { background: var(--bg-raised); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); padding: 0.4rem 0.85rem; font-size: 0.85rem; cursor: pointer; }
	.sp-btn:disabled { opacity: 0.45; cursor: default; }
	.sp-section { margin-top: 1.75rem; }
	.sp-h3 { margin: 0 0 0.85rem; font-size: 1rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
	.sp-row { display: flex; align-items: baseline; gap: 1rem; margin: 0.5rem 0; }
	.sp-tag { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; color: var(--text-secondary); min-width: 8rem; }
	.sp-sample { flex: 1; }
	.sp-meta { font-family: var(--font-mono, monospace); font-size: 0.7rem; color: var(--text-muted); min-width: 4rem; text-align: right; }
	.sp-scale { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
	.sp-scale-label { min-width: 8rem; font-family: var(--font-mono, monospace); color: var(--text-secondary); }
	.sp-range { flex: 1; }
	.sp-scale-val { font-family: var(--font-mono, monospace); min-width: 2.5rem; text-align: right; }
	.sp-scale-live { color: var(--text-secondary); font-family: var(--font-mono, monospace); }
	.sp-swatches { display: flex; flex-wrap: wrap; gap: 0.75rem; }
	.sp-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; min-width: 4.2rem; border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem; background: var(--bg-surface); }
	.sp-swatch-input { width: 2.6rem; height: 2.6rem; border: none; padding: 0; background: none; cursor: pointer; border-radius: 6px; }
	.sp-swatch-label { font-family: var(--font-mono, monospace); font-size: 0.68rem; color: var(--text-secondary); }
	.sp-swatch-hex { font-family: var(--font-mono, monospace); font-size: 0.62rem; color: var(--text-muted); }
	code { font-family: var(--font-mono, monospace); font-size: 0.75em; background: var(--bg-subtle); padding: 0.1em 0.3em; border-radius: 4px; }
	.sp-foot { margin-top: 1.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--text-muted); }
</style>