# Menu / Palette / Settings Parity Audit — FractalKnow (Tauri replica) vs OpenKnowledge (Electron reference)

Scope: T038 menu bar · T039 context menus · T040 settings dialog · T041 command palette · cross-cutting dispatcher.

Reference (READ-ONLY): `open-knowledge-main/packages/desktop/src/main/menu.ts` (native menu), `open-knowledge-main/packages/core/src/commands/command-identity.ts` (shared command registry + accelerators), `open-knowledge-main/packages/app/src/components/{AppMenubar,CommandPalette,FileSidebar,FileTree,EditorTabs}.tsx`, `.../components/settings/*`.
Replica: `src-tauri/src/menu.rs`, `src/lib/shell/{commands,shortcuts,menu-actions,menu-enablement,preferences,storage}.ts`, `src/lib/components/{CommandPalette,DialogHost,AppShell,ShellSidebar}.svelte`.

Status legend: **parity** / **missing** / **wrong-accelerator** / **wrong-placement** / **missing-separator** / **extra** (replica-only, not in reference) / **partial** (exists but behavior/labels diverge).

---

## T038 — Menu bar parity

### App menu (macOS, ref-2)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| About OpenKnowledge | — | menu.ts:732 (`role: about`) | menu.rs:323 (`PredefinedMenuItem::about`, "About FractalKnow") | parity (label differs by rebrand) |
| Check for updates… | — | command-identity.ts:658-667 (`app-updates`, mac) | — | **missing** |
| Settings… | ⌘, | command-identity.ts:354-361 (`app-settings`, mac) | menu.rs:62 (placed in **View** menu) | **wrong-placement** |
| Services ▸ | — | menu.ts:743 | menu.rs:325 | parity |
| Hide OpenKnowledge | ⌘H | menu.ts:745 | menu.rs:327 | parity |
| Hide Others | ⌥⌘H | menu.ts:746 | menu.rs:328 | parity |
| Show All | — | menu.ts:747 | menu.rs:329 | parity |
| Uninstall OpenKnowledge… | — | command-identity.ts:693-705 (`app-uninstall`, mac, presence-gated) | — | **missing** |
| Quit OpenKnowledge | ⌘Q | menu.ts:750 | menu.rs:331 | parity |

