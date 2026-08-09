export {
	contentExtensionFromPath,
	contentExtensions,
	pathToSlug,
	pathToSlugSegments,
	slugToPathname,
	type ContentExtension,
	type DiscoveredContent
} from '@docs-kit/core/content';
// Filesystem discovery is deliberately absent from this barrel: it imports `node:fs`, and
// this entry point is what browser bundles pull in. Import `@docs-kit/core/discovery`
// from build-time code instead.
export {
	parseDocsFrontmatter,
	serializeDocsFrontmatter,
	type DocsFrontmatterValue,
	type ParsedDocsFrontmatter
} from '@docs-kit/core/frontmatter';
export {
	formatDocsDiagnostic,
	validateDocs,
	type DocsDiagnostic,
	type DocsDiagnosticCode,
	type DocsDiagnosticSeverity,
	type DocsValidationResult,
	type ValidateDocsOptions
} from '@docs-kit/core/validate';
export {
	createDocsSearchRecords,
	toSearchableText,
	type CreateDocsSearchRecordsOptions,
	type DocsSearchRecord
} from '@docs-kit/core/search';
export {
	createDocsPageMeta,
	titleFromSlug,
	type CreateDocsPageMetaOptions,
	type DocsPageMeta
} from '@docs-kit/core/page';
export {
	buildDocsNavigation,
	createDocsPagination,
	flattenDocsNavigation,
	getDocsNavigationKey,
	sectionMetaFileName,
	type BuildDocsNavigationOptions,
	type DiscoveredSection,
	type DocsNavigablePage,
	type DocsNavigationInput,
	type DocsNavigationLink,
	type DocsNavigationNode,
	type DocsNavigationPage,
	type DocsNavigationSection,
	type DocsPageReference,
	type DocsSectionMeta
} from '@docs-kit/core/navigation';
export {
	createDocsManifest,
	findManifestPage,
	getDocsNavigation,
	findManifestPageByPathname,
	findDocsRedirect,
	getDocsManifestPageKey,
	hashDocsManifestConfig,
	defaultDocsManifestGeneratedAt,
	createDocsPageRecord,
	type CreateDocsManifestOptions,
	type DocsManifest,
	type DocsManifestPage,
	type DocsPageRecord,
	type DocsRedirectRecord,
	type DocsManifestSource
} from '@docs-kit/core/manifest';
export {
	findDocsVersion,
	normalizeDocsVersions,
	type DocsVersionInput,
	type DocsVersionModel,
	type DocsVersionRecord,
	type DocsVersionsConfig
} from '@docs-kit/core/versioning';
export {
	diagnoseDocsTranslations,
	findDocsLocale,
	normalizeDocsLocales,
	type DocsI18nConfig,
	type DocsLocaleModel,
	type DocsLocaleInput,
	type DocsLocaleRecord,
	type DiagnoseDocsTranslationsOptions,
	type DocsTranslationDiagnostic,
	type DocsTranslationDiagnosticCode,
	type DocsTranslationPage
} from '@docs-kit/core/i18n';
export {
	buildDocsLocaleSwitcherItems,
	buildDocsVersionSwitcherItems,
	createDocsPath,
	normalizeDocsRouteTarget,
	normalizeDocsRoutingOptions,
	parseDocsPath,
	resolveEquivalentPage,
	type DocsEquivalentMatch,
	type DocsEquivalentPageResolution,
	type DocsLocalePrefixPolicy,
	type DocsLocaleSwitcherItem,
	type DocsNormalizedRoutingOptions,
	type DocsRouteTarget,
	type DocsRoutingOptions,
	type DocsVersionPrefixPolicy,
	type DocsVersionSwitcherItem
} from '@docs-kit/core/routing';
export {
	extractDocsHeadings,
	extractDocsLinks,
	extractDocsTitle,
	slugifyHeading,
	splitDocsFrontmatter,
	splitDocsSections,
	type DocsHeading,
	type DocsLink,
	type DocsSection
} from '@docs-kit/core/markdown';
export {
	defaultDocsOutDir,
	defineDocsConfig,
	resolveDocsConfig,
	type DocsConfig,
	type DocsCollectionConfig,
	type DocsCollectionRecord,
	type DocsContentConfig,
	type DocsResolvedConfig,
	type DocsRoutingConfig,
	type DocsSiteConfig,
	type DocsSourceConfig,
	type DocsSourcesConfig,
	type DocsOpenApiConfig
} from '@docs-kit/core/config';
export {
	assertSafeRelativePath,
	hashDocsSourceContent,
	normalizeDocsSourceDocument,
	resolveDocsSourceConflicts,
	toDiscoveredContent,
	type DocsContentSource,
	type DocsSourceConflictPolicy,
	type DocsSourceContext,
	type DocsSourceDiagnostic,
	type DocsSourceDiagnosticCode,
	type DocsSourceDocument,
	type DocsSourceOrigin,
	type DocsSourceRecord,
	type DocsSourceResolution,
	type DocsSourceWatchContext,
	type DocsSourceWatcher,
	type ResolveDocsSourceConflictsOptions
} from '@docs-kit/core/sources';
export {
	createDocsSourceCacheIndex,
	createDocsSourceFailurePlan,
	createDocsSourceSyncPlan,
	docsSourceCacheVersion,
	findDocsSourceCacheState,
	mergeDocsSourceCacheIndex,
	parseDocsSourceCacheIndex,
	type DocsSourceCacheEntry,
	type DocsSourceCacheIndex,
	type DocsSourceCacheState,
	type DocsSourceCacheStatus,
	type DocsSourceSyncPlan,
	type DocsSourceSyncWrite
} from '@docs-kit/core/cache';
export {
	createDocsPageMetadata,
	type DocsCanonicalPolicy,
	type DocsLocaleAlternate,
	type DocsMetadataOptions,
	type DocsPageMetadata
} from '@docs-kit/core/metadata';
