# fractal-agentic explorer — Site Flow Map

Mapped with `flow-mapper` on 2026-08-04. Scope: complete `packages/fractal-agentic/site` explorer (SvelteKit 5, prerender) rendering the plugin armory (skills/agents/commands/bosses/docs). Solid arrows = containment; dashed arrows = data/state/event flow. ⚠ marks evidence-based anomalies (duplicate children render, unwired search/theme).

```mermaid
flowchart TD
  ROOT["Root layout<br/>.appshell — +layout.svelte:58"]
  HDR["App header<br/>header.app-header — :59"]
  LOGO["App logo<br/>a.app-logo — :60"]
  NAV["Primary nav<br/>nav.app-nav — :64"]
  NL["Nav links<br/>a.nav-links — :65"]
  NS["Search button ⚠ inert<br/>button.nav-links — :74"]
  MN["Landing main (children #1)<br/>.narrow-width — :80"]
  S1["Children render #1<br/>{@render children()} — :82"]
  DS["Docs shell<br/>div.content — :86"]
  SB["Docs sidebar<br/>aside.app-sidebar — :87"]
  DSD["DocsSidebar<br/>DocsSidebar.svelte"]
  MD["Docs main (children #2)<br/>main.app-shell-main — :92"]
  MOB["Mobile nav strip<br/>MobileNav.svelte — ≤1024px"]
  S2["Children render #2 ⚠ dup<br/>{@render children()} — :96"]
  RR["On-this-page rail<br/>aside.app-right — :98"]
  OTP["OnThisPage<br/>OnThisPage.svelte"]
  HOME["Home route<br/>+page.svelte:67"]
  S1A["Section 01 — hero + stats<br/>.page-section — :69"]
  HT["Hero title<br/>h1.page-title — :70"]
  ST["Stats grid<br/>.stats-grid.grid-cols-6 — :79"]
  S2A["Section 02 — bosses<br/>.page-section — :107"]
  BG["Boss grid<br/>.home-boss-grid — :118"]
  S3A["Section 03 — systems<br/>.page-section — :132"]
  SG["Systems grid<br/>.grid-cols-3.border-grid — :144"]
  DOC["Docs catch-all<br/>docs/[...slug]/+page.svelte"]
  ART["Doc article<br/>article.doc-article"]
  DH["Detail head<br/>.detail-head"]
  MB["MarkdownBody<br/>MarkdownBody.svelte"]
  PG["PrevNext pager<br/>PrevNext.svelte"]
  CAT["Catalog listing<br/>skills/+page.svelte"]
  CH["Catalog page head<br/>.page-head"]
  CF["CatalogFilter<br/>CatalogFilter.svelte"]
  CD["Catalog detail<br/>skills/[slug]/+page.svelte"]
  LD["Layout server data<br/>+layout.server.ts"]
  HD["Home server data<br/>+page.server.ts"]
  CL["Content library<br/>lib/content/*"]
  TL["Theme module<br/>lib/theme.ts"]
  PLG["plugin/ armory source<br/>plugin/{skills,agents,…}"]
  STL["fractals-styler virtual CSS"]
  TT["ThemeToggle ⚠ unwired"]
  GS["GlobalSearch ⚠ unwired"]
  FT["SiteFooter ⚠ unused"]
  PW["PageWrapper ⚠ unused"]
  CS["comps.sass ⚠ dead stylesheet"]

  ROOT --> HDR & MN & DS
  HDR --> LOGO & NAV
  NAV --> NL & NS
  MN --> S1
  DS --> SB & MD & RR
  SB --> DSD
  MD --> MOB & S2
  RR --> OTP
  HOME --> S1A & S2A & S3A
  S1A --> HT & ST
  S2A --> BG
  S3A --> SG
  DOC --> ART
  ART --> DH & MB & PG
  CAT --> CH & CF

  S1 -. renders .-> HOME
  S2 -. renders .-> HOME
  S2 -. renders .-> DOC
  S2 -. renders .-> CAT
  S2 -. renders .-> CD
  LD -. loads .-> CL
  HD -. loads .-> CL
  CL -. globs .-> PLG
  LD -. stats/sidebar .-> ST & DSD
  HD -. bosses .-> BG
  NS -. should open .-> GS
  TT -. toggles .-> TL
  HDR -. intended .-> TT
  HDR -. intended .-> GS
  ROOT -. css .-> STL
  ROOT -. css (dead) .-> CS
```

Interactive canvas: `fa-flow-map.html` in this folder.
