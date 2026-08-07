import { ideState } from './ide.svelte';
import { undoCoordinator } from './undo.svelte';

class ShellState {
	get dockOpen(): boolean {
		return ideState.dockOpen;
	}

	set dockOpen(value: boolean) {
		if (value) {
			ideState.showCommandPalette = false;
			ideState.showSettings = false;
		}
		ideState.dockOpen = value;
	}

	get showCommandPalette(): boolean {
		return ideState.showCommandPalette;
	}

	set showCommandPalette(value: boolean) {
		if (value) {
			ideState.showSettings = false;
			ideState.showSearchOverlay = false;
			ideState.dockOpen = false;
		}
		ideState.showCommandPalette = value;
	}

	get showSearchOverlay(): boolean {
		return ideState.showSearchOverlay;
	}

	set showSearchOverlay(value: boolean) {
		if (value) {
			ideState.showCommandPalette = false;
			ideState.showSettings = false;
			ideState.dockOpen = false;
		}
		ideState.showSearchOverlay = value;
	}

	get showSettings(): boolean {
		return ideState.showSettings;
	}

	set showSettings(value: boolean) {
		if (value) {
			ideState.showCommandPalette = false;
			ideState.dockOpen = false;
		}
		ideState.showSettings = value;
	}

	get consoleLogs() {
		return ideState.consoleLogs;
	}

	addLog = ideState.addLog.bind(ideState);
	clearLogs = ideState.clearLogs.bind(ideState);
	pushUndo = undoCoordinator.pushUndo.bind(undoCoordinator);
	undo = undoCoordinator.undo.bind(undoCoordinator);
	redo = undoCoordinator.redo.bind(undoCoordinator);
}

export const shellState = new ShellState();
