# Plan — Content-source and navigation layer

## Architecture

```text
import.meta.glob(.md)
        │
        ▼
@acrolls/sveltekit source adapter
        │  normalize keys / lookup / entries
        ▼
@acrolls/docs pure document tree builder
        │  host definition / fallback discovery / ordering / hidden
        ├── source.nav ───────► DocsShell
        ├── source.load(slug) ► SvelteKit +page.ts
        └── source.entries() ─► prerender entries
```

## Implementation Order

1. Define the host-owned page/group tree contract and fallback precedence in `@acrolls/docs`.
2. Add unit tests for explicit links/levels/roles, fallback paths, metadata, ordering,
   hidden pages, and collisions.
3. Add the SvelteKit source adapter and package dependency/export surface.
4. Update the kit consumer example and snippets to use the generated source.
5. Replace mandalarepo’s custom nav type with the generated source integration, using a
   curated glob until its malformed legacy Markdown is repaired or excluded.
6. Update Acrolls product/technical docs and run package/example/consumer checks.

## Risks and Mitigations

- Legacy Markdown currently fails mdsvex compilation: keep source discovery configurable
  and do not claim the full mandalarepo corpus is build-safe as part of the first slice.
- Keep the first source contract Markdown-first; defer automatic `.svx` discovery until the
  typed metadata and navigation contract is stable.
- `DocsNav` has separate section/node shapes: widen them compatibly so explicit host-defined
  group landing links work at every depth without forcing manual-nav consumers to migrate.
- Static builds need entries: expose a serializable route-entry method and test it in the
  example.
- A large eagerly compiled glob can increase build cost: preserve lazy body loaders and
  document the eager metadata tradeoff.
