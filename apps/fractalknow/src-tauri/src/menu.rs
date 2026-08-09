use std::collections::HashMap;
use std::path::Path;
use std::sync::{Arc, LazyLock};
use tauri::menu::{
    AboutMetadata, IsMenuItem, Menu, MenuBuilder, MenuItem, MenuItemBuilder, PredefinedMenuItem,
    Submenu, SubmenuBuilder,
};
use tauri::{AppHandle, Runtime};

use crate::platform;

/// Custom menu item id for the macOS "Bring All to Front" window command.
/// Handled natively in `lib.rs::handle_menu_event` (no webview round-trip).
pub const WINDOW_BRING_ALL_TO_FRONT_ID: &str = "window-bring-all-to-front";

#[derive(Copy, Clone, Debug)]
pub struct MenuItemSpec {
    pub id: &'static str,
    pub label: &'static str,
    pub accelerator: Option<&'static str>,
    pub default_enabled: bool,
}

#[derive(Copy, Clone, Debug)]
pub enum MenuEntry {
    Item(MenuItemSpec),
    Separator,
}

pub struct MenuSpec {
    pub file: Vec<MenuEntry>,
    pub edit: Vec<MenuEntry>,
    pub view: Vec<MenuEntry>,
    pub terminal: Vec<MenuEntry>,
    pub help: Vec<MenuEntry>,
}

const SEP: MenuEntry = MenuEntry::Separator;

pub static MENU_SPEC: LazyLock<MenuSpec> = LazyLock::new(|| MenuSpec {
    file: vec![
        item("new-doc", "New Document", Some("CmdOrCtrl+N"), true),
        item("new-folder", "New Folder", Some("CmdOrCtrl+Shift+N"), true),
        item("new-from-template", "New From Template…", None, true),
        SEP,
        item("new-project", "New Project", Some("CmdOrCtrl+Alt+N"), true),
        item("clone-project", "Clone Project", None, true),
        item("publish-project", "Publish Project", None, true),
        item("choose-template", "Choose Template", None, true),
        SEP,
        item(
            "switch-project",
            "Switch Project…",
            Some("CmdOrCtrl+Shift+P"),
            true,
        ),
        item("open-folder", "Open Folder…", Some("CmdOrCtrl+O"), true),
        item("open-file", "Open File…", Some("CmdOrCtrl+Shift+O"), true),
        SEP,
        item("duplicate", "Duplicate", Some("CmdOrCtrl+D"), true),
        // No accelerator: the reference triggers rename via a tree-row Enter
        // gesture (web side), never a native menu chord.
        item("rename", "Rename", None, true),
        item("move-to-trash", "Move to Trash", Some("CmdOrCtrl+Backspace"), true),
        SEP,
        item("reveal-in-finder", "Reveal in Finder", None, true),
        // Reference shows Copy path rows without accelerators.
        item("copy-full-path", "Copy Full Path", None, true),
        item("copy-relative-path", "Copy Relative Path", None, true),
        SEP,
        item(
            "close-active-tab-or-window",
            "Close Tab",
            Some("CmdOrCtrl+W"),
            true,
        ),
        item("save-version", "Save Version", Some("CmdOrCtrl+S"), true),
    ],
    // No native accelerator on Delete: a bare "Backspace" chord would capture
    // every Backspace keystroke app-wide, breaking text editing. The web
    // shortcut layer owns Delete/Backspace.
    edit: vec![item("delete", "Delete", None, true)],
    view: vec![
        item(
            "focus-command-palette",
            "Command Palette",
            Some("CmdOrCtrl+K"),
            true,
        ),
        item("settings", "Settings", Some("CmdOrCtrl+,"), true),
        item("settings-validation", "Validation Settings", None, true),
        item(
            "toggle-validate-on-save",
            "Toggle Validate on Save",
            None,
            true,
        ),
        item(
            "toggle-link-validation",
            "Toggle Link Validation",
            None,
            true,
        ),
        item(
            "toggle-metadata-validation",
            "Toggle Metadata Validation",
            None,
            true,
        ),
        item("focus-search", "Search", Some("CmdOrCtrl+F"), true),
        SEP,
        // Alt+Left/Alt+Right normalize to Cmd+[/Cmd+] on macOS
        // (platform::normalize_accelerator), matching the reference.
        item("navigate-back", "Back", Some("Alt+Left"), true),
        item("navigate-forward", "Forward", Some("Alt+Right"), true),
        SEP,
        // ⌥⌘S, never ⌘B: ⌘B is Bold in the editor; the reference app
        // deliberately uses ⌥⌘S for the sidebar for this reason.
        item(
            "toggle-sidebar",
            "Toggle Sidebar",
            Some("CmdOrCtrl+Alt+S"),
            true,
        ),
        item(
            "toggle-doc-panel",
            "Toggle Document Panel",
            Some("CmdOrCtrl+Alt+B"),
            true,
        ),
        item("toggle-terminal", "Show Terminal", Some("CmdOrCtrl+J"), true),
        SEP,
        item(
            "toggle-show-hidden-files",
            "Show Hidden Files",
            Some("CmdOrCtrl+Shift+."),
            true,
        ),
        item("toggle-show-ok-folders", "Show .ok Folders", None, true),
        item(
            "toggle-show-only-markdown-files",
            "Show Only Markdown Files",
            None,
            true,
        ),
        item(
            "toggle-show-skills-section",
            "Show Skills Section",
            None,
            true,
        ),
        SEP,
        item("expand-all-tree", "Expand All Tree", None, true),
        item("collapse-all-tree", "Collapse All Tree", None, true),
        SEP,
        item(
            "toggle-source",
            "Toggle Source Mode",
            Some("CmdOrCtrl+E"),
            true,
        ),
        item("show-activity", "Activity", None, true),
        item("show-diagnostics", "Diagnostics", None, true),
        item(
            "version-history",
            "Version History",
            Some("CmdOrCtrl+Shift+H"),
            true,
        ),
    ],
    terminal: vec![
        // No accelerator on New Terminal: the reference menu shows none;
        // ⇧⌘J lives in the web shortcut layer only.
        item("new-terminal", "New Terminal", None, true),
        item("kill-terminal", "Kill Terminal", None, true),
    ],
    help: vec![
        item("open-github", "FractalKnow on GitHub", None, true),
        item("report-bug", "Report a Bug…", None, true),
        item("send-feedback", "Send Feedback…", None, true),
    ],
});