### File menu (ref-3)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| New file | ⌘N | command-identity.ts:255-263 (`new-file`) | menu.rs:30 (`new-doc`, "New Document") | parity (label case differs: "New file" vs "New Document") |
| New folder | ⇧⌘N | command-identity.ts:264-274 | menu.rs:31 | parity (label case) |
| New from template… | — | command-identity.ts:420-427 | menu.rs:32 (no ellipsis) | partial |
| *separator* | — | menu.ts:766 | — | **missing-separator** |
| Recent project ▸ (≤10 rows + Clear menu) | — | menu.ts:685-701, 768 | — | **missing** |
| Recent files ▸ | — | menu.ts:706-723, 771-773 | — | **missing** |
| New project… | — | command-identity.ts:291-298 | menu.rs:33 (`new-project`, ⌘⌥N accelerator added) | partial (reference menu has no accelerator; replica adds ⌘⌥N) |
| Switch project… | ⇧⌘P | command-identity.ts:339-346 | — | **missing** |
| Open folder… | ⌘O | command-identity.ts:300-315 | — | **missing** |
| Open file… | ⇧⌘O | command-identity.ts:322-337 | — | **missing** |
| Clone Project | — | (not in reference menu; deferred per menu.ts:15) | menu.rs:34 | extra |
| Publish Project | — | (not in reference) | menu.rs:35 | extra |
| Choose Template | — | (not in reference) | menu.rs:36 | extra |
| *separator* | — | menu.ts:775 | — | **missing-separator** |
| New worktree… | — | command-identity.ts:504-511 | menu.rs:37 (no ellipsis) | partial |
| Switch worktree… | — | command-identity.ts:513-520 | menu.rs:38 | partial |
| *separator* | — | menu.ts:777 | — | **missing-separator** |
| Duplicate | ⌘D | command-identity.ts:438-446; disabled unless target is doc/folder (menu.ts:217-221, AppMenubar.tsx:150-156) | menu.rs:39; enablement via menu-enablement.ts:65-76 (`activeDocument`, any kind incl. asset) | partial (enablement rule looser: asset not excluded) |
| Rename | — | command-identity.ts:429-436; disabled without target | menu.rs:40 (**accelerator "Enter"** added) | **wrong-accelerator** (reference menu item has none; Enter is a tree-row inline gesture, not a menu chord) |
| Move to Trash | ⌘⌫ | command-identity.ts:448-456; disabled without target (ref-3 shows dimmed) | menu.rs:41 (`CmdOrCtrl+Backspace`) | parity |
| *separator* | — | menu.ts:779 | — | **missing-separator** |
| Reveal in Finder | — | command-identity.ts:458-465 | menu.rs:42 | parity |
| Open with AI | — | command-identity.ts:469-475; disabled for asset targets (AppMenubar.tsx:176-181) | menu.rs:43 (`send-to-ai`) | partial (enablement rule differs) |
| Copy path ▸ (Full path / Relative path) | — | menu.ts:781-785 (submenu parent); command-identity.ts:477-493 | menu.rs:44-45 (flat items; `copy-full-path` gets ⌘⇧C accelerator) | **wrong-placement** + wrong-accelerator (reference: submenu, no accelerators) |
| *separator* | — | menu.ts:786 | — | **missing-separator** |
| Set up OpenKnowledge integrations… | — | command-identity.ts:669-675 (presence-gated) | — | **missing** |
| Settings… (Win/Linux only) | ⌘, | command-identity.ts:362-369 (`file-settings`, other) | (in View menu, all platforms) | **wrong-placement** |
| Close tab (mac) / Exit (other) | ⌘W | command-identity.ts:495-502; menu.ts:791 | menu.rs:46-51 ("Close", label), 351-356 (Exit non-mac) | partial (label "Close" vs "Close tab") |
| Save Version | ⌘S | (not in reference menu — autosave CRDT; Project menu deferred, menu.ts:14) | menu.rs:52 | extra |

Replica File menu has **no separators at all** (`build_submenu`, menu.rs:340-350, only adds separators for Edit/View roles) — every section rule from ref-3 is missing.

### Edit menu (ref-4)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| Undo | ⌘Z | menu.ts:798 | menu.rs:359 (appended **after** custom item) | wrong-placement (order) |
| Redo | ⇧⌘Z | menu.ts:799 | menu.rs:360 | wrong-placement (order) |
| Cut / Copy / Paste | ⌘X/⌘C/⌘V | menu.ts:801-804 | menu.rs:362-364 | wrong-placement (order) |
| Select All | ⌘A | menu.ts:804 | menu.rs:366 | wrong-placement (order) |
| Check spelling while typing (checkbox) | — | command-identity.ts:677-683 (`edit-spell`) | — | **missing** |
| Delete | ⌫ | (not in reference Edit menu) | menu.rs:54, rendered **first** (menu.rs:347-350 adds spec items before roles) | extra + wrong-placement |
| AutoFill ▸ / Start Dictation… / Emoji & Symbols | — | macOS-provided (visible in ref-4) | (OS-dependent in Tauri/WKWebView — unverified) | partial/unverified |

