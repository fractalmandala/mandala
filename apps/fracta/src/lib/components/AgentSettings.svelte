<script lang="ts">
	import { agent, type AgentMode } from '$lib/state/agent.svelte';
	import { ui } from '$lib/state/ui.svelte';

	// Local draft so the user can edit without thrashing localStorage on every keystroke.
	let providerName = $state(agent.providerName);
	let baseUrl = $state(agent.baseUrl);
	let apiKey = $state(agent.apiKey);
	let model = $state(agent.model);
	let showKey = $state(false);
	let savedFlash = $state(false);
	let loadError = $state<string | null>(null);
	let firstField = $state<HTMLInputElement | null>(null);

	// Re-sync if the panel is reopened; refresh GGUF status.
	$effect(() => {
		if (ui.agentOpen) {
			providerName = agent.providerName;
			baseUrl = agent.baseUrl;
			apiKey = agent.apiKey;
			model = agent.model;
			loadError = null;
			void agent.refreshGgufStatus();
			requestAnimationFrame(() => firstField?.focus());
		}
	});

	function close() {
		ui.agentOpen = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function setMode(mode: AgentMode) {
		agent.setMode(mode);
		loadError = null;
	}

	function save() {
		agent.save({
			providerName: providerName.trim(),
			baseUrl: baseUrl.trim(),
			apiKey: apiKey.trim(),
			model: model.trim()
		});
		agent.setMode('api');
		savedFlash = true;
		setTimeout(() => {
			savedFlash = false;
		}, 1400);
	}

	function clearAll() {
		agent.clear();
		providerName = '';
		baseUrl = '';
		apiKey = '';
		model = '';
	}

	async function chooseAndMaybeLoad() {
		loadError = null;
		const path = await agent.chooseGguf();
		if (!path) return;
		// Auto-load after pick when server is available.
		if (agent.gguf.serverAvailable) {
			await loadModel();
		}
	}

	async function loadModel() {
		loadError = null;
		try {
			await agent.loadGguf();
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e);
		}
	}

	async function unloadModel() {
		loadError = null;
		await agent.unloadGguf();
	}

	const presets = [
		{
			label: 'CommandCode',
			providerName: 'CommandCode',
			baseUrl: 'https://api.commandcode.ai/provider/v1',
			model: 'deepseek/deepseek-v4-flash'
		},
		{
			label: 'xAI',
			providerName: 'xAI',
			baseUrl: 'https://api.x.ai/v1',
			model: 'grok-4.5'
		},
		{
			label: 'OpenAI',
			providerName: 'OpenAI',
			baseUrl: 'https://api.openai.com/v1',
			model: 'gpt-4o-mini'
		},
		{
			label: 'OpenRouter',
			providerName: 'OpenRouter',
			baseUrl: 'https://openrouter.ai/api/v1',
			model: 'openai/gpt-4o-mini'
		},
		{
			label: 'Ollama',
			providerName: 'Ollama',
			baseUrl: 'http://127.0.0.1:11434/v1',
			model: 'llama3.2'
		}
	] as const;

	function applyPreset(p: (typeof presets)[number]) {
		providerName = p.providerName;
		baseUrl = p.baseUrl;
		model = p.model;
		agent.setMode('api');
	}

	const ggufName = $derived(
		agent.gguf.fileName ||
			agent.ggufPath.split(/[/\\]/).pop() ||
			'No file chosen'
	);
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="rules-overlay"
	role="button"
	tabindex="-1"
	onclick={close}
	onkeydown={(e) => e.key === 'Enter' && close()}
></div>

