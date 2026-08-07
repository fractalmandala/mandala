<script lang="ts">
	// AI Copilot — integrated view rebuilt on top of the ai-elements kit
	// (Stream B components) + the Stream A state wiring (sessions, env
	// providers, token-usage, buildModelGroups, onSelectModel, checkpoint).
	//
	// Follows the cross-stream contracts in ai-elements/types.ts.

	import { aiState as ideState } from "../state/ai.svelte";
	import { tick } from "svelte";
	import { onAiUsage, readFile, type TokenUsage } from "../ipc";
	import { errorMessage } from "../errors";
	import { dictation } from '$lib/state/dictation.svelte';
	import { maxContextTokensFor } from "../data/modelContextWindows";
	import { onDestroy } from "svelte";
	import PromptInput from "./PromptInput.svelte";
	import Conversation from "./ai-elements/Conversation.svelte";
	import Response from "./ai-elements/Response.svelte";
	import Reasoning from "./ai-elements/Reasoning.svelte";
	import Actions from "./ai-elements/Actions.svelte";
	import ModelSelector from "./ai-elements/ModelSelector.svelte";
	import { Context } from "./ai-elements/context";
	import { appState } from "$lib/state/app.svelte";
	import DesignInspector from "$lib/modules/designer/components/DesignInspector.svelte";
	import ExportPanel from "$lib/modules/designer/components/ExportPanel.svelte";
	import {
		modelRegistry,
		skillsApi,
		searchWorkspaceFiles,
	} from "$lib/state/modelRegistry.svelte";

	let { showHeader = true }: { showHeader?: boolean } = $props();

	let promptValue = $state("");
	let textareaElement = $state<HTMLTextAreaElement | null>(null);

	// Autocomplete state
	let showSuggestions = $state(false);
	let suggestionType = $state<"file" | "skill" | null>(null);
	let searchFilter = $state("");
	let selectedSuggestionIndex = $state(0);
	// Drag state
	let isDragging = $state(false);

	// Subscribe to ai-usage events (Stream A) — feeds the Context meter
	let currentUsage = $state<TokenUsage | null>(null);
	const offUsage = onAiUsage((u) => {
		currentUsage = u;
	});
	onDestroy(() => offUsage());

	// Active model id used to resolve the context-window denominator
	let activeModel = $derived(modelRegistry.active());
	let activeModelId = $derived(
		activeModel?.modelId ??
			(ideState.aiProvider === "sidecar"
				? ideState.selectedModelId
				: ideState.activeApiModel),
	);
	let maxTokens = $derived(maxContextTokensFor(activeModelId));
	// Local-model lifecycle cue: shown only when a local (sidecar) model is selected.
	// The sidecar loads the model per message and unloads it when the reply ends,
	// so "loaded" (green) is only true while a reply is being generated.
	let localModelStatus = $derived.by(
		(): { kind: "missing" | "ready" | "loaded"; label: string; title: string } | null => {
			if (ideState.aiProvider !== "sidecar" || !ideState.selectedModelId) return null;
			if (!activeModel || activeModel.runnable === false) {
				return {
					kind: "missing",
					label: "Local model unavailable",
					title: activeModel?.unavailableReason ?? "The selected local model file could not be found.",
				};
			}
			if (ideState.isAiStreaming) {
				return {
					kind: "loaded",
					label: "Local model loaded",
					title: "The local model is loaded in memory and generating a reply.",
				};
			}
			return {
				kind: "ready",
				label: "Local model ready",
				title: "The model loads into memory when you send a message and unloads after the reply finishes.",
			};
		},
	);

	// Model selector groups enriched with registry records (B2)
	let modelGroups = $derived(
		modelRegistry.groups().map((group) => ({
			...group,
			options: group.options.map((opt) => {
				const record = modelRegistry
					.records()
					.find(
						(r) => r.providerId === opt.provider && r.id === opt.id,
					);
				return {
					...opt,
					runnable: record?.runnable,
					unavailableReason: record?.unavailableReason,
				};
			}),
		})),
	);

	function onModelSelect(provider: string, modelId: string) {
		modelRegistry.setActive(provider, modelId);
		// Reset usage meter when model changes
		currentUsage = null;
	}

	// AI / History tabs (panel-label buttons)
	let activeTab = $state<"ai" | "history" | "style" | "export">("ai");

	function selectTab(tab: "ai" | "history" | "style" | "export") {
		activeTab = tab;
		if (tab === "history") {
			ideState.refreshSessions();
		}
	}

	function openHistoryItem(sessionId: string) {
		ideState.loadChatSession(sessionId);
		activeTab = "ai";
	}

	function formatSessionTimestamp(ms: number): string {
		return new Date(ms).toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	}

	// Ends the current conversation: stops any in-flight stream (cancels it backend-side,
	// same as the prompt box's Stop button) and clears the panel. Every turn was already
	// persisted to project memory as it happened (see persistMessage in ide.svelte.ts), so
	// there's nothing left to flush here — closing just ends the view of this conversation.
	function handleCloseChat() {
		if (ideState.isAiStreaming) {
			ideState.stopAiStreaming();
		}
		const hadMessages = ideState.chatMessages.length > 0;
		ideState.newChatSession();
		currentUsage = null;
		if (hadMessages) {
			ideState.addLog("Chat closed — saved to project memory.", "info");
		}
	}

	// Starts a fresh conversation. If one is currently streaming, stop it first rather than
	// leaving an orphaned stream running behind a now-empty chat.
	function handleNewChat() {
		if (ideState.isAiStreaming) {
			ideState.stopAiStreaming();
		}
		ideState.newChatSession();
		currentUsage = null;
	}

	function triggerAutocomplete(type: "file" | "skill") {
		if (!textareaElement) return;
		const char = type === "file" ? "@" : "/";
		const text = promptValue;
		const caretPos = textareaElement.selectionStart || text.length;
		promptValue = text.slice(0, caretPos) + char + text.slice(caretPos);
		tick().then(() => {
			if (textareaElement) {
				textareaElement.focus();
				const newPos = caretPos + 1;
				textareaElement.setSelectionRange(newPos, newPos);
				showSuggestions = true;
				suggestionType = type;
				searchFilter = "";
				selectedSuggestionIndex = 0;
			}
		});
	}

	// Debounced file search (B4) with sequence counter for stale request cancellation
	let fileSearchResults = $state<Array<{ path: string; name: string }>>([]);
	let fileSearchRequestId = 0;
	let fileSearchTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (suggestionType !== "file") return;
		const query = searchFilter;
		if (!query.trim()) {
			// Empty query → instant root listing
			fileSearchResults = ideState.fileEntries
				.filter((e) => !e.isDir)
				.slice(0, 8)
				.map((e) => ({ path: e.path, name: e.name }));
			return;
		}
		// Debounce: 150ms
		if (fileSearchTimer) clearTimeout(fileSearchTimer);
		const requestId = ++fileSearchRequestId;
		fileSearchTimer = setTimeout(async () => {
			try {
				const results = await searchWorkspaceFiles(query, 8);
				if (requestId === fileSearchRequestId) {
					fileSearchResults = results;
				}
			} catch {
				// Stale or failed — keep current results
			}
		}, 150);
	});

	// Filter skills based on searchFilter
	let suggestions = $derived(
		suggestionType === "skill"
			? skillsApi
					.catalog()
					.filter(
						(s) =>
							!searchFilter ||
							s.name
								.toLowerCase()
								.includes(searchFilter.toLowerCase()),
					)
					.slice(0, 8)
			: fileSearchResults,
	);

	// Lazy-load skills catalog on first / trigger
	let skillsLoadTriggered = false;
	$effect(() => {
		if (suggestionType === "skill" && !skillsLoadTriggered) {
			skillsLoadTriggered = true;
			skillsApi.loadCatalog();
		}
	});

	function handleInput(e: Event) {
		const textarea = e.currentTarget as HTMLTextAreaElement;
		const text = textarea.value;
		const caretPos = textarea.selectionStart;
		const textBeforeCaret = text.slice(0, caretPos);

		const fileMatch = textBeforeCaret.match(/@([a-zA-Z0-9_\-\.]*)$/);
		const skillMatch = textBeforeCaret.match(/\/([a-zA-Z0-9_\-]*)$/);

		if (fileMatch) {
			showSuggestions = true;
			suggestionType = "file";
			searchFilter = fileMatch[1];
			selectedSuggestionIndex = 0;
		} else if (skillMatch) {
			showSuggestions = true;
			suggestionType = "skill";
			searchFilter = skillMatch[1];
			selectedSuggestionIndex = 0;
		} else {
			showSuggestions = false;
			suggestionType = null;
			searchFilter = "";
		}

		textarea.style.height = "auto";
		textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
	}

	function selectSuggestion(suggestion: { name: string }) {
		if (!textareaElement) return;
		const text = promptValue;
		const caretPos = textareaElement.selectionStart;
		const textBeforeCaret = text.slice(0, caretPos);
		const textAfterCaret = text.slice(caretPos);

		let replacement = "";
		let matchLength = 0;
		if (suggestionType === "file") {
			replacement = `@[${suggestion.name}] `;
			const fileMatch = textBeforeCaret.match(/@([a-zA-Z0-9_\-\.]*)$/);
			matchLength = fileMatch ? fileMatch[0].length : 1;
		} else if (suggestionType === "skill") {
			replacement = `/${suggestion.name} `;
			const skillMatch = textBeforeCaret.match(/\/([a-zA-Z0-9_\-]*)$/);
			matchLength = skillMatch ? skillMatch[0].length : 1;
		}

		promptValue =
			textBeforeCaret.slice(0, caretPos - matchLength) +
			replacement +
			textAfterCaret;
		showSuggestions = false;
		suggestionType = null;
		tick().then(() => {
			if (textareaElement) {
				textareaElement.focus();
				const newCaretPos = caretPos - matchLength + replacement.length;
				textareaElement.setSelectionRange(newCaretPos, newCaretPos);
				textareaElement.style.height = "auto";
				textareaElement.style.height =
					Math.min(textareaElement.scrollHeight, 120) + "px";
			}
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		const list = suggestions;
		if (showSuggestions && list.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				selectedSuggestionIndex =
					(selectedSuggestionIndex + 1) % list.length;
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				selectedSuggestionIndex =
					(selectedSuggestionIndex - 1 + list.length) % list.length;
			} else if (e.key === "Enter") {
				e.preventDefault();
				selectSuggestion(list[selectedSuggestionIndex]);
			} else if (e.key === "Escape") {
				e.preventDefault();
				showSuggestions = false;
			}
		} else if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!promptValue.trim() || ideState.isAiStreaming) return;
			const form = (e.currentTarget as HTMLTextAreaElement).form;
			const submitBtn = form?.querySelector(
				"[data-prompt-submit]",
			) as HTMLButtonElement | null;
			if (submitBtn) form?.requestSubmit(submitBtn);
		}
	}

	function handlePromptSubmit(message: { text: string }) {
		if (!message.text.trim() || ideState.isAiStreaming) return;
		const toSend = message.text;
		promptValue = "";
		showSuggestions = false;
		if (textareaElement) textareaElement.style.height = "auto";
		ideState.sendAiMessage(toSend);
	}

	// Per-message checkpoint / restore (Stream A contract)
	async function createCheckpointAt(msgId: string) {
		await ideState.checkpointAt(msgId, "User checkpoint");
	}

	async function restoreCheckpointAt(msgId: string) {
		await ideState.restoreToCheckpoint(msgId);
	}

	// Drag-and-drop file attach
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}
	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		const projectPath = ideState.rootPath;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				// Tauri's webview attaches a native filesystem `path` to dropped File objects —
				// not part of the standard DOM File type, hence the augmentation here.
				const file = e.dataTransfer.files[i] as File & {
					path?: string;
				};
				const filePath = file.path || file.name;
				const fileName = file.name;
				if (ideState.attachedFiles.some((f) => f.path === filePath)) {
					ideState.addLog(
						`File ${fileName} is already attached.`,
						"error",
					);
					continue;
				}
				try {
					let content = "";
					if (file.path) {
						content = await readFile(file.path);
					} else {
						content = await new Promise<string>(
							(resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () =>
									resolve(reader.result as string);
								reader.onerror = reject;
								reader.readAsText(file);
							},
						);
					}
					if (projectPath !== ideState.rootPath) return;
					ideState.pushUndo();
					ideState.attachedFiles.push({
						path: filePath,
						name: fileName,
						content,
					});
					ideState.addLog(
						`Attached dropped file: ${fileName}`,
						"success",
					);
				} catch (err: unknown) {
					if (projectPath !== ideState.rootPath) return;
					ideState.addLog(
						`Failed to read dropped file: ${errorMessage(err)}`,
						"error",
					);
				}
			}
		} else {
			const text = e.dataTransfer?.getData("text/plain");
			if (text && text.startsWith("@[") && text.endsWith("]")) {
				insertText(text);
			}
		}
	}

	function insertText(tag: string) {
		if (!textareaElement) return;
		const text = promptValue;
		const caretPos = textareaElement.selectionStart;
		promptValue =
			text.slice(0, caretPos) + tag + " " + text.slice(caretPos);
		tick().then(() => {
			if (textareaElement) {
				textareaElement.focus();
				const newPos = caretPos + tag.length + 1;
				textareaElement.setSelectionRange(newPos, newPos);
			}
		});
	}

	// Retry last user message
	function handleRetry() {
		if (ideState.isAiStreaming) return;
		// Find last user message
		for (let i = ideState.chatMessages.length - 1; i >= 0; i--) {
			if (ideState.chatMessages[i].role === "user") {
				ideState.sendAiMessage(ideState.chatMessages[i].content);
				return;
			}
		}
	}

	// ModelSelector value from registry active() — null when nothing valid selected
	let selectorValue = $derived(activeModel?.id ?? "");
