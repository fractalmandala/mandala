---
id: macos-dictation-feature-spec
title: macOS Dictation — Feature and Function Specification
type: plan
tags: [plan, macos, dictation, speech, accessibility, ipc, undo-redo]
status: proposed
relates_to: [ADR-004, ADR-006, ADR-025, ADR-026, ADR-028]
updated: 2026-07-17
---

# macOS Dictation — Feature and Function Specification

## 1. Purpose

Add an optional, macOS-only dictation capability that lets a person speak text into the writing surface that currently has focus. The feature uses Apple's native speech-recognition service, prefers offline/on-device recognition where the selected language supports it, and does not send transcript text to an AI provider.

This is application dictation: FractalEngine starts and owns the microphone session, shows the transcription state, and inserts the resulting text into the active editing surface. It complements, but does not replace, macOS's system Dictation shortcut.

## 2. Product boundaries

### Included in the first release

- Start dictation by holding the Fn/Globe key while FractalEngine is frontmost and an eligible writing surface has focus; releasing the key finalizes and stops the session. Provide a fallback command and visible microphone control for keyboards/macOS configurations that do not deliver Fn/Globe events to the app.
- Stream partial transcription while speaking, then commit the final text at the caret or current selection.
- Support CodeMirror file editors, raw Markdown notes, rich-text Notes, AI chat prompts, generic app textareas/inputs, and editable designer text.
- Provide settings for enabled state, language/locale, Fn/Globe activation diagnostics, fallback shortcut, and automatic punctuation when Apple exposes it for the selected locale.
- Make each finished utterance a single undoable edit in the owning editor.
- Report permissions, unavailable model/language, microphone failure, and recognition failure without losing existing typed text.
- Include a non-native browser mock so `pnpm dev` remains fully usable; the mock never requests the microphone and offers a deterministic simulated transcript for automated tests.

### Explicitly deferred

- Continuous background listening, wake words, and dictation while the app is unfocused.
- Voice commands for application navigation or editor commands.
- Speaker identification, meeting recording, audio-file transcription, audio retention, or cloud transcription supplied by FractalEngine.
- A Windows/Linux speech engine. The UI may display the setting disabled with a short platform explanation on those platforms.
- Automatic rewriting, summarizing, grammar correction, or AI processing of dictated content.

## 3. User-facing feature set

| Feature | User action | Expected result |
| --- | --- | --- |
| Dictate with Fn/Globe | Hold Fn/Globe while FractalEngine is frontmost and an eligible surface has focus; release it when finished speaking | The hold threshold starts a push-to-talk session. Releasing finalizes available speech, then ends the session and releases the microphone. |
| Fallback toggle | Choose **Start/Stop Dictation** from the command palette, use the microphone control, or use the configurable fallback shortcut | Provides the same start/stop behavior when Fn/Globe is unavailable or the person prefers a toggle. |
| See live speech | Speak after the listening indicator appears | Provisional text is visibly composed at the caret. It is distinguishable from committed text and is not persisted as a series of edits. |
| Correct by keyboard | Type, select text, move the caret, Undo, or use a command that changes the document | Dictation stops before the competing edit. Any already-final text remains, and standard editor behavior wins. |
| Pick a language | Select English or, when installed and verified on-device, Hindi in Settings | The next dictation session uses that locale. Hindi is not presented as usable until Apple reports an installed, on-device-capable recognizer. |
| Privacy mode | On-device recognition is mandatory in v1 | The app never falls back to Apple network recognition. If local assets are unavailable, it explains how to select/download a supported language rather than uploading audio. |

## 4. Surface behaviour

### Eligibility and focus

An eligible target is the editable surface currently focused inside the FractalEngine window. A target is ineligible when it is read-only, disabled, hidden, no longer mounted, or belongs to a browser page rendered inside the Browser module.

The dictation controller does not guess a target. It starts only when a registered surface reports an active editable selection. If the user triggers the command with no eligible surface focused, the app shows a brief non-destructive status message: **“Focus a text field or editor to dictate.”**

