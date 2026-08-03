//! Source-app auto-tagging.
//!
//! A background watcher notes which app was frontmost at the instant the clipboard
//! changed — which, at copy-time, is the app the content came from. Each seen app is
//! registered as a rule the user can name and toggle. When a paste starts an entry, the
//! active rule's tags are merged in.
//!
//! The registry and the rules are one structure keyed by bundle id: a newly-seen app is
//! added inactive with a default tag, and the UI lets the user rename the tag and flip it
//! active. Persisted to `autotag.json` in the app config dir.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AppRule {
    #[serde(rename = "bundleId")]
    pub bundle_id: String,
    #[serde(rename = "appName")]
    pub app_name: String,
    pub tags: Vec<String>,
    pub active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    #[serde(rename = "bundleId")]
    pub bundle_id: String,
    #[serde(rename = "appName")]
    pub app_name: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct Config {
    apps: Vec<AppRule>,
}

struct Inner {
    config_path: Mutex<Option<PathBuf>>,
    config: Mutex<Config>,
    current: Mutex<Option<Source>>,
    /// Our own bundle id — a copy made inside fracta must not be attributed.
    self_bundle: String,
}

#[derive(Clone)]
pub struct AutoTag {
    inner: Arc<Inner>,
}

impl AutoTag {
    pub fn new(self_bundle: impl Into<String>) -> Self {
        AutoTag {
            inner: Arc::new(Inner {
                config_path: Mutex::new(None),
                config: Mutex::new(Config::default()),
                current: Mutex::new(None),
                self_bundle: self_bundle.into(),
            }),
        }
    }

    /// Loads the saved rules for this config dir.
    pub fn init(&self, app_config_dir: &Path) {
        let path = app_config_dir.join("autotag.json");
        if let Ok(raw) = fs::read_to_string(&path) {
            if let Ok(config) = serde_json::from_str::<Config>(&raw) {
                *self.inner.config.lock().unwrap() = config;
            }
        }
        *self.inner.config_path.lock().unwrap() = Some(path);
    }

    fn persist(&self) {
        let path = self.inner.config_path.lock().unwrap().clone();
        let Some(path) = path else { return };
        if let Ok(raw) = serde_json::to_string_pretty(&*self.inner.config.lock().unwrap()) {
            let _ = fs::write(path, raw);
        }
    }

    pub fn rules(&self) -> Vec<AppRule> {
        self.inner.config.lock().unwrap().apps.clone()
    }

    /// Creates or updates a rule, returning the full list.
    pub fn upsert(&self, rule: AppRule) -> Vec<AppRule> {
        {
            let mut config = self.inner.config.lock().unwrap();
            match config
                .apps
                .iter_mut()
                .find(|a| a.bundle_id == rule.bundle_id)
            {
                Some(existing) => {
                    existing.app_name = rule.app_name;
                    existing.tags = normalize_tags(rule.tags);
                    existing.active = rule.active;
                }
                None => config.apps.push(AppRule {
                    tags: normalize_tags(rule.tags),
                    ..rule
                }),
            }
        }
        self.persist();
        self.rules()
    }

    pub fn delete(&self, bundle_id: &str) -> Vec<AppRule> {
        self.inner
            .config
            .lock()
            .unwrap()
            .apps
            .retain(|a| a.bundle_id != bundle_id);
        self.persist();
        self.rules()
    }

    /// Records the source of a clipboard change. Skips our own copies (recorded so a
    /// later paste of *our* content isn't misattributed, but never registered as a
    /// rule). A newly-seen external app is registered inactive with a default tag.
    pub fn record_source(&self, bundle_id: String, app_name: String) {
        let is_self = bundle_id == self.inner.self_bundle;
        *self.inner.current.lock().unwrap() = Some(Source {
            bundle_id: bundle_id.clone(),
            app_name: app_name.clone(),
        });
        if is_self || bundle_id.is_empty() {
            return;
        }
        let mut newly_added = false;
        {
            let mut config = self.inner.config.lock().unwrap();
            match config.apps.iter_mut().find(|a| a.bundle_id == bundle_id) {
                // Keep the friendly name fresh, but never override the user's choices.
                Some(existing) => existing.app_name = app_name.clone(),
                None => {
                    config.apps.push(AppRule {
                        tags: vec![default_tag(&bundle_id, &app_name)],
                        bundle_id,
                        app_name,
                        active: false,
                    });
                    newly_added = true;
                }
            }
        }
        if newly_added {
            self.persist();
        }
    }

    pub fn current_source(&self) -> Option<Source> {
        let current = self.inner.current.lock().unwrap().clone()?;
        if current.bundle_id == self.inner.self_bundle || current.bundle_id.is_empty() {
            return None;
        }
        Some(current)
    }