const fn item(
    id: &'static str,
    label: &'static str,
    accelerator: Option<&'static str>,
    default_enabled: bool,
) -> MenuEntry {
    MenuEntry::Item(MenuItemSpec {
        id,
        label,
        accelerator,
        default_enabled,
    })
}

fn all_specs() -> Vec<&'static MenuItemSpec> {
    MENU_SPEC
        .file
        .iter()
        .chain(MENU_SPEC.edit.iter())
        .chain(MENU_SPEC.view.iter())
        .chain(MENU_SPEC.terminal.iter())
        .chain(MENU_SPEC.help.iter())
        .filter_map(|entry| match entry {
            MenuEntry::Item(spec) => Some(spec),
            MenuEntry::Separator => None,
        })
        .collect()
}

/// Returns the canonical accelerator for a menu item id on the current platform.
#[allow(dead_code)]
pub fn accelerator_for(item_id: &str) -> Option<&'static str> {
    all_specs()
        .iter()
        .find(|spec| spec.id == item_id)
        .and_then(|spec| spec.accelerator)
        .map(|accel| platform::normalize_accelerator(accel))
}

/// Maps a menu item id to the `ok:menu-action` payload value.
pub fn menu_action_for_id(id: &str) -> Option<String> {
    let known = all_specs().iter().any(|spec| spec.id == id);
    if known {
        Some(id.to_string())
    } else {
        None
    }
}

