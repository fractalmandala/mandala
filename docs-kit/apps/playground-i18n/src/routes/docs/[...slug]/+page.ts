import { error } from '@sveltejs/kit';
import {
	findManifestPage,
	getDocsManifestPageKey,
	getDocsNavigation,
	parseDocsPath,
	type DocsRoutingOptions
} from '@docs-kit/core';
import { manifest, pageImporters } from 'virtual:docs-kit/manifest';

import type { EntryGenerator, PageLoad } from './$types';

const basePath = '/docs';

/** Routing policy rebuilt from the manifest, so the route repeats no configuration. */
const routing: DocsRoutingOptions = {
	basePath,
	versions: {
		current: manifest.versions.find((version) => version.current)?.id ?? '',
		versions: manifest.versions
	},
	locales: {
		defaultLocale: manifest.locales.find((locale) => locale.default)?.id ?? '',
		locales: manifest.locales
	}
};

export const prerender = true;

export const entries: EntryGenerator = () =>
	manifest.pages.map((page) => ({
		slug: page.pathname.replace(new RegExp(`^${basePath}/?`), '')
	}));

export const load: PageLoad = async ({ params }) => {
	const target = parseDocsPath(`${basePath}/${params.slug ?? ''}`, routing) ?? {
		slug: params.slug ?? ''
	};
	const page = findManifestPage(manifest, target.slug, {
		...(target.version === undefined ? {} : { version: target.version }),
		...(target.locale === undefined ? {} : { locale: target.locale })
	});

	if (!page) {
		error(404, `No documentation page matches "${params.slug ?? ''}".`);
	}

	const importer = pageImporters[getDocsManifestPageKey(page)];

	if (!importer) {
		error(404, `No compiled module exists for "${page.id}".`);
	}

	const module = await importer();

	return {
		page,
		manifest,
		navigation: getDocsNavigation(manifest, {
			...(page.version === undefined ? {} : { version: page.version }),
			...(page.locale === undefined ? {} : { locale: page.locale })
		}),
		content: module.default,
		site: {
			title: 'Acme Documentation',
			description: 'Versioned, multilingual documentation.',
			url: 'https://example.com'
		}
	};
};
