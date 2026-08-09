# Third-Party Notices

fractalknow is distributed under the GNU General Public License v3.0 or later
(see `LICENSE`). This file records third-party works that the project derives
from, replicates, or ships alongside.

## open-knowledge (Inkeep) — GPL-3.0

fractalknow replicates UI surfaces, interaction concepts, and architecture from
**open-knowledge** by Inkeep, which is licensed under the GNU General Public
License v3.0.

- Upstream source: https://github.com/inkeep/open-knowledge
- A read-only copy of the upstream tree is kept in `open-knowledge-main/` for
  reference during migration; it is not part of the shipped product.
- Because the app is a derivative work of GPL-3.0 material, fractalknow as a
  whole is licensed GPL-3.0-or-later (declared in `package.json` and
  `src-tauri/Cargo.toml`).

## Lucide icons — ISC License

The inline SVG icon set in `src/lib/icons/Icon.svelte` is a lightweight,
hand-redrawn "lucide-style" icon set (inline paths, no runtime dependency).
Icon names and visual style derive from **Lucide** (https://lucide.dev), which
is licensed under the ISC License:

> ISC License
>
> Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part
> of Feather (MIT). All other copyright (c) for Lucide are held by Lucide
> Contributors 2022.
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.

The Lucide project name and icon style are acknowledged here as attribution;
the shipped paths were redrawn for this project.

## Runtime dependencies

All other third-party code arrives via package managers and is not vendored:

- npm dependencies — see `package.json` (licenses available via
  `pnpm licenses list`).
- Rust crates — see `src-tauri/Cargo.toml` and `src-tauri/Cargo.lock`
  (licenses available via `cargo license`).

No third-party code is copied into this repository outside of the read-only
`open-knowledge-main/` reference directory.
