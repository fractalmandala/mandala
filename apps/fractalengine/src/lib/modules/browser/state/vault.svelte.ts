/**
 * Browser password vault — extracted from the `ideState` god object (ADR-007 → ADR-029).
 *
 * Owns every credential concern that used to live on `ide.svelte.ts`: the entry list, CRUD,
 * Bitwarden import, encrypted load/save, and registrable-domain matching. It carries its own
 * `UndoHistory` (registered as the `vault` undo domain) so credential edits are undoable in
 * isolation, never dragged through IDE snapshots. Persistence still rides the native
 * crypto/keychain boundary via `loadPasswordDatabase` / `savePasswordDatabase` on the IPC
 * gateway.
 *
 * Lazy: the encrypted vault is decrypted on first browser use (`ensureLoaded`), not at IDE
 * boot — password data never touches disk-read paths unless the user opens the vault.
 *
 * NB: this is the *password* vault. The unrelated `VaultBridge` on `ideState` is the
 * notes-module *workspace* vault (folders/roots) — a name collision this module deliberately
 * steps away from. Do not conflate them.
 */
import { loadPasswordDatabase, savePasswordDatabase, readFile, selectFile, selectSaveFile, writeFile } from '$lib/ipc';
import { UndoHistory } from '$lib/state/undoHistory.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { ideState } from '$lib/state/ide.svelte';
import { errorMessage } from '$lib/errors';
import { loginMatchesUrl } from './registrableDomain';

export interface PasswordEntry {
	id: string;
	type: number;
	name: string;
	login: {
		uris: { uri: string }[];
		username: string;
		password: string;
		totp: string;
	};
	creationDate: string;
	revisionDate: string;
}

/** Input shape accepted by add/update — the flat form fields the vault UI collects. */
export interface VaultInput {
	name: string;
	username?: string;
	password?: string;
	uri?: string;
	totp?: string;
}

export interface PasswordGeneratorOptions {
	length?: number;
	symbols?: boolean;
}

const PASSWORD_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const PASSWORD_DIGITS = '23456789';
const PASSWORD_SYMBOLS = '!@#$%^&*_-+=';

/**
 * Generates a password with Web Crypto, never Math.random.  The default is intentionally
 * password-manager-grade (20 chars, symbols), while callers may explicitly turn symbols off.
 */
export function generatePassword(options: PasswordGeneratorOptions = {}): string {
	const length = Math.max(12, Math.min(128, Math.floor(options.length ?? 20)));
	const alphabet = PASSWORD_LETTERS + PASSWORD_DIGITS + (options.symbols === false ? '' : PASSWORD_SYMBOLS);
	if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random generation is unavailable.');
	const max = Math.floor(0x1_0000_0000 / alphabet.length) * alphabet.length;
	let result = '';
	while (result.length < length) {
		const values = new Uint32Array(length - result.length);
		globalThis.crypto.getRandomValues(values);
		for (const value of values) {
			// Rejection sampling avoids modulo bias in the generated alphabet distribution.
			if (value < max) result += alphabet[value % alphabet.length];
			if (result.length === length) break;
		}
	}
	return result;
}

interface BitwardenImportItem {
	id: string;
	type: number;
	name?: string;
	login?: {
		username?: string;
		password?: string;
		totp?: string;
		uris?: { uri: string }[];
	};
	creationDate?: string;
	revisionDate?: string;
}

function isStringUri(value: unknown): value is { uri: string } {
	return !!value && typeof value === 'object' && typeof (value as Record<string, unknown>).uri === 'string';
}

export function isBitwardenImportItem(value: unknown): value is BitwardenImportItem {
	if (!value || typeof value !== 'object') return false;
	const item = value as Record<string, unknown>;
	if (typeof item.id !== 'string' || !item.id || typeof item.type !== 'number' || !Number.isFinite(item.type)) return false;
	if (item.name !== undefined && typeof item.name !== 'string') return false;
	if (item.creationDate !== undefined && typeof item.creationDate !== 'string') return false;
	if (item.revisionDate !== undefined && typeof item.revisionDate !== 'string') return false;
	if (item.login === undefined) return true;
	if (!item.login || typeof item.login !== 'object') return false;
	const login = item.login as Record<string, unknown>;
	return (login.username === undefined || typeof login.username === 'string')
		&& (login.password === undefined || typeof login.password === 'string')
		&& (login.totp === undefined || typeof login.totp === 'string')
		&& (login.uris === undefined || (Array.isArray(login.uris) && login.uris.every(isStringUri)));
}