### View menu (ref-5)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| Back | ⌘[ (mac) / Alt+← | command-identity.ts:226-238 | menu.rs:117 (`Alt+Left` only) | **wrong-accelerator** on mac (⌘[ missing; shortcuts.ts:40 has ⌘[ on web side — inconsistent with native menu) |
| Forward | ⌘] (mac) / Alt+→ | command-identity.ts:240-252 | menu.rs:118-123 (`Alt+Right` only) | **wrong-accelerator** on mac |
| Reload | ⌘R | menu.ts:817 (role) | — | **missing** |
| Force Reload | ⇧⌘R | menu.ts:818 (role) | — | **missing** |
| Toggle Developer Tools (gated) | — | menu.ts:819-821 | — | **missing** |
| Hide/Show sidebar (state-toggle label) | ⌥⌘S | command-identity.ts:523-537 | menu.rs:83-88 ("Toggle Sidebar", **⌘B**, static label) | **wrong-accelerator** (⌘B is Bold in the editor; reference deliberately uses ⌥⌘S — menu.ts:286-292 comment) + partial label |
| Hide/Show document panel (state-toggle) | ⌥⌘B | command-identity.ts:539-553 | menu.rs:89-94 ("Toggle Document Panel", ⌘⌥B, static label) | partial (accelerator parity; label not state-aware) |
| Show Terminal (state-toggle) | ⌘J | command-identity.ts:555-569 (`view-panels` order 2) | menu.rs:133-139 (placed in **Terminal** menu) | **wrong-placement** |
| Show hidden files (checkbox) | ⇧⌘. | command-identity.ts:571-581 | menu.rs:101 (plain item, **no accelerator**, not a checkbox) | **wrong-accelerator** + partial (no check state) |
| Show .ok folders (checkbox) | — | command-identity.ts:583-591 | menu.rs:102 (plain item) | partial (no checkbox) |
| Show only markdown files (checkbox) | — | command-identity.ts:593-601 | menu.rs:103-108 | partial (no checkbox) |
| Show skills section (checkbox) | — | command-identity.ts:603-611 | menu.rs:109-114 | partial (no checkbox) |
| Expand all (smart-hide) | — | command-identity.ts:613-620 | menu.rs:115 ("Expand All Tree", always visible) | partial (label + no smart-hide) |
| Collapse all (smart-hide) | — | command-identity.ts:622-629 | menu.rs:116 | partial |
| Actual Size / Zoom In / Zoom Out | ⌘0 / ⌘+ / ⌘− | menu.ts:829-831 (roles) | — | **missing** |
| Toggle Full Screen | ⌃⌘F | menu.ts:833 (role) | menu.rs:368-372 (mac only) | partial (absent on Win/Linux) |
| Command Palette | ⌘K | (shortcut-only in reference; not a View item) | menu.rs:56-61 | extra |
| Settings / Validation Settings / Toggle Validate on Save / Toggle Link Validation / Toggle Metadata Validation | ⌘, / — | (reference: Settings ⌘, lives in App/File menu; validation toggles do not exist as menu items) | menu.rs:62-81 | **wrong-placement** + extra |
| Search | ⌘F | (not a View menu item in reference) | menu.rs:82 | extra |
| Toggle Source Mode | ⌘E | (shortcut-only in reference, and it is **⌥⌘M** — keyboard-shortcuts.ts:181-194) | menu.rs:95-100 | **wrong-accelerator** + wrong-placement |
| Activity / Diagnostics / Version History ⌘⇧H | — | (not in reference View menu) | menu.rs:124-131 | extra |

### Terminal menu (ref-6)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| New Terminal | — (menu shows none) | command-identity.ts:631-639 | menu.rs:140-145 (**⌘⇧J** accelerator shown) | **wrong-accelerator** (reference menu item carries no accelerator; ⇧⌘J is a web shortcut) |
| New Terminal Window | — | command-identity.ts:640-646 | — | **missing** |
| Kill Terminal | — | command-identity.ts:647-655; enabled only when `terminalLive` (menu.ts:319-324) | menu.rs:146; gated on `activeTerminal` (menu-enablement.ts:81-82) | parity |
| Toggle Terminal | ⌘J | (View-menu item in reference) | menu.rs:133-139 | **wrong-placement** |

### Window menu (ref-7)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| Minimize | ⌘M | menu.ts:846 (role) | — | **missing** (no Window menu built at all — menu.rs:310-315) |
| Zoom | — | menu.ts:848 (mac role) | — | **missing** |
| Bring All to Front | — | menu.ts:850 (mac role `front`) | — | **missing** |
| Close Window (Win/Linux) | — | menu.ts:853 | — | **missing** |

### Help menu (ref-8)

| Item | Accelerator | Reference path | Replica path | Status |
|---|---|---|---|---|
| Search (macOS help search) | — | macOS-provided | (OS-dependent) | unverified |
| Install for Claude Chat & Cowork (desktop app)… | — | command-identity.ts:372-385 (`help-install`, gated) | — | **missing** |
| OpenKnowledge on GitHub | — | command-identity.ts:685-691 | — | **missing** |
| Report a bug… | — | command-identity.ts:387-394 | menu.rs:149 ("Report Bug", no ellipsis) | partial |
| Send feedback… | — | command-identity.ts:410-417 | menu.rs:150 (no ellipsis) | partial |
| Check for updates… (Win/Linux) | — | command-identity.ts:663-667 (`help-updates`, other) | — | **missing** |

