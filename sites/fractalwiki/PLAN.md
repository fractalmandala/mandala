# Implementation Plan — FractalWiki SvelteKit Documentation Site

**Project Path**: `/Users/amrit/fractals/sites/fractalwiki`  
**Vault Path**: `/Users/amrit/100cabinet/10wiki`  
**Stack**: SvelteKit (Svelte 5 runes), TypeScript, mdsvex, Indented SASS, `fractals-styler`

---

## Step 1: Vault Indexer & Server Data Loader Engine
- **Intent**: Create `src/lib/server/vault.ts` and `src/lib/server/config.ts` to load `site-config.json`, recursively scan vault folders in `/Users/amrit/100cabinet/10wiki`, parse YAML frontmatter (`title`, `description`, `tags`, `sources`, `related`, `timestamp`), and build the navigation tree (Groups -> Sections -> Topics).
- **Acceptance Criteria**:
  1. `loadSiteConfig()` successfully reads `site-config.json`.
  2. `getVaultTree()` correctly scans all 4 groups and sections defined in `site-config.json`.
  3. Frontmatter metadata is correctly extracted from `.md` files using parser.

## Step 2: Global Root Layout & App Shell (`src/routes/+layout.server.ts` & `+layout.svelte`)
- **Intent**: Connect the vault indexer to the SvelteKit root layout and build the responsive App Shell layout with sidebar and header.
- **Acceptance Criteria**:
  1. `+layout.server.ts` passes `siteConfig` and `navigation` data to all client routes.
  2. Global SASS styles (`$lib/styles/index.sass`) and `virtual:fractals-styler.css` render without errors.
  3. Dark/Light theme mode state is managed reactively via Svelte 5 `$state`.

## Step 3: Multi-Bank Collapsible Sidebar Component (`src/lib/components/Sidebar.svelte`)
- **Intent**: Build `Sidebar.svelte` styled with `fractals-styler` utility classes to display the grouped navigation menu with collapsible group headers, section icons, topic counts, and active route indicators.
- **Acceptance Criteria**:
  1. Displays all 4 groups (*Civilization and History*, *Philosophy and Thought*, *Dev and Design*, *AI Built Wiki*).
  2. Clicking a group expands/collapses its nested sections and topics.
  3. Active page/topic route is highlighted.

## Step 4: Header & Interactive Search Modal (`Header.svelte` & `SearchModal.svelte`)
- **Intent**: Implement top header bar with breadcrumb path navigation, theme toggle button, and `Cmd+K` modal popup for fast client-side fuzzy search across document titles, tags, and topics.
- **Acceptance Criteria**:
  1. Header displays current section breadcrumbs and search button.
  2. Pressing `Cmd+K` or `Ctrl+K` opens `SearchModal.svelte`.
  3. Typing in search modal filters vault topics instantly and allows arrow-key navigation.

## Step 5: Dynamic Markdown Catch-All Route (`src/routes/[...slug]/`)
- **Intent**: Implement `+page.server.ts` and `+page.svelte` to catch vault document routes, render mdsvex/HTML content, display YAML Frontmatter Inspector badges, resolve internal links (`[Title](slug)` & `[[wiki]]`), and generate right-side TOC.
- **Acceptance Criteria**:
  1. Navigating to any vault section/topic route loads and renders the target `.md` file.
  2. Frontmatter inspector panel displays title, description, tags, sources, and timestamp.
  3. Right-side Table of Contents panel extracts `h2`/`h3` headings with scroll-spy.

## Step 6: Home Page Dashboard (`src/routes/+page.svelte`)
- **Intent**: Design the main landing dashboard highlighting the knowledge banks, recent updates, search shortcut, and quick start cards.
- **Acceptance Criteria**:
  1. Displays cards for all 4 knowledge groups with section badges and descriptions.
  2. Provides quick links to main section index pages.
