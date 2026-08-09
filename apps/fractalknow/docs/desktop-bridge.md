# FractalKnow Desktop Bridge Contract

Date: 2026-07-31
Scope: `/Users/amrit/fractals/apps/fractalknow`

The SvelteKit app talks to one compatibility facade from `$lib/desktop`. The facade keeps the migrated UI independent from whether it is running inside Tauri or in the browser-preview dev server.

## Runtime Metadata

| App-facing API | Tauri command | Browser-preview behavior |
| --- | --- | --- |
| `bridge.config` | `desktop_config` during bridge creation | Static fallback config for `fractalknow` with no project folder and no PTY support |
| `bridge.appInfo()` | `app_info` | Static fallback metadata identifying the browser preview runtime |

## Events

Every subscription returns an unsubscribe function. Browser preview emits initial update and server status events where useful and otherwise returns a no-op unsubscribe.
The Tauri shell emits startup seed events for `ok:update-status` and `ok:server-status`, emits `ok:deep-link` when a supported launch URL is present in the process arguments, and forwards the `tauri-plugin-deep-link` runtime events for OS open-url requests. Every subscription returns a reliable unsubscribe function.

| App-facing event | Tauri event | Payload normalization |
| --- | --- | --- |
| `onProjectSwitched` | `ok:project:switched` | Uses the app-facing config shape |
| `onMenuAction` | `ok:menu-action` | Uses the typed `OkMenuAction` union |
| `onDeepLink` | `ok:deep-link` plus `startup_deep_link` seed | Accepts `receivedAt` or `received_at` |
| `onUpdateStatus` | `ok:update-status` | Accepts `checkedAt` or `checked_at`; empty strings become `null` |
| `onServerStatus` | `ok:server-status` | Accepts `changedAt` or `changed_at`; empty strings become `null` |
| `onCrashInvite` | `ok:crash-invite` | Accepts `reportPath` or `report_path`, `createdAt` or `created_at` |
| `onConsentRequired` | `ok:consent-required` | Accepts `requiredAt` or `required_at`; defaults scope to `filesystem` |

### Native event sources

| Bridge event | Native source | Description |
| --- | --- | --- |
| `ok:deep-link` | `tauri-plugin-deep-link::on_open_url` + `startup_deep_link` | Real OS open-url forwarding plus launch-arg seed |
| `ok:update-status` | `tauri-plugin-updater` | Real check, available, ready, error states |
| `ok:server-status` | Local server lifecycle | Spawn, ready, stopped, error states |
| `ok:crash-invite` | Rust panic hook | Real panic caught and written to disk |
| `ok:consent-required` | Consent gate | Emitted when a consent-gated feature is invoked without prior consent |
| `ok:menu-action` | Native menu events | Routed through the same command dispatcher as the keyboard and palette |
| `ok:terminal-data` | Real PTY output | Real `portable-pty` reader thread |
| `ok:terminal-exit` | Real PTY exit | Captured via `child.wait().exit_code()` |

## Commands

Native-only commands return either `{ ok: true }` or an explicit unsupported payload:

```ts
{
	ok: false,
	reason: 'not-implemented' | 'unsupported-platform' | 'missing-backend',
	feature: string,
	message?: string
}
```

