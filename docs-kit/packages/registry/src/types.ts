/** Registry format version. Consumers must reject registries they do not understand. */
export const registryVersion = 1;

export type RegistryItemType =
	| 'component'
	| 'theme'
	| 'provider'
	| 'source'
	| 'analytics'
	| 'feedback';

export interface RegistryFile {
	/** Path relative to the install root, for example `components/Callout.svelte`. */
	path: string;
	content: string;
	/**
	 * Where the file belongs. `lib` is the default install root; `route` files go into the
	 * host's routes directory, which the installer resolves separately.
	 */
	target?: 'lib' | 'route' | 'static';
}

export interface RegistryItem {
	name: string;
	type: RegistryItemType;
	title: string;
	description: string;
	/** Framework versions this item supports, as a supported range expression. */
	frameworkVersion: string;
	/** npm dependencies the host must install. Reported, never installed automatically. */
	dependencies?: string[];
	/** Other registry items this item needs. */
	registryDependencies?: string[];
	files: RegistryFile[];
	/** Short usage documentation shown after installation. */
	docs?: string;
}

export interface Registry {
	version: number;
	items: RegistryItem[];
}

/** Reads a registry document defensively, rejecting unknown formats. */
export function parseRegistry(value: unknown): Registry {
	if (value === null || typeof value !== 'object') {
		throw new Error('A registry must be an object.');
	}

	const candidate = value as Partial<Registry>;
	if (candidate.version !== registryVersion) {
		throw new Error(
			`Unsupported registry version ${String(candidate.version)}. This build understands version ${registryVersion}.`
		);
	}
	if (!Array.isArray(candidate.items)) {
		throw new Error('A registry must contain an "items" array.');
	}

	for (const item of candidate.items) {
		if (typeof item?.name !== 'string' || item.name === '') {
			throw new Error('Every registry item needs a name.');
		}
		if (!Array.isArray(item.files) || item.files.length === 0) {
			throw new Error(`Registry item "${item.name}" has no files.`);
		}
		if (typeof item.frameworkVersion !== 'string' || item.frameworkVersion === '') {
			throw new Error(`Registry item "${item.name}" must declare a compatible frameworkVersion.`);
		}
	}

	return { version: registryVersion, items: candidate.items };
}
