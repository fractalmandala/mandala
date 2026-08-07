import { UndoHistory } from '$lib/state/undoHistory.svelte';

export type WorkspaceProfileId = 'notes' | 'dev' | 'code' | 'design' | 'agent' | 'media' | 'docs';
export type WorkspaceSurfaceId = 'left' | 'leftSecondary' | 'right' | 'bottom';

interface SurfaceLayout {
	collapsed: boolean;
	size: number;
}

interface ProfileLayout {
	surfaces: Partial<Record<WorkspaceSurfaceId, SurfaceLayout>>;
}

interface PersistedWorkspaceLayout {
	version: 3;
	profiles: Record<WorkspaceProfileId, ProfileLayout>;
}

const STORAGE_KEY = 'fractalengine:workspace-layout';

const defaults: Record<WorkspaceProfileId, ProfileLayout> = {
	notes: {
		surfaces: {
			left: { collapsed: false, size: 17 },
			leftSecondary: { collapsed: false, size: 20 },
			right: { collapsed: true, size: 25 },
			bottom: { collapsed: true, size: 25 }
		}
	},
	dev: {
		surfaces: {
			left: { collapsed: false, size: 21 },
			right: { collapsed: false, size: 21 }
		}
	}
	,
	code: { surfaces: { left: { collapsed: false, size: 20 }, right: { collapsed: false, size: 24 } } },
	design: { surfaces: { left: { collapsed: false, size: 20 }, right: { collapsed: false, size: 24 } } },
	agent: { surfaces: { left: { collapsed: false, size: 22 }, right: { collapsed: false, size: 28 } } },
	media: { surfaces: { left: { collapsed: false, size: 20 }, right: { collapsed: true, size: 24 } } },
	docs: { surfaces: { left: { collapsed: false, size: 22 }, right: { collapsed: false, size: 22 } } }
};

function cloneDefaults(): Record<WorkspaceProfileId, ProfileLayout> {
	return JSON.parse(JSON.stringify(defaults)) as Record<WorkspaceProfileId, ProfileLayout>;
}

function isSurfaceLayout(value: unknown): value is SurfaceLayout {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<SurfaceLayout>;
	return typeof candidate.collapsed === 'boolean'
		&& typeof candidate.size === 'number'
		&& Number.isFinite(candidate.size);
}

function loadPersisted(): Record<WorkspaceProfileId, ProfileLayout> {
	const fallback = cloneDefaults();
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw) as { profiles?: Partial<Record<WorkspaceProfileId, ProfileLayout>> };
		if (!parsed.profiles) return fallback;
		for (const profileId of Object.keys(fallback) as WorkspaceProfileId[]) {
			const persisted = parsed.profiles[profileId];
			if (!persisted) continue;
			for (const [surfaceId, surface] of Object.entries(persisted.surfaces ?? {})) {
				if (!(surfaceId in fallback[profileId].surfaces) || !isSurfaceLayout(surface)) continue;
				fallback[profileId].surfaces[surfaceId as WorkspaceSurfaceId] = {
					collapsed: surface.collapsed,
					size: Math.round(Math.min(80, Math.max(8, surface.size)))
				};
			}
		}
	} catch {
		// A malformed saved layout must never prevent the workspace from loading.
	}
	return fallback;
}

class WorkspaceLayoutState {
	profiles = $state<Record<WorkspaceProfileId, ProfileLayout>>(loadPersisted());
	private histories: Record<WorkspaceProfileId, UndoHistory<ProfileLayout>>;

	constructor() {
		this.histories = Object.fromEntries(
			(Object.keys(defaults) as WorkspaceProfileId[]).map((profileId) => [
				profileId,
				new UndoHistory<ProfileLayout>({
					capture: () => this.snapshotProfile(profileId),
					restore: (snapshot) => this.restoreProfile(profileId, snapshot),
					capacity: 100
				})
			])
		) as Record<WorkspaceProfileId, UndoHistory<ProfileLayout>>;
	}

	isCollapsed(profileId: WorkspaceProfileId, surfaceId: WorkspaceSurfaceId): boolean {
		return this.profiles[profileId].surfaces[surfaceId]?.collapsed ?? true;
	}

	size(profileId: WorkspaceProfileId, surfaceId: WorkspaceSurfaceId): number {
		return this.profiles[profileId].surfaces[surfaceId]?.size ?? 0;
	}

	setCollapsed(profileId: WorkspaceProfileId, surfaceId: WorkspaceSurfaceId, collapsed: boolean): void {
		const profile = this.profiles[profileId];
		const surface = profile.surfaces[surfaceId];
		if (!surface || surface.collapsed === collapsed) return;
		this.historyForUndo(profileId).transact(() => {
			this.profiles = {
				...this.profiles,
				[profileId]: {
					...profile,
					surfaces: { ...profile.surfaces, [surfaceId]: { ...surface, collapsed } }
				}
			};
			this.persist();
		});
	}

	toggle(profileId: WorkspaceProfileId, surfaceId: WorkspaceSurfaceId): boolean {
		const collapsed = !this.isCollapsed(profileId, surfaceId);
		this.setCollapsed(profileId, surfaceId, collapsed);
		return collapsed;
	}

	syncSurfaceSizes(profileId: WorkspaceProfileId, updates: Partial<Record<WorkspaceSurfaceId, number>>): void {
		const profile = this.profiles[profileId];
		const surfaces = { ...profile.surfaces };
		let changed = false;
		for (const [surfaceId, size] of Object.entries(updates)) {
			const surface = surfaces[surfaceId as WorkspaceSurfaceId];
			if (!surface || surface.collapsed || !Number.isFinite(size) || size <= 0) continue;
			const nextSize = Math.round(Math.min(80, Math.max(8, size)));
			if (surface.size === nextSize) continue;
			surfaces[surfaceId as WorkspaceSurfaceId] = { ...surface, size: nextSize };
			changed = true;
		}
		if (changed) this.profiles = { ...this.profiles, [profileId]: { ...profile, surfaces } };
		this.persist();
	}

	beginGesture(profileId: WorkspaceProfileId): void {
		this.historyForUndo(profileId).beginGesture();
	}

	endGesture(profileId: WorkspaceProfileId): void {
		this.historyForUndo(profileId).endGesture();
	}

	undo(profileId: WorkspaceProfileId): void {
		this.historyForUndo(profileId).undo();
	}

	redo(profileId: WorkspaceProfileId): void {
		this.historyForUndo(profileId).redo();
	}

	historyForUndo(profileId: WorkspaceProfileId): UndoHistory<ProfileLayout> {
		return this.histories[profileId];
	}

	private snapshotProfile(profileId: WorkspaceProfileId): ProfileLayout {
		return JSON.parse(JSON.stringify(this.profiles[profileId])) as ProfileLayout;
	}

	private restoreProfile(profileId: WorkspaceProfileId, snapshot: ProfileLayout): void {
		this.profiles = { ...this.profiles, [profileId]: JSON.parse(JSON.stringify(snapshot)) as ProfileLayout };
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, profiles: this.profiles } satisfies PersistedWorkspaceLayout));
		} catch {
			// Storage can be unavailable in browser-private or constrained webview modes.
		}
	}
}

export const workspaceLayout = new WorkspaceLayoutState();
