import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OkDesktopBridge, OkTerminalDataEvent, OkTerminalExitEvent } from '$lib/desktop';
import {
	resetTerminalSessions,
	startTerminalSession,
	stopTerminalSession,
	terminalSessions,
	writeToTerminal,
} from './terminal';
import { get } from 'svelte/store';

function createFakeTauriBridge(): {
	bridge: OkDesktopBridge;
	emitData: (event: OkTerminalDataEvent) => void;
	emitExit: (event: OkTerminalExitEvent) => void;
	start: ReturnType<typeof vi.fn>;
	write: ReturnType<typeof vi.fn>;
	stop: ReturnType<typeof vi.fn>;
} {
	let dataCb: ((event: OkTerminalDataEvent) => void) | null = null;
	let exitCb: ((event: OkTerminalExitEvent) => void) | null = null;
	const start = vi.fn(async () => ({ ok: true as const }));
	const write = vi.fn(async () => ({ ok: true as const }));
	const stop = vi.fn(async () => ({ ok: true as const }));
	const bridge = {
		runtime: 'tauri',
		config: { ptyAvailable: true, projectPath: '/tmp/project' },
		onTerminalData: (cb: (event: OkTerminalDataEvent) => void) => {
			dataCb = cb;
			return () => {
				dataCb = null;
			};
		},
		onTerminalExit: (cb: (event: OkTerminalExitEvent) => void) => {
			exitCb = cb;
			return () => {
				exitCb = null;
			};
		},
		terminal: { start, write, stop },
	} as unknown as OkDesktopBridge;
	return {
		bridge,
		start,
		write,
		stop,
		emitData: (event) => dataCb?.(event),
		emitExit: (event) => exitCb?.(event),
	};
}

describe('terminal sessions', () => {
	beforeEach(() => {
		resetTerminalSessions();
	});

	it('starts a PTY session and records live output from ok:terminal-data', async () => {
		const { bridge, start, emitData } = createFakeTauriBridge();
		const started = await startTerminalSession(bridge, 'term-1', '/tmp/project');
		expect(started).toBe(true);
		expect(start).toHaveBeenCalledWith({ id: 'term-1', cwd: '/tmp/project' });
		expect(get(terminalSessions)['term-1']?.status).toBe('running');

		emitData({ id: 'term-1', data: 'hello ' });
		emitData({ id: 'term-1', data: 'world\n' });
		expect(get(terminalSessions)['term-1']?.output).toBe('hello world\n');
	});

	it('marks the session exited on ok:terminal-exit', async () => {
		const { bridge, emitExit } = createFakeTauriBridge();
		await startTerminalSession(bridge, 'term-1');
		emitExit({ id: 'term-1', code: 0 });
		const session = get(terminalSessions)['term-1'];
		expect(session?.status).toBe('exited');
		expect(session?.exitCode).toBe(0);
	});

	it('does not restart an already running session', async () => {
		const { bridge, start } = createFakeTauriBridge();
		await startTerminalSession(bridge, 'term-1');
		await startTerminalSession(bridge, 'term-1');
		expect(start).toHaveBeenCalledTimes(1);
	});

	it('marks sessions unsupported without a tauri bridge', async () => {
		const started = await startTerminalSession(null, 'term-1');
		expect(started).toBe(false);
		expect(get(terminalSessions)['term-1']?.status).toBe('unsupported');
	});

	it('writes input to the active PTY and stops sessions cleanly', async () => {
		const { bridge, write, stop } = createFakeTauriBridge();
		await startTerminalSession(bridge, 'term-1');
		const wrote = await writeToTerminal(bridge, 'term-1', 'pwd\n');
		expect(wrote).toBe(true);
		expect(write).toHaveBeenCalledWith({ id: 'term-1', data: 'pwd\n' });

		await stopTerminalSession(bridge, 'term-1');
		expect(stop).toHaveBeenCalledWith({ id: 'term-1' });
		expect(get(terminalSessions)['term-1']).toBeUndefined();
	});
});
