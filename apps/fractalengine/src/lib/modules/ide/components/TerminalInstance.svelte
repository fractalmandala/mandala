<script lang="ts">
	import { onMount } from 'svelte';
	import '@xterm/xterm/css/xterm.css';
	import { ideState, type IdeTerminalSession } from '$lib/state/ide.svelte';
	import type { Terminal as XtermTerminal } from '@xterm/xterm';
	import type { FitAddon } from '@xterm/addon-fit';

	interface Props {
		session: IdeTerminalSession;
		active: boolean;
	}

	let { session, active }: Props = $props();
	let terminalSurface = $state<HTMLDivElement | null>(null);
	let term: XtermTerminal | null = null;
	let fitAddon: FitAddon | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let renderedOutputLength = 0;

	$effect(() => {
		session.output;
		syncTerminalOutput();
	});

	$effect(() => {
		if (term && active && !ideState.terminalCollapsed) {
			queueMicrotask(() => {
				fitTerminal();
				term?.focus();
			});
		}
	});

	onMount(() => {
		let destroyed = false;

		void Promise.all([
			import('@xterm/xterm'),
			import('@xterm/addon-fit')
		]).then(([xterm, fitModule]) => {
			if (destroyed || !terminalSurface) return;
			const instance = new xterm.Terminal({
				cursorBlink: true,
				fontFamily: '"JetBrains Mono", monospace',
				fontSize: cssNumber('--terminal-font-size', 12),
				fontWeight: '400',
				fontWeightBold: '600',
				letterSpacing: 0,
				lineHeight: 1.2,
				scrollback: 5000,
				theme: {
					background: cssVar('--background10', '#ffffff'),
					foreground: cssVar('--text-primary', '#181818'),
					cursor: cssVar('--theme-color', '#28ad33'),
					selectionBackground: cssVar('--accent-surface-medium', '#d7f4db')
				}
			});
			const fitInstance = new fitModule.FitAddon();
			instance.loadAddon(fitInstance);
			instance.open(terminalSurface);
			term = instance;
			fitAddon = fitInstance;

			instance.onData((data) => ideState.sendTerminalInput(data, session.id));
			instance.onResize(({ cols, rows }) => ideState.resizeTerminal(cols, rows, session.id));
			instance.attachCustomKeyEventHandler((event) => {
				const modifier = event.metaKey || event.ctrlKey;
				if (event.type === 'keydown' && modifier && event.key.toLowerCase() === 'c' && instance.hasSelection()) {
					void navigator.clipboard.writeText(instance.getSelection());
					return false;
				}
				if (event.type === 'keydown' && modifier && event.key.toLowerCase() === 'v') {
					void navigator.clipboard.readText().then((text) => {
						if (text) ideState.sendTerminalInput(text, session.id);
					});
					return false;
				}
				return true;
			});

			resizeObserver = new ResizeObserver(() => fitTerminal());
			resizeObserver.observe(terminalSurface);
			requestAnimationFrame(() => {
				fitTerminal();
				syncTerminalOutput();
				void ideState.initTerminalSession(session.id, instance.cols, instance.rows);
				if (active) instance.focus();
			});
			void document.fonts?.ready.then(() => {
				if (destroyed) return;
				instance.options.fontFamily = '"JetBrains Mono", monospace';
				fitTerminal();
				instance.refresh(0, instance.rows - 1);
			});
		});

		return () => {
			destroyed = true;
			resizeObserver?.disconnect();
			term?.dispose();
			term = null;
			fitAddon = null;
		};
	});

	function fitTerminal(): void {
		if (!term || !fitAddon || !terminalSurface) return;
		try {
			fitAddon.fit();
		} catch {
			// xterm can throw while the panel is mounted at zero height during layout transitions.
		}
	}

	function syncTerminalOutput(): void {
		if (!term) return;
		if (session.output.length < renderedOutputLength) {
			term.clear();
			renderedOutputLength = 0;
		}
		const nextOutput = session.output.slice(renderedOutputLength);
		if (nextOutput) {
			term.write(nextOutput);
			renderedOutputLength = session.output.length;
		}
	}

	function cssVar(name: string, fallback: string): string {
		if (typeof document === 'undefined') return fallback;
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
	}

	function cssNumber(name: string, fallback: number): number {
		const parsed = Number.parseFloat(cssVar(name, String(fallback)));
		return Number.isFinite(parsed) ? parsed : fallback;
	}
</script>

<div
	class="terminal-pty-surface"
	class:is-active={active}
	bind:this={terminalSurface}
	role="application"
	aria-label={`${session.title} interactive terminal`}
></div>
