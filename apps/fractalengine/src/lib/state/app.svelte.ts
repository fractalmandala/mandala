import { setActiveTemplateMenu } from '../ipc';
import { TEMPLATES, type AppTemplate, type AppTemplateId } from '../data/templates';
import { canvas } from './canvas.svelte';
import { flushSync } from 'svelte';

const STORAGE_KEY = 'fractalengine:app-template';
const MODULE_TEMPLATE_IDS = new Set<AppTemplateId>(['code', 'notes', 'design', 'ai', 'bookmarks', 'media', 'docs', 'dev']);
const TEMPLATE_IDS = new Set<AppTemplateId>(TEMPLATES.map(template => template.id));

function isModuleTemplateId(value: AppTemplateId): boolean {
	return MODULE_TEMPLATE_IDS.has(value);
}

function canAnimateModuleSwitch(from: AppTemplateId, to: AppTemplateId): boolean {
	return typeof window !== 'undefined'
		&& typeof document !== 'undefined'
		&& from !== to
		&& isModuleTemplateId(from)
		&& isModuleTemplateId(to)
		&& typeof document.startViewTransition === 'function'
		&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isTemplateId(value: unknown): value is AppTemplateId {
	return typeof value === 'string' && TEMPLATE_IDS.has(value as AppTemplateId);
}

function loadTemplateId(): AppTemplateId {
	if (typeof localStorage === 'undefined') return 'home';
	const stored = localStorage.getItem(STORAGE_KEY);
	return isTemplateId(stored) ? stored : 'home';
}

class AppState {
	activeTemplateId = $state<AppTemplateId>(loadTemplateId());
	showTemplateGallery = $state(loadTemplateId() === 'home');
	private moduleTransitionCount = 0;

	activeTemplate = $derived(
		TEMPLATES.find(template => template.id === this.activeTemplateId) ?? TEMPLATES[0]!
	);

	get templates(): AppTemplate[] {
		return TEMPLATES;
	}

	applyTemplate(templateOrId: AppTemplate | AppTemplateId): void {
		const template = typeof templateOrId === 'string'
			? TEMPLATES.find(item => item.id === templateOrId)
			: templateOrId;
		if (!template) return;

		if (canAnimateModuleSwitch(this.activeTemplateId, template.id)) {
			this.animateModuleSwitch(() => this.applyTemplateImmediately(template));
			return;
		}

		this.applyTemplateImmediately(template);
	}

	private applyTemplateImmediately(template: AppTemplate): void {
		this.activeTemplateId = template.id;
		this.showTemplateGallery = false;

		if (template.id === 'home' || template.id === 'blank') {
			canvas.applySpatialTemplate(template);
		}

		this.persist();
		void this.syncNativeMenu();
	}

	private animateModuleSwitch(apply: () => void): void {
		const root = document.documentElement;
		this.moduleTransitionCount += 1;
		root.classList.add('module-wipe-transition');

		try {
			const transition = document.startViewTransition(() => flushSync(apply));
			void transition.finished.then(
				() => this.finishModuleTransition(),
				() => this.finishModuleTransition()
			);
		} catch {
			this.finishModuleTransition();
			apply();
		}
	}

	private finishModuleTransition(): void {
		this.moduleTransitionCount = Math.max(0, this.moduleTransitionCount - 1);
		if (this.moduleTransitionCount === 0) {
			document.documentElement.classList.remove('module-wipe-transition');
		}
	}

	openTemplateGallery(): void {
		this.showTemplateGallery = true;
	}

	closeTemplateGallery(): void {
		this.showTemplateGallery = false;
	}

	restoreFromLegacyTemplateId(value: unknown): void {
		if (!isTemplateId(value)) return;
		this.activeTemplateId = value;
		this.showTemplateGallery = false;
		this.persist();
		void this.syncNativeMenu();
	}

	persist(): void {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, this.activeTemplateId);
	}

	async syncNativeMenu(): Promise<void> {
		try {
			await setActiveTemplateMenu(this.activeTemplateId);
		} catch (err) {
			console.warn('setActiveTemplateMenu failed:', err);
		}
	}
}

export { type AppTemplate, type AppTemplateId };
export const appState = new AppState();
