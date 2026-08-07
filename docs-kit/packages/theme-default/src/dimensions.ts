import {
	buildDocsLocaleSwitcherItems,
	buildDocsVersionSwitcherItems,
	type DocsLocaleSwitcherItem,
	type DocsManifest,
	type DocsManifestPage,
	type DocsRoutingOptions,
	type DocsVersionSwitcherItem
} from '@docs-kit/core';

export interface DocsDimensionOptions {
	manifest: DocsManifest;
	/** The page currently being viewed. */
	page: DocsManifestPage;
	basePath?: string;
	versionPrefix?: DocsRoutingOptions['versionPrefix'];
	localePrefix?: DocsRoutingOptions['localePrefix'];
}

export interface DocsDimensionSwitchers {
	versions: DocsVersionSwitcherItem[];
	locales: DocsLocaleSwitcherItem[];
}

/**
 * Builds switcher data from the generated manifest.
 *
 * Routing options are reconstructed from the manifest itself, so a host does not have to
 * repeat its version and locale configuration in the route.
 */
export function createDocsDimensionSwitchers(
	options: DocsDimensionOptions
): DocsDimensionSwitchers {
	const { manifest, page } = options;
	const routing: DocsRoutingOptions = {
		...(options.basePath === undefined ? {} : { basePath: options.basePath }),
		...(options.versionPrefix === undefined ? {} : { versionPrefix: options.versionPrefix }),
		...(options.localePrefix === undefined ? {} : { localePrefix: options.localePrefix }),
		...(manifest.versions.length === 0
			? {}
			: {
					versions: {
						current: manifest.versions.find((version) => version.current)?.id ?? '',
						versions: manifest.versions
					}
				}),
		...(manifest.locales.length === 0
			? {}
			: {
					locales: {
						defaultLocale: manifest.locales.find((locale) => locale.default)?.id ?? '',
						locales: manifest.locales
					}
				})
	};

	const target = {
		slug: page.slug,
		...(page.version === undefined ? {} : { version: page.version }),
		...(page.locale === undefined ? {} : { locale: page.locale })
	};

	return {
		versions:
			manifest.versions.length === 0
				? []
				: buildDocsVersionSwitcherItems(manifest.pages, target, routing),
		locales:
			manifest.locales.length === 0
				? []
				: buildDocsLocaleSwitcherItems(manifest.pages, target, routing)
	};
}
