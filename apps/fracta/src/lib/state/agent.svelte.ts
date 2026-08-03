/**
 * Agent configuration — either a remote OpenAI-compatible API, or a local GGUF
 * loaded via llama-server (managed by the Tauri backend).
 */

import {
	ggufLoad,
	ggufStatus,
	ggufUnload,
	isTauri,
	pickGguf,
	type GgufStatus
} from '$lib/ipc';

const STORAGE_KEY = 'fracta:agent';

export type AgentMode = 'api' | 'gguf';

export interface AgentConfig {
	/** Human label shown in the UI (e.g. "xAI", "OpenRouter"). */
	providerName: string;
	/** OpenAI-compatible base URL, usually ending in `/v1`. */
	baseUrl: string;
	/** Bearer token / API key. */
	apiKey: string;
	/** Model id the provider expects (e.g. `grok-4.5`, `gpt-4o-mini`). */
	model: string;
}

interface Persisted {
	mode?: AgentMode;
	providerName?: string;
	baseUrl?: string;
	apiKey?: string;
	model?: string;
	/** Last chosen GGUF path — reloaded on demand, not auto-loaded at boot. */
	ggufPath?: string;
}

function load(): Persisted {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Persisted) : {};
	} catch {
		return {};
	}
}

class AgentSettings {
	mode = $state<AgentMode>('api');

	providerName = $state('');
	baseUrl = $state('');
	apiKey = $state('');
	model = $state('');

	/** Absolute path to the selected .gguf (may not be loaded yet). */
	ggufPath = $state('');
	gguf = $state<GgufStatus>({
		loaded: false,
		loading: false,
		path: null,
		fileName: null,
		baseUrl: null,
		port: null,
		error: null,
		serverAvailable: false,
		serverPath: null
	});

	constructor() {
		const initial = load();
		if (initial.mode === 'api' || initial.mode === 'gguf') this.mode = initial.mode;
		this.providerName = initial.providerName ?? '';
		this.baseUrl = initial.baseUrl ?? '';
		this.apiKey = initial.apiKey ?? '';
		this.model = initial.model ?? '';
		this.ggufPath = initial.ggufPath ?? '';
	}

	/** True when the active mode can answer asks. */
	get configured(): boolean {
		if (this.mode === 'gguf') {
			return this.gguf.loaded && Boolean(this.gguf.baseUrl);
		}
		return (
			this.baseUrl.trim() !== '' &&
			this.apiKey.trim() !== '' &&
			this.model.trim() !== ''
		);
	}

	get label(): string {
		if (this.mode === 'gguf') {
			const name = this.gguf.fileName || this.ggufPath.split(/[/\\]/).pop() || 'GGUF';
			return this.gguf.loaded ? `Local · ${name}` : `Local · ${name} (not loaded)`;
		}
		const name = this.providerName.trim() || 'Agent';
		const model = this.model.trim();
		return model ? `${name} · ${model}` : name;
	}

	/**
	 * Effective OpenAI-compatible config for the chat client.
	 * Local GGUF uses a dummy key — llama-server does not require auth.
	 */
	snapshot(): AgentConfig {
		if (this.mode === 'gguf' && this.gguf.baseUrl) {
			const name = this.gguf.fileName || 'local-gguf';
			return {
				providerName: 'Local GGUF',
				baseUrl: this.gguf.baseUrl,
				apiKey: 'local',
				model: name
			};
		}
		return {
			providerName: this.providerName.trim(),
			baseUrl: this.baseUrl.trim(),
			apiKey: this.apiKey.trim(),
			model: this.model.trim()
		};
	}

	setMode(mode: AgentMode) {
		this.mode = mode;
		this.#persist();
	}

	save(next: Partial<AgentConfig>) {
		if (next.providerName !== undefined) this.providerName = next.providerName;
		if (next.baseUrl !== undefined) this.baseUrl = next.baseUrl;
		if (next.apiKey !== undefined) this.apiKey = next.apiKey;
		if (next.model !== undefined) this.model = next.model;
		this.#persist();
	}

	clear() {
		this.providerName = '';
		this.baseUrl = '';
		this.apiKey = '';
		this.model = '';
		this.#persist();
	}

	async refreshGgufStatus() {
		if (!isTauri()) {
			this.gguf = {
				loaded: false,
				loading: false,
				path: null,
				fileName: null,
				baseUrl: null,
				port: null,
				error: 'Local GGUF requires the desktop app (Tauri).',
				serverAvailable: false,
				serverPath: null
			};
			return;
		}
		try {
			this.gguf = await ggufStatus();
		} catch (e) {
			this.gguf = {
				...this.gguf,
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}

	/** Native file picker → store path (does not load yet). */
	async chooseGguf(): Promise<string | null> {
		if (!isTauri()) return null;
		const path = await pickGguf();
		if (!path) return null;
		this.ggufPath = path;
		this.mode = 'gguf';
		this.#persist();
		return path;
	}

	/** Start llama-server with the selected GGUF. */
	async loadGguf(path?: string): Promise<void> {
		const target = (path ?? this.ggufPath).trim();
		if (!target) throw new Error('No GGUF file selected.');
		if (!isTauri()) throw new Error('Local GGUF requires the desktop app.');

		this.ggufPath = target;
		this.mode = 'gguf';
		this.gguf = { ...this.gguf, loading: true, error: null };
		this.#persist();

		try {
			this.gguf = await ggufLoad(target);
			if (!this.gguf.loaded) {
				throw new Error(this.gguf.error || 'Failed to load GGUF.');
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			this.gguf = {
				...this.gguf,
				loaded: false,
				loading: false,
				error: message
			};
			throw e;
		}
	}

	async unloadGguf(): Promise<void> {
		if (!isTauri()) return;
		await ggufUnload();
		await this.refreshGgufStatus();
	}

	#persist() {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: Persisted = {
				mode: this.mode,
				providerName: this.providerName.trim(),
				baseUrl: this.baseUrl.trim(),
				apiKey: this.apiKey.trim(),
				model: this.model.trim(),
				ggufPath: this.ggufPath
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// quota / private mode
		}
	}
}

export const agent = new AgentSettings();
