import { markdownToBlocks, streamingBlocks } from '$lib/agent/blocks';
import { AgentRequestError, streamChatCompletion } from '$lib/agent/openai-compat';
import { buildSystemPrompt, turnsToMessages, type LocalDocumentContext } from '$lib/agent/prompt';
import { agent } from '$lib/state/agent.svelte';
import { entries } from '$lib/state/entries.svelte';

export type AskBlock =
	| { type: 'p'; text: string }
	| { type: 'h'; text: string }
	| { type: 'list'; items: string[] }
	| { type: 'code'; lines: string[] };

export interface AskTurn {
	role: 'user' | 'assistant';
	content: AskBlock[];
	thinking?: string;
	thinkingLabel?: string;
	/** Error style for failed assistant turns. */
	error?: boolean;
}

/**
 * Ask column — streams from API provider or local GGUF (llama-server).
 */
class Ask {
	turns = $state<AskTurn[]>([]);
	draft = $state('');
	streaming = $state(false);
	error = $state<string | null>(null);
	/** Entry id the transcript was built against. */
	#boundId: string | null = null;
	#abort: AbortController | null = null;
	#context: LocalDocumentContext | null = null;

	get title(): string {
		return this.#context?.title || entries.title.trim() || 'this note';
	}

	get sourcePath(): string | null {
		return this.#context?.path ?? null;
	}

	get configured(): boolean {
		return agent.configured;
	}

	/** Reset when the user switches notes so answers don't bleed. */
	syncToActive() {
		if (this.#context) return;
		const id = entries.activeId;
		if (id === this.#boundId) return;
		this.#boundId = id;
		this.#context = null;
		this.#cancelInFlight();
		this.turns = [];
		this.draft = '';
		this.streaming = false;
		this.error = null;
	}

	setWorkspaceContext(path: string, content: string) {
		const id = `workspace:${path}`;
		if (id === this.#boundId && this.#context?.content === content) return;
		this.#boundId = id;
		this.#context = { path, title: path.split('/').at(-1) || path, content };
		this.#cancelInFlight();
		this.turns = [];
		this.draft = '';
		this.streaming = false;
		this.error = null;
	}

	setWorkspaceSources(title: string, sources: { path: string; content: string }[]) {
		const usable = sources.filter((source) => source.content.trim());
		const id = `workspace-sources:${usable.map((source) => source.path).join('|')}`;
		this.#boundId = id;
		this.#context = {
			path: `${title} (${usable.length} sources)`,
			title,
			content: '',
			sources: usable
		};
		this.#cancelInFlight();
		this.turns = [];
		this.draft = '';
		this.streaming = false;
		this.error = null;
	}

	clear() {
		this.#cancelInFlight();
		this.turns = [];
		this.draft = '';
		this.streaming = false;
		this.error = null;
	}

	async send(text: string) {
		const question = text.trim();
		if (!question || this.streaming) return;

		this.error = null;
		this.turns = [
			...this.turns,
			{ role: 'user', content: [{ type: 'p', text: question }] }
		];
		this.draft = '';

		if (!agent.configured) {
			const hint =
				agent.mode === 'gguf'
					? 'Load a local GGUF first: open Agent settings → Local GGUF → Choose file → Load model. Requires llama.cpp (`brew install llama.cpp`).'
					: 'Connect a provider first: open Agent settings and set API key, base URL, and model — or load a local GGUF.';
			this.turns = [
				...this.turns,
				{
					role: 'assistant',
					content: [{ type: 'p', text: hint }]
				}
			];
			return;
		}

		this.streaming = true;
		const config = agent.snapshot();
		const assistantIndex = this.turns.length;
		const thinkingLabel =
			agent.mode === 'gguf' ? 'Local GGUF' : config.providerName || 'Agent';
		const thinking =
			agent.mode === 'gguf'
				? `Running ${config.model} on this machine…`
				: `Calling ${config.model}…`;

		this.turns = [
			...this.turns,
			{
				role: 'assistant',
				thinkingLabel,
				thinking,
				content: [{ type: 'p', text: '' }]
			}
		];

		const messages = [
			{ role: 'system' as const, content: buildSystemPrompt(this.#context ?? undefined) },
			...turnsToMessages(this.turns.slice(0, assistantIndex))
		];

		this.#abort = new AbortController();
		let raw = '';

		try {
			for await (const delta of streamChatCompletion(
				config,
				messages,
				this.#abort.signal
			)) {
				raw += delta;
				this.#patchAssistant(assistantIndex, {
					thinking: undefined,
					thinkingLabel: undefined,
					content: streamingBlocks(raw)
				});
			}

			if (raw.trim()) {
				this.#patchAssistant(assistantIndex, {
					content: markdownToBlocks(raw)
				});
			} else {
				this.#patchAssistant(assistantIndex, {
					content: [
						{
							type: 'p',
							text: 'The model returned an empty response.'
						}
					],
					error: true
				});
			}
		} catch (err) {
			if (this.#abort?.signal.aborted) {
				return;
			}
			const message =
				err instanceof AgentRequestError
					? err.message
					: err instanceof Error
						? err.message
						: String(err);
			this.error = message;
			if (raw.trim()) {
				this.#patchAssistant(assistantIndex, {
					thinking: undefined,
					content: [
						...markdownToBlocks(raw),
						{ type: 'p', text: `⚠ ${message}` }
					],
					error: true
				});
			} else {
				this.#patchAssistant(assistantIndex, {
					thinking: undefined,
					thinkingLabel: undefined,
					content: [{ type: 'p', text: message }],
					error: true
				});
			}
		} finally {
			this.streaming = false;
			this.#abort = null;
		}
	}

	#patchAssistant(index: number, patch: Partial<AskTurn>) {
		const next = [...this.turns];
		const current = next[index];
		if (!current || current.role !== 'assistant') return;
		next[index] = { ...current, ...patch };
		this.turns = next;
	}

	#cancelInFlight() {
		if (this.#abort) {
			this.#abort.abort();
			this.#abort = null;
		}
	}
}

export const ask = new Ask();
