import { get, writable } from 'svelte/store';
import type { OkDesktopConfig } from '$lib/desktop';
import { shellPreferences } from './preferences';
import { setProjectFromConfig } from './projects';

export type ProviderKey =
	| 'i18n'
	| 'telemetry'
	| 'project-config'
	| 'desktop-listeners'
	| 'feature-flags';

export type ProviderStatus = 'loading' | 'ready' | 'failed';

export type ProviderEntry = {
	key: ProviderKey;
	label: string;
	status: ProviderStatus;
	message: string;
	updatedAt: string;
};

export type TelemetryEvent = {
	id: string;
	name: string;
	properties: Record<string, string | number | boolean | null>;
	dispatchedAt: string;
};

export type FeatureFlagState = Record<string, boolean>;

const now = () => new Date().toISOString();

const initialProviders: ProviderEntry[] = [
	{
		key: 'i18n',
		label: 'Internationalization',
		status: 'loading',
		message: 'Waiting for locale hydration.',
		updatedAt: now(),
	},
	{
		key: 'telemetry',
		label: 'Telemetry',
		status: 'loading',
		message: 'Waiting for consent state.',
		updatedAt: now(),
	},
	{
		key: 'project-config',
		label: 'Project config',
		status: 'loading',
		message: 'Waiting for desktop config.',
		updatedAt: now(),
	},
	{
		key: 'desktop-listeners',
		label: 'Desktop listeners',
		status: 'loading',
		message: 'Waiting for bridge subscriptions.',
		updatedAt: now(),
	},
	{
		key: 'feature-flags',
		label: 'Feature flags',
		status: 'loading',
		message: 'Waiting for runtime flags.',
		updatedAt: now(),
	},
];

export const appProviders = writable<ProviderEntry[]>(initialProviders);
export const telemetryEvents = writable<TelemetryEvent[]>([]);
export const featureFlags = writable<FeatureFlagState>({});

function updateProvider(key: ProviderKey, status: ProviderStatus, message: string): void {
	appProviders.update((providers) =>
		providers.map((provider) =>
			provider.key === key ? { ...provider, status, message, updatedAt: now() } : provider,
		),
	);
}

export function markProviderReady(key: ProviderKey, message: string): void {
	updateProvider(key, 'ready', message);
}

export function markProviderFailed(key: ProviderKey, message: string): void {
	updateProvider(key, 'failed', message);
}

export function initializeI18nProvider(): void {
	const { locale } = get(shellPreferences);
	markProviderReady('i18n', `Locale ${locale} loaded.`);
}

export function initializeTelemetryProvider(): void {
	const { telemetryEnabled } = get(shellPreferences);
	markProviderReady(
		'telemetry',
		telemetryEnabled ? 'Telemetry dispatch enabled by consent.' : 'Telemetry gated until user consent.',
	);
}

export function initializeFeatureFlags(config: OkDesktopConfig): void {
	featureFlags.set({
		desktopBridge: true,
		e2eSmoke: config.e2eSmoke,
		ptyBridge: config.ptyAvailable,
		singleFileMode: config.singleFile,
	});
	markProviderReady('feature-flags', 'Runtime feature flags hydrated.');
}

export function hydrateProjectConfig(config: OkDesktopConfig): void {
	setProjectFromConfig(config);
	markProviderReady('project-config', config.projectName || 'Project config hydrated.');
}

export function markDesktopListenersReady(): void {
	markProviderReady('desktop-listeners', 'Bridge listeners subscribed.');
}

export function recordTelemetryEvent(
	name: string,
	properties: Record<string, string | number | boolean | null> = {},
): boolean {
	if (!get(shellPreferences).telemetryEnabled) return false;

	telemetryEvents.update((events) =>
		[
			{
				id: `${Date.now()}-${name}`,
				name,
				properties,
				dispatchedAt: now(),
			},
			...events,
		].slice(0, 40),
	);
	return true;
}