**Enablement rules (ref-3 behavior):** reference computes availability from the shared registry (`evaluateCommandAvailability`, menu.ts:625) with target-kind gates (Duplicate: doc/folder only; Rename/Move-to-Trash: doc/folder/asset; reveal/copy-path enabled even at project scope) plus smart-hide for Expand/Collapse all. Replica has a parallel mechanism (Rust `MenuRegistry` + `apply_menu_enablement` menu.rs:396-431, fed by `src/lib/shell/menu-enablement.ts:63-96`) — mechanism parity, but rules are coarser (single `activeDocument` boolean; no project-scope reveal; no asset exclusion on Duplicate; no smart-hide; `switch-worktree` bizarrely gated on `hasRecentProjects`, menu-enablement.ts:83-84).

---

## T039 — Context menu parity

Replica: **no context menus exist** — a repo-wide search of `src/` for `contextmenu|ContextMenu|right-click` returns zero matches. Every surface below is **missing**.

| Surface | Reference rows | Reference path | Replica path | Status |
|---|---|---|---|---|
| File-tree folder row (ref-9) | New file · New from template ▸ (if templates) · New folder ‖ Reveal in Finder (desktop) · Open with AI ▸ · Share (if remote) · Copy path ▸ (Full/Relative) ‖ Expand all / Collapse all (smart-hide, subtree-scoped) ‖ Duplicate · Rename · Hide folder (writes `.okignore`) · **Delete (destructive red)**; `.ok` rows render read-only subset | FileTree.tsx:700-901 | — | **missing** |
| File-tree file/asset row | Reveal in Finder · Open with AI ▸ (not for assets) · Share · Copy path ▸ ‖ Import as template ▸ (Keep original / Convert) · Duplicate (not assets) · Rename · Hide file · **Delete (destructive)** | FileTree.tsx:903-1042 | — | **missing** |
| Sidebar empty space | New file · New from template ▸ · New folder ‖ Reveal in Finder · Open with AI ▸ · Share · Copy full path ‖ Show hidden files ☐ · Show .ok folders ☐ · Show only markdown files ☐ · Show skills section ☐ ‖ Expand all / Collapse all (smart-hide) | FileSidebar.tsx:1206-1368 | — | **missing** |
| Editor tab | Close · Close others · Close all / Close all unpinned ‖ Pin tab / Unpin tab | EditorTabs.tsx:284-318 | — | **missing** |
| Palette recents row | Per-row remove + `RecentItemContextMenu` (recent-remove-controls.tsx) | CommandPalette.tsx:102 | per-row × remove only (CommandPalette.svelte:507-517) | partial |
| Editor (rich text) spell-check Disable/Enable rows | shares persisted flag with Edit menu (menu.ts:346-353) | menu.ts:346-353 | — | **missing** |

---

## T040 — Settings dialog parity (ref-10)

