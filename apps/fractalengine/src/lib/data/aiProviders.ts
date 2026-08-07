export const AI_PROVIDER_DEFINITIONS = [
	{ id: 'sidecar', label: 'Metal GGUF / MLX Sidecar (Local)', kind: 'local', defaultBaseUrl: '' },
	{ id: 'env', label: 'Project .env Provider', kind: 'dynamic', defaultBaseUrl: '' },
	{ id: 'openai', label: 'OpenAI', kind: 'api', defaultBaseUrl: 'https://api.openai.com' },
	{ id: 'anthropic', label: 'Anthropic Claude', kind: 'api', defaultBaseUrl: 'https://api.anthropic.com' },
	{ id: 'gemini', label: 'Google Gemini', kind: 'api', defaultBaseUrl: 'https://generativelanguage.googleapis.com' },
	{ id: 'deepseek', label: 'DeepSeek', kind: 'api', defaultBaseUrl: 'https://api.deepseek.com' },
	{ id: 'xai', label: 'xAI Grok', kind: 'api', defaultBaseUrl: 'https://api.x.ai' },
	{ id: 'zai', label: 'Z.ai', kind: 'api', defaultBaseUrl: 'https://api.z.ai' },
	{ id: 'ollama', label: 'Ollama', kind: 'local-api', defaultBaseUrl: 'http://localhost:11434' },
	{ id: 'custom', label: 'Custom Provider / Added Models', kind: 'dynamic', defaultBaseUrl: '' }
] as const;

export type AiProvider = typeof AI_PROVIDER_DEFINITIONS[number]['id'];

export function isAiProvider(value: string): value is AiProvider {
	return AI_PROVIDER_DEFINITIONS.some(provider => provider.id === value);
}

export function providerDefinition(provider: AiProvider) {
	return AI_PROVIDER_DEFINITIONS.find(definition => definition.id === provider)!;
}