| Surface | Insertion behaviour | Finalisation and undo |
| --- | --- | --- |
| IDE files (CodeMirror) | Replace the selected range, or insert at the primary cursor. Composition is represented through a CodeMirror transaction/decorations, never a DOM-only mutation. | One completed utterance is one CodeMirror history event. |
| Raw Markdown Notes | Replace the native textarea selection or insert at its caret. | One completed utterance produces one Notes undo transaction. |
| Rich Notes (TipTap) | Replace the current ProseMirror selection using the editor command API. | One completed utterance is grouped as one editor history item. |
| AI chat prompts | Insert into the current prompt textarea without submitting. | One completed utterance is one ordinary textarea undo step; sending remains an explicit keyboard/button action. |
| Designer text editing | Insert only while a text block is already in edit mode. Dictation never creates a text block or changes the selected layer. | The existing designer history domain receives one committed-text transaction. |
| Generic inputs/textareas | Replace selection or insert at caret via the registered surface adapter. | The surface's normal input/undo path is retained. |

Partial speech is provisional. A finalized phrase replaces its associated provisional range, preserving nearby user text and selection boundaries. If recognition yields no final text, the provisional range is removed and the underlying document stays unchanged.

## 5. Interaction details

### Fn/Globe push-to-talk sequence

1. The app installs a **local** native macOS event monitor only while its own window is frontmost. It observes the AppKit function modifier state; it does not request Accessibility permission, monitor another app, or register a system-wide key hook.
2. When Fn/Globe is held by itself for the configured hold threshold (initially 400 ms), the app checks target eligibility and begins dictation. A short tap has no effect, so normal Fn use remains available.
3. Releasing Fn/Globe finalizes and stops the current session. Holding it with another modifier/key never starts dictation.
4. If macOS, the connected keyboard, or a user-selected Keyboard setting consumes the Fn/Globe event, FractalEngine reports **“Fn/Globe is unavailable on this keyboard configuration”** and keeps the mic control, palette command, and fallback shortcut available.

Fn/Globe is deliberately push-to-talk rather than double-tap. A double-tap is less discoverable, is easier to collide with macOS's own Fn/Globe assignment (including system Dictation), and risks a listening session that remains active after the user has switched context. AppKit exposes the function modifier state and local event monitors for events delivered to the app, but the operating system may reserve the physical key before it reaches FractalEngine; therefore the fallback is required. [AppKit event monitoring](https://developer.apple.com/documentation/appkit/nsevent), [function modifier flag](https://developer.apple.com/documentation/appkit/nsevent/modifierflags-swift.struct/function)

### Fallback start sequence

1. The user focuses an eligible writing surface and starts dictation from a supported fallback control.
2. The app validates platform support, target availability, on-device locale availability, microphone permission, and speech-recognition permission.
3. On first use, macOS presents its normal permission prompts using FractalEngine's plain-language usage descriptions.
4. Once ready, the active surface displays a listening/composition indicator; no text is inserted until Apple returns a partial or final result.
5. While listening, the microphone control is an explicit **Stop Dictation** action and the command-palette item changes accordingly.

### During dictation

- Partial results replace only the current provisional text.
- Final results commit text, then either continue into the next utterance or end according to the native recognizer's session behavior and the user's Stop action.
- The app shows a concise status for listening, processing, unavailable, permission-denied, and error states. It does not expose raw native error strings as the primary UI.
- The active surface remains keyboard-editable. Any direct document edit interrupts dictation first to prevent interleaved edits.
- Moving focus to another eligible surface stops the current session; text is never redirected to the newly focused surface mid-utterance.

### Stop sequence

The service tells the recognizer that audio has ended, waits briefly for a final result when possible, commits it atomically, clears composition UI, releases audio resources, and restores the surface's prior selection/focus. Explicit cancellation clears only provisional text and does not insert an empty undo item.

## 6. Commands, controls, and settings

### Contributions

The implementation declares these core contributions so the command palette, menu, and keybinding system receive the same source of truth:

| Command ID | Title | Default keybinding | Enablement |
| --- | --- | --- | --- |
| `core.dictationToggle` | Start/Stop Dictation | Configurable; initial fallback `Cmd+Shift+D` | macOS + an eligible focused target + service ready; toggles while active |
| `core.dictationStop` | Stop Dictation | none | active dictation only; used by menu/control semantics |
| `dictation.openSettings` | Open Dictation Settings | none | macOS; available even when unavailable so the user can inspect configuration |

