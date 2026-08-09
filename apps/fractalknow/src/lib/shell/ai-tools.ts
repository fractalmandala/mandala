import { derived, writable } from 'svelte/store';
import type { OkDesktopBridge } from '$lib/desktop';
import { appConfig, updateAppConfig } from './config';

export type AgentToolId = 'claude' | 'codex' | 'cursor';

export type AgentToolSpec = {
	id: AgentToolId;
	name: string;
	scheme: string;
	defaultCommand: string;
	description: string;
};

export const BUILTIN_AGENT_TOOLS: AgentToolSpec[] = [
	{
		id: 'claude',
		name: 'Claude Code',
		scheme: 'claude',
		defaultCommand: 'claude --dangerously-skip-permissions',
		description: 'Anthropic CLI agent for terminal coding workflows.',
	},
	{
		id: 'codex',
		name: 'Codex CLI',
		scheme: 'codex',
		defaultCommand: 'codex --full-auto',
		description: 'Local coding assistant with automated tool execution.',
	},
	{
		id: 'cursor',
		name: 'Cursor',
		scheme: 'cursor',
		defaultCommand: 'cursor .',
		description: 'AI-first code editor with terminal and IPC integration.',
	},
];

export type ToolConfigOverride = {
	enabled: boolean;
	launchCommand: string;
};

export type AgentDetectionMap = Record<AgentToolId, boolean>;

const initialDetection: AgentDetectionMap = {
	claude: false,
	codex: false,
	cursor: false,
};

export const agentDetection = writable<AgentDetectionMap>(initialDetection);

/**
 * Parses raw system launch services / protocol dump text to determine if a scheme is registered.
 * Pure function suitable for unit testing.
 */
export function parseProtocolDetection(dumpText: string, scheme: string): boolean {
	if (!dumpText || !scheme) return false;
	const lower = dumpText.toLowerCase();
	const target = `${scheme.toLowerCase()}:`;
	return lower.includes(target);
}

/**
 * Checks system protocol detection via the Tauri bridge desktop API for a given scheme.
 */
export async function detectAgentTool(
	bridge: OkDesktopBridge | null,
	scheme: string,
): Promise<boolean> {
	if (!bridge || bridge.runtime !== 'tauri') return false;
	try {
		const res = await bridge.shell.detectProtocol(scheme);
		if (res && 'installed' in res) {
			return Boolean(res.installed);
		}
	} catch {
		// fallthrough to false
	}
	return false;
}

/**
 * Runs detection sweeps across all built-in agent tools.
 */
export async function refreshAgentDetections(bridge: OkDesktopBridge | null): Promise<AgentDetectionMap> {
	const results: AgentDetectionMap = { ...initialDetection };
	for (const tool of BUILTIN_AGENT_TOOLS) {
		results[tool.id] = await detectAgentTool(bridge, tool.scheme);
	}
	agentDetection.set(results);
	return results;
}

/**
 * Helper to get the effective enabled state and launch command for a tool,
 * considering project config defaults and overrides.
 */
export function getToolState(
	config: { agentTools: { enabledProviders: string[]; overrides?: Record<string, ToolConfigOverride> } },
	toolId: AgentToolId,
) {
	const spec = BUILTIN_AGENT_TOOLS.find((t) => t.id === toolId);
	const override = config.agentTools.overrides?.[toolId];

	const enabled = override?.enabled ?? config.agentTools.enabledProviders.includes(toolId);
	const launchCommand = override?.launchCommand || spec?.defaultCommand || '';

	return { enabled, launchCommand, isOverridden: override !== undefined };
}

/**
 * Update global or project-level tool enablement and launch command in appConfig.
 */
export function setToolOverride(
	toolId: AgentToolId,
	enabled: boolean,
	launchCommand: string,
): void {
	updateAppConfig((config) => {
		const currentOverrides = config.agentTools.overrides ?? {};
		const nextOverrides = {
			...currentOverrides,
			[toolId]: { enabled, launchCommand: launchCommand.trim() },
		};

		// Also sync enabledProviders set
		const enabledProvidersSet = new Set(config.agentTools.enabledProviders);
		if (enabled) {
			enabledProvidersSet.add(toolId as any);
		} else {
			enabledProvidersSet.delete(toolId as any);
		}

		return {
			...config,
			agentTools: {
				...config.agentTools,
				enabledProviders: Array.from(enabledProvidersSet) as any[],
				overrides: nextOverrides,
			},
		};
	});
}

/**
 * Clear override for a tool to restore default behavior.
 */
export function clearToolOverride(toolId: AgentToolId): void {
	updateAppConfig((config) => {
		const currentOverrides = { ...(config.agentTools.overrides ?? {}) };
		delete currentOverrides[toolId];
		return {
			...config,
			agentTools: {
				...config.agentTools,
				overrides: currentOverrides,
			},
		};
	});
}
