import type { AgentConfig } from '$lib/state/agent.svelte';

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export class AgentRequestError extends Error {
	status?: number;
	constructor(message: string, status?: number) {
		super(message);
		this.name = 'AgentRequestError';
		this.status = status;
	}
}

/** Join base URL + `/chat/completions`, tolerant of trailing slashes and full paths. */
export function chatCompletionsUrl(baseUrl: string): string {
	const cleaned = baseUrl.trim().replace(/\/+$/, '');
	if (!cleaned) throw new AgentRequestError('API base URL is empty.');
	if (cleaned.endsWith('/chat/completions')) return cleaned;
	return `${cleaned}/chat/completions`;
}

/**
 * Stream an OpenAI-compatible chat completion.
 * Yields text deltas (not full JSON events).
 */
export async function* streamChatCompletion(
	config: AgentConfig,
	messages: ChatMessage[],
	signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
	const url = chatCompletionsUrl(config.baseUrl);
	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.apiKey}`
			},
			body: JSON.stringify({
				model: config.model,
				messages,
				stream: true,
				temperature: 0.4
			}),
			signal
		});
	} catch (err) {
		if (signal?.aborted) return;
		const msg = err instanceof Error ? err.message : String(err);
		throw new AgentRequestError(
			`Network error reaching ${config.providerName || 'provider'}: ${msg}`
		);
	}

	if (!response.ok) {
		let raw = '';
		try {
			raw = await response.text();
		} catch {
			// ignore
		}
		throw new AgentRequestError(
			formatHttpError(response.status, config, raw),
			response.status
		);
	}

	if (!response.body) {
		throw new AgentRequestError('Provider returned an empty body (no stream).');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			// SSE frames separated by blank lines
			const parts = buffer.split('\n');
			buffer = parts.pop() ?? '';

			for (const line of parts) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith(':')) continue;
				if (!trimmed.startsWith('data:')) continue;
				const data = trimmed.slice(5).trim();
				if (data === '[DONE]') return;

				try {
					const json = JSON.parse(data) as {
						choices?: Array<{
							delta?: { content?: string | null };
							message?: { content?: string | null };
						}>;
						error?: { message?: string };
					};
					if (json.error?.message) {
						throw new AgentRequestError(json.error.message);
					}
					const delta =
						json.choices?.[0]?.delta?.content ??
						json.choices?.[0]?.message?.content ??
						'';
					if (delta) yield delta;
				} catch (err) {
					if (err instanceof AgentRequestError) throw err;
					// skip malformed chunks
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

/** Pull OpenAI-style `error.message` / `code` out of a raw error body. */
function parseProviderError(raw: string): { message?: string; code?: string } {
	if (!raw.trim()) return {};
	try {
		const json = JSON.parse(raw) as {
			error?: { message?: string; code?: string; type?: string };
			message?: string;
		};
		return {
			message: json.error?.message ?? json.message,
			code: json.error?.code ?? json.error?.type
		};
	} catch {
		return { message: raw.slice(0, 280) };
	}
}

function formatHttpError(status: number, config: AgentConfig, raw: string): string {
	const who = config.providerName || 'Provider';
	const model = config.model;
	const { message, code } = parseProviderError(raw);

	if (status === 401 || status === 403) {
		return `${who} rejected the API key (${status}). Check the key in Agent settings.`;
	}
	if (status === 404) {
		return `${who} returned 404 — check the API base URL (e.g. …/v1) and model id.`;
	}
	if (status === 429) {
		return `${who} rate-limited the request. Wait a moment and try again.`;
	}

	// Model id is wrong for this endpoint — most common 400.
	if (
		code === 'unsupported_model' ||
		code === 'model_not_found' ||
		/not supported|model.*(invalid|not found|unknown)/i.test(message ?? '')
	) {
		return [
			`${who}: model “${model}” is not valid on this endpoint.`,
			'Use the provider’s exact API model id (often lowercase, sometimes vendor/slug — not a display name like “GPT-5.5”).',
			'Open Agent settings and paste an id from the provider’s models list.'
		].join(' ');
	}

	if (message) return `${who}: ${message}`;
	return `${who} error ${status}`;
}