The fallback shortcut must be conflict-checked against existing core and module contributions before it is adopted. If it conflicts, the feature uses an unassigned default and exposes a settings assignment path rather than silently overriding another command. Fn/Globe push-to-talk is native local-event handling, not a regular contribution-registry keybinding.

### Visible controls

- A compact mic button appears beside the composer controls in AI chat and in the editor/tooling area of text-capable modules when the current target is eligible.
- The control has an accessible label that changes between **Start Dictation** and **Stop Dictation**, exposes pressed/listening state, and shows an explanatory tooltip with the shortcut.
- A non-intrusive inline status appears near the target for listening, processing, permission, and recoverable failure. It is announced through an appropriate live region.
- No microphone control appears in read-only code blocks, rendered Markdown previews, disabled prompts, or the embedded Browser module.

### Settings

The Dictation section is macOS-only and contains:

- Enable Dictation toggle (off means controls, Fn/Globe handling, and fallback shortcut are inactive, without removing the user’s macOS system Dictation capability).
- Recognition language selector: English is required for launch; Hindi is offered only after macOS reports it supported and its on-device asset ready.
- Read-only availability detail: on-device ready, language asset required, unsupported locale, permission denied, or service unavailable.
- Fn/Globe diagnostics showing whether FractalEngine receives the key and a link to the fallback shortcut configuration.
- Fallback shortcut display/customization, using the app's existing keybinding conventions.
- A concise privacy explanation: microphone audio remains within Apple's on-device speech service; v1 has no network recognition fallback.

Changes to persisted preferences use the established settings undo/persistence rules. A locale/privacy change is rejected while recording; the UI asks the user to stop dictation first.

## 7. Native and application functions

### Frontend dictation controller

A single controller owns the session state and emits a typed state model to all UI consumers:

```ts
type DictationState =
	| { phase: 'idle' }
	| { phase: 'checking'; targetId: string }
	| { phase: 'requesting-permission'; targetId: string }
	| { phase: 'listening'; targetId: string; partialText: string }
	| { phase: 'finalizing'; targetId: string }
	| { phase: 'error'; code: DictationErrorCode; recoverable: boolean };
```

Its responsibilities are to discover registered targets, preserve the start selection, coordinate start/stop/cancel, ensure focus changes terminate safely, and map native events into a surface adapter. It does not own document state and does not directly import Tauri APIs from a component.

### Surface-adapter contract

Each supported editing technology registers an adapter with the controller. The contract supplies `canDictate`, selection capture, provisional replace, final commit, cancellation cleanup, and teardown notification. This centralizes consistency while allowing CodeMirror, TipTap, and DOM inputs to use their native edit and undo APIs.

### IPC boundary

All renderer/native calls and native events pass through `src/lib/ipc.ts` and are mirrored in `src/lib/ipc-mock.ts`. Planned functions include capability/permission status, `startDictation(options)`, `stopDictation()`, `cancelDictation()`, and typed subscriptions for state/partial/final/error events. IPC payloads contain only session metadata and transcript deltas; no audio crosses the webview IPC boundary.

The native macOS implementation is isolated behind a narrow bridge—preferably a small Swift component invoked by the Rust/Tauri layer—because Apple Speech and AVFoundation are native frameworks with asynchronous callback APIs. The Rust side remains responsible for Tauri commands, lifecycle management, and emitting typed events to the app.

### Apple service behavior

- Request microphone and speech authorization before creating the first live session.
- Use the selected locale and verify recognition availability before listening.
- Require on-device recognition and fail clearly if the installed locale cannot provide it; v1 never calls a network recognition fallback.
- Send partial and final transcripts separately; do not persist audio or transcripts merely to run dictation.
- End audio and cancel/destroy the recognition task on Stop, focus loss, window close, module teardown, permission revocation, or native failure.

## 8. Permissions, privacy, and security

