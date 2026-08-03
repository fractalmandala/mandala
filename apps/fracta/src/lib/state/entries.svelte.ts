import {
	autotagsNow,
	createEntry,
	deleteEntry,
	isTauri,
	listEntries,
	pickVault,
	readEntry,
	vaultStatus,
	writeEntry,
	type EntrySummary,
	type VaultStatus
} from '$lib/ipc';
import { formatLongDate, localDateKey } from '$lib/utils/dates';

const AUTOSAVE_DELAY = 600;

/**
 * The single source of truth for the vault and the entry currently being edited.
 *
 * The active entry starts life as an in-memory *draft* with no id: nothing is written
 * to disk until the first real content arrives. That keeps the capture flow instant
 * (open app → paste) without littering the vault with empty files when the user opens
 * the window and does nothing.
 */
class Entries {
	status = $state<VaultStatus>({ configured: false, path: null });
	loading = $state(true);
	summaries = $state<EntrySummary[]>([]);

	/** null while the active entry is an unsaved draft. */
	activeId = $state<string | null>(null);
	title = $state('');
	category = $state('');
	tags = $state<string[]>([]);
	/** Markdown — the on-disk representation. */
	body = $state('');

	saving = $state(false);
	lastSavedAt = $state<number | null>(null);
	dirty = $state(false);

	/**
	 * Bumped whenever the active entry is swapped (open or newDraft). The editor keys
	 * its content reload on this rather than on `body`, so it reloads on a genuine
	 * switch — including draft→draft — but not on every keystroke.
	 */
	resetToken = $state(0);

	#timer: ReturnType<typeof setTimeout> | null = null;
	/** Serializes writes so two autosaves can't race on the same file. */
	#writeChain: Promise<unknown> = Promise.resolve();

	get vaultConfigured() {
		return this.status.configured;
	}

	get hasPersistableContent() {
		return (
			this.body.trim() !== '' ||
			this.title.trim() !== '' ||
			this.category.trim() !== '' ||
			this.tags.length > 0
		);
	}

	get canBookmark() {
		return isTauri() && (this.activeId !== null || this.hasPersistableContent);
	}

	async init() {
		this.loading = true;
		if (!isTauri()) {
			// Browser preview: no backend. Present an empty draft so the UI renders.
			this.status = { configured: true, path: '(browser preview — no vault)' };
			this.newDraft();
			this.loading = false;
			return;
		}
		this.status = await vaultStatus();
		if (this.status.configured) {
			await this.refresh();
			this.newDraft();
		}
		this.loading = false;
	}

	async chooseVault() {
		if (!isTauri()) return;
		const path = await pickVault();
		if (!path) return;
		this.status = { configured: true, path };
		await this.refresh();
		this.newDraft();
	}

	async refresh() {
		if (!isTauri()) return;
		this.summaries = await listEntries();
	}

	/** Resets the active surface to a blank, unsaved draft ready for capture. */
	newDraft() {
		void this.flush();
		this.activeId = null;
		this.title = '';
		this.category = '';
		this.tags = [];
		this.body = '';
		this.dirty = false;
		this.resetToken++;
	}

	async open(id: string) {
		if (id === this.activeId) return;
		await this.flush();
		if (!isTauri()) return;
		const entry = await readEntry(id);
		this.activeId = entry.id;
		this.title = entry.title;
		this.category = entry.category;
		this.tags = entry.tags;
		this.body = entry.body;
		this.dirty = false;
		this.resetToken++;
	}

	/**
	 * Opens today's daily note if one already exists (matched by title date key or
	 * `daily` tag + title), otherwise starts a draft pre-filled as a daily entry.
	 */
	async openDaily(date: Date = new Date()) {
		const key = localDateKey(date);
		const title = formatLongDate(date.getTime());
		const existing = this.summaries.find(
			(e) =>
				e.title === title ||
				e.title === key ||
				(e.tags.includes('daily') && e.title.toLowerCase().includes(key))
		);
		if (existing) {
			await this.open(existing.id);
			return;
		}
		await this.flush();
		this.activeId = null;
		this.title = title;
		this.category = 'Daily';
		this.tags = ['daily'];
		this.body = `# ${title}\n\n`;
		this.dirty = true;
		this.resetToken++;
		// Materialize immediately so bookmark / organize see it.
		await this.flush();
	}

	// --- edit surface: these mark the draft dirty and schedule an autosave ---

	setBody(markdown: string) {
		if (markdown === this.body) return;
		this.body = markdown;
		this.#touch();
	}

	setTitle(value: string) {
		this.title = value;
		this.#touch();
	}

	setCategory(value: string) {
		this.category = value;
		this.#touch();
	}

	setTags(tags: string[]) {
		this.tags = tags;
		this.#touch();
	}

	/**
	 * Merges the source-app tags for whatever is on the clipboard into the active entry.
	 * Called from the editor's paste handler. Idempotent — pasting twice from the same
	 * app never duplicates the tag; pasting from a second app adds that one too.
	 */
	async applySourceTags() {
		if (!isTauri()) return;
		let sourceTags: string[];
		try {
			sourceTags = await autotagsNow();
		} catch {
			return; // never let tagging break a paste
		}
		const additions = sourceTags.filter((t) => t && !this.tags.includes(t));
		if (additions.length === 0) return;
		this.tags = [...this.tags, ...additions];
		this.#touch();
	}

	async ensureSaved(): Promise<string | null> {
		if (!isTauri()) return null;
		if (this.activeId !== null) return this.activeId;
		if (!this.hasPersistableContent) return null;
		await this.flush();
		return this.activeId;
	}

	#touch() {
		this.dirty = true;
		if (this.#timer) clearTimeout(this.#timer);
		this.#timer = setTimeout(() => void this.flush(), AUTOSAVE_DELAY);
	}

	/** True when the draft has nothing worth persisting yet. */
	get #isEmptyDraft() {
		return (
			this.activeId === null &&
			this.body.trim() === '' &&
			this.title.trim() === '' &&
			this.category.trim() === '' &&
			this.tags.length === 0
		);
	}

	/** Writes pending changes now. Safe to call redundantly. */
	async flush(): Promise<void> {
		if (this.#timer) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		if (!this.dirty || !isTauri()) return;
		if (this.#isEmptyDraft) {
			this.dirty = false;
			return;
		}

		// Snapshot the fields so a keystroke mid-write doesn't corrupt this save.
		const snapshot = {
			title: this.title,
			category: this.category,
			tags: [...this.tags],
			body: this.body
		};
		this.dirty = false;
		this.saving = true;

		this.#writeChain = this.#writeChain
			.catch(() => {})
			.then(async () => {
				// Materialize the file on first save of a draft.
				if (this.activeId === null) {
					this.activeId = await createEntry();
				}
				const saved = await writeEntry(
					this.activeId,
					snapshot.title,
					snapshot.category,
					snapshot.tags,
					snapshot.body
				);
				this.lastSavedAt = saved.updated_at;
				if (this.activeId === saved.id && this.title === snapshot.title) {
					this.title = saved.title;
				}
				await this.refresh();
			})
			.catch((error) => {
				// A failed write must not be silently swallowed — re-arm the dirty flag
				// so the next autosave or manual save retries.
				this.dirty = true;
				console.error('Autosave failed:', error);
			})
			.finally(() => {
				this.saving = false;
			});

		return this.#writeChain as Promise<void>;
	}

	async remove(id: string) {
		if (!isTauri()) return;
		await deleteEntry(id);
		if (id === this.activeId) this.newDraft();
		await this.refresh();
	}
}

export const entries = new Entries();
