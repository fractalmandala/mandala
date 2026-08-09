import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { readLocalStorage, writeLocalStorage } from './storage';

const STORAGE_KEY = 'fractalknow:toast-history';
const MAX_HISTORY = 32;
const DEFAULT_TIMEOUT_MS = 4200;
const MAX_TOASTS = 5;

export type ToastKind = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
	id: string;
	kind: ToastKind;
	title: string;
	body?: string;
	createdAt: string;
	timeoutMs: number;
}

export interface ToastInput {
	kind?: ToastKind;
	title: string;
	body?: string;
	timeoutMs?: number;
}

export const toasts = writable<Toast[]>([]);
export const toastHistory = writable<Toast[]>(readHistory());

function readHistory(): Toast[] {
	if (!browser) return [];
	try {
		const raw = readLocalStorage(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as Toast[];
		return Array.isArray(parsed)
			? parsed.filter(
					(t): t is Toast =>
						typeof t.id === 'string' &&
						typeof t.title === 'string' &&
						typeof t.kind === 'string' &&
						typeof t.createdAt === 'string',
				)
			: [];
	} catch {
		return [];
	}
}

function persistHistory(): void {
	if (!browser) return;
	toastHistory.subscribe((value) => {
		writeLocalStorage(STORAGE_KEY, JSON.stringify(value.slice(0, MAX_HISTORY)));
	})();
}

function recordInHistory(toast: Toast): void {
	toastHistory.update((list) => [toast, ...list].slice(0, MAX_HISTORY));
	persistHistory();
}

function makeId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `toast-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
}

export function pushToast(input: ToastInput): string {
	const id = makeId();
	const toast: Toast = {
		id,
		kind: input.kind ?? 'info',
		title: input.title,
		body: input.body,
		createdAt: new Date().toISOString(),
		timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
	};
	toasts.update((list) => [...list, toast].slice(-MAX_TOASTS));
	recordInHistory(toast);
	if (browser && toast.timeoutMs > 0) {
		const reduced =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// Keep auto-dismiss, but avoid long lingering toasts when motion is reduced.
		const timeout = reduced ? Math.min(toast.timeoutMs, 2200) : toast.timeoutMs;
		setTimeout(() => dismissToast(id), timeout);
	}
	return id;
}

export function dismissToast(id: string): void {
	toasts.update((list) => list.filter((t) => t.id !== id));
}

export function clearToasts(): void {
	toasts.set([]);
}

export function currentToasts(): Toast[] {
	return get(toasts);
}