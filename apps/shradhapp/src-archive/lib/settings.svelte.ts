import { backend, isTauri } from '$lib/backend';
import type { AppSettings, RuntimeInfo } from '$lib/backend/types';
import { clone } from '$lib/utils';

export const defaultAppSettings: AppSettings = {
	version: 1,
	appearance: {
		theme: 'dark',
		reducedMotion: 'system',
		density: 'comfortable'
	},
	workflow: {
		startView: 'home',
		defaultProjectPhase: 'story',
		showAutosaveStatus: true
	},
	audio: {
		defaultRepairMode: 'manual',
		keepOriginals: true
	},
	export: {
		defaultPreset: 'mp4-full',
		keepOriginalAudio: true,
		showExportProgress: true
	},
	channel: {
		enabled: true
	},
	advanced: {
		showDiagnostics: false,
		confirmDestructiveCommands: true
	}
};

class SettingsStore {
	settings = $state<AppSettings>(clone(defaultAppSettings));
	runtimeInfo = $state<RuntimeInfo | null>(null);
	loaded = $state(false);
	saving = $state(false);
	error = $state<string | null>(null);

	async load() {
		try {
			if (isTauri) {
				this.settings = await backend.getAppSettings();
				this.runtimeInfo = await backend.getRuntimeInfo();
			} else {
				this.settings = this.loadPreviewSettings();
				this.runtimeInfo = {
					appDataDir: 'Preview only',
					libraryDir: 'Preview only',
					thumbnailDir: 'Preview only',
					ffmpegAvailable: false,
					ffmpegMessage: 'Desktop runtime is not active in browser preview.'
				};
			}
			this.error = null;
		} catch (error) {
			this.error = error instanceof Error ? error.message : String(error);
		} finally {
			this.loaded = true;
		}
	}

	async update(next: AppSettings) {
		this.saving = true;
		try {
			this.settings = isTauri ? await backend.updateAppSettings(next) : this.savePreviewSettings(next);
			this.error = null;
		} catch (error) {
			this.error = error instanceof Error ? error.message : String(error);
		} finally {
			this.saving = false;
		}
	}

	async patch(change: (next: AppSettings) => void) {
		const next = clone(this.settings);
		change(next);
		await this.update(next);
	}

	async reset() {
		this.saving = true;
		try {
			this.settings = isTauri ? await backend.resetAppSettings() : this.savePreviewSettings(clone(defaultAppSettings));
			this.error = null;
		} catch (error) {
			this.error = error instanceof Error ? error.message : String(error);
		} finally {
			this.saving = false;
		}
	}

	migrateThemeFromLocalStorage() {
		if (isTauri || typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem('shradhapp:theme');
		if (saved !== 'light' && saved !== 'dark') return;
		if (localStorage.getItem('shradhapp:settings')) return;
		const next = clone(this.settings);
		next.appearance.theme = saved;
		this.settings = this.savePreviewSettings(next);
	}

	private loadPreviewSettings(): AppSettings {
		if (typeof localStorage === 'undefined') return clone(defaultAppSettings);
		const raw = localStorage.getItem('shradhapp:settings');
		if (!raw) return clone(defaultAppSettings);
		try {
			return { ...clone(defaultAppSettings), ...JSON.parse(raw) };
		} catch {
			return clone(defaultAppSettings);
		}
	}

	private savePreviewSettings(settings: AppSettings): AppSettings {
		const next = clone(settings);
		if (typeof localStorage !== 'undefined') localStorage.setItem('shradhapp:settings', JSON.stringify(next));
		return next;
	}
}

export const settingsStore = new SettingsStore();
