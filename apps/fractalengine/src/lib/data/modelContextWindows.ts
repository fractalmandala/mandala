// Max context-window sizes (in tokens) for known models, used as the denominator
// of the AI Context usage meter (ADR-011 / ai-elements remaster). Unknown model
// ids — including user-added custom and `.env`-derived ones — fall back to DEFAULT.
//
// These types are the cross-stream contract shape (mirrors ai-elements/types.ts);
// they live here so Stream A compiles without depending on Stream B's files.

export interface ModelOption {
	id: string;
	label: string;
	provider: string;
}

export interface ModelGroup {
	label: string;
	options: ModelOption[];
}

export const DEFAULT_CONTEXT_WINDOW = 8192;

// Keyed by a substring matched case-insensitively against the model id.
const CONTEXT_WINDOWS: Array<[string, number]> = [
	// OpenAI
	['gpt-4o', 128000],
	['gpt-4-turbo', 128000],
	['gpt-4.1', 1000000],
	['gpt-4', 8192],
	['gpt-3.5', 16385],
	['o1', 200000],
	['o3', 200000],
	// Anthropic
	['claude-3-5', 200000],
	['claude-3-7', 200000],
	['claude-sonnet-4', 200000],
	['claude-haiku-4', 200000],
	['claude-opus-4', 200000],
	['claude-3', 200000],
	['claude', 200000],
	// Google Gemini
	['gemini-1.5-pro', 2000000],
	['gemini-1.5-flash', 1000000],
	['gemini-2.5', 1000000],
	['gemini-2.0', 1000000],
	['gemini', 1000000],
	// DeepSeek
	['deepseek-reasoner', 65536],
	['deepseek-coder', 16384],
	['deepseek', 65536],
	// xAI Grok
	['grok-2', 131072],
	['grok-beta', 131072],
	['grok', 131072],
	// Z.ai
	['z-code', 128000],
	['z-chat', 128000],
	// Common local / Ollama models
	['qwen2.5', 32768],
	['qwen', 32768],
	['llama-3', 8192],
	['llama3', 8192],
	['llama2', 4096],
	['mistral', 32768],
	['codellama', 16384],
	['gemma', 8192]
];

/** Returns the max context-window (tokens) for a model id, or DEFAULT if unknown. */
export function maxContextTokensFor(modelId: string | undefined | null): number {
	if (!modelId) return DEFAULT_CONTEXT_WINDOW;
	const id = modelId.toLowerCase();
	for (const [needle, size] of CONTEXT_WINDOWS) {
		if (id.includes(needle)) return size;
	}
	return DEFAULT_CONTEXT_WINDOW;
}