</script>

<!-- AI Chat Header -->
{#if showHeader}
	<div class="sidebar-header row ycenter gap4 xbetween ai-chat-sidebar">
		<div class="row ycenter gap8" role="tablist">
			{#if appState.activeTemplateId === "design"}
				<button
					type="button"
					class="sidebar-tab-item"
					class:active={activeTab === "style"}
					role="tab"
					aria-selected={activeTab === "style"}
					onclick={() => selectTab("style")}
				>
					<img
						src="/ic-fin/ds-style.svg"
						alt="Style"
						class="icon-svg-sm"
					/>
					<span class="sidebar-tab-item-text">Style</span>
				</button>
				<button
					type="button"
					class="sidebar-tab-item"
					class:active={activeTab === "export"}
					role="tab"
					aria-selected={activeTab === "export"}
					onclick={() => selectTab("export")}
				>
					<img
						src="/ic-fin/ds-export.svg"
						alt="Export"
						class="icon-svg-sm"
					/>
					<span class="sidebar-tab-item-text">Export</span>
				</button>
			{/if}
			<button
				type="button"
				class="sidebar-tab-item"
				class:active={activeTab === "ai"}
				role="tab"
				aria-selected={activeTab === "ai"}
				onclick={() => selectTab("ai")}
			>
				<img src="/iconset/aiAssistant.svg" alt="AI" class="icon-svg-sm" />
				<span class="sidebar-tab-item-text truncate">AI</span>
			</button>
			<button
				type="button"
				class="sidebar-tab-item"
				class:active={activeTab === "history"}
				role="tab"
				aria-selected={activeTab === "history"}
				onclick={() => selectTab("history")}
			>
				<img
					src="/iconset/history.svg"
					alt="History"
					class="icon-svg-sm"
				/>
				<span class="sidebar-tab-item-text truncate">History</span>
			</button>
		</div>
		<div class="row ycenter gap8">
			<button
				type="button"
				class="btn-icon"
				onclick={handleNewChat}
				title="New Chat"
			>
				<img src="/iconset/add.svg" alt="New Chat" class="icon-svg" />
			</button>
			<button
				type="button"
				class="btn-icon"
				onclick={handleCloseChat}
				disabled={ideState.chatMessages.length === 0 &&
					!ideState.isAiStreaming}
				title="Close Chat"
			>
				<img
					src="/iconset/close.svg"
					alt="Close Chat"
					class="icon-svg"
				/>
			</button>
			<Context
				usage={currentUsage}
				{maxTokens}
				modelId={activeModelId}
				compact
			/>
		</div>
	</div>
{/if}
<div class="sidebar-content-box">
	{#if activeTab === "ai"}
		<div class="box pad8 full-length">
			<!-- Conversation: scrollable, stick-to-bottom -->
			<Conversation>
				{#if ideState.chatMessages.length === 0 && !ideState.isAiStreaming}
					<div class="empty-state"></div>
				{/if}

				{#each ideState.chatMessages as msg (msg.id)}
					{#if msg.role === "user"}
						<div class="ai-message-box role-user">
							<div class="message-meta">
								You • {msg.timestamp}
							</div>
							<div class="message-bubble">
								<Response content={msg.content} />
							</div>
						</div>
					{:else if msg.isError}
						<div class="ai-message-box role-assistant is-error">
							<div class="message-meta">
								Copilot • {msg.timestamp}
							</div>
							<div class="message-bubble is-error">
								<img
									class="error-icon icon-svg-sm"
									src="/iconset/warning.svg"
									alt=""
								/>
								<Response content={msg.content} />
								<Actions
									onRetry={handleRetry}
									copyText={msg.content}
								/>
							</div>
						</div>
					{:else}
						<div class="ai-message-row role-assistant">
							<div class="message-bubble">
								{#if msg.reasoning}
									<Reasoning
										text={msg.reasoning}
										isStreaming={false}
									/>
								{/if}
								<Response content={msg.content} />
								<div class="message-meta">
									Copilot • {msg.timestamp}
								</div>
								<Actions
									onRetry={handleRetry}
									copyText={msg.content}
								>
									{#snippet children()}
										<button
											type="button"
											class="ai-action-btn"
											onclick={() =>
												createCheckpointAt(msg.id)}
											title="Save checkpoint"
										>
											✦ Checkpoint
										</button>
									{/snippet}
								</Actions>
							</div>
						</div>
					{/if}
				{/each}

				<!-- Streaming Assistant -->
				{#if ideState.isAiStreaming}
					<div class="ai-message-row role-assistant">
						<div class="message-meta">Copilot • Thinking...</div>
						<div class="message-bubble">
							{#if ideState.streamingReasoning}
								<Reasoning
									text={ideState.streamingReasoning}
									isStreaming={true}
								/>
							{/if}
							{#if ideState.streamingText}
								<Response
									content={ideState.streamingText}
									isStreaming={true}
								/>
							{:else}
								<div class="dot-typing-row">
									<div class="dot-typing"></div>
									<div class="dot-typing"></div>
									<div class="dot-typing"></div>
								</div>
							{/if}
						</div>
					</div>

					<!-- System Status checklist (kept for visual continuity) -->
					<div class="exec-step-box">
						<div class="exec-step-title">
							<span class="exec-dot-status exec-dot-status-active"
							></span>
							<span class="uppercase">Copilot Execution Step</span
							>
						</div>
						<div class="exec-step-list">
							<div class="exec-step-row">
								<img
									src="/iconset/checkmarkList.svg"
									alt="Done"
									class="icon-svg-xs icon-dimmed"
								/>
								<span class="col2"
									>Context parsed ({ideState.fileEntries
										.length} files available)</span
								>
							</div>
							{#if ideState.attachedFiles.length > 0}
								<div class="exec-step-row">
									<img
										src="/iconset/checkmarkList.svg"
										alt="Done"
										class="icon-svg-xs icon-dimmed"
									/>
									<span class="col2"
										>Attached {ideState.attachedFiles
											.length} local files as reference</span
									>
								</div>
							{/if}
							<div class="exec-step-row">
								{#if ideState.streamingText || ideState.streamingReasoning}
									<img
										src="/iconset/checkmarkList.svg"
										alt="Done"
										class="icon-svg-xs icon-dimmed"
									/>
									<span class="col2"
										>Connected to {ideState.aiProvider.toUpperCase()}
										({ideState.activeApiModel ||
											ideState.selectedModelId})</span
									>
								{:else}
									<span
										class="exec-dot-status exec-dot-status-idle"
									></span>
									<span class="col3"
										>Contacting API provider stream...</span
									>
								{/if}
							</div>
							{#if ideState.streamingReasoning}
								<div class="exec-step-row">
									{#if ideState.streamingText}
										<img
											src="/iconset/checkmarkList.svg"
											alt="Done"
											class="icon-svg-xs icon-dimmed"
										/>
										<span class="col2"
											>Reasoning process completed</span
										>
									{:else}
										<span
											class="exec-dot-status exec-dot-status-active"
										></span>
										<span class="col3"
											>Thinking: streaming
											chain-of-thought...</span
										>
									{/if}
								</div>
							{/if}
							{#if ideState.streamingText}
								<div class="exec-step-row">
									<span
										class="exec-dot-status exec-dot-status-active"
									></span>
									<span class="col3"
										>Streaming reply tokens...</span
									>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</Conversation>
			<!-- Prompt Box Panel -->
			<div class="ai-input-area">
				<PromptInput
					bind:value={promptValue}
					status={ideState.isAiStreaming ? "streaming" : "ready"}
					onSubmit={handlePromptSubmit}
					onStop={() => ideState.stopAiStreaming()}
				>
					{#snippet body()}
						{#if showSuggestions && suggestions.length > 0}
							<div class="autocomplete-suggestions-panel">
								{#each suggestions as item, idx (`${suggestionType}:${item.name}`)}
									<button
										type="button"
										class="suggestion-item-row {idx ===
										selectedSuggestionIndex
											? 'is-selected'
											: ''}"
										onclick={() => selectSuggestion(item)}
									>
										{#if suggestionType === "file"}
											<span
												class="suggestion-type-badge type-file"
												>File</span
											>
											<span class="box gap4 truncate">
												<span class="truncate"
													>{item.name}</span
												>
												<span
													class="text-3xs col3 shrink-0"
													>{"path" in item
														? item.path
														: ""}</span
												>
											</span>
										{:else if suggestionType === "skill"}
											<span
												class="suggestion-type-badge type-skill"
												>Skill</span
											>
											<span class="truncate"
												>/{item.name} — {"description" in
												item
													? item.description
													: ""}</span
											>
										{/if}
									</button>
								{/each}
							</div>
						{/if}

						{#if ideState.attachedFiles.length > 0}
							<div class="row wrap">
								{#each ideState.attachedFiles as file (file.path)}
									<div class="attached-file-chip">
										<img
											src="/iconset/fileUnread.svg"
											alt="File"
											class="icon-svg-xs"
										/>
										<span
											class="text-3xs col2 font-bold truncate attached-file-name"
											>{file.name}</span
										>
										<button
											type="button"
											class="text-3xs col3 font-bold hover-col1"
											onclick={() =>
												ideState.removeAttachedFile(
													file.path,
												)}>×</button
										>
									</div>
								{/each}
							</div>
						{/if}

						<div
							class="prompt-textarea-wrapper {isDragging
								? 'prompt-drop-highlight'
								: ''}"
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
							role="region"
							aria-label="Prompt drop zone"
						>
							<textarea
								bind:this={textareaElement}
								class="prompt-textarea"
								placeholder="Ask Copilot..."
								bind:value={promptValue}
								oninput={handleInput}
								onkeydown={handleKeydown}
								rows="1"
								disabled={ideState.isAiStreaming}
							></textarea>
						</div>
					{/snippet}

					{#snippet tools()}
						<button
							type="button"
							class="chat-action-btn"
							onclick={() => { textareaElement?.focus(); void dictation.toggle(); }}
							title={dictation.isActive ? 'Stop Dictation' : 'Start Dictation (Cmd+Shift+D)'}
							aria-label={dictation.isActive ? 'Stop Dictation' : 'Start Dictation'}
						>
							<img src="/iconset/record.svg" alt="" class="icon-svg-sm" />
						</button>
						<button
							type="button"
							class="chat-action-btn"
							onclick={() => ideState.attachFile()}
							title="Attach File"
						>
							<img
								src="/iconset/attach.svg"
								alt="Attach"
								class="icon-svg-sm"
							/>
						</button>
						<button
							type="button"
							class="chat-action-btn"
							onclick={() => triggerAutocomplete("file")}
							title="Reference File (@)"
						>
							<span class="chat-action-text">@</span>
						</button>
						<button
							type="button"
							class="chat-action-btn"
							onclick={() => triggerAutocomplete("skill")}
							title="Enable Skill Template (/)"
						>
							<span class="chat-action-text">#</span>
						</button>
					{/snippet}
					{#snippet toolbar()}
						<div class="prompt-model-select-wrap">
							<ModelSelector
								groups={modelGroups}
								value={selectorValue}
								placeholder="Select a model…"
								onSelect={onModelSelect}
							/>
							{#if localModelStatus}
								<span
									class="local-model-status is-{localModelStatus.kind}"
									role="status"
									title={localModelStatus.title}
								>
									<span class="local-model-status-dot" aria-hidden="true"></span>
									<span>{localModelStatus.label}</span>
								</span>
							{/if}
							<Context
								usage={currentUsage}
								{maxTokens}
								modelId={activeModelId}
							/>
						</div>
					{/snippet}
				</PromptInput>
			</div>
		</div>
	{:else if activeTab === "history"}
		<!-- History: past chat sessions for this project -->
		<div class="history-list">
			{#if ideState.sessions.length === 0}
				<div class="empty-state">
					<p>No chat history yet</p>
				</div>
			{:else}
				{#each ideState.sessions as session (session.id)}
					<button
						type="button"
						class="box history-item"
						onclick={() => openHistoryItem(session.id)}
					>
						<span class="text-md w600 truncate"
							>{session.preview || "Untitled chat"}</span
						>
						<span class="text-sm"
							>{session.messageCount} message{session.messageCount ===
							1
								? ""
								: "s"}</span
						>
						<span class="text-xs"
							>{formatSessionTimestamp(session.updatedAt)} | {session.model ||
								"unknown model"}</span
						>
					</button>
				{/each}
			{/if}
		</div>
	{:else if activeTab === "style"}
		<div class="styling-panel box">
			<DesignInspector />
		</div>
	{:else if activeTab === "export"}
		<div class="export-panel box">
			<ExportPanel />
		</div>
	{/if}
</div>
