// Shared types for ai-elements components (Stream B contract)
// Both Stream A (state/backend) and Stream B (presentation) consume these.

export interface ModelOption {
	id: string;
	label: string;
	provider: string; // passed back verbatim on selection
	runnable?: boolean;
	unavailableReason?: string;
}

export interface ModelGroup {
	label: string;
	options: ModelOption[];
}

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
	reasoningTokens?: number;
	cachedInputTokens?: number;
}