| Section | Reference path | Replica path | Status |
|---|---|---|---|
| **Group: USER** | SettingsDialogShell.tsx:199-216 | — (replica has no user/project grouping) | **missing** |
| ├ Preferences (theme, word wrap, editor prefs…) | `preferences` → PreferencesSection/AttachmentsSection, fields in settings-fields.ts | DialogHost.svelte `appearance` + `editor` sections | partial (subset of fields) |
| ├ Configure agents | `configure-agents` → ConfigureAgentsSection.tsx | DialogHost.svelte `agents` section (stub text) | partial (stub only) |
| ├ Hotkeys | `hotkeys` → HotkeysSection.tsx | — | **missing** |
| ├ Account | `account` → AccountSection.tsx | — | **missing** |
| ├ Plugins (user scope) | `user-plugins-manage` | — | **missing** |
| └ AI tools & CLI (desktop) | `ai-tools` → AiToolsSection.tsx | — | **missing** |
| **Group: THIS PROJECT** | SettingsDialogShell.tsx:218-235 | — | **missing** |
| ├ Sync | `sync` → SyncSection.tsx | DialogHost.svelte `sync` section | partial |
| ├ Search | `search` → SearchSection.tsx | — | **missing** |
| ├ Plugins (project scope) | `plugins-manage` | — | **missing** |
| ├ Content rules | `content-rules` → ContentRulesSection.tsx | DialogHost.svelte `validation` (nearest analogue) | partial (different scope/mechanism) |
| ├ Link previews (gated) | `link-previews` → LinkPreviewsSection.tsx | — | **missing** |
| ├ Terminal (gated) | `terminal` → TerminalSection.tsx | — | **missing** |
| ├ AI tools (project, desktop) | `project-ai-tools` → ProjectAiToolsSection.tsx | — | **missing** |
| ├ Templates | `project-templates` → ProjectTemplatesSection.tsx | — | **missing** |
| ├ Skills | `skills` → SkillsManagerSection.tsx | — | **missing** |
| ├ Ignore patterns | `okignore` → OkignoreSection.tsx | — | **missing** |
| └ Config sharing | `sharing` → SharingSection.tsx | — | **missing** |
| **Group: Plugins** (per-enabled-plugin panels, incl. Themes) | SettingsDialogShell.tsx:237-248 | — | **missing** |
| **Group: Integrations** (Claude Desktop) | SettingsDialogShell.tsx:250-257 | — | **missing** |
| Search box (deep field search w/ keywords; collapses group nav into result rows) | SettingsDialogShell.tsx:261-265, 340-353; settings-search-index.ts | DialogHost.svelte:247-255 (filters 7 section labels by hand-written `terms` strings only — DialogHost.svelte:70-78) | partial (shallow search; no field-level index) |
| Per-field reset-to-default buttons (↺, visible when value differs; ref-10 right edge) | field-controls.tsx:188-212 (RotateCcw) | — | **missing** |
| Persistence: project config via CRDT/Y.Text `ConfigBinding` with L1 safeParse + external-update merge; user config separate scope; scope badges | use-config-form.ts:1-31; ScopeBadge.tsx; projectLocalBinding (FileSidebar.tsx:1315-1348) | `window.localStorage` (storage.ts:5) + `shellPreferences` (preferences.ts:78-99) + bridge config | **wrong mechanism** (no CRDT, no user/project scope split, no external-update merge) |
| Extra replica sections: `project`, `runtime` | — | DialogHost.svelte:71, 77 | extra |

---

## T041 — Command palette parity (ref-11)

| Feature | Reference path | Replica path | Status |
|---|---|---|---|
| Trigger ⌘K + input placeholder "Search files, folders, or commands" | keyboard-shortcuts.ts:100-112; CommandPalette.tsx:1125-1128 | shortcuts.ts:27; CommandPalette.svelte:356 ("Search files, folders, or commands…") | **parity** (searches commands, workspace files/folders, and recent projects) |
| `#` By-tag mode **clickable pill** (Slack-style filter row, always visible, aria-pressed, focus restore) | CommandPalette.tsx:1133-1163 | CommandPalette.svelte:368-376 | **parity** (discoverable `# Tags` pill button with aria-pressed toggle) |
| `✨` By-meaning semantic mode (gated on setup) | CommandPalette.tsx:1165-1190 | — | **dropped** (Orama/semantic backend search dropped per scope decision) |
| Group taxonomy: COMMANDS · PROJECT · FILE · VIEW · TERMINAL · APPLICATION | command-identity.ts palette groups; CommandPalette.tsx:932-946 | types.ts; commands.ts; CommandPalette.svelte | **parity** (aligned to canonical taxonomy ordering; DEV-only groups gated) |
| **OPEN WITH AI** group (per-installed-agent rows, "Not installed" hints for AT) | CommandPalette.tsx:1434-1490 | — | **deferred** (deferred to ADD task T072) |
| kbd shortcut chips rendered from shared shortcut registry (`formatShortcut(shortcutId)`) | CommandPalette.tsx:954-970; Kbd component | shortcuts.ts:357; CommandPalette.svelte | **parity** (single-sourced via formatShortcut, static strings removed) |
| Recently opened (file/folder recents, validity-filtered, per-row remove + context menu) | CommandPalette.tsx:444-447, 1419-1430; command-palette-recents.ts | documents.ts; CommandPalette.svelte | **parity** (validity-filtered document recents with &times; remove and ContextMenu) |
| Recent projects / switch rows in palette | CommandPalette.tsx:449, 841 | projects.ts; CommandPalette.svelte | **parity** (recent projects rendered under PROJECT group with switch action) |
| Status row (counts / warming / running / error) | (no direct equivalent; reference uses group headings + coverage banner) | CommandPalette.svelte:386-419 | **parity-or-better** (replica-only status row) |
| Reference commands missing from replica palette | open-folder, open-file, switch-project, check-for-updates, bug-report-history | commands.ts | **parity** (`open-folder`, `open-file`, `switch-project`, `check-for-updates`, `bug-report-history` implemented; `open-graph` skipped: graph visualization dropped; `initialize-starter-pack` skipped: covered by Templates section; `toggle-spell-check` skipped: native OS spellcheck used; `open-github` covered; `install-claude-desktop` & `set-up-integrations` deferred to T074) |
| Replica-only debug rows | — | commands.ts | **parity** (dev scaffolding gated under import.meta.env.DEV) |

