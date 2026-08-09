import { describe, expect, it } from 'vitest';
import {
	BUILTIN_AGENT_TOOLS,
	getToolState,
	parseProtocolDetection,
} from './ai-tools';

describe('ai-tools detection and configuration logic', () => {
	describe('parseProtocolDetection', () => {
		it('correctly detects registered schemes in system dump strings', () => {
			const mockDump = `
				bindings:
				  scheme: claude: -> /Applications/Claude.app
				  scheme: cursor: -> /Applications/Cursor.app
			`;

			expect(parseProtocolDetection(mockDump, 'claude')).toBe(true);
			expect(parseProtocolDetection(mockDump, 'cursor')).toBe(true);
			expect(parseProtocolDetection(mockDump, 'codex')).toBe(false);
		});

		it('handles case-insensitivity and empty dumps gracefully', () => {
			const dump = 'Registered Handler: CLAUDE:';
			expect(parseProtocolDetection(dump, 'Claude')).toBe(true);
			expect(parseProtocolDetection('', 'claude')).toBe(false);
			expect(parseProtocolDetection('some text', '')).toBe(false);
		});
	});

	describe('getToolState', () => {
		it('returns default provider state when no override exists', () => {
			const mockConfig = {
				agentTools: {
					enabledProviders: ['claude'],
				},
			};

			const claudeState = getToolState(mockConfig, 'claude');
			expect(claudeState.enabled).toBe(true);
			expect(claudeState.launchCommand).toBe(BUILTIN_AGENT_TOOLS[0].defaultCommand);
			expect(claudeState.isOverridden).toBe(false);

			const codexState = getToolState(mockConfig, 'codex');
			expect(codexState.enabled).toBe(false);
			expect(codexState.isOverridden).toBe(false);
		});

		it('honors overrides when present', () => {
			const mockConfig = {
				agentTools: {
					enabledProviders: ['claude'],
					overrides: {
						claude: { enabled: false, launchCommand: 'claude --custom-flag' },
					},
				},
			};

			const claudeState = getToolState(mockConfig, 'claude');
			expect(claudeState.enabled).toBe(false);
			expect(claudeState.launchCommand).toBe('claude --custom-flag');
			expect(claudeState.isOverridden).toBe(true);
		});
	});
});
