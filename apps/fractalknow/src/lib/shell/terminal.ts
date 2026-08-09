import { get, writable } from 'svelte/store';
import type { OkDesktopBridge, OkUnsubscribe } from '$lib/desktop';
import { shellPreferences } from './preferences';

/**
 * PTY session state per terminal tab. The Rust side (terminal_pty.rs)
 * emits `ok:terminal-data` / `ok:terminal-exit`; this module subscribes to
 * those events through the typed bridge facade and keeps a bounded output
 * buffer per tab id so the terminal panel can render live output.
 */
export type TerminalSessionStatus = 'idle' | 'running' | 'exited' | 'unsupported';

export type TerminalSession = {
	id: string;
	status: TerminalSessionStatus;
	exitCode: number | null;
	output: string;
};

/** Ring cap so a noisy child process cannot grow memory without bound. */
const MAX_OUTPUT_CHARS = 200_000;

export const terminalSessions = writable<Record<string, TerminalSession>>({});

let boundBridge: OkDesktopBridge | null = null;
let unbindData: OkUnsubscribe | null = null;
let unbindExit: OkUnsubscribe | null = null;

function emptySession(id: string): TerminalSession {
	return { id, status: 'idle', exitCode: null, output: '' };
}

function upsertSession(id: string, patch: Partial<TerminalSession>): void {
	terminalSessions.update((sessions) => ({
		...sessions,
		[id]: { ...(sessions[id] ?? emptySession(id)), ...patch },
	}));
}

function appendOutput(id: string, data: string): void {
	terminalSessions.update((sessions) => {
		const current = sessions[id] ?? { ...emptySession(id), status: 'running' as const };
		let output = current.output + data;
		if (output.length > MAX_OUTPUT_CHARS) output = output.slice(-MAX_OUTPUT_CHARS);
		const status = current.status === 'exited' ? 'exited' : 'running';
		return { ...sessions, [id]: { ...current, status, output } };
	});
}

/**
 * Subscribes to the PTY output/exit events on the given bridge. Idempotent
 * per bridge instance; re-binding replaces the previous subscriptions.
 */
export function bindTerminalBridge(bridge: OkDesktopBridge): void {
	if (boundBridge === bridge) return;
	unbindTerminalBridge();
	if (bridge.runtime !== 'tauri' || !bridge.config.ptyAvailable) return;
	boundBridge = bridge;
	unbindData = bridge.onTerminalData((event) => {
		if (event.id) appendOutput(event.id, event.data);
	});
	unbindExit = bridge.onTerminalExit((event) => {
		if (event.id) upsertSession(event.id, { status: 'exited', exitCode: event.code });
	});
}

export function unbindTerminalBridge(): void {
	unbindData?.();
	unbindExit?.();
	unbindData = null;
	unbindExit = null;
	boundBridge = null;
}

/**
 * Starts a native PTY for the given tab id (no-op if already running).
 * Returns true when the session is running after the call.
 */
export async function startTerminalSession(
	bridge: OkDesktopBridge | null,
	id: string,
	cwd?: string,
): Promise<boolean> {
	if (!bridge || bridge.runtime !== 'tauri' || !bridge.config.ptyAvailable) {
		upsertSession(id, { status: 'unsupported' });
		return false;
	}
	bindTerminalBridge(bridge);
	const existing = get(terminalSessions)[id];
	if (existing?.status === 'running') return true;
	upsertSession(id, { status: 'idle', output: '', exitCode: null });
	try {
		const prefs = get(shellPreferences);
		const shell = prefs.terminalShellPath?.trim() || undefined;
		const result = await bridge.terminal.start({ id, cwd, shell });
		if (result.ok) {
			upsertSession(id, { status: 'running' });
			return true;
		}
	} catch {
		// fall through to unsupported
	}
	upsertSession(id, { status: 'unsupported' });
	return false;
}

export async function writeToTerminal(
	bridge: OkDesktopBridge | null,
	id: string,
	data: string,
): Promise<boolean> {
	if (!bridge || bridge.runtime !== 'tauri') return false;
	try {
		const result = await bridge.terminal.write({ id, data });
		return result.ok;
	} catch {
		return false;
	}
}

export async function stopTerminalSession(
	bridge: OkDesktopBridge | null,
	id: string,
): Promise<void> {
	if (bridge?.runtime === 'tauri') {
		try {
			await bridge.terminal.stop({ id });
		} catch {
			// Stopping is best-effort; the session is dropped locally regardless.
		}
	}
	terminalSessions.update((sessions) => {
		const next = { ...sessions };
		delete next[id];
		return next;
	});
}

/** Test hook: reset all session state and subscriptions. */
export function resetTerminalSessions(): void {
	unbindTerminalBridge();
	terminalSessions.set({});
}