| Disabled-reason surfacing on rows | availability via shared `evaluateCommandAvailability` | per-command `disabledReason` strings (commands.ts:87-95) | partial (duplicate, unsynced gating logic) |

---

## Cross-cutting: single dispatcher?

**Replica converges on one dispatcher — but with three unsynced accelerator sources and double registration.**

- Menu → dispatcher: `lib.rs:689-693` (`handle_menu_event` → emit `ok:menu-action`) → `bridge.ts:243` subscription → `AppShell.svelte:163-166` → `menu-actions.ts:53-60` (`handleMenuAction` maps action id → command id) → `commands.ts:682` `runCommandById`. ✅
- Shortcut → dispatcher: `AppShell.svelte:199-216` keydown → `shortcuts.ts:14-47` `resolveShellShortcutCommand` → same `runCommandById`. ✅
- Palette → dispatcher: `CommandPalette.svelte:195-229` → same `runCommandById`. ✅

**Problems:**
1. **Double registration:** the same chords are registered as native Tauri accelerators (menu.rs:30-131) AND as web keydown shortcuts (shortcuts.ts:27-44) — e.g. ⌘K, ⌘,, ⌘N, ⇧⌘N, ⌘B, ⌘J, ⌘W, ⌘S, ⌘D, ⌘⌫. Native accelerators capture the keypress OS-side and re-enter via `ok:menu-action`, so the web handler is dead code for those chords; worse, **⌘B as native "Toggle Sidebar" captures Bold** inside the editor (reference deliberately avoids ⌘B — menu.ts:286-292).
2. **Three unsynced accelerator sources:** menu.rs `MENU_SPEC` vs shortcuts.ts vs the `shortcut:` display strings in commands.ts drift independently (e.g. navigate-back is `Alt+Left` in menu.rs:117 but ⌘[ *and* ⌥← in shortcuts.ts:38-41; toggle-source is ⌘E in menu.rs:98 but ⌘⇧E in commands.ts:131; reference single-sources in command-identity.ts with a parity ratchet test against keyboard-shortcuts.ts).
3. **Two unsynced gating layers:** menu-enablement.ts (`isEnabledFor`, boolean context) vs commands.ts `disabledReason` strings can disagree about the same command (e.g. `reveal-in-finder` gated on `activeDocument` in menu-enablement.ts:69 but on `bridgeReason` in commands.ts:537).
4. **Id-mapping shim:** menu-actions.ts:5-51 hand-maps 44 menu-action ids → command ids; any new command must be added in 4 places (menu.rs spec, menu_action_for_id, menu-actions.ts map, commands.ts item) — reference derives all of this from one `COMMAND_IDENTITIES` array.

Reference architecture for comparison: single `COMMAND_IDENTITIES` registry (labels, keywords, shortcutId, availability, palette group, menu placement+order+accelerator) consumed by the native menu builder, the palette, and the shortcut registry, with parity tests enforcing agreement.
