import type { DocsManifestPage } from '@docs-kit/core/manifest';
import {
	normalizeDocsVersions,
	type DocsVersionModel,
	type DocsVersionsConfig
} from '@docs-kit/core/versioning';

export type DocsLocaleDirection = 'ltr' | 'rtl';

export type DocsLocaleInput =
	| string
	| {
			id: string;
			label?: string;
			dir?: DocsLocaleDirection;
			source?: string;
	  };

export interface DocsI18nConfig {
	defaultLocale: string;
	locales: readonly DocsLocaleInput[];
	omitDefaultLocale?: boolean;
}

export interface DocsLocaleRecord {
	id: string;
	label: string;
	default: boolean;
	dir: DocsLocaleDirection;
	source?: string;
}

export interface DocsLocaleModel {
	defaultLocale: string;
	locales: DocsLocaleRecord[];
	omitDefaultLocale: boolean;
}

function normalizeId(value: string, kind: string, position: number): string {
	const id = value.trim();
	if (!id) {
		throw new Error(`@docs-kit/core ${kind} at position ${position} must have a non-empty id.`);
	}
	return id;
}

function normalizeInput(input: DocsLocaleInput, position: number): DocsLocaleRecord {
	const id = normalizeId(typeof input === 'string' ? input : input.id, 'locale', position);
	const label = typeof input === 'string' ? id : input.label?.trim() || id;
	const dir = typeof input === 'string' ? 'ltr' : input.dir ?? 'ltr';
	const source = typeof input === 'string' ? undefined : input.source?.trim() || undefined;

	return {
		id,
		label,
		default: false,
		dir,
		...(source ? { source } : {})
	};
}

/** Normalizes locale configuration into a deterministic, client-safe model. */
export function normalizeDocsLocales(config: DocsI18nConfig): DocsLocaleModel {
	const defaultLocale = normalizeId(config.defaultLocale, 'default locale', 0);
	const records = config.locales.map(normalizeInput);
	const seen = new Set<string>();

	for (const record of records) {
		if (seen.has(record.id)) {
			throw new Error(`@docs-kit/core locales config contains duplicate locale id "${record.id}".`);
		}
		seen.add(record.id);
	}

	if (!seen.has(defaultLocale)) {
		throw new Error(
			`@docs-kit/core locales config default locale "${defaultLocale}" is not present in the configured locales.`
		);
	}

	return {
		defaultLocale,
		omitDefaultLocale: config.omitDefaultLocale ?? true,
		locales: records.map((record) => ({ ...record, default: record.id === defaultLocale }))
	};
}

/** Returns a locale record by id from a normalized model. */
export function findDocsLocale(
	model: DocsLocaleModel,
	id: string
): DocsLocaleRecord | undefined {
	return model.locales.find((locale) => locale.id === id);
}

export type DocsTranslationPage = Pick<
	DocsManifestPage,
	'id' | 'slug' | 'version' | 'locale'
> & {
	contentHash?: string;
	translationSourceHash?: string;
};

export type DocsTranslationDiagnosticCode = 'MISSING_TRANSLATION' | 'STALE_TRANSLATION';

export interface DocsTranslationDiagnostic {
	code: DocsTranslationDiagnosticCode;
	severity: 'warning';
	pageId: string;
	locale: string;
	version?: string;
	slug: string;
	message: string;
}

export interface DiagnoseDocsTranslationsOptions {
	locales: DocsI18nConfig | DocsLocaleModel;
	versions?: DocsVersionsConfig | DocsVersionModel;
}

function isLocaleModel(value: DocsI18nConfig | DocsLocaleModel): value is DocsLocaleModel {
	return 'defaultLocale' in value && 'omitDefaultLocale' in value;
}

function isVersionModel(
	value: NonNullable<DiagnoseDocsTranslationsOptions['versions']>
): value is DocsVersionModel {
	return (
		'current' in value &&
		Array.isArray(value.versions) &&
		value.versions.every((version) => typeof version === 'object' && 'current' in version)
	);
}

function pageLocale(page: DocsTranslationPage, model: DocsLocaleModel): string {
	return page.locale ?? model.defaultLocale;
}

function pageVersion(
	page: DocsTranslationPage,
	model: DocsVersionModel | undefined
): string | undefined {
	return page.version ?? model?.current;
}

/** Reports missing and stale translations in deterministic page/locale order. */
export function diagnoseDocsTranslations(
	pages: readonly DocsTranslationPage[],
	options: DiagnoseDocsTranslationsOptions
): DocsTranslationDiagnostic[] {
	const localeModel = isLocaleModel(options.locales)
		? options.locales
		: normalizeDocsLocales(options.locales);
	const versionModel = options.versions
		? isVersionModel(options.versions)
			? options.versions
			: normalizeDocsVersions(options.versions)
		: undefined;
	const defaultLocale = localeModel.defaultLocale;
	const nonDefaultLocales = localeModel.locales.filter((locale) => !locale.default);
	const versions = versionModel?.versions.map((version) => version.id) ?? [undefined];
	const diagnostics: DocsTranslationDiagnostic[] = [];

	for (const version of versions) {
		const sourcePages = pages
			.filter((page) => pageLocale(page, localeModel) === defaultLocale)
			.filter((page) => pageVersion(page, versionModel) === version)
			.sort((left, right) => left.slug.localeCompare(right.slug));

		for (const sourcePage of sourcePages) {
			for (const locale of nonDefaultLocales) {
				const translatedPage = pages.find(
					(page) =>
						page.slug === sourcePage.slug &&
						pageLocale(page, localeModel) === locale.id &&
						pageVersion(page, versionModel) === version
				);

				if (!translatedPage) {
					diagnostics.push({
						code: 'MISSING_TRANSLATION',
						severity: 'warning',
						pageId: sourcePage.id,
						locale: locale.id,
						...(version ? { version } : {}),
						slug: sourcePage.slug,
						message: `Missing ${locale.label} translation for "${sourcePage.slug || 'index'}".`
					});
					continue;
				}

				if (
					sourcePage.contentHash &&
					translatedPage.translationSourceHash &&
					sourcePage.contentHash !== translatedPage.translationSourceHash
				) {
					diagnostics.push({
						code: 'STALE_TRANSLATION',
						severity: 'warning',
						pageId: translatedPage.id,
						locale: locale.id,
						...(version ? { version } : {}),
						slug: sourcePage.slug,
						message: `${locale.label} translation for "${sourcePage.slug || 'index'}" is stale.`
					});
				}
			}
		}
	}

	return diagnostics;
}
