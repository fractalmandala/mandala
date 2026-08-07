pub mod session;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use tauri::webview::{NewWindowResponse, PageLoadEvent, WebviewBuilder};
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Position, Rect, Size, WebviewUrl,
    WindowEvent,
};

const DEFAULT_URL: &str = "https://www.google.com";

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Tab {
    pub id: String,
    pub url: String,
    pub title: String,
    pub favicon_url: Option<String>,
    pub can_go_back: bool,
    pub can_go_forward: bool,
    pub loading: bool,
    pub nav_epoch: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserWindowInfo {
    pub window_id: String,
    pub tabs: Vec<Tab>,
    pub active_tab_id: Option<String>,
}

#[derive(Clone)]
struct ClosedTab(Tab);

#[derive(Clone)]
struct BrowserWindow {
    window_label: String,
    chrome_label: String,
    tabs: Vec<Tab>,
    active_tab_id: Option<String>,
    closed_tabs: Vec<ClosedTab>,
    viewport: Option<BrowserViewportRect>,
}

#[derive(Default)]
struct RegistryData {
    windows: HashMap<String, BrowserWindow>,
    last_focused: Option<String>,
}

#[derive(Default)]
pub struct BrowserRegistry {
    next_id: AtomicU64,
    data: Mutex<RegistryData>,
}

impl BrowserRegistry {
    fn next(&self, prefix: &str) -> String {
        format!(
            "{prefix}-{}",
            self.next_id.fetch_add(1, Ordering::Relaxed) + 1
        )
    }
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserViewportRect {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct BrowserEventPayload {
    window_id: String,
    tab_id: String,
    nav_epoch: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct BrowserEvent {
    #[serde(rename = "type")]
    type_: String,
    payload: BrowserEventPayload,
    #[serde(skip_serializing_if = "Option::is_none")]
    url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<String>,
}

fn emit(app: &AppHandle, chrome_label: &str, event: BrowserEvent) {
    let _ = app.emit_to(chrome_label, "browser:event", event);
}

fn tab_label(window_id: &str, tab_id: &str) -> String {
    format!("browser-tab-{window_id}-{tab_id}")
}

fn window_info(window_id: &str, window: &BrowserWindow) -> BrowserWindowInfo {
    BrowserWindowInfo {
        window_id: window_id.to_string(),
        tabs: window.tabs.clone(),
        active_tab_id: window.active_tab_id.clone(),
    }
}

fn persisted_window(window: &BrowserWindow) -> session::PersistedBrowserWindow {
    let tabs: Vec<_> = window
        .tabs
        .iter()
        .filter_map(|tab| {
            session::sanitize_url(&tab.url).map(|url| session::PersistedBrowserTab { url })
        })
        .collect();
    let active_tab_index = window
        .active_tab_id
        .as_ref()
        .and_then(|active| window.tabs.iter().position(|tab| &tab.id == active))
        .unwrap_or(0)
        .min(tabs.len().saturating_sub(1));
    session::PersistedBrowserWindow {
        tabs,
        active_tab_index,
    }
}

fn find_tab<'a>(window: &'a BrowserWindow, tab_id: &str) -> Result<&'a Tab, String> {
    window
        .tabs
        .iter()
        .find(|tab| tab.id == tab_id)
        .ok_or_else(|| "Browser tab is not open".to_string())
}

fn find_tab_mut<'a>(window: &'a mut BrowserWindow, tab_id: &str) -> Result<&'a mut Tab, String> {
    window
        .tabs
        .iter_mut()
        .find(|tab| tab.id == tab_id)
        .ok_or_else(|| "Browser tab is not open".to_string())
}

fn activate_locked(window: &mut BrowserWindow, tab_id: &str) -> Result<(), String> {
    find_tab(window, tab_id)?;
    window.active_tab_id = Some(tab_id.to_string());
    Ok(())
}