<div class="rules-modal agent-modal" role="dialog" aria-label="Agent settings" aria-modal="true">
	<header class="rules-modal__head">
		<div>
			<h2 class="rules-modal__title">Agent</h2>
			<p class="rules-modal__sub">
				Remote API or a local GGUF on this machine. Credentials stay local.
			</p>
		</div>
		<button class="rules-modal__close" onclick={close} aria-label="Close">✕</button>
	</header>

	<div class="agent-mode row gap8" role="tablist" aria-label="Agent mode">
		<button
			type="button"
			class="agent-mode__btn"
			class:agent-mode__btn--on={agent.mode === 'api'}
			role="tab"
			aria-selected={agent.mode === 'api'}
			onclick={() => setMode('api')}
		>
			API provider
		</button>
		<button
			type="button"
			class="agent-mode__btn"
			class:agent-mode__btn--on={agent.mode === 'gguf'}
			role="tab"
			aria-selected={agent.mode === 'gguf'}
			onclick={() => setMode('gguf')}
		>
			Local GGUF
		</button>
	</div>

	{#if agent.mode === 'gguf'}
		<div class="agent-form">
			<div class="agent-gguf">
				<p class="agent-gguf__lead">
					Pick a <code>.gguf</code> model from disk. Fracta starts a local
					<code>llama-server</code> and streams chat through it — no cloud key needed.
				</p>

				{#if !agent.gguf.serverAvailable && !agent.gguf.loading}
					<div class="agent-gguf__warn" role="status">
						<strong>llama-server not found.</strong>
						Install llama.cpp, then restart fracta:
						<code>brew install llama.cpp</code>
						{#if agent.gguf.serverPath}
							<span class="agent-field__hint">Found path hint: {agent.gguf.serverPath}</span>
						{/if}
						<span class="agent-field__hint">
							Or set <code>FRACTA_LLAMA_SERVER</code> to the binary path.
						</span>
					</div>
				{:else if agent.gguf.serverAvailable}
					<p class="agent-field__hint">
						Runtime: <code>{agent.gguf.serverPath}</code>
					</p>
				{/if}

				<div class="agent-gguf__file">
					<span class="agent-field__label">Model file</span>
					<div class="agent-gguf__path" title={agent.ggufPath || undefined}>
						{ggufName}
					</div>
					<div class="row gap12 ycenter wrap">
						<button type="button" class="agent-actions__save" onclick={chooseAndMaybeLoad}>
							Choose .gguf…
						</button>
						{#if agent.ggufPath && !agent.gguf.loaded && !agent.gguf.loading}
							<button type="button" class="agent-preset" onclick={loadModel}>
								Load model
							</button>
						{/if}
						{#if agent.gguf.loaded}
							<button type="button" class="agent-actions__ghost" onclick={unloadModel}>
								Unload
							</button>
						{/if}
					</div>
				</div>

				{#if agent.gguf.loading}
					<p class="agent-gguf__status" role="status">
						Loading into memory — large models can take a minute…
					</p>
				{:else if agent.gguf.loaded}
					<p class="agent-gguf__status agent-gguf__status--ok" role="status">
						Ready · {agent.gguf.fileName}
						{#if agent.gguf.baseUrl}
							<span class="agent-field__hint"> · {agent.gguf.baseUrl}</span>
						{/if}
					</p>
				{/if}

				{#if loadError || agent.gguf.error}
					<p class="agent-gguf__error" role="alert">
						{loadError || agent.gguf.error}
					</p>
				{/if}
			</div>

			<div class="agent-actions row gap16 ycenter xbetween">
				<span class="agent-actions__status">
					{#if agent.configured}
						Ask will use this local model
					{:else}
						Load a GGUF to enable Ask
					{/if}
				</span>
				<button type="button" class="agent-actions__save" onclick={close}>Done</button>
			</div>
		</div>
	{:else}
		<div class="agent-presets row wrap gap12">
			<span class="agent-presets__label">Presets</span>
			{#each presets as p (p.label)}
				<button type="button" class="agent-preset" onclick={() => applyPreset(p)}>
					{p.label}
				</button>
			{/each}
		</div>

		<form
			class="agent-form"
			onsubmit={(e) => {
				e.preventDefault();
				save();
			}}
		>
			<label class="agent-field">
				<span class="agent-field__label">Provider name</span>
				<input
					class="agent-field__input"
					bind:this={firstField}
					bind:value={providerName}
					placeholder="e.g. xAI, OpenRouter, CommandCode"
					autocomplete="off"
				/>
			</label>

			<label class="agent-field">
				<span class="agent-field__label">API base URL</span>
				<input
					class="agent-field__input"
					bind:value={baseUrl}
					placeholder="https://api.example.com/v1"
					autocomplete="off"
					spellcheck="false"
				/>
				<span class="agent-field__hint"
					>OpenAI-style root. We append <code>/chat/completions</code>.</span
				>
			</label>

			<label class="agent-field">
				<span class="agent-field__label">API key</span>
				<div class="agent-field__key row gap8 ycenter">
					<input
						class="agent-field__input"
						type={showKey ? 'text' : 'password'}
						bind:value={apiKey}
						placeholder="sk-…"
						autocomplete="off"
						spellcheck="false"
					/>
					<button
						type="button"
						class="agent-field__toggle"
						onclick={() => (showKey = !showKey)}
					>
						{showKey ? 'Hide' : 'Show'}
					</button>
				</div>
			</label>

			<label class="agent-field">
				<span class="agent-field__label">Model id</span>
				<input
					class="agent-field__input"
					bind:value={model}
					placeholder="exact API id — e.g. deepseek/deepseek-v4-flash"
					autocomplete="off"
					spellcheck="false"
				/>
				<span class="agent-field__hint">
					Must match the provider’s API slug exactly (case-sensitive).
				</span>
			</label>

			<div class="agent-actions row gap16 ycenter xbetween">
				<button type="button" class="agent-actions__ghost" onclick={clearAll}> Clear </button>
				<div class="row gap12 ycenter">
					{#if savedFlash}
						<span class="agent-actions__saved">Saved</span>
					{:else if agent.configured}
						<span class="agent-actions__status">Ready · {agent.label}</span>
					{/if}
					<button type="submit" class="agent-actions__save">Save</button>
				</div>
			</div>
		</form>
	{/if}
</div>