/// Thread-safe registry of menu items keyed by id.
#[derive(Clone, Default)]
pub struct MenuRegistry {
    inner: Arc<parking_lot::RwLock<HashMap<String, MenuItemState>>>,
}

#[derive(Clone, Debug)]
struct MenuItemState {
    enabled: bool,
}

impl MenuRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_enabled(&self, item_id: &str, enabled: bool) {
        let mut map = self.inner.write();
        map.insert(item_id.to_string(), MenuItemState { enabled });
    }

    pub fn is_enabled(&self, item_id: &str) -> bool {
        self.inner
            .read()
            .get(item_id)
            .map(|state| state.enabled)
            .unwrap_or(true)
    }

    pub fn enabled_snapshot(&self) -> HashMap<String, bool> {
        self.inner
            .read()
            .iter()
            .map(|(k, v)| (k.clone(), v.enabled))
            .collect()
    }
}

/// Builds the application menu and registers every item in the given registry.
pub fn build_menu<R: Runtime>(
    app: &AppHandle<R>,
    registry: &MenuRegistry,
) -> tauri::Result<Menu<R>> {
    let app_about = AboutMetadata {
        name: Some("FractalKnow".to_string()),
        version: Some(env!("CARGO_PKG_VERSION").to_string()),
        short_version: None,
        authors: Some(vec!["Inkeep".to_string()]),
        comments: Some("OpenKnowledge migration shell".to_string()),
        copyright: None,
        license: Some("GPL-3.0-or-later".to_string()),
        website: None,
        website_label: None,
        credits: None,
        icon: None,
    };

    let file = build_submenu(app, "File", &MENU_SPEC.file, registry)?;
    let edit = build_submenu(app, "Edit", &MENU_SPEC.edit, registry)?;
    let view = build_submenu(app, "View", &MENU_SPEC.view, registry)?;
    let terminal = build_submenu(app, "Terminal", &MENU_SPEC.terminal, registry)?;
    let window = build_window_menu(app)?;

    let help = build_submenu(app, "Help", &MENU_SPEC.help, registry)?;

    let mut menu = MenuBuilder::new(app)
        .item(&file)
        .item(&edit)
        .item(&view)
        .item(&terminal)
        .item(&window)
        .item(&help);

    if cfg!(target_os = "macos") {
        let app_submenu = Submenu::with_items(
            app,
            "FractalKnow",
            true,
            &[
                &PredefinedMenuItem::about(app, Some("About FractalKnow"), Some(app_about))?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::services(app, None)?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::hide(app, None)?,
                &PredefinedMenuItem::hide_others(app, None)?,
                &PredefinedMenuItem::show_all(app, None)?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::quit(app, None)?,
            ],
        )?;
        menu = menu.item(&app_submenu);
    }

    menu.build()
}

/// Window menu: Minimize / Zoom / Bring All to Front on macOS
/// (Minimize / Close Window elsewhere), matching the reference app.
fn build_window_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Submenu<R>> {
    let minimize = PredefinedMenuItem::minimize(app, None)?;
    if cfg!(target_os = "macos") {
        let zoom = PredefinedMenuItem::maximize(app, Some("Zoom"))?;
        let separator = PredefinedMenuItem::separator(app)?;
        let bring_all =
            MenuItemBuilder::with_id(WINDOW_BRING_ALL_TO_FRONT_ID, "Bring All to Front")
                .build(app)?;
        Submenu::with_items(app, "Window", true, &[&minimize, &zoom, &separator, &bring_all])
    } else {
        let separator = PredefinedMenuItem::separator(app)?;
        let close = PredefinedMenuItem::close_window(app, None)?;
        Submenu::with_items(app, "Window", true, &[&minimize, &separator, &close])
    }
}

