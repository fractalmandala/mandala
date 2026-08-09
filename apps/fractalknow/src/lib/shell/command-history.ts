import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { readLocalStorage, writeLocalStorage } from './storage';
import type { CommandItem } from './types';

const STORAGE_KEY = 'fractalknow:recent-commands';
const MAX_RECENT_COMMANDS = 8;

export type CommandStatus =
	| { status: 'idle'; commandId: null; message: null; updatedAt: string | null }
	| { status: 'warming'; commandId: null; message: string; updatedAt: string }
	| { status: 'running'; commandId: string; message: string; updatedAt: string }
	| { status: 'error'; commandId: string | null; message: string; updatedAt: string };

function readRecentCommandIds(): string[] {
	if (!browser) return [];

	try {
		const value = readLocalStorage(STORAGE_KEY);
		if (!value) return [];
		const parsed = JSON.parse(value) as string[];
		return parsed.filter((id) => typeof id === 'string' && id.length > 0);
	} catch {
		return [];
	}
}

const idleStatus: CommandStatus = {
	status: 'idle',
	commandId: null,
	message: null,
	updatedAt: null,
};

export const recentCommandIds = writable<string[]>(readRecentCommandIds());
export const commandStatus = writable<CommandStatus>(idleStatus);

if (browser) {
	recentCommandIds.subscribe((ids) => {
		writeLocalStorage(STORAGE_KEY, JSON.stringify(ids));
	});
}

export function recordCommandStarted(command: CommandItem): void {
	commandStatus.set({
		status: 'running',
		commandId: command.id,
		message: command.title,
		updatedAt: new Date().toISOString(),
	});
}

export function recordCommandWarming(message: string): void {
	commandStatus.set({
		status: 'warming',
		commandId: null,
		message,
		updatedAt: new Date().toISOString(),
	});
}

export function clearCommandStatus(): void {
	commandStatus.set(idleStatus);
}

export function recordCommandLoading(message: string): void {
	commandStatus.set({
		status: 'running',
		commandId: '__loading__',
		message,
		updatedAt: new Date().toISOString(),
	});
}

export function recordCommandSucceeded(command: CommandItem): void {
	recentCommandIds.update((ids) => [command.id, ...ids.filter((id) => id !== command.id)].slice(0, MAX_RECENT_COMMANDS));
	commandStatus.set(idleStatus);
}

export function recordCommandFailed(commandId: string | null, reason: string): void {
	commandStatus.set({
		status: 'error',
		commandId,
		message: reason,
		updatedAt: new Date().toISOString(),
	});
}

export function removeRecentCommand(commandId: string): void {
	recentCommandIds.update((ids) => ids.filter((id) => id !== commandId));
}

export function clearRecentCommands(): void {
	recentCommandIds.set([]);
}