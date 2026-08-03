import type { Backend } from './types';
import { tauriBackend } from './tauri';

// Real Tauri runtime injects __TAURI_INTERNALS__ (and __TAURI__ when
// withGlobalTauri is enabled). Media workflows require that desktop runtime.
const w = window as unknown as Record<string, unknown>;
export const isTauri = '__TAURI_INTERNALS__' in w || '__TAURI__' in w;

export const backend: Backend = tauriBackend;
