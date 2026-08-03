import {
	currentClipboardSource,
	deleteAppRule,
	isTauri,
	listAppRules,
	upsertAppRule,
	type AppRule,
	type ClipboardSource
} from '$lib/ipc';

// Auto-tag rules: the apps the watcher has seen, each mapped to tags and a toggle.

class Rules {
	list = $state<AppRule[]>([]);
	/** The app the current clipboard came from, for the live hint in the manager. */
	source = $state<ClipboardSource | null>(null);

	async load() {
		if (!isTauri()) return;
		this.list = await listAppRules();
		await this.refreshSource();
	}

	async refreshSource() {
		if (!isTauri()) return;
		this.source = await currentClipboardSource();
	}

	async save(rule: AppRule) {
		if (!isTauri()) return;
		this.list = await upsertAppRule(rule);
	}

	async setActive(rule: AppRule, active: boolean) {
		await this.save({ ...rule, active });
	}

	async setTags(rule: AppRule, tags: string[]) {
		await this.save({ ...rule, tags });
	}

	async remove(bundleId: string) {
		if (!isTauri()) return;
		this.list = await deleteAppRule(bundleId);
	}
}

export const rules = new Rules();