fn apply_viewport(app: &AppHandle, window_id: &str) -> Result<(), String> {
    let registry = app.state::<BrowserRegistry>();
    let data = registry
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?;
    let browser = data
        .windows
        .get(window_id)
        .ok_or_else(|| "Browser window is not open".to_string())?;
    let rect = browser.viewport.clone().unwrap_or(BrowserViewportRect {
        x: 0.0,
        y: 0.0,
        width: 0.0,
        height: 0.0,
    });
    let active = browser.active_tab_id.clone();
    for tab in &browser.tabs {
        let webview = app
            .get_webview(&tab_label(window_id, &tab.id))
            .ok_or_else(|| "Browser content webview is not open".to_string())?;
        webview
            .set_bounds(Rect {
                position: Position::Logical(LogicalPosition::new(rect.x, rect.y)),
                size: Size::Logical(LogicalSize::new(rect.width.max(0.0), rect.height.max(0.0))),
            })
            .map_err(|error| error.to_string())?;
        if active.as_deref() == Some(tab.id.as_str()) {
            webview.show().map_err(|error| error.to_string())?;
        } else {
            webview.hide().map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

fn navigation_started(app: &AppHandle, window_id: &str, tab_id: &str, url: String) {
    let registry = app.state::<BrowserRegistry>();
    let payload = (|| -> Result<(String, BrowserEvent), String> {
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get_mut(window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        let chrome_label = window.chrome_label.clone();
        let tab = find_tab_mut(window, tab_id)?;
        tab.url = url.clone();
        tab.loading = true;
        tab.nav_epoch += 1;
        Ok((
            chrome_label,
            BrowserEvent {
                type_: "nav-started".into(),
                payload: BrowserEventPayload {
                    window_id: window_id.into(),
                    tab_id: tab_id.into(),
                    nav_epoch: tab.nav_epoch,
                },
                url: Some(url),
                title: None,
            },
        ))
    })();
    if let Ok((chrome, event)) = payload {
        emit(app, &chrome, event);
    }
}

fn navigation_finished(app: &AppHandle, window_id: &str, tab_id: &str, url: String) {
    let registry = app.state::<BrowserRegistry>();
    let payload = (|| -> Result<(String, BrowserEvent, BrowserEvent, BrowserEvent), String> {
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get_mut(window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        let chrome_label = window.chrome_label.clone();
        let tab = find_tab_mut(window, tab_id)?;
        tab.url = url.clone();
        tab.loading = false;
        let title = tauri::Url::parse(&url)
            .ok()
            .and_then(|parsed| parsed.host_str().map(str::to_string))
            .unwrap_or_else(|| url.clone());
        tab.title = title.clone();
        let epoch = tab.nav_epoch;
        let committed = BrowserEvent {
            type_: "nav-committed".into(),
            payload: BrowserEventPayload {
                window_id: window_id.into(),
                tab_id: tab_id.into(),
                nav_epoch: epoch,
            },
            url: Some(url.clone()),
            title: None,
        };
        let finished = BrowserEvent {
            type_: "load-finished".into(),
            payload: BrowserEventPayload {
                window_id: window_id.into(),
                tab_id: tab_id.into(),
                nav_epoch: epoch,
            },
            url: Some(url),
            title: None,
        };
        let title_changed = BrowserEvent {
            type_: "title-changed".into(),
            payload: BrowserEventPayload {
                window_id: window_id.into(),
                tab_id: tab_id.into(),
                nav_epoch: epoch,
            },
            url: None,
            title: Some(title),
        };
        Ok((chrome_label, committed, title_changed, finished))
    })();
    if let Ok((chrome, committed, title_changed, finished)) = payload {
        // Capture only the committed final URL. Redirect intermediates surface as
        // navigation-started events and deliberately never reach history.
        let _ = crate::storage::history_record_visit(
            app.clone(),
            crate::storage::HistoryVisitInput {
                url: committed.url.clone().unwrap_or_default(),
                title: title_changed.title.clone(),
                favicon_url: None,
                transition: Some("link".into()),
            },
        );
        emit(app, &chrome, committed);
        emit(app, &chrome, title_changed);
        emit(app, &chrome, finished);
    }
}

fn create_tab_webview(app: &AppHandle, window_id: String, tab: Tab) -> Result<(), String> {
    let window_label = {
        let registry = app.state::<BrowserRegistry>();
        let data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        data.windows
            .get(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?
            .window_label
            .clone()
    };
    let window = app
        .get_window(&window_label)
        .ok_or_else(|| "Browser window is not open".to_string())?;
    let nav_app = app.clone();
    let nav_window = window_id.clone();
    let nav_tab = tab.id.clone();
    let load_app = app.clone();
    let load_window = window_id.clone();
    let load_tab = tab.id.clone();
    let popup_app = app.clone();
    let popup_window = window_id.clone();
    let builder = WebviewBuilder::new(
        tab_label(&window_id, &tab.id),
        WebviewUrl::External(crate::normalize_browser_url(&tab.url)?),
    )
    .on_navigation(move |url| {
        navigation_started(&nav_app, &nav_window, &nav_tab, url.to_string());
        true
    })
    .on_page_load(move |_webview, payload| {
        if matches!(payload.event(), PageLoadEvent::Finished) {
            navigation_finished(
                &load_app,
                &load_window,
                &load_tab,
                payload.url().to_string(),
            );
        }
    })
    .on_new_window(move |url, _| {
        let _ = browser_tab_create(
            popup_app.clone(),
            popup_window.clone(),
            Some(url.to_string()),
            Some(false),
        );
        NewWindowResponse::Deny
    });
    window
        .add_child(
            builder,
            LogicalPosition::new(0.0, 0.0),
            LogicalSize::new(0.0, 0.0),
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn browser_window_open(
    app: AppHandle,
    url: Option<String>,
) -> Result<BrowserWindowInfo, String> {
    let registry = app.state::<BrowserRegistry>();
    let window_id = registry.next("browser");
    let restored = if url.is_none() {
        app.state::<session::BrowserSessionStore>()
            .take_window_to_restore()?
    } else {
        None
    };
    let restored_active = restored
        .as_ref()
        .map(|window| window.active_tab_index)
        .unwrap_or(0);
    let tab_urls = match restored {
        Some(window) => window
            .tabs
            .into_iter()
            .map(|tab| tab.url)
            .collect::<Vec<_>>(),
        None => {
            vec![crate::normalize_browser_url(url.as_deref().unwrap_or(DEFAULT_URL))?.to_string()]
        }
    };
    let tabs: Vec<Tab> = tab_urls
        .into_iter()
        .map(|target| Tab {
            id: registry.next("tab"),
            url: target,
            title: "New Tab".into(),
            favicon_url: None,
            can_go_back: false,
            can_go_forward: false,
            loading: true,
            nav_epoch: 0,
        })
        .collect();
    let active_tab_id = tabs
        .get(restored_active.min(tabs.len().saturating_sub(1)))
        .map(|tab| tab.id.clone());
    let window_label = format!("browser-window-{window_id}");
    let chrome_label = format!("browser-chrome-{window_id}");
    // Built from a WindowConfig (not the fluent builder) because traffic_light_position
    // is only reachable via config on a plain multiwebview window. Keep the traffic-light
    // offset in sync with the main window's tauri.conf.json.
    let native = tauri::window::WindowBuilder::from_config(
        &app,
        &tauri::utils::config::WindowConfig {
            label: window_label.clone(),
            title: "FractalEngine Browser".into(),
            width: 1080.0,
            height: 760.0,
            min_width: Some(560.0),
            min_height: Some(420.0),
            resizable: true,
            decorations: true,
            shadow: false,
            title_bar_style: tauri::TitleBarStyle::Overlay,
            hidden_title: true,
            traffic_light_position: Some(tauri::utils::config::LogicalPosition {
                x: 16.0,
                y: 26.0,
            }),
            ..Default::default()
        },
    )
    .map_err(|error| error.to_string())?
    .build()
    .map_err(|error| error.to_string())?;
    native
        .add_child(
            WebviewBuilder::new(
                &chrome_label,
                WebviewUrl::App(format!("browser?win={window_id}").into()),
            )
            // Child webviews do not track the parent window's size on their own;
            // without this the chrome stays 1080×760 when the window is resized.
            .auto_resize(),
            LogicalPosition::new(0.0, 0.0),
            LogicalSize::new(1080.0, 760.0),
        )
        .map_err(|error| error.to_string())?;
    {
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        data.last_focused = Some(window_id.clone());
        data.windows.insert(
            window_id.clone(),
            BrowserWindow {
                window_label,
                chrome_label: chrome_label.clone(),
                tabs: tabs.clone(),
                active_tab_id: active_tab_id.clone(),
                closed_tabs: vec![],
                viewport: None,
            },
        );
    }
    for tab in tabs.clone() {
        create_tab_webview(&app, window_id.clone(), tab)?;
    }
    let close_app = app.clone();
    let close_window = window_id.clone();
    native.on_window_event(move |event| match event {
        WindowEvent::Focused(true) => {
            if let Ok(mut data) = close_app.state::<BrowserRegistry>().data.lock() {
                data.last_focused = Some(close_window.clone());
            }
        }
        // The macOS red traffic light emits CloseRequested before the native window is
        // destroyed. Release the engine state here, then let the system close continue.
        // Waiting only for Destroyed leaves the registry alive when the close request is
        // handled by the platform without a subsequent destruction notification.
        WindowEvent::CloseRequested { .. } => {
            let _ = unregister_browser_window(&close_app, &close_window);
        }
        WindowEvent::Destroyed => {
            let _ = unregister_browser_window(&close_app, &close_window);
        }
        _ => {}
    });
    apply_viewport(&app, &window_id)?;
    for tab in &tabs {
        emit(
            &app,
            &chrome_label,
            BrowserEvent {
                type_: "tab-created".into(),
                payload: BrowserEventPayload {
                    window_id: window_id.clone(),
                    tab_id: tab.id.clone(),
                    nav_epoch: 0,
                },
                url: Some(tab.url.clone()),
                title: Some(tab.title.clone()),
            },
        );
    }
    let data = registry
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?;
    Ok(window_info(
        &window_id,
        data.windows
            .get(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?,
    ))
}

/// Snapshot of one window's current tabs/active-tab, for chrome bootstrap. The chrome webview
/// loads *after* the engine created the window and its initial tab, so those `browser:event`s
/// are gone by the time the mirror subscribes — it calls this once to seed itself, then stays
/// in sync via events. Returns None for an unknown window (e.g. stale ?win= param).
#[tauri::command]
pub fn browser_window_state(
    app: AppHandle,
    window_id: String,
) -> Result<Option<BrowserWindowInfo>, String> {
    let registry = app.state::<BrowserRegistry>();
    let data = registry
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?;
    Ok(data
        .windows
        .get(&window_id)
        .map(|window| window_info(&window_id, window)))
}

/// Remove one browser window from the engine and persist the remaining session.
///
/// This is deliberately idempotent because both an explicit IPC close and the native
/// window lifecycle can reach it. It does not close the native window itself: the caller
/// either lets a platform close request proceed or explicitly closes it after teardown.
fn unregister_browser_window(app: &AppHandle, window_id: &str) -> Result<bool, String> {
    let (removed, snapshots) = {
        let registry = app.state::<BrowserRegistry>();
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let removed = data.windows.remove(window_id);
        let snapshots = data.windows.values().map(persisted_window).collect();
        (removed, snapshots)
    };
    app.state::<session::BrowserSessionStore>()
        .replace_windows(app, snapshots)?;
    if let Some(window) = removed {
        for tab in &window.tabs {
            crate::discard_credential_candidate(app, window_id, &tab.id)?;
        }
        emit(
            app,
            &window.chrome_label,
            BrowserEvent {
                type_: "window-closed".into(),
                payload: BrowserEventPayload {
                    window_id: window_id.into(),
                    tab_id: String::new(),
                    nav_epoch: 0,
                },
                url: None,
                title: None,
            },
        );
        return Ok(true);
    }
    Ok(false)
}

#[tauri::command]
pub fn browser_window_close(app: AppHandle, window_id: String) -> Result<(), String> {
    if unregister_browser_window(&app, &window_id)? {
        if let Some(native) = app.get_window(&format!("browser-window-{window_id}")) {
            let _ = native.close();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn browser_session_restore_enabled(app: AppHandle) -> Result<bool, String> {
    app.state::<session::BrowserSessionStore>()
        .restore_enabled()
}

#[tauri::command]
pub fn browser_set_session_restore(app: AppHandle, enabled: bool) -> Result<(), String> {
    app.state::<session::BrowserSessionStore>()
        .set_restore_enabled(&app, enabled)
}

#[tauri::command]
pub fn browser_toggle_focus(app: AppHandle) -> Result<(), String> {
    let registry = app.state::<BrowserRegistry>();
    let target = registry
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?
        .last_focused
        .clone();
    if let Some(window_id) = target {
        let data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        if let Some(window) = data.windows.get(&window_id) {
            app.get_window(&window.window_label)
                .ok_or_else(|| "Browser window is not open".to_string())?
                .set_focus()
                .map_err(|error| error.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn browser_tab_create(
    app: AppHandle,
    window_id: String,
    url: Option<String>,
    background: Option<bool>,
) -> Result<Tab, String> {
    let target = crate::normalize_browser_url(url.as_deref().unwrap_or(DEFAULT_URL))?.to_string();
    let tab_id = app.state::<BrowserRegistry>().next("tab");
    let tab = Tab {
        id: tab_id.clone(),
        url: target,
        title: "New Tab".into(),
        favicon_url: None,
        can_go_back: false,
        can_go_forward: false,
        loading: true,
        nav_epoch: 0,
    };
    let (chrome, activate) = {
        let registry = app.state::<BrowserRegistry>();
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get_mut(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        window.tabs.push(tab.clone());
        let activate = !background.unwrap_or(false);
        if activate {
            window.active_tab_id = Some(tab_id.clone());
        }
        (window.chrome_label.clone(), activate)
    };
    create_tab_webview(&app, window_id.clone(), tab.clone())?;
    apply_viewport(&app, &window_id)?;
    emit(
        &app,
        &chrome,
        BrowserEvent {
            type_: "tab-created".into(),
            payload: BrowserEventPayload {
                window_id: window_id.clone(),
                tab_id: tab_id.clone(),
                nav_epoch: 0,
            },
            url: Some(tab.url.clone()),
            title: Some(tab.title.clone()),
        },
    );
    if activate {
        emit(
            &app,
            &chrome,
            BrowserEvent {
                type_: "tab-activated".into(),
                payload: BrowserEventPayload {
                    window_id,
                    tab_id,
                    nav_epoch: 0,
                },
                url: None,
                title: None,
            },
        );
    }
    Ok(tab)
}

#[tauri::command]
pub fn browser_tab_activate(
    app: AppHandle,
    window_id: String,
    tab_id: String,
) -> Result<(), String> {
    let (chrome, epoch) = {
        let registry = app.state::<BrowserRegistry>();
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get_mut(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        activate_locked(window, &tab_id)?;
        (
            window.chrome_label.clone(),
            find_tab(window, &tab_id)?.nav_epoch,
        )
    };
    apply_viewport(&app, &window_id)?;
    emit(
        &app,
        &chrome,
        BrowserEvent {
            type_: "tab-activated".into(),
            payload: BrowserEventPayload {
                window_id,
                tab_id,
                nav_epoch: epoch,
            },
            url: None,
            title: None,
        },
    );
    Ok(())
}

#[tauri::command]
pub fn browser_tab_close(app: AppHandle, window_id: String, tab_id: String) -> Result<(), String> {
    let (chrome, tab, successor) = {
        let registry = app.state::<BrowserRegistry>();
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get_mut(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        let position = window
            .tabs
            .iter()
            .position(|tab| tab.id == tab_id)
            .ok_or_else(|| "Browser tab is not open".to_string())?;
        let tab = window.tabs.remove(position);
        window.closed_tabs.push(ClosedTab(tab.clone()));
        let successor = window
            .tabs
            .get(position.min(window.tabs.len().saturating_sub(1)))
            .map(|tab| tab.id.clone());
        window.active_tab_id = successor.clone();
        (window.chrome_label.clone(), tab, successor)
    };
    if let Some(webview) = app.get_webview(&tab_label(&window_id, &tab.id)) {
        let _ = webview.close();
    }
    crate::discard_credential_candidate(&app, &window_id, &tab.id)?;
    emit(
        &app,
        &chrome,
        BrowserEvent {
            type_: "tab-closed".into(),
            payload: BrowserEventPayload {
                window_id: window_id.clone(),
                tab_id,
                nav_epoch: tab.nav_epoch,
            },
            url: None,
            title: None,
        },
    );
    if let Some(next) = successor {
        browser_tab_activate(app, window_id, next)?;
    }
    Ok(())
}

#[tauri::command]
pub fn browser_tab_reorder(
    app: AppHandle,
    window_id: String,
    tab_id: String,
    to_index: usize,
) -> Result<(), String> {
    let registry = app.state::<BrowserRegistry>();
    let mut data = registry
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?;
    let window = data
        .windows
        .get_mut(&window_id)
        .ok_or_else(|| "Browser window is not open".to_string())?;
    let from = window
        .tabs
        .iter()
        .position(|tab| tab.id == tab_id)
        .ok_or_else(|| "Browser tab is not open".to_string())?;
    let tab = window.tabs.remove(from);
    window.tabs.insert(to_index.min(window.tabs.len()), tab);
    Ok(())
}

#[tauri::command]
pub fn browser_tab_reopen_closed(app: AppHandle, window_id: String) -> Result<Option<Tab>, String> {
    let tab = {
        let registry = app.state::<BrowserRegistry>();
        let mut data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        data.windows
            .get_mut(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?
            .closed_tabs
            .pop()
            .map(|closed| closed.0)
    };
    if let Some(tab) = tab {
        browser_tab_create(app, window_id, Some(tab.url), Some(false)).map(Some)
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn browser_navigate(
    app: AppHandle,
    window_id: String,
    tab_id: String,
    url: String,
) -> Result<(), String> {
    let url = crate::normalize_browser_url(&url)?;
    let webview = app
        .get_webview(&tab_label(&window_id, &tab_id))
        .ok_or_else(|| "Browser content webview is not open".to_string())?;
    webview.navigate(url).map_err(|error| error.to_string())
}
#[tauri::command]
pub fn browser_reload(app: AppHandle, window_id: String, tab_id: String) -> Result<(), String> {
    app.get_webview(&tab_label(&window_id, &tab_id))
        .ok_or_else(|| "Browser content webview is not open".to_string())?
        .reload()
        .map_err(|error| error.to_string())
}
#[tauri::command]
pub fn browser_stop(_app: AppHandle, _window_id: String, _tab_id: String) -> Result<(), String> {
    Ok(())
}
#[tauri::command]
pub fn browser_go_back(app: AppHandle, window_id: String, tab_id: String) -> Result<(), String> {
    app.get_webview(&tab_label(&window_id, &tab_id))
        .ok_or_else(|| "Browser content webview is not open".to_string())?
        .eval("history.back()")
        .map_err(|error| error.to_string())
}
#[tauri::command]
pub fn browser_go_forward(app: AppHandle, window_id: String, tab_id: String) -> Result<(), String> {
    app.get_webview(&tab_label(&window_id, &tab_id))
        .ok_or_else(|| "Browser content webview is not open".to_string())?
        .eval("history.forward()")
        .map_err(|error| error.to_string())
}
#[tauri::command]
pub fn browser_set_viewport_bounds(
    app: AppHandle,
    window_id: String,
    rect: BrowserViewportRect,
) -> Result<(), String> {
    app.state::<BrowserRegistry>()
        .data
        .lock()
        .map_err(|_| "Browser registry lock poisoned")?
        .windows
        .get_mut(&window_id)
        .ok_or_else(|| "Browser window is not open".to_string())?
        .viewport = Some(rect);
    apply_viewport(&app, &window_id)
}
#[tauri::command]
pub fn browser_set_chrome_overlay(
    app: AppHandle,
    window_id: String,
    open: bool,
) -> Result<(), String> {
    let (chrome_label, active_tab_id) = {
        let registry = app.state::<BrowserRegistry>();
        let data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        (window.chrome_label.clone(), window.active_tab_id.clone())
    };
    if open {
        let chrome = app
            .get_webview(&chrome_label)
            .ok_or_else(|| "Browser chrome webview is not open".to_string())?;
        chrome.hide().map_err(|error| error.to_string())?;
        chrome.show().map_err(|error| error.to_string())?;
    } else if let Some(tab_id) = active_tab_id {
        let content = app
            .get_webview(&tab_label(&window_id, &tab_id))
            .ok_or_else(|| "Browser content webview is not open".to_string())?;
        content.hide().map_err(|error| error.to_string())?;
        content.show().map_err(|error| error.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn browser_autofill(
    app: AppHandle,
    window_id: String,
    tab_id: String,
    entry_id: String,
) -> Result<(), String> {
    let active_url = {
        let registry = app.state::<BrowserRegistry>();
        let data = registry
            .data
            .lock()
            .map_err(|_| "Browser registry lock poisoned")?;
        let window = data
            .windows
            .get(&window_id)
            .ok_or_else(|| "Browser window is not open".to_string())?;
        if window.active_tab_id.as_deref() != Some(tab_id.as_str()) {
            return Err("Refusing to fill an inactive browser tab".into());
        }
        find_tab(window, &tab_id)?.url.clone()
    };
    let credential = crate::resolve_vault_credential(&app, &entry_id)?;
    if !credential.uris.is_empty()
        && !credential
            .uris
            .iter()
            .any(|uri| same_origin(uri, &active_url))
    {
        return Err("Vault entry does not match the active page origin".into());
    }
    let username =
        serde_json::to_string(&credential.username).map_err(|error| error.to_string())?;
    let password =
        serde_json::to_string(&credential.password).map_err(|error| error.to_string())?;
    let script = format!(
        r#"(() => {{ const u={username}, p={password}; const visible = e => e && !e.disabled && e.type !== 'hidden'; const inputs=[...document.querySelectorAll('input')]; const user=inputs.find(e => visible(e) && /user|email|login/i.test(e.name+' '+e.id+' '+e.autocomplete)) || inputs.find(e => visible(e) && ['text','email'].includes(e.type)); const pass=inputs.find(e => visible(e) && e.type === 'password'); const set=(e,v)=>{{ if(!e)return; const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value'); d?.set?.call(e,v); e.dispatchEvent(new Event('input',{{bubbles:true}})); e.dispatchEvent(new Event('change',{{bubbles:true}})); }}; set(user,u); set(pass,p); }})()"#
    );
    app.get_webview(&tab_label(&window_id, &tab_id))
        .ok_or_else(|| "Browser content webview is not open".to_string())?
        .eval(&script)
        .map_err(|error| error.to_string())
}

fn same_origin(saved: &str, active: &str) -> bool {
    match (tauri::Url::parse(saved), tauri::Url::parse(active)) {
        (Ok(saved), Ok(active)) => {
            saved.scheme() == active.scheme()
                && saved.host_str() == active.host_str()
                && saved.port_or_known_default() == active.port_or_known_default()
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn registry_generates_unique_labels() {
        let registry = BrowserRegistry::default();
        assert_ne!(registry.next("browser"), registry.next("browser"));
    }
    #[test]
    fn tab_labels_are_window_scoped() {
        assert_ne!(
            tab_label("browser-1", "tab-1"),
            tab_label("browser-2", "tab-1")
        );
    }

    #[test]
    fn browser_events_serialize_to_the_frozen_nested_payload_contract() {
        let event = BrowserEvent {
            type_: "nav-committed".into(),
            payload: BrowserEventPayload {
                window_id: "browser-1".into(),
                tab_id: "tab-2".into(),
                nav_epoch: 7,
            },
            url: Some("https://example.com".into()),
            title: Some("Example".into()),
        };

        assert_eq!(
            serde_json::to_value(event).expect("browser event serializes"),
            serde_json::json!({
                "type": "nav-committed",
                "payload": {
                    "windowId": "browser-1",
                    "tabId": "tab-2",
                    "navEpoch": 7
                },
                "url": "https://example.com",
                "title": "Example"
            })
        );
    }
}
