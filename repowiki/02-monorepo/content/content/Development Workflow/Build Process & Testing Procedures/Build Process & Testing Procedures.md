# Build Process & Testing Procedures

<cite>
**Referenced Files in This Document**
- [package.json](file://packages/fractal-svelte/package.json)
- [vite.config.ts](file://packages/fractal-svelte/vite.config.ts)
- [svelte.config.js](file://packages/fractal-svelte/svelte.config.js)
- [tsconfig.json](file://packages/fractal-svelte/tsconfig.json)
- [ci.yml](file://packages/fractal-svelte/.github/workflows/ci.yml)
- [setup.ts](file://packages/fractal-svelte/tests/setup.ts)
- [button.test.ts](file://packages/fractal-svelte/tests/button.test.ts)
- [package.json](file://packages/morphicons-svelte/package.json)
- [vite.config.ts](file://packages/morphicons-svelte/vite.config.ts)
- [MorphIcon.ssr.test.ts](file://packages/morphicons-svelte/tests/MorphIcon.ssr.test.ts)
- [MorphIcon.browser.test.ts](file://packages/morphicons-svelte/tests/MorphIcon.browser.test.ts)
- [vite.config.ts](file://packages/svelte-animated-icon/vite.config.ts)
- [package.json](file://packages/svelte-icons/package.json)
- [vite.config.ts](file://packages/svelte-icons/vite.config.ts)
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion

## Introduction
This document explains the build process and testing procedures across the packages in this repository. It covers Vite build configuration, TypeScript compilation, package publishing workflows, unit testing with Vitest, component testing with Svelte testing utilities, SSR and browser tests, and CI/CD integration. It also provides guidance on test coverage reporting, performance profiling, bundle size analysis, debugging techniques, test environment setup, and common testing patterns for UI components and agent logic.

## Project Structure
The repository contains multiple Svelte-based packages:
- fractal-svelte: A Svelte 5 component library with extensive unit/component tests and a comprehensive CI pipeline.
- morphicons-svelte: A Svelte 5 binding for morphicons with both SSR and browser tests.
- svelte-animated-icon and svelte-icons: Svelte icon libraries using Vite + SvelteKit and mdsvex for documentation.

Key build and test configuration files are located at the root of each package (package.json, vite.config.ts, svelte.config.js, tsconfig.json), with tests under tests/ directories.

```mermaid
graph TB
subgraph "fractal-svelte"
FS_PKG["package.json"]
FS_VITE["vite.config.ts"]
FS_SVELTE["svelte.config.js"]
FS_TS["tsconfig.json"]
FS_CI[".github/workflows/ci.yml"]
FS_TESTS["tests/*.test.ts"]
end
subgraph "morphicons-svelte"
MI_PKG["package.json"]
MI_VITE["vite.config.ts"]
MI_TESTS["tests/*.test.ts"]
end
subgraph "svelte-animated-icon"
SA_VITE["vite.config.ts"]
end
subgraph "svelte-icons"
SI_PKG["package.json"]
SI_VITE["vite.config.ts"]
end
FS_PKG --> FS_VITE
FS_PKG --> FS_SVELTE
FS_PKG --> FS_TS
FS_VITE --> FS_TESTS
FS_CI --> FS_PKG
FS_CI --> FS_TESTS
MI_PKG --> MI_VITE
MI_VITE --> MI_TESTS
SA_VITE --> SA_VITE
SI_PKG --> SI_VITE
```

**Diagram sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [svelte.config.js:1-18](file://packages/fractal-svelte/svelte.config.js#L1-L18)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)
- [package.json:27-33](file://packages/morphicons-svelte/package.json#L27-L33)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)
- [vite.config.ts:1-22](file://packages/svelte-animated-icon/vite.config.ts#L1-L22)
- [package.json:5-16](file://packages/svelte-icons/package.json#L5-L16)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)

**Section sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [svelte.config.js:1-18](file://packages/fractal-svelte/svelte.config.js#L1-L18)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)
- [package.json:27-33](file://packages/morphicons-svelte/package.json#L27-L33)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)
- [vite.config.ts:1-22](file://packages/svelte-animated-icon/vite.config.ts#L1-L22)
- [package.json:5-16](file://packages/svelte-icons/package.json#L5-L16)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)

## Core Components
- Vite build configuration:
  - fractal-svelte uses Vite with SvelteKit plugin, jsdom test environment, and aliasing for mocking dependencies during tests.
  - morphicons-svelte configures Vite with jsdom environment and conditional browser conditions for tests.
  - svelte-animated-icon and svelte-icons use SvelteKit with mdsvex preprocessing for docs.
- TypeScript compilation:
  - All packages extend SvelteKit-generated tsconfig and enable strict mode, NodeNext modules, and source maps.
- Package publishing:
  - Scripts invoke svelte-package and publint to validate exports and types before publishing.
  - Exports map svelte, types, and default entries for clean consumption.

**Section sources**
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)
- [vite.config.ts:1-22](file://packages/svelte-animated-icon/vite.config.ts#L1-L22)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [package.json:27-33](file://packages/morphicons-svelte/package.json#L27-L33)
- [package.json:5-16](file://packages/svelte-icons/package.json#L5-L16)

## Architecture Overview
The build and test architecture integrates Vite, SvelteKit, TypeScript, Vitest, and GitHub Actions. Each package defines its own build and test scripts, while CI orchestrates checks, linting, tests, and packaging validation.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant NPM as "npm/pnpm scripts"
participant Vite as "Vite/SvelteKit"
participant TS as "TypeScript"
participant Test as "Vitest"
participant CI as "GitHub Actions"
Dev->>NPM : Run "build" or "test"
NPM->>Vite : Execute Vite build/dev
Vite->>TS : Compile TypeScript/Svelte
Vite-->>NPM : Output dist artifacts
NPM->>Test : Execute Vitest suite
Test-->>NPM : Report results
CI->>NPM : Trigger check/lint/test/build
NPM-->>CI : Exit codes and artifacts
```

**Diagram sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)

**Section sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)

## Detailed Component Analysis

### Vite Configuration and Build Pipeline
- frаctаl-svelte:
  - Uses @sveltejs/kit/vite plugin, sets browser conditions, esbuild target to esnext, and Vitest configuration including jsdom environment, setup file, and aliasing for mocking.
- morphicons-svelte:
  - Configures Vitest with jsdom and includes test files; resolves browser conditions conditionally when running tests.
- svelte-animated-icon and svelte-icons:
  - Use SvelteKit with mdsvex preprocessing for markdown/svx content and adapter configuration.

```mermaid
flowchart TD
Start(["Build Entry"]) --> ViteConfig["Load Vite Config"]
ViteConfig --> SveltePlugin["SvelteKit Plugin"]
SveltePlugin --> Preprocess["Preprocessors (mdsvex if present)"]
Preprocess --> TSCompile["TypeScript Compilation"]
TSCompile --> Bundle["Bundle Generation"]
Bundle --> Dist["Output dist/*"]
Dist --> End(["Build Complete"])
```

**Diagram sources**
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)
- [vite.config.ts:1-22](file://packages/svelte-animated-icon/vite.config.ts#L1-L22)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)

**Section sources**
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)
- [vite.config.ts:1-22](file://packages/svelte-animated-icon/vite.config.ts#L1-L22)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)

### TypeScript Compilation Settings
- Extends SvelteKit-generated tsconfig.
- Enables strict mode, NodeNext module resolution, source maps, and JSON module support.
- Ensures consistent casing and allows JS with type checking where applicable.

**Section sources**
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)

### Package Publishing Workflow
- Scripts:
  - prepack runs svelte-kit sync, svelte-package, and publint to validate package structure and exports.
  - build triggers Vite build then prepack.
- Exports:
  - Explicit mappings for svelte, types, and default entry points per module.
  - sideEffects declarations for CSS/SASS assets.

```mermaid
flowchart TD
PrepackStart(["prepack"]) --> Sync["svelte-kit sync"]
Sync --> Package["svelte-package"]
Package --> Publint["publint"]
Publint --> Validate{"Validation Pass?"}
Validate --> |Yes| PublishReady["Package Ready"]
Validate --> |No| FixIssues["Fix Export/Types Issues"]
FixIssues --> Publint
```

**Diagram sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [package.json:27-33](file://packages/morphicons-svelte/package.json#L27-L33)
- [package.json:5-16](file://packages/svelte-icons/package.json#L5-L16)

**Section sources**
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)
- [package.json:27-33](file://packages/morphicons-svelte/package.json#L27-L33)
- [package.json:5-16](file://packages/svelte-icons/package.json#L5-L16)

### Unit and Component Testing with Vitest and Svelte Testing Utilities
- Environment:
  - jsdom configured for Vitest to simulate browser APIs.
  - Setup file initializes testing-library integrations and mocks global APIs like matchMedia.
- Patterns:
  - Render components, assert DOM attributes and data slots.
  - Fire events and verify behavior (e.g., pointer interactions).
  - Mock dependencies via aliases in Vite config.

```mermaid
sequenceDiagram
participant Test as "Vitest Runner"
participant Setup as "tests/setup.ts"
participant Lib as "Component Under Test"
participant TL as "@testing-library/svelte"
Test->>Setup : Load setup file
Setup-->>Test : Initialize globals and mocks
Test->>TL : render(Component)
TL-->>Test : DOM snapshot
Test->>Lib : fireEvent / assertions
Lib-->>Test : Behavior outcomes
Test-->>Test : Assertions pass/fail
```

**Diagram sources**
- [setup.ts:1-17](file://packages/fractal-svelte/tests/setup.ts#L1-L17)
- [button.test.ts:1-32](file://packages/fractal-svelte/tests/button.test.ts#L1-L32)
- [vite.config.ts:22-31](file://packages/fractal-svelte/vite.config.ts#L22-L31)

**Section sources**
- [setup.ts:1-17](file://packages/fractal-svelte/tests/setup.ts#L1-L17)
- [button.test.ts:1-32](file://packages/fractal-svelte/tests/button.test.ts#L1-L32)
- [vite.config.ts:22-31](file://packages/fractal-svelte/vite.config.ts#L22-L31)

### SSR and Browser Tests for Morphicons
- SSR tests:
  - Use a Vite dev server in middleware mode to load Svelte SSR rendering.
  - Verify canonical SVG paths, accessibility attributes, and controlled morph states.
- Browser tests:
  - Mount components in jsdom, flush synchronous updates, and assert imperative APIs and state transitions.

```mermaid
sequenceDiagram
participant SSR as "SSR Test"
participant ViteSSR as "Vite Dev Server (SSR)"
participant SvelteSSR as "svelte/server"
participant Comp as "MorphIcon.svelte"
SSR->>ViteSSR : Create server with svelte plugin
ViteSSR-->>SSR : ssrLoadModule("svelte/server")
SSR->>SvelteSSR : render(Component, props)
SvelteSSR-->>SSR : HTML body string
SSR->>Comp : Assert d attribute and aria roles
```

**Diagram sources**
- [MorphIcon.ssr.test.ts:1-98](file://packages/morphicons-svelte/tests/MorphIcon.ssr.test.ts#L1-L98)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)

**Section sources**
- [MorphIcon.ssr.test.ts:1-98](file://packages/morphicons-svelte/tests/MorphIcon.ssr.test.ts#L1-L98)
- [MorphIcon.browser.test.ts:1-114](file://packages/morphicons-svelte/tests/MorphIcon.browser.test.ts#L1-L114)
- [vite.config.ts:1-12](file://packages/morphicons-svelte/vite.config.ts#L1-L12)

### CI/CD Pipeline Integration
- Triggers:
  - On push and pull requests to main branch.
- Jobs:
  - check: installs dependencies, runs type checks, linting, tests, and registry checks.
  - build: builds the package and validates packaging with dry-run pack and publint.

```mermaid
flowchart TD
Trigger["Push/Pull Request to main"] --> Checkout["Checkout code"]
Checkout --> SetupNode["Setup Node + pnpm"]
SetupNode --> Install["pnpm install --frozen-lockfile"]
Install --> CheckJob["Run pnpm check"]
Install --> LintJob["Run pnpm lint"]
Install --> TestJob["Run pnpm test"]
Install --> RegistryJob["Run pnpm run check:registry"]
Install --> BuildJob["Run pnpm build"]
BuildJob --> PackJob["pnpm pack --dry-run && npx publint"]
PackJob --> Result["CI Status"]
```

**Diagram sources**
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)

**Section sources**
- [ci.yml:1-37](file://packages/fractal-svelte/.github/workflows/ci.yml#L1-L37)

## Dependency Analysis
- Internal dependencies:
  - Vite plugins (@sveltejs/kit/vite) and preprocessors (mdsvex) drive build steps.
  - TypeScript configuration extends SvelteKit-generated settings.
- External dependencies:
  - Vitest and jsdom provide unit/component testing environments.
  - Svelte testing utilities facilitate rendering and event simulation.
  - publint ensures package export correctness.

```mermaid
graph TB
Vite["@sveltejs/kit/vite"] --> Build["Build Pipeline"]
MDX["mdsvex"] --> Docs["Docs Preprocessing"]
TS["TypeScript"] --> Types["Type Checking"]
Vitest["Vitest + jsdom"] --> Tests["Unit/Component Tests"]
TL["@testing-library/svelte"] --> Tests
Publint["publint"] --> Validation["Package Validation"]
```

**Diagram sources**
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [package.json:219-243](file://packages/fractal-svelte/package.json#L219-L243)

**Section sources**
- [vite.config.ts:1-32](file://packages/fractal-svelte/vite.config.ts#L1-L32)
- [vite.config.ts:1-20](file://packages/svelte-icons/vite.config.ts#L1-L20)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [package.json:219-243](file://packages/fractal-svelte/package.json#L219-L243)

## Performance Considerations
- Bundle analysis:
  - Use tools like webpack-bundle-analyzer or source-map-explorer to inspect bundle composition and identify large dependencies.
- Web Vitals:
  - Measure LCP, CLS, INP, FCP, TTFB to ensure performance targets.
- Build performance:
  - Track cold build time, hot reload speed, and test suite duration to optimize developer experience.
- Optimization strategies:
  - Code splitting, lazy loading, tree shaking, and removing unused dependencies.
  - Memoization and stable references to avoid unnecessary re-renders.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Common issues:
  - Missing browser APIs in jsdom: Ensure setup files mock window.matchMedia and other globals.
  - Type errors: Confirm tsconfig extends SvelteKit-generated config and strict mode is enabled.
  - Export mismatches: Use publint to detect incorrect or missing exports.
- Debugging techniques:
  - Enable source maps for better stack traces.
  - Use Vitest’s watch mode to iterate quickly on tests.
  - Inspect Vite dev server logs for SSR and module loading issues.

**Section sources**
- [setup.ts:1-17](file://packages/fractal-svelte/tests/setup.ts#L1-L17)
- [tsconfig.json:1-16](file://packages/fractal-svelte/tsconfig.json#L1-L16)
- [package.json:24-42](file://packages/fractal-svelte/package.json#L24-L42)

## Conclusion
This repository employs a robust build and testing strategy across multiple Svelte packages. Vite and SvelteKit streamline development and production builds, while Vitest and Svelte testing utilities provide comprehensive unit and component testing. CI pipelines enforce quality gates through checks, linting, tests, and packaging validation. Following the outlined practices ensures reliable releases, maintainable code, and high-quality user experiences.

[No sources needed since this section summarizes without analyzing specific files]