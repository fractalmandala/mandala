import { derived, writable } from 'svelte/store';
import type {
	OkConsentRequiredEvent,
	OkCrashInviteEvent,
	OkDeepLinkEvent,
	OkDesktopConfig,
	OkMenuAction,
	OkServerStatusEvent,
	OkUpdateStatusEvent,
} from '$lib/desktop';
import { setProjectConfig, setSyncCollaborationConfig } from './config';

const MAX_EVENT_HISTORY = 30;

export type DesktopEventKind =
	| 'menu-action'
	| 'project-config'
	| 'deep-link'
	| 'update-status'
	| 'server-status'
	| 'crash-invite'
	| 'consent-required';

export type DesktopEventHistoryEntry = {
	id: string;
	kind: DesktopEventKind;
	label: string;
	recordedAt: string;
	payload: unknown;
};

export type DesktopEventState = {
	lastMenuAction: OkMenuAction | null;
	projectConfig: OkDesktopConfig | null;
	deepLink: OkDeepLinkEvent | null;
	updateStatus: OkUpdateStatusEvent | null;
	serverStatus: OkServerStatusEvent | null;
	crashInvite: OkCrashInviteEvent | null;
	consentRequired: OkConsentRequiredEvent | null;
	history: DesktopEventHistoryEntry[];
	eventCount: number;
};

const initialState: DesktopEventState = {
	lastMenuAction: null,
	projectConfig: null,
	deepLink: null,
	updateStatus: null,
	serverStatus: null,
	crashInvite: null,
	consentRequired: null,
	history: [],
	eventCount: 0,
};

export const desktopEvents = writable<DesktopEventState>(initialState);

export const lastMenuAction = derived(desktopEvents, ($events) => $events.lastMenuAction);
export const projectConfig = derived(desktopEvents, ($events) => $events.projectConfig);
export const deepLink = derived(desktopEvents, ($events) => $events.deepLink);
export const updateStatus = derived(desktopEvents, ($events) => $events.updateStatus);
export const serverStatus = derived(desktopEvents, ($events) => $events.serverStatus);
export const crashInvite = derived(desktopEvents, ($events) => $events.crashInvite);
export const consentRequired = derived(desktopEvents, ($events) => $events.consentRequired);
export const desktopEventHistory = derived(desktopEvents, ($events) => $events.history);

function recordHistory(
	state: DesktopEventState,
	kind: DesktopEventKind,
	label: string,
	payload: unknown,
): Pick<DesktopEventState, 'history' | 'eventCount'> {
	const eventCount = state.eventCount + 1;
	return {
		eventCount,
		history: [
			{
				id: `${eventCount}-${kind}`,
				kind,
				label,
				recordedAt: new Date().toISOString(),
				payload,
			},
			...state.history,
		].slice(0, MAX_EVENT_HISTORY),
	};
}

export function recordMenuAction(lastMenuAction: OkMenuAction): void {
	desktopEvents.update((state) => ({
		...state,
		lastMenuAction,
		...recordHistory(state, 'menu-action', lastMenuAction, lastMenuAction),
	}));
}

export function recordProjectConfig(projectConfig: OkDesktopConfig): void {
	setProjectConfig({
		apiOrigin: projectConfig.apiOrigin,
		collabUrl: projectConfig.collabUrl,
		name: projectConfig.projectName,
		path: projectConfig.projectPath,
		singleFile: projectConfig.singleFile,
	});
	setSyncCollaborationConfig({
		collaborationEnabled: Boolean(projectConfig.collabUrl),
		serverUrl: projectConfig.collabUrl,
	});
	desktopEvents.update((state) => ({
		...state,
		projectConfig,
		...recordHistory(state, 'project-config', projectConfig.projectName || 'Project config', projectConfig),
	}));
}

export function recordDeepLink(deepLink: OkDeepLinkEvent): void {
	desktopEvents.update((state) => ({
		...state,
		deepLink,
		...recordHistory(state, 'deep-link', deepLink.url, deepLink),
	}));
}

export function recordUpdateStatus(updateStatus: OkUpdateStatusEvent): void {
	desktopEvents.update((state) => ({
		...state,
		updateStatus,
		...recordHistory(state, 'update-status', updateStatus.status, updateStatus),
	}));
}

export function recordServerStatus(serverStatus: OkServerStatusEvent): void {
	desktopEvents.update((state) => ({
		...state,
		serverStatus,
		...recordHistory(state, 'server-status', serverStatus.status, serverStatus),
	}));
}

export function recordCrashInvite(crashInvite: OkCrashInviteEvent): void {
	desktopEvents.update((state) => ({
		...state,
		crashInvite,
		...recordHistory(state, 'crash-invite', crashInvite.reason, crashInvite),
	}));
}

export function recordConsentRequired(consentRequired: OkConsentRequiredEvent): void {
	desktopEvents.update((state) => ({
		...state,
		consentRequired,
		...recordHistory(state, 'consent-required', consentRequired.scope, consentRequired),
	}));
}