- The macOS bundle includes `NSMicrophoneUsageDescription` explaining that the microphone is used only for user-triggered dictation.
- The implementation verifies the privacy declaration requirements of the selected Apple Speech API/SDK before packaging. A speech-recognition declaration, if required by that API, does not enable a network fallback in v1.
- Signed sandboxed builds include the appropriate macOS audio-input entitlement.
- The app never starts recording automatically, listens in the background, or captures system audio.
- On-device-only mode is the default. If the user opts into fallback, the settings UI states that Apple may process audio for recognition, and links to Apple’s relevant privacy information at release time.
- Transcripts are treated exactly like manually typed content: they are stored only if the containing editor normally stores that content. The dictation service itself has no transcript history, analytics payload, or crash-log transcript fields.
- Tauri event payloads are limited to the current session and current text delta; listeners are always unregistered on component/application teardown.

## 9. Expected failure behavior

| Condition | User-visible behavior | Data behavior |
| --- | --- | --- |
| Not macOS | Controls/settings show unsupported state; command is unavailable. | No microphone request; browser mock remains testable. |
| No editable focus | Brief instruction to focus a text field/editor. | No session and no document change. |
| Microphone denied | Explain how to allow FractalEngine in macOS Privacy & Security, with a retry action. | Existing typed text unchanged. |
| Speech permission denied | Explain the permission requirement and show Settings/retry action. | Existing typed text unchanged. |
| Offline asset unavailable | Explain that the selected language cannot dictate on-device yet and offer locale/settings path. | No network fallback and no session. |
| Fn/Globe intercepted by macOS or keyboard | Explain that the app cannot see the key in the current keyboard configuration and offer the microphone control, palette command, and fallback shortcut. | No session unless a fallback is used. |
| Native service/network unavailable | Display recoverable failure; allow retry after service availability returns. | Remove partial composition; do not create an undo entry. |
| Target is destroyed or surface changes | Stop/cancel safely and clear its composition state. | Never insert into another surface. |
| App/window closes | Cancel immediately; do not block shutdown waiting indefinitely for final speech. | Discard uncommitted provisional text. |
| User edits while listening | Stop before applying the competing edit. | Already-finalized text remains; no corrupted selection. |

## 10. Acceptance criteria

1. On a supported macOS build, a user can dictate into each included writing surface and final speech appears at the original caret or replaces the original selection.
2. Dictating does not submit a chat, save a file, create a designer block, or trigger any other action beyond text insertion.
3. Partial results are not persisted or accumulated as separate undo entries; one finalized utterance is undone and redone atomically in each supported editor.
4. The feature asks for microphone access only after an explicit user start action and reports both denied permissions in understandable language.
5. The service always refuses rather than falls back to network recognition when on-device recognition is unavailable.
6. A focus change, direct editing action, module teardown, and app close each stop/cancel cleanly without stale text insertion or leaked listeners/audio capture.
7. Browser development works without Tauri or microphone hardware through the IPC mock, and targeted tests cover partial/final/cancel/error state transitions plus each surface adapter.
8. Command, shortcut, settings, IPC mock parity, security configuration, undo boundaries, and documentation contracts pass their relevant test suites.

## 11. Implementation phases (not yet authorized)

1. **Foundation:** define typed contracts, settings state, core contributions, IPC gateway/mock, macOS capability/permission status, and a focused-window Fn/Globe long-press detector with a tested fallback path.
2. **Native proof:** add the macOS bridge with a single controlled test target, partial/final events, permission states, cancellation, and on-device policy.
3. **Editor adapters:** implement and test CodeMirror, textarea/input, TipTap, and designer adapters with their proper undo boundaries.
4. **Product UI:** add controls, status feedback, settings, accessibility semantics, and platform-unavailable presentation.
5. **Hardening:** exercise permissions, assets, focus races, out-of-order callbacks, cancellation, teardown, malformed native events, undo/redo, and signed-bundle entitlements; update areas/ADRs/design documentation as implementation decisions become final.

No code changes should begin until this specification is reviewed and the unresolved product choices below are confirmed.

## 12. Decisions requested before implementation

1. **Resolved:** Fn/Globe long-press is the primary push-to-talk control; its native event-delivery diagnostic and a configurable fallback must ship with v1.
2. **Resolved:** v1 is strictly on-device; Apple network fallback is not offered.
3. **Resolved:** every eligible surface ships in v1. The adapter inventory and its surface-specific tests are release blockers.
4. **Resolved:** English is required. Hindi ships when the machine exposes it as a supported, installed on-device locale; otherwise it is shown as unavailable rather than silently using a network service.