fn build_submenu<R: Runtime>(
    app: &AppHandle<R>,
    label: &str,
    entries: &[MenuEntry],
    registry: &MenuRegistry,
) -> tauri::Result<Submenu<R>> {
    let mut builder = SubmenuBuilder::new(app, label);
    if label == "Edit" {
        // Editing roles come first, matching the reference Edit menu order
        // (Undo/Redo, Cut/Copy/Paste, Select All) ahead of custom items.
        builder = builder
            .item(&PredefinedMenuItem::undo(app, None)?)
            .item(&PredefinedMenuItem::redo(app, None)?)
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::cut(app, None)?)
            .item(&PredefinedMenuItem::copy(app, None)?)
            .item(&PredefinedMenuItem::paste(app, None)?)
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::select_all(app, None)?)
            .item(&PredefinedMenuItem::separator(app)?);
    }
    for entry in entries {
        match entry {
            MenuEntry::Item(spec) => {
                let item = build_item(app, spec, registry)?;
                builder = builder.item(&item);
            }
            MenuEntry::Separator => {
                builder = builder.item(&PredefinedMenuItem::separator(app)?);
            }
        }
    }
    if label == "File" && !cfg!(target_os = "macos") {
        // Windows/Linux put Exit on the File menu; macOS uses the app menu Quit.
        builder = builder
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::quit(app, Some("Exit"))?);
    }
    if label == "View" && cfg!(target_os = "macos") {
        builder = builder
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::fullscreen(app, None)?);
    }
    if label == "Help" && !cfg!(target_os = "macos") {
        // Non-macOS About lives under Help rather than an application menu.
        builder = builder
            .item(&PredefinedMenuItem::separator(app)?)
            .item(&PredefinedMenuItem::about(app, Some("About FractalKnow"), None)?);
    }
    builder.build()
}

fn build_item<R: Runtime>(
    app: &AppHandle<R>,
    spec: &MenuItemSpec,
    registry: &MenuRegistry,
) -> tauri::Result<MenuItem<R>> {
    let enabled = spec.default_enabled && registry.is_enabled(spec.id);
    let mut builder = MenuItemBuilder::with_id(spec.id, spec.label).enabled(enabled);
    if let Some(accel) = spec.accelerator {
        builder = builder.accelerator(platform::normalize_accelerator(accel));
    }
    builder.build(app)
}

/// Sets the enabled state of a single menu item by id and applies it to the native menu.
pub fn set_menu_item_enabled<R: Runtime>(
    app: &AppHandle<R>,
    item_id: &str,
    enabled: bool,
) -> tauri::Result<()> {
    if let Some(menu) = app.menu() {
        if let Some(item) = menu.get(item_id) {
            match item {
                tauri::menu::MenuItemKind::MenuItem(menu_item) => {
                    menu_item.set_enabled(enabled)?;
                }
                tauri::menu::MenuItemKind::Predefined(_) => {
                    // Predefined menu items can't be disabled individually.
                }
                tauri::menu::MenuItemKind::Submenu(_) => {
                    // Submenus don't have an enabled state here.
                }
                _ => {}
            }
        }
    }
    Ok(())
}

/// Sets the enabled state of many menu items at once.
pub fn apply_menu_enablement<R: Runtime>(
    app: &AppHandle<R>,
    registry: &MenuRegistry,
    states: &HashMap<String, bool>,
) -> tauri::Result<()> {
    for (item_id, enabled) in states {
        registry.set_enabled(item_id, *enabled);
        set_menu_item_enabled(app, item_id, *enabled)?;
    }
    Ok(())
}

/// Returns a list of every menu item id that has been declared.
#[allow(dead_code)]
pub fn known_menu_item_ids() -> Vec<&'static str> {
    all_specs().iter().map(|spec| spec.id).collect()
}

/// Used by tests to ensure a path-relative accelerator map exists.
#[allow(dead_code)]
pub fn ensure_path(_path: &Path) -> std::io::Result<()> {
    Ok(())
}

// Suppress unused warning for IsMenuItem trait import in some configurations.
#[allow(dead_code)]
fn _is_menu_item_bound<R: Runtime>(_: &dyn IsMenuItem<R>) {}