export function toPasswordEntry(item: BitwardenImportItem): PasswordEntry {
	return {
		id: item.id,
		type: item.type,
		name: item.name || 'Unnamed Login',
		login: {
			uris: item.login?.uris || [],
			username: item.login?.username || '',
			password: item.login?.password || '',
			totp: item.login?.totp || ''
		},
		creationDate: item.creationDate || new Date().toISOString(),
		revisionDate: item.revisionDate || new Date().toISOString()
	};
}

function randomEntryId(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

class VaultState {
	/** The live vault. Was `ideState.passwordsList`. */
	entries = $state<PasswordEntry[]>([]);
	loaded = $state(false);
	private loadPromise: Promise<void> | null = null;

	// Own undo boundary — credential edits are undoable without touching IDE history.
	private history = new UndoHistory<PasswordEntry[]>({
		capture: () => JSON.parse(JSON.stringify(this.entries)),
		restore: (snapshot) => { this.entries = snapshot; void this.save(); },
		capacity: 50,
	});

	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }
	pushUndo(): void { this.history.push(); }
	get canUndo(): boolean { return this.history.canUndo; }
	get canRedo(): boolean { return this.history.canRedo; }

	/**
	 * Decrypt-and-load on first use, memoized. Repeated calls share one in-flight promise and
	 * become no-ops once loaded. Call before rendering vault UI or resolving credentials.
	 */
	async ensureLoaded(): Promise<void> {
		if (this.loaded) return;
		if (this.loadPromise) return this.loadPromise;
		this.loadPromise = this.load().finally(() => { this.loadPromise = null; });
		return this.loadPromise;
	}

	/** Force a reload from the encrypted store. */
	async load(): Promise<void> {
		try {
			const content = await loadPasswordDatabase();
			const parsed: unknown = JSON.parse(content);
			if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Record<string, unknown>).items)) {
				throw new Error('Password database has an invalid structure.');
			}
			const ids = new Set<string>();
			const items = (parsed as { items: unknown[] }).items;
			const entries = items.filter(isBitwardenImportItem);
			if (entries.length !== items.length
				|| entries.some(entry => ids.has(entry.id) || !ids.add(entry.id))) {
				throw new Error('Password database contains invalid or duplicate entries.');
			}
			this.entries = entries.filter(entry => entry.type === 1 && entry.login).map(toPasswordEntry);
			this.loaded = true;
			ideState.addLog(`Loaded ${this.entries.length} vault entries.`, 'success');
		} catch (e: unknown) {
			ideState.addLog(`Failed to load password database: ${errorMessage(e)}`, 'error');
		}
	}

	async save(): Promise<boolean> {
		try {
			const db = { encrypted: false, folders: [], items: this.entries };
			await savePasswordDatabase(JSON.stringify(db, null, 2));
			return true;
		} catch (e: unknown) {
			ideState.addLog(`Failed to save password database: ${errorMessage(e)}`, 'error');
			return false;
		}
	}

	async add(item: VaultInput): Promise<boolean> {
		await this.ensureLoaded();
		const before = JSON.parse(JSON.stringify(this.entries));
		this.pushUndo();
		const newItem: PasswordEntry = {
			id: randomEntryId(),
			type: 1,
			name: item.name || 'Unnamed Login',
			login: {
				uris: item.uri ? [{ uri: item.uri }] : [],
				username: item.username || '',
				password: item.password || '',
				totp: item.totp || ''
			},
			creationDate: new Date().toISOString(),
			revisionDate: new Date().toISOString()
		};
		this.entries.push(newItem);
		if (!(await this.save())) {
			this.entries = before;
			return false;
		}
		ideState.addLog(`Added password entry: ${newItem.name}`, 'success');
		return true;
	}

	async update(id: string, item: VaultInput): Promise<boolean> {
		await this.ensureLoaded();
		const idx = this.entries.findIndex(x => x.id === id);
		if (idx === -1) return false;
		const before = JSON.parse(JSON.stringify(this.entries));
		this.pushUndo();
		const current = this.entries[idx];
		this.entries[idx] = {
			...current,
			name: item.name || 'Unnamed Login',
			login: {
				uris: item.uri ? [{ uri: item.uri }] : [],
				username: item.username || '',
				password: item.password || '',
				totp: item.totp || ''
			},
			revisionDate: new Date().toISOString()
		};
		if (!(await this.save())) {
			this.entries = before;
			return false;
		}
		ideState.addLog(`Updated password entry: ${this.entries[idx].name}`, 'success');
		return true;
	}

	async remove(id: string): Promise<boolean> {
		await this.ensureLoaded();
		const entry = this.entries.find(x => x.id === id);
		if (!entry) return false;
		const before = JSON.parse(JSON.stringify(this.entries));
		this.pushUndo();
		this.entries = this.entries.filter(x => x.id !== id);
		if (!(await this.save())) {
			this.entries = before;
			return false;
		}
		ideState.addLog(`Deleted password entry: ${entry.name}`, 'info');
		return true;
	}

	async clear(): Promise<boolean> {
		await this.ensureLoaded();
		if (this.entries.length === 0) return true;
		const before = JSON.parse(JSON.stringify(this.entries));
		this.pushUndo();
		this.entries = [];
		if (!(await this.save())) {
			this.entries = before;
			return false;
		}
		ideState.addLog('Cleared password vault data.', 'info');
		return true;
	}

	/**
	 * Entries whose stored URIs match `url` by registrable domain (eTLD+1), not string prefix.
	 * Takes the URL as a parameter so callers pass the active tab's URL — no `ideState.browserUrl`
	 * coupling, per-tab ready.
	 */
	matchesFor(url: string): PasswordEntry[] {
		if (!url) return [];
		return this.entries.filter(item => loginMatchesUrl(item.login?.uris || [], item.name, url));
	}

	/** Vault entries carrying a TOTP seed — surfaces 2FA coverage in the vault UI. */
	get totpCount(): number {
		return this.entries.filter(item => !!item.login?.totp).length;
	}

	/** Resolve a single entry by id — the id-only surface the Rust autofill bridge calls (§3.5). */
	async resolve(id: string): Promise<PasswordEntry | null> {
		await this.ensureLoaded();
		return this.entries.find(x => x.id === id) ?? null;
	}

	/**
	 * One-time migration path: merge a Bitwarden JSON export into the live vault. Entries are
	 * matched by Bitwarden's own `id` and updated in place, so re-importing is idempotent.
	 */
	async importFromBitwarden(): Promise<{ added: number; updated: number } | null> {
		await this.ensureLoaded();
		const path = await selectFile();
		if (!path) return null;
		try {
			const content = await readFile(path);
			const parsed: unknown = JSON.parse(content);
			const rawItems = (parsed as { items?: unknown })?.items;
			const items: BitwardenImportItem[] = Array.isArray(rawItems) ? rawItems.filter(isBitwardenImportItem) : [];
			const logins = items.filter(item => item.type === 1 && item.login).map(toPasswordEntry);
			if (logins.length === 0) throw new Error('The selected export contains no valid login items.');

			const before = JSON.parse(JSON.stringify(this.entries));
			this.pushUndo();
			let added = 0;
			let updated = 0;
			for (const incoming of logins) {
				const idx = this.entries.findIndex(x => x.id === incoming.id);
				if (idx !== -1) {
					this.entries[idx] = incoming;
					updated++;
				} else {
					this.entries.push(incoming);
					added++;
				}
			}
			if (!(await this.save())) {
				this.entries = before;
				return null;
			}
			ideState.addLog(`Bitwarden import: added ${added}, updated ${updated} login(s) from ${path.split('/').pop()}.`, 'success');
			return { added, updated };
		} catch (e: unknown) {
			ideState.addLog(`Bitwarden import failed: ${errorMessage(e)}`, 'error');
			return null;
		}
	}

	/** Native save-dialog export. It retains login IDs/TOTP/URI metadata so a future import is lossless. */
	async exportBitwarden(): Promise<boolean> {
		await this.ensureLoaded();
		const path = await selectSaveFile('Export Password Vault', 'fractalengine-vault.json', 'json');
		if (!path) return false;
		const payload = {
			encrypted: false,
			folders: [],
			items: JSON.parse(JSON.stringify(this.entries)) as PasswordEntry[],
		};
		await writeFile(path, JSON.stringify(payload, null, 2));
		ideState.addLog(`Exported ${this.entries.length} vault entries. Keep this plaintext export secure.`, 'success');
		return true;
	}
}

export const vault = new VaultState();

registerUndoDomain({
	id: 'vault',
	undo: () => vault.undo(),
	redo: () => vault.redo(),
	pushUndo: () => vault.pushUndo(),
});
