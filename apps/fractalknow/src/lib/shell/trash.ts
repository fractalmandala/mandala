import { writable } from 'svelte/store';

export type TrashFailure = {
	path: string;
	message: string;
	code?: string;
};

export const trashFailures = writable<TrashFailure[]>([]);

export function recordTrashFailures(failures: TrashFailure[]): void {
	trashFailures.set(failures);
}

export function clearTrashFailures(): void {
	trashFailures.set([]);
}