| App-facing API | Tauri command or plugin | Browser-preview behavior |
| --- | --- | --- |
| `setThemeSource(source)` | `set_theme_source` | Unsupported: `setThemeSource` |
| `signalThemeApplied(opts)` | `theme_applied` | Unsupported: `themeApplied` |
| `setMenuEnablement(items)` | `set_menu_enablement` | Unsupported: `setMenuEnablement` |
| `getMenuEnablement()` | `get_menu_enablement` | Returns `{}` |
| `updater.checkStatus()` | `check_update_status` | Unsupported: `updater.checkStatus` |
| `updater.installUpdate()` | `install_update` | Unsupported: `updater.installUpdate` |
| `terminal.start(opts)` | `terminal_start` | Unsupported: `terminal.start` |
| `terminal.write(opts)` | `terminal_write` | Unsupported: `terminal.write` |
| `terminal.stop(opts)` | `terminal_stop` | Unsupported: `terminal.stop` |
| `projects.create(opts)` | `create_project` (returns project metadata; facade normalizes to `{ ok: true }`) | Unsupported: `projects.create` |
| `projects.readRecent()` | `read_recent_projects` | Unsupported: `projects.readRecent` |
| `projects.writeRecent(projects)` | `write_recent_projects` | Unsupported: `projects.writeRecent` |
| `appConfig.read()` | `read_app_config` | Unsupported: `appConfig.read` |
| `appConfig.write(config)` | `write_app_config` | Unsupported: `appConfig.write` |
| `feedback.captureBugReport()` | `capture_bug_report` | Unsupported: `feedback.captureBugReport` |
| `feedback.submitFeedback(message)` | `submit_feedback` | Opens the public issue tracker URL as an external handoff |
| `dialog.openFolder(opts)` | Tauri dialog plugin `open` | Resolves `null` |
| `shell.openExternal(url)` | Tauri opener plugin `openUrl` | Calls `window.open(url, '_blank', 'noopener,noreferrer')` |
| `shell.detectProtocol(scheme)` | `detect_protocol` | Unsupported: `shell.detectProtocol` |
| `consent.request(scope, message)` | `request_consent` | Resolves `false` |
| `consent.grant(scope, granted)` | `grant_consent` | Unsupported: `consent.grant` |
| `server.start(config)` | `start_local_server` | Unsupported: `server.start` |
| `server.stop()` | `stop_local_server` | Unsupported: `server.stop` |
| `server.status()` | `local_server_status` | Unsupported: `server.status` |
| `crash.simulatePanic()` | `simulate_panic` | Unsupported: `crash.simulatePanic` |
| `crash.listReports()` | `list_crash_reports` | Returns `[]` |
| `crash.readReport(id)` | `read_crash_report` | Returns `null` |

## Menu Enablement

The bridge exposes `setMenuEnablement(items)` so the shell can flip native menu items on and off as the user navigates. The shell derives the enablement map from the active document, sidebar section, and terminal tab and forwards only the changed keys. The Svelte helper at `src/lib/shell/menu-enablement.ts` deduplicates repeated updates.

The Rust side caches the same map in a `MenuRegistry` so the next time the menu is rebuilt, the prior enablement is preserved.

## Native menu accelerators

| Menu id | Linux / Windows | macOS |
| --- | --- | --- |
| `new-doc` | `Ctrl+N` | `Cmd+N` |
| `new-folder` | `Ctrl+Shift+N` | `Cmd+Shift+N` |
| `new-project` | `Ctrl+Alt+N` | `Cmd+Alt+N` |
| `close-active-tab-or-window` | `Ctrl+W` | `Cmd+W` |
| `save-version` | `Ctrl+S` | `Cmd+S` |
| `focus-command-palette` | `Ctrl+K` | `Cmd+K` |
| `settings` | `Ctrl+,` | `Cmd+,` |
| `focus-search` | `Ctrl+F` | `Cmd+F` |
| `toggle-sidebar` | `Ctrl+B` | `Cmd+B` |
| `toggle-source` | `Ctrl+E` | `Cmd+E` |
| `navigate-back` | `Alt+Left` | `Cmd+[` |
| `navigate-forward` | `Alt+Right` | `Cmd+]` |
| `version-history` | `Ctrl+Shift+H` | `Cmd+Shift+H` |
| `toggle-terminal` | `Ctrl+J` | `Cmd+J` |
| `new-terminal` | `Ctrl+Shift+J` | `Cmd+Shift+J` |

## Verification

- `src/lib/desktop/bridge.unit.test.ts` covers Tauri snake_case to app-facing camelCase normalizers, all bridge command surface, the browser-preview fallback, and the new menu enablement, crash report, consent, and server command paths.
- `src/lib/shell/menu-enablement.unit.test.ts` covers menu enablement derivation and dedup.
- Rust command tests in `src-tauri/src/lib.rs` cover the menu spec, accelerator mapping, deep-link scheme validation, project scaffolding, and the menu registry.

## Remaining native gaps

- The local server command in `start_local_server` requires a real external process to spawn; until the OpenKnowledge collaboration server is ported to this app, callers can pass any real binary such as `python3 -m http.server` to exercise the lifecycle.
- The updater endpoints list in `tauri.conf.json` is empty; once a release channel is published, the `tauri-plugin-updater` will resolve and report real versions.
