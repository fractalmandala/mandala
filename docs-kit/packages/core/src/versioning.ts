export type DocsVersionInput =
	| string
	| {
			id: string;
			label?: string;
			source?: string;
	  };

export interface DocsVersionsConfig {
	current: string;
	versions?: readonly DocsVersionInput[];
	available?: readonly DocsVersionInput[];
}

export interface DocsVersionRecord {
	id: string;
	label: string;
	current: boolean;
	source?: string;
}

export interface DocsVersionModel {
	current: string;
	versions: DocsVersionRecord[];
}

function normalizeId(value: string, kind: string, position: number): string {
	const id = value.trim();
	if (!id) {
		throw new Error(`@docs-kit/core ${kind} at position ${position} must have a non-empty id.`);
	}
	return id;
}

function normalizeInput(input: DocsVersionInput, position: number): DocsVersionRecord {
	const id = normalizeId(typeof input === 'string' ? input : input.id, 'version', position);
	const label = typeof input === 'string' ? id : input.label?.trim() || id;
	const source = typeof input === 'string' ? undefined : input.source?.trim() || undefined;

	return {
		id,
		label,
		current: false,
		...(source ? { source } : {})
	};
}

/** Normalizes version configuration into a deterministic, client-safe model. */
export function normalizeDocsVersions(config: DocsVersionsConfig): DocsVersionModel {
	if (config.versions !== undefined && config.available !== undefined) {
		throw new Error('@docs-kit/core versions config cannot define both `versions` and `available`.');
	}

	const current = normalizeId(config.current, 'current version', 0);
	const configured = config.versions ?? config.available ?? [current];
	const records = configured.map(normalizeInput);
	const seen = new Set<string>();

	for (const record of records) {
		if (seen.has(record.id)) {
			throw new Error(`@docs-kit/core versions config contains duplicate version id "${record.id}".`);
		}
		seen.add(record.id);
	}

	if (!seen.has(current)) {
		throw new Error(
			`@docs-kit/core versions config current version "${current}" is not present in the configured versions.`
		);
	}

	return {
		current,
		versions: records.map((record) => ({ ...record, current: record.id === current }))
	};
}

/** Returns a version record by id from a normalized model. */
export function findDocsVersion(
	model: DocsVersionModel,
	id: string
): DocsVersionRecord | undefined {
	return model.versions.find((version) => version.id === id);
}
