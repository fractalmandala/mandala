import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { OkDesktopBridge, OkDesktopConfig, OkRecentProject } from '$lib/desktop';
import { readLocalStorage, writeLocalStorage } from './storage';

const STORAGE_KEY = 'fractalknow:project-state';
const RECENT_STORAGE_KEY = 'fractalknow:recent-projects';
const MAX_RECENT_PROJECTS = 8;

export type ProjectSource = 'desktop-config' | 'folder-picker' | 'browser-preview';

export type ProjectState = {
	path: string;
	name: string;
	source: ProjectSource;
	openedAt: string | null;
	notice: string | null;
};

export type RecentProject = {
	path: string;
	name: string;
	source: ProjectSource;
	openedAt: string;
};

let recentProjectsBridge: OkDesktopBridge | null = null;
let hydratingNativeRecentProjects = false;

const defaults: ProjectState = {
	path: '',
	name: 'fractalknow',
	source: 'browser-preview',
	openedAt: null,
	notice: null,
};

function readProjectState(): ProjectState {
	if (!browser) return defaults;

	try {
		const value = readLocalStorage(STORAGE_KEY);
		if (!value) return defaults;
		return { ...defaults, ...JSON.parse(value) } as ProjectState;
	} catch {
		return defaults;
	}
}

function readRecentProjects(): RecentProject[] {
	if (!browser) return [];

	try {
		const value = readLocalStorage(RECENT_STORAGE_KEY);
		if (!value) return [];
		const parsed = JSON.parse(value) as RecentProject[];
		return parsed.filter((project) => project.path && project.name);
	} catch {
		return [];
	}
}

export const projectState = writable<ProjectState>(readProjectState());
export const recentProjects = writable<RecentProject[]>(readRecentProjects());

if (browser) {
	projectState.subscribe((state) => {
		writeLocalStorage(STORAGE_KEY, JSON.stringify(state));
	});
	recentProjects.subscribe((projects) => {
		writeLocalStorage(RECENT_STORAGE_KEY, JSON.stringify(projects));
		if (hydratingNativeRecentProjects || !recentProjectsBridge) return;
		void recentProjectsBridge.projects.writeRecent(projects.map(toBridgeRecentProject));
	});
}

export function connectRecentProjectsBridge(bridge: OkDesktopBridge): void {
	recentProjectsBridge = bridge.runtime === 'tauri' ? bridge : null;
	if (!recentProjectsBridge) return;

	void recentProjectsBridge.projects.readRecent().then((projects) => {
		if (!Array.isArray(projects) || projects.length === 0) return;
		hydratingNativeRecentProjects = true;
		recentProjects.set(projects.map(fromBridgeRecentProject));
		queueMicrotask(() => {
			hydratingNativeRecentProjects = false;
		});
	});
}

export function setProjectFromConfig(config: OkDesktopConfig): void {
	projectState.update((state) => {
		const path = config.projectPath || state.path;
		const name = config.projectName || titleFromPath(path) || state.name;
		const source: ProjectSource = config.projectPath ? 'desktop-config' : 'browser-preview';

		return {
			...state,
			path,
			name,
			source,
			notice: config.projectPath ? `Opened ${name}` : state.notice,
		};
	});
	if (config.projectPath) rememberRecentProject(config.projectPath, config.projectName, 'desktop-config');
}

export function setProjectFromFolder(path: string): void {
	const name = titleFromPath(path) || 'Untitled Project';
	const openedAt = new Date().toISOString();
	projectState.set({
		path,
		name,
		source: 'folder-picker',
		openedAt,
		notice: `Selected ${name}`,
	});
	rememberRecentProject(path, name, 'folder-picker', openedAt);
}

export function openRecentProject(project: RecentProject): void {
	projectState.set({
		path: project.path,
		name: project.name,
		source: project.source,
		openedAt: project.openedAt,
		notice: `Reopened ${project.name}`,
	});
	rememberRecentProject(project.path, project.name, project.source);
}

export function removeRecentProject(path: string): void {
	recentProjects.update((projects) => projects.filter((project) => project.path !== path));
}

export function clearRecentProjects(): void {
	recentProjects.set([]);
}

function rememberRecentProject(
	path: string,
	name = titleFromPath(path) || 'Untitled Project',
	source: ProjectSource,
	openedAt = new Date().toISOString(),
): void {
	if (!path) return;
	const project: RecentProject = {
		path,
		name,
		source,
		openedAt,
	};
	recentProjects.update((projects) => [
		project,
		...projects.filter((item) => item.path !== path),
	].slice(0, MAX_RECENT_PROJECTS));
}

function titleFromPath(path: string): string {
	return path.split(/[\\/]/).filter(Boolean).at(-1) ?? '';
}

function toBridgeRecentProject(project: RecentProject): OkRecentProject {
	return { ...project };
}

function fromBridgeRecentProject(project: OkRecentProject): RecentProject {
	return { ...project };
}