    /// The tags an active rule assigns to whatever is currently on the clipboard.
    pub fn tags_for_current(&self) -> Vec<String> {
        let Some(source) = self.current_source() else {
            return vec![];
        };
        let config = self.inner.config.lock().unwrap();
        config
            .apps
            .iter()
            .find(|a| a.bundle_id == source.bundle_id && a.active)
            .map(|a| a.tags.clone())
            .unwrap_or_default()
    }
}

fn normalize_tags(tags: Vec<String>) -> Vec<String> {
    let mut seen = std::collections::HashSet::new();
    tags.into_iter()
        .map(|t| t.trim().to_string())
        .filter(|t| !t.is_empty() && seen.insert(t.clone()))
        .collect()
}

/// A sensible starting tag for a freshly-seen app: its display name lowercased with
/// spaces collapsed to hyphens, or the last segment of the bundle id as a fallback.
fn default_tag(bundle_id: &str, app_name: &str) -> String {
    let name = app_name.trim();
    if !name.is_empty() {
        return name
            .to_lowercase()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join("-");
    }
    bundle_id
        .rsplit('.')
        .next()
        .unwrap_or(bundle_id)
        .to_lowercase()
}

// --- Platform watcher -------------------------------------------------------------

#[cfg(target_os = "macos")]
pub fn spawn_watch(autotag: AutoTag) {
    use objc2_app_kit::{NSPasteboard, NSWorkspace};
    use std::thread;
    use std::time::Duration;

    // Poll on a dedicated thread. changeCount is a cheap integer read; the frontmost
    // app is only queried when the count actually moves, so idle cost is negligible.
    thread::spawn(move || {
        let mut last_change: isize = -1;
        loop {
            let count = unsafe { NSPasteboard::generalPasteboard().changeCount() };
            if count != last_change {
                last_change = count;
                // Skip the very first observation at startup: we can't know who owns a
                // clipboard that predates the watcher.
                if count > 0 {
                    let workspace = unsafe { NSWorkspace::sharedWorkspace() };
                    if let Some(app) = unsafe { workspace.frontmostApplication() } {
                        let bundle = unsafe { app.bundleIdentifier() }
                            .map(|s| s.to_string())
                            .unwrap_or_default();
                        let name = unsafe { app.localizedName() }
                            .map(|s| s.to_string())
                            .unwrap_or_default();
                        autotag.record_source(bundle, name);
                    }
                }
            }
            thread::sleep(Duration::from_millis(250));
        }
    });
}

#[cfg(not(target_os = "macos"))]
pub fn spawn_watch(_autotag: AutoTag) {
    // No source detection outside macOS yet; rules simply never match.
}

#[cfg(test)]
mod tests {
    use super::*;

    fn autotag() -> AutoTag {
        AutoTag::new("com.fractalmandala.fracta")
    }

    #[test]
    fn newly_seen_app_is_registered_inactive_with_default_tag() {
        let at = autotag();
        at.record_source("com.anthropic.claude".into(), "Claude".into());
        let rules = at.rules();
        assert_eq!(rules.len(), 1);
        assert_eq!(rules[0].bundle_id, "com.anthropic.claude");
        assert_eq!(rules[0].tags, vec!["claude"]);
        assert!(
            !rules[0].active,
            "a freshly-seen app must default to inactive"
        );
    }

    #[test]
    fn own_copies_are_not_registered_or_attributed() {
        let at = autotag();
        at.record_source("com.fractalmandala.fracta".into(), "fracta".into());
        assert!(at.rules().is_empty());
        assert!(at.current_source().is_none());
        assert!(at.tags_for_current().is_empty());
    }

    #[test]
    fn tags_apply_only_when_rule_is_active() {
        let at = autotag();
        at.record_source("com.openai.codex".into(), "Codex".into());
        // Inactive by default → no tags.
        assert!(at.tags_for_current().is_empty());

        at.upsert(AppRule {
            bundle_id: "com.openai.codex".into(),
            app_name: "Codex".into(),
            tags: vec!["codex".into(), "code".into()],
            active: true,
        });
        assert_eq!(at.tags_for_current(), vec!["codex", "code"]);
    }

    #[test]
    fn current_source_follows_latest_change() {
        let at = autotag();
        at.record_source("com.anthropic.claude".into(), "Claude".into());
        at.record_source("net.imput.helium".into(), "Helium".into());
        assert_eq!(at.current_source().unwrap().bundle_id, "net.imput.helium");
    }

    #[test]
    fn upsert_dedupes_and_trims_tags() {
        let at = autotag();
        let rules = at.upsert(AppRule {
            bundle_id: "com.foo.bar".into(),
            app_name: "Bar".into(),
            tags: vec![" web ".into(), "web".into(), "".into(), "news".into()],
            active: true,
        });
        assert_eq!(rules[0].tags, vec!["web", "news"]);
    }

    #[test]
    fn default_tag_falls_back_to_bundle_segment() {
        assert_eq!(default_tag("com.some.app", ""), "app");
        assert_eq!(default_tag("com.some.app", "My Cool App"), "my-cool-app");
    }
}
