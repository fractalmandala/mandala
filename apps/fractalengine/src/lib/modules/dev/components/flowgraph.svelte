<script>
	// @ts-nocheck — ported legacy renderer, checked at runtime via #err
	import { onMount } from 'svelte';

	const DATA = {
	"version": 1,
	"project": {
		"name": "FractalEngine Studio",
		"slug": "fractalengine",
		"tagline": "Spatial canvas, notes wiki, and native IDE for creative developers",
		"date": "2026-07-17"
	},
	"stats": {
		"agents": 2,
		"models": 4,
		"tools": 3,
		"integrations": 3
	},
	"topModels": [
		{
			"id": "gemini",
			"label": "Gemini",
			"domain": "gemini.google.com"
		},
		{
			"id": "claude",
			"label": "Claude",
			"domain": "claude.ai"
		},
		{
			"id": "gpt-4o",
			"label": "GPT-4o",
			"domain": "openai.com"
		}
	],
	"topTools": [
		{
			"id": "dictation",
			"label": "Apple Dictation",
			"domain": "apple.com"
		},
		{
			"id": "tiptap",
			"label": "TipTap Editor",
			"domain": "tiptap.dev"
		},
		{
			"id": "codemirror",
			"label": "CodeMirror",
			"domain": "codemirror.net"
		}
	],
	"topIntegrations": [
		{
			"id": "tauri",
			"label": "Tauri",
			"domain": "tauri.app"
		},
		{
			"id": "sqlite",
			"label": "SQLite",
			"domain": "sqlite.org"
		},
		{
			"id": "keychain",
			"label": "macOS Keychain",
			"domain": "apple.com"
		}
	],
	"graph": {
		"nodes": [
			{
				"id": "routes-layout",
				"label": "SvelteKit Root Layout",
				"kind": "entry",
				"sub": "routes/+layout.svelte",
				"detail": "Root shell bootstraps UI themes, tooltips, and registers menu-event IPC listeners.",
				"sourceRef": "src/routes/+layout.svelte"
			},
			{
				"id": "routes-page",
				"label": "SvelteKit Router Page",
				"kind": "entry",
				"sub": "routes/+page.svelte",
				"detail": "Main entry point routing to classic IDE layout, spatial canvas, or wiki templates.",
				"sourceRef": "src/routes/+page.svelte"
			},
			{
				"id": "agent-copilot",
				"label": "AI Copilot",
				"kind": "agent",
				"sub": "streamApiModel / runLocalModel",
				"group": "AI Copilot",
				"detail": "Answers questions with workspace context, active files, and attached assets.",
				"sourceRef": "src/lib/state/ide.svelte.ts:1700"
			},
			{
				"id": "agent-frontend-designer",
				"label": "Frontend Designer",
				"kind": "agent",
				"sub": "agents/orchestrators",
				"detail": "Orchestrator for Svelte 5 runes, styling guidelines, and feature layout.",
				"sourceRef": "agents/orchestrators/frontend-designer/AGENT.md"
			},
			{
				"id": "model-gemini",
				"label": "Gemini Pro/Flash",
				"kind": "model",
				"domain": "gemini.google.com"
			},
			{
				"id": "model-claude",
				"label": "Claude 3.5 Sonnet",
				"kind": "model",
				"domain": "claude.ai"
			},
			{
				"id": "model-gpt4",
				"label": "GPT-4o",
				"kind": "model",
				"domain": "openai.com"
			},
			{
				"id": "model-local",
				"label": "Local GGUF/MLX",
				"kind": "model"
			},
			{
				"id": "service-ai-workspace",
				"label": "AI Workspace Module",
				"kind": "service",
				"sub": "modules/ai",
				"group": "AI Copilot",
				"detail": "Tabbed panels coordinating chat logs, terminal views, and active documents.",
				"sourceRef": "src/lib/modules/ai/state/ai.svelte.ts"
			},
			{
				"id": "service-model-registry",
				"label": "Model Registry",
				"kind": "service",
				"sub": "modelRegistry.svelte.ts",
				"group": "AI Copilot",
				"detail": "Manages BYOK keys, endpoints, and local model file selections.",
				"sourceRef": "src/lib/state/modelRegistry.svelte.ts"
			},
			{
				"id": "service-dictation",
				"label": "Dictation Bridge",
				"kind": "service",
				"sub": "macOS dictation.rs",
				"detail": "On-device macOS speech recognition bridge for accessible typing.",
				"sourceRef": "src-tauri/src/dictation.rs"
			},
			{
				"id": "service-undo-engine",
				"label": "Undo Engine",
				"kind": "service",
				"sub": "UndoHistory.transact()",
				"detail": "App-wide composite undo/redo manager via snapshot boundaries.",
				"sourceRef": "src/lib/state/undoHistory.svelte.ts"
			},
			{
				"id": "service-classic-ide",
				"label": "IDE Classic Layout",
				"kind": "service",
				"sub": "modules/ide",
				"group": "Editor & Wiki",
				"detail": "File tree, editor panels using CodeMirror/Monaco, and terminal console launcher.",
				"sourceRef": "src/lib/modules/ide/components/ClassicIdeLayout.svelte"
			},
			{
				"id": "service-browser-engine",
				"label": "Browser Engine",
				"kind": "service",
				"sub": "modules/browser",
				"group": "Browser & Vault",
				"detail": "Multi-tab embedded browser window utilizing native WebViews.",
				"sourceRef": "src-tauri/src/browser/mod.rs"
			},
			{
				"id": "service-password-vault",
				"label": "Password Vault",
				"kind": "service",
				"sub": "AES-256-GCM envelope",
				"group": "Browser & Vault",
				"detail": "Provides secure password management and autofill actions in web pages.",
				"sourceRef": "src/lib/modules/browser/state/vault.svelte.ts"
			},
			{
				"id": "service-designer-canvas",
				"label": "Designer Canvas",
				"kind": "service",
				"sub": "modules/designer",
				"group": "Editor & Wiki",
				"detail": "Visual workspace supporting spatial tile placement, layout designs, and art.",
				"sourceRef": "src/lib/modules/designer/state/canvas.svelte.ts"
			},
			{
				"id": "service-notes-wiki",
				"label": "Notes & Wiki",
				"kind": "service",
				"sub": "modules/notes",
				"group": "Editor & Wiki",
				"detail": "Interactive wiki editor built on TipTap supporting rich text and images.",
				"sourceRef": "src/lib/modules/notes/state/notes.svelte.ts"
			},
			{
				"id": "service-media-library",
				"kind": "service",
				"label": "Media Library",
				"sub": "modules/media",
				"detail": "Discovers and catalogs image, audio, and video assets in designated folders.",
				"sourceRef": "src/lib/modules/media/state/media.svelte.ts"
			},
			{
				"id": "service-bookmarks-manager",
				"kind": "service",
				"label": "Bookmarks Manager",
				"sub": "modules/bookmarks",
				"detail": "Manages browser bookmarks with hierarchical folders and description search.",
				"sourceRef": "src/lib/modules/bookmarks/state/bookmarks.svelte.ts"
			},
			{
				"id": "service-contribution-registry",
				"kind": "service",
				"label": "Contributions Registry",
				"sub": "contributions.svelte.ts",
				"detail": "Global registry for custom commands, menu actions, and keybindings.",
				"sourceRef": "src/lib/state/contributions.svelte.ts"
			},
			{
				"id": "service-ipc-gateway",
				"kind": "service",
				"label": "Tauri IPC Gateway",
				"sub": "ipc.ts Gateway",
				"detail": "Single entry point for all frontend to Rust native communications.",
				"sourceRef": "src/lib/ipc.ts"
			},
			{
				"id": "store-passwords-json",
				"label": "passwords.json",
				"kind": "store",
				"group": "Browser & Vault",
				"detail": "Secure database of saved accounts and credentials."
			},
			{
				"id": "store-browser-session",
				"label": "browser-session.json",
				"kind": "store",
				"group": "Browser & Vault",
				"detail": "Restores open tabs, view states, and window configurations."
			},
			{
				"id": "store-project-memory",
				"label": "Project SQLite DB",
				"kind": "store",
				"group": "AI Copilot",
				"detail": "SQLite database storage containing message threads and checkpoints."
			},
			{
				"id": "store-media-db",
				"label": "Media SQLite DB",
				"kind": "store",
				"detail": "Media asset library metadata storage catalog."
			},
			{
				"id": "store-app-db",
				"label": "App SQLite DB",
				"kind": "store",
				"group": "Editor & Wiki",
				"detail": "Global search index database using FTS5 virtual tables."
			},
			{
				"id": "store-keychain",
				"label": "OS Keychain",
				"kind": "store",
				"detail": "Stores master AES key for decrypting local passwords and BYOK keys."
			}
		],
		"edges": [
			{
				"from": "routes-layout",
				"to": "service-ipc-gateway",
				"kind": "calls"
			},
			{
				"from": "routes-page",
				"to": "service-classic-ide",
				"kind": "triggers"
			},
			{
				"from": "routes-page",
				"to": "service-designer-canvas",
				"kind": "triggers"
			},
			{
				"from": "routes-page",
				"to": "service-notes-wiki",
				"kind": "triggers"
			},
			{
				"from": "routes-page",
				"to": "service-ai-workspace",
				"kind": "triggers"
			},
			{
				"from": "service-ai-workspace",
				"to": "agent-copilot",
				"kind": "triggers"
			},
			{
				"from": "agent-copilot",
				"to": "service-model-registry",
				"kind": "reads"
			},
			{
				"from": "agent-copilot",
				"to": "service-ipc-gateway",
				"kind": "calls",
				"label": "invokes LLM streams"
			},
			{
				"from": "service-ipc-gateway",
				"to": "model-gemini",
				"kind": "calls"
			},
			{
				"from": "service-ipc-gateway",
				"to": "model-claude",
				"kind": "calls"
			},
			{
				"from": "service-ipc-gateway",
				"to": "model-gpt4",
				"kind": "calls"
			},
			{
				"from": "service-ipc-gateway",
				"to": "model-local",
				"kind": "calls",
				"label": "spawns local sidecar"
			},
			{
				"from": "service-model-registry",
				"to": "store-keychain",
				"kind": "reads",
				"label": "validates BYOK keys"
			},
			{
				"from": "agent-copilot",
				"to": "store-project-memory",
				"kind": "writes",
				"label": "saves and loads chat"
			},
			{
				"from": "service-browser-engine",
				"to": "service-password-vault",
				"kind": "calls",
				"label": "autofills fields"
			},
			{
				"from": "service-password-vault",
				"to": "store-passwords-json",
				"kind": "writes",
				"label": "saves credential"
			},
			{
				"from": "store-passwords-json",
				"to": "store-keychain",
				"kind": "reads",
				"label": "AES-GCM key lookup"
			},
			{
				"from": "service-browser-engine",
				"to": "store-browser-session",
				"kind": "writes",
				"label": "saves active tabs"
			},
			{
				"from": "service-notes-wiki",
				"to": "store-app-db",
				"kind": "writes",
				"label": "indexes wiki pages"
			},
			{
				"from": "service-bookmarks-manager",
				"to": "store-app-db",
				"kind": "writes",
				"label": "indexes bookmarks"
			},
			{
				"from": "service-classic-ide",
				"to": "store-app-db",
				"kind": "reads",
				"label": "FTS5 global search"
			},
			{
				"from": "service-classic-ide",
				"to": "service-undo-engine",
				"kind": "calls",
				"label": "undo-redo transaction"
			},
			{
				"from": "service-designer-canvas",
				"to": "service-undo-engine",
				"kind": "calls"
			},
			{
				"from": "service-notes-wiki",
				"to": "service-undo-engine",
				"kind": "calls"
			},
			{
				"from": "service-media-library",
				"to": "store-media-db",
				"kind": "writes",
				"label": "catalogs import"
			},
			{
				"from": "service-classic-ide",
				"to": "service-dictation",
				"kind": "triggers"
			},
			{
				"from": "service-dictation",
				"to": "service-ipc-gateway",
				"kind": "calls"
			},
			{
				"from": "agent-frontend-designer",
				"to": "service-designer-canvas",
				"kind": "calls"
			},
			{
				"from": "agent-frontend-designer",
				"to": "service-notes-wiki",
				"kind": "calls"
			},
			{
				"from": "agent-frontend-designer",
				"to": "service-classic-ide",
				"kind": "calls"
			}
		]
	}
};
	let { activated = false } = $props();
	const CDN = ["https://cdn.jsdelivr.net/npm/elkjs@0.9.3/lib/elk.bundled.js"];

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const el = document.createElement('script');
			el.src = src;
			el.onload = () => resolve();
			el.onerror = () => reject(new Error('failed to load ' + src));
			document.head.appendChild(el);
		});
	}

	onMount(() => {
		let destroyed = false;
		const run = () => {
			if (destroyed) return;

"use strict";

/* ============================================================
   Foglamp-style codebase scan renderer (standalone replica)
   ============================================================ */

// DATA injected by component scope

const KIND_ORDER = ["entry","cron","agent","model","tool","service","store","external"];
const KIND_STYLES = {
  entry:    { label: "Entry",    hex: "#64748b" },
  cron:     { label: "Cron",     hex: "#f59e0b" },
  agent:    { label: "Agent",    hex: "#f97316" },
  model:    { label: "Model",    hex: "#3b82f6" },
  tool:     { label: "Tool",     hex: "#8b5cf6" },
  service:  { label: "Service",  hex: "#ec4899" },
  store:    { label: "Store",    hex: "#10b981" },
  external: { label: "External", hex: "#0ea5e9" },
};

/* --- inline glyphs (Tabler-ish, filled) --- */
const P = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="${d}"/></svg>`;
const GLYPHS = {
  entry: P("M13 2a1 1 0 0 1 .9 .55l.01 .02l-3.45 8.43h5.54a1 1 0 0 1 .83 1.55l-7 10a1 1 0 0 1 -1.7 -1.05l3.45 -8.5h-5.58a1 1 0 0 1 -.83 -1.55l7 -10a1 1 0 0 1 .83 -1.45z"),
  cron: P("M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0 -20zm1 5a1 1 0 0 1 1 1v3.59l2.7 2.71a1 1 0 1 1 -1.4 1.4l-3 -3a1 1 0 0 1 -.3 -.7v-4a1 1 0 0 1 1 -1z"),
  agent: P("M12 2a8 8 0 0 0 -8 8v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-6a8 8 0 0 0 -8 -8zm-3 8.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0 -3zm6 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0 -3z"),
  model: P("M12 2a1 1 0 0 1 .93 .63l2.1 5.24l5.24 2.1a1 1 0 0 1 0 1.86l-5.24 2.1l-2.1 5.24a1 1 0 0 1 -1.86 0l-2.1 -5.24l-5.24 -2.1a1 1 0 0 1 0 -1.86l5.24 -2.1l2.1 -5.24a1 1 0 0 1 .93 -.63zm7 13a1 1 0 0 1 .93 .63l.6 1.5l1.5 .6a1 1 0 0 1 0 1.86l-1.5 .6l-.6 1.5a1 1 0 0 1 -1.86 0l-.6 -1.5l-1.5 -.6a1 1 0 0 1 0 -1.86l1.5 -.6l.6 -1.5a1 1 0 0 1 .93 -.63z"),
  tool: P("M14.7 6.3a4.5 4.5 0 0 0 -5.9 5.9l-5.5 5.5a2.1 2.1 0 1 0 3 3l5.5 -5.5a4.5 4.5 0 0 0 5.9 -5.9l-2.8 2.8l-2.1 -.7l-.7 -2.1l2.6 -2z"),
  service: P("M12 2a2 2 0 0 1 1 .27l8.49 4.9a2 2 0 0 1 1 1.73v9.8a2 2 0 0 1 -1 1.73l-8.49 4.9a2 2 0 0 1 -2 0l-8.49 -4.9a2 2 0 0 1 -1 -1.73v-9.8a2 2 0 0 1 1 -1.73l8.49 -4.9a2 2 0 0 1 1 -.27z"),
  store: P("M12 3c4.97 0 9 1.34 9 3v12c0 1.66 -4.03 3 -9 3s-9 -1.34 -9 -3v-12c0 -1.66 4.03 -3 9 -3zm7 8.71c-1.7 .9 -4.26 1.29 -7 1.29s-5.3 -.39 -7 -1.29v3.17c.62 1.1 3.4 2.12 7 2.12s6.38 -1.02 7 -2.12v-3.17zm0 -5c-1.7 .9 -4.26 1.29 -7 1.29s-5.3 -.39 -7 -1.29v3.17c.62 1.1 3.4 2.12 7 2.12s6.38 -1.02 7 -2.12v-3.17z"),
  external: P("M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0 -20zm-4.93 6h2.28a18 18 0 0 1 2.28 -5.53a1 1 0 0 1 .74 0a18 18 0 0 1 2.28 5.53h2.28a18 18 0 0 1 0 8h-2.28a18 18 0 0 1 -2.28 5.53a1 1 0 0 1 -.74 0a18 18 0 0 1 -2.28 -5.53h-2.28a18 18 0 0 1 0 -8z"),
  globe: P("M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0 -20zm-1.27 16.4a8.01 8.01 0 0 1 -6.7 -8.4h4.47a16 16 0 0 0 .2 6.9l-1.97 1.5zm6.7 -1.4l-1.4 -1.07a16 16 0 0 0 .23 -5.93h4.47a8.01 8.01 0 0 1 -3.3 7zm-7.43 -13.05a16 16 0 0 0 -1.57 3.88h3.14a16 16 0 0 0 -1.57 -3.88zm-2.07 4.55a16 16 0 0 0 -.2 5.5h4.54a16 16 0 0 0 -.2 -5.5h-4.14zm1.42 7.03a16 16 0 0 0 1.3 2.52a16 16 0 0 0 1.3 -2.52h-2.6z"),
};

function faviconURL(domain) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

/* favicon img with glyph fallback (sibling swap on error) */
function iconHTML(node) {
  const st = KIND_STYLES[node.kind];
  const glyph = `<span style="color:${st.hex};display:${node.domain ? "none" : "flex"};align-items:center">${GLYPHS[node.kind] || GLYPHS.service}</span>`;
  if (node.domain) {
    return `<img src="${faviconURL(node.domain)}" alt="" loading="lazy" style="display:block"
      onerror="var s=this.nextElementSibling;this.remove();if(s){s.style.display='flex'}"/>` + glyph;
  }
  return glyph;
}

/* ============================================================
   1. foldGraph — fold model/tool nodes into callers as embeds
   ============================================================ */
function foldGraph(g) {
  const FOLD = new Set(["model", "tool"]);
  const byId = new Map(g.nodes.map((n) => [n.id, n]));
  const embedMap = new Map();
  for (const e of g.edges) {
    const to = byId.get(e.to), from = byId.get(e.from);
    if (!to || !from || !FOLD.has(to.kind)) continue;
    const arr = embedMap.get(from.id) ?? [];
    if (!arr.some((x) => x.id === to.id))
      arr.push({ id: to.id, label: to.label, kind: to.kind, domain: to.domain });
    embedMap.set(from.id, arr);
  }
  const nodes = g.nodes
    .filter((n) => !FOLD.has(n.kind))
    .map((n) => ({
      ...n,
      embeds: (embedMap.get(n.id) ?? []).sort((a, b) =>
        a.kind === b.kind ? 0 : a.kind === "model" ? -1 : 1),
    }));
  const keep = new Set(nodes.map((n) => n.id));
  return { nodes, edges: g.edges.filter((e) => keep.has(e.from) && keep.has(e.to)) };
}

/* ============================================================
   2. measure node boxes
   ============================================================ */
const measureCtx = document.createElement("canvas").getContext("2d");
function textW(t, font) { measureCtx.font = font; return measureCtx.measureText(t).width; }

function measureNode(n) {
  const headW =
    14 + 28 + 10 +
    Math.max(
      textW(n.label, '500 14px Inter, sans-serif'),
      n.sub ? textW(n.sub, '400 12px Inter, sans-serif') : 0
    ) + 14 + 8;
  let embedW = 0;
  for (const em of n.embeds)
    embedW = Math.max(embedW, 16 + 12 + 6 + textW(em.label, '500 12px Inter, sans-serif') + 16 + 8);
  const width = Math.round(Math.min(Math.max(Math.max(headW, embedW), 156), 264));
  const height = 56 + (n.embeds.length ? 1 + 20 + n.embeds.length * 16 + (n.embeds.length - 1) * 8 : 0);
  return { width, height };
}

/* ============================================================
   3. layout with ELK (groups first, then main graph)
   ============================================================ */
const elk = new ELK();

async function layoutGraph(folded) {
  const nodes = folded.nodes.map((n) => ({ ...n, ...measureNode(n) }));
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // group order = first-seen
  const groupNames = [];
  const groupMembers = new Map();
  for (const n of nodes) {
    if (!n.group) continue;
    if (!groupMembers.has(n.group)) { groupMembers.set(n.group, []); groupNames.push(n.group); }
    groupMembers.get(n.group).push(n);
  }
  const gid = (g) => `group:${groupNames.indexOf(g)}`;

  // layout each group internally (DOWN)
  const groupLayouts = new Map();
  for (const g of groupNames) {
    const members = groupMembers.get(g);
    const mset = new Set(members.map((m) => m.id));
    const internal = folded.edges
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => mset.has(e.from) && mset.has(e.to));
    const res = await elk.layout({
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.edgeRouting": "ORTHOGONAL",
        "elk.layered.spacing.nodeNodeBetweenLayers": "30",
        "elk.spacing.nodeNode": "18",
        "elk.spacing.edgeNode": "14",
        "elk.edgeLabels.inline": "true",
        "elk.spacing.edgeLabel": "4",
        "elk.padding": "[top=46,left=16,bottom=16,right=16]",
      },
      children: members.map((m) => ({ id: m.id, width: m.width, height: m.height })),
      edges: internal.map(({ e, i }) => ({
        id: `e${i}`, sources: [e.from], targets: [e.to],
        ...(e.label ? { labels: [{ id: `el${i}`, text: e.label, width: Math.round(6 * e.label.length) + 14, height: 22 }] } : {}),
      })),
    });
    groupLayouts.set(g, res);
  }

  // main edges: node→node, node→group, group→group (merged by pair)
  const nodeGroup = (id) => byId.get(id)?.group;
  const mainEdgeMap = new Map();
  folded.edges.forEach((e, i) => {
    const gf = nodeGroup(e.from), gt = nodeGroup(e.to);
    if (gf && gf === gt) return;
    const from = gf ? gid(gf) : e.from;
    const to = gt ? gid(gt) : e.to;
    const key = `${from}→${to}`;
    const cur = mainEdgeMap.get(key);
    if (cur) { cur.orig.push(i); if (!cur.label && e.label) cur.label = e.label; }
    else mainEdgeMap.set(key, { from, to, label: e.label, orig: [i] });
  });

  const ungrouped = nodes.filter((n) => !n.group);
  const mainChildren = [
    ...ungrouped.map((n) => ({ id: n.id, width: n.width, height: n.height })),
    ...groupNames.map((g) => {
      const gl = groupLayouts.get(g);
      return { id: gid(g), width: gl.width ?? 0, height: gl.height ?? 0 };
    }),
  ];
  const many = mainChildren.length > 12;
  const mainRes = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.mergeEdges": "true",
      "elk.layered.spacing.nodeNodeBetweenLayers": many ? "56" : "72",
      "elk.spacing.nodeNode": many ? "18" : "26",
      "elk.spacing.edgeNode": many ? "16" : "24",
      "elk.spacing.edgeEdge": "14",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH",
      "elk.edgeLabels.inline": "true",
      "elk.spacing.edgeLabel": "4",
      "elk.padding": "[top=16,left=16,bottom=16,right=16]",
    },
    children: mainChildren,
    edges: [...mainEdgeMap.values()].map((e, i) => ({
      id: `r${i}`, sources: [e.from], targets: [e.to],
      ...(e.label ? { labels: [{ id: `rl${i}`, text: e.label, width: Math.round(6 * e.label.length) + 14, height: 22 }] } : {}),
    })),
  });

  // resolve absolute coordinates
  const abs = new Map();  // node id -> {x, y, width, height}
  const groups = [];
  const mainEdges = [];
  for (const c of mainRes.children ?? []) {
    if (c.id.startsWith("group:")) {
      const g = groupNames[Number(c.id.slice(6))];
      const gl = groupLayouts.get(g);
      groups.push({ name: g, x: c.x ?? 0, y: c.y ?? 0, width: gl.width, height: gl.height });
      for (const gc of gl.children ?? [])
        abs.set(gc.id, { x: (c.x ?? 0) + (gc.x ?? 0), y: (c.y ?? 0) + (gc.y ?? 0), ...pick(byId.get(gc.id)) });
      for (const ge of gl.edges ?? []) {
        const idx = Number(ge.id.slice(1));
        mainEdges.push({ orig: [idx], points: offsetPoints(ge, c.x ?? 0, c.y ?? 0), label: folded.edges[idx].label, labelPos: labelPos(ge, c.x ?? 0, c.y ?? 0), fromNode: byId.get(folded.edges[idx].from) });
      }
    } else {
      abs.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, ...pick(byId.get(c.id)) });
    }
  }
  for (const me of mainRes.edges ?? []) {
    const meta = [...mainEdgeMap.values()][Number(me.id.slice(1))];
    const idxs = meta.orig;
    mainEdges.push({ orig: idxs, points: edgePoints(me), label: meta.label, labelPos: labelPos(me), fromNode: byId.get(folded.edges[idxs[0]].from) });
  }

  return { abs, groups, edges: mainEdges, width: mainRes.width ?? 0, height: mainRes.height ?? 0, byId };
}
const pick = (n) => ({ width: n.width, height: n.height });
function edgePoints(e) {
  const s = e.sections?.[0];
  return s ? [s.startPoint, ...(s.bendPoints ?? []), s.endPoint] : [];
}
const offsetPoints = (e, dx, dy) => edgePoints(e).map((p) => ({ x: p.x + dx, y: p.y + dy }));
function labelPos(e, dx = 0, dy = 0) {
  const l = e.labels?.[0];
  if (l && l.x != null && l.y != null) return { x: l.x + dx + (l.width ?? 0) / 2, y: l.y + dy + (l.height ?? 0) / 2 };
  return undefined;
}

/* ============================================================
   4. render
   ============================================================ */
const stage = document.getElementById("stage");
const nodesEl = document.getElementById("nodes");
const edgesEl = document.getElementById("edges");
const SVGNS = "http://www.w3.org/2000/svg";

function roundedPath(points, r = 10) {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1], p1 = points[i], p2 = points[i + 1];
    const v1 = norm(p1.x - p0.x, p1.y - p0.y), v2 = norm(p2.x - p1.x, p2.y - p1.y);
    const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y), l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = { x: p1.x - v1.x * rr, y: p1.y - v1.y * rr };
    const b = { x: p1.x + v2.x * rr, y: p1.y + v2.y * rr };
    d += ` L ${a.x} ${a.y} Q ${p1.x} ${p1.y} ${b.x} ${b.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };

function arrowPath(points, size = 7) {
  if (points.length < 2) return "";
  const l = points[points.length - 1], a = points[points.length - 2];
  const n = Math.atan2(l.y - a.y, l.x - a.x);
  const r1x = l.x - size * Math.cos(n - 0.46), r1y = l.y - size * Math.sin(n - 0.46);
  const r2x = l.x - size * Math.cos(n + 0.46), r2y = l.y - size * Math.sin(n + 0.46);
  return `M ${r1x} ${r1y} L ${l.x} ${l.y} L ${r2x} ${r2y}`;
}

function midLongest(points) {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];
  let best = 0, bestLen = -1;
  for (let i = 0; i < points.length - 1; i++) {
    const l = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    if (l > bestLen) { bestLen = l; best = i; }
  }
  return { x: (points[best].x + points[best + 1].x) / 2, y: (points[best].y + points[best + 1].y) / 2 };
}

let LAYOUT = null;
const nodeEls = new Map();
const edgeEls = []; // {path, flow, labelEl, orig:Set}

async function render() {
  const folded = foldGraph(DATA.graph);
  LAYOUT = await layoutGraph(folded);
  const { abs, groups, edges, width, height, byId } = LAYOUT;

  edgesEl.setAttribute("width", width + 40);
  edgesEl.setAttribute("height", height + 40);

  // group boxes
  for (const g of groups) {
    const div = document.createElement("div");
    div.className = "group-box";
    div.style.cssText = `left:${g.x}px;top:${g.y}px;width:${g.width}px;height:${g.height}px;animation-delay:0.15s`;
    div.innerHTML = `<span class="group-label">${escapeHTML(g.name)}</span>`;
    nodesEl.appendChild(div);
  }

  // edges
  edges.forEach((e, i) => {
    const color = KIND_STYLES[e.fromNode?.kind ?? "entry"].hex;
    const d = roundedPath(e.points);
    const path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "edge-path");
    path.setAttribute("stroke", color);
    path.style.animation = `fade-in 0.4s ease ${0.3 + i * 0.03}s both`;
    edgesEl.appendChild(path);

    const arrow = document.createElementNS(SVGNS, "path");
    arrow.setAttribute("d", arrowPath(e.points));
    arrow.setAttribute("class", "edge-path");
    arrow.setAttribute("stroke", color);
    arrow.style.animation = `fade-in 0.4s ease ${0.5 + i * 0.03}s both`;
    edgesEl.appendChild(arrow);

    const flow = document.createElementNS(SVGNS, "path");
    flow.setAttribute("d", d);
    flow.setAttribute("class", "edge-flow");
    flow.setAttribute("stroke", color);
    flow.style.animationDelay = `${(i * 0.17) % 1.1}s`;
    edgesEl.appendChild(flow);

    // label pill
    let labelEl = null;
    const text = e.label;
    if (text) {
      const pos = e.labelPos ?? midLongest(e.points);
      if (pos) {
        labelEl = document.createElement("div");
        labelEl.className = "edge-label";
        labelEl.textContent = text;
        labelEl.style.left = pos.x + "px";
        labelEl.style.top = pos.y + "px";
        nodesEl.appendChild(labelEl);
      }
    }
    // kind tag (hidden until traced)
    let kindEl = null;
    const kinds = [...new Set(e.orig.map((oi) => folded.edges[oi].kind).filter(Boolean))];
    if (kinds.length) {
      const pos = e.label && e.labelPos ? e.labelPos : (midLongest(e.points) ?? null);
      if (pos) {
        kindEl = document.createElement("div");
        kindEl.className = "edge-label kind-tag";
        kindEl.textContent = kinds.join(" · ");
        kindEl.style.left = pos.x + "px";
        kindEl.style.top = (pos.y + (e.label ? 22 : 0)) + "px";
        kindEl.style.opacity = "0";
        nodesEl.appendChild(kindEl);
      }
    }
    edgeEls.push({ path, arrow, flow, labelEl, kindEl, orig: new Set(e.orig) });
  });

  // nodes
  const maxX = Math.max(...[...abs.values()].map((v) => v.x), 1);
  for (const n of folded.nodes) {
    const a = abs.get(n.id);
    if (!a) continue;
    const st = KIND_STYLES[n.kind];
    const div = document.createElement("div");
    div.className = "node" + (n.kind === "agent" ? " agent" : "");
    div.style.cssText = `left:${a.x}px;top:${a.y}px;width:${a.width}px;height:${a.height}px;animation-delay:${(a.x / maxX) * 0.6}s`;
    div.dataset.id = n.id;
    div.innerHTML = `
      <div class="node-head">
        <span class="node-ic" style="background:${st.hex}1a">${iconHTML(n)}</span>
        <span class="node-txt">
          <span class="node-label">${escapeHTML(n.label)}</span>
          ${n.sub ? `<span class="node-sub">${escapeHTML(n.sub)}</span>` : ""}
        </span>
      </div>
      ${n.embeds.length ? `<div class="node-embeds">${n.embeds.map((em) => `
        <span class="embed">${iconHTML(em)}<span>${escapeHTML(em.label)}</span></span>`).join("")}
      </div>` : ""}`;
    nodesEl.appendChild(div);
    nodeEls.set(n.id, div);

    div.addEventListener("pointerenter", () => trace(n.id));
    div.addEventListener("pointerleave", () => { if (!selected) untrace(); });
    div.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (selected === n.id) { clearSelection(); return; }
      selected = n.id;
      trace(n.id);
      document.querySelectorAll(".node.selected").forEach((x) => x.classList.remove("selected"));
      div.classList.add("selected");
      showPopover(n, a);
    });
  }

  fitView();
  document.getElementById("loading").style.opacity = "0";
  setTimeout(() => document.getElementById("loading").remove(), 450);
}

/* ---------- flow tracing ---------- */
let selected = null;
function trace(id) {
  const adjEdges = new Set();
  const adjNodes = new Set([id]);
  DATA.graph.edges.forEach((e, i) => {
    if (e.from === id || e.to === id) {
      adjEdges.add(i);
      adjNodes.add(e.from); adjNodes.add(e.to);
    }
  });
  // folded edges reference original indices — map via LAYOUT edge orig sets
  nodeEls.forEach((el, nid) => el.classList.toggle("dim", !adjNodes.has(nid)));
  edgeEls.forEach((ee) => {
    const hot = ee.orig.size && [...ee.orig].some((oi) => {
      const fe = foldRef.edges[oi];
      return fe && (fe.from === id || fe.to === id);
    });
    ee.path.classList.toggle("dim", !hot);
    ee.arrow.classList.toggle("dim", !hot);
    ee.path.classList.toggle("hot", hot);
    ee.flow.style.opacity = hot ? "1" : "0.06";
    if (ee.labelEl) ee.labelEl.classList.toggle("dim", !hot);
    if (ee.kindEl) ee.kindEl.style.opacity = hot ? "1" : "0";
  });
}
function untrace() {
  nodeEls.forEach((el) => el.classList.remove("dim"));
  edgeEls.forEach((ee) => {
    ee.path.classList.remove("dim", "hot");
    ee.arrow.classList.remove("dim");
    ee.flow.style.opacity = "";
    if (ee.labelEl) ee.labelEl.classList.remove("dim");
    if (ee.kindEl) ee.kindEl.style.opacity = "0";
  });
}

/* ---------- popover ---------- */
const popover = document.getElementById("popover");
function showPopover(n, a) {
  const st = KIND_STYLES[n.kind];
  popover.innerHTML = `
    <div class="p-kind"><span style="color:${st.hex};display:flex">${GLYPHS[n.kind]}</span>${st.label}</div>
    <div class="p-label">${escapeHTML(n.label)}</div>
    ${(n.detail ?? n.sub) ? `<p class="p-detail">${escapeHTML(n.detail ?? n.sub)}</p>` : ""}
    ${n.sourceRef ? `<p class="p-ref">${escapeHTML(n.sourceRef)}</p>` : ""}`;
  // screen position of node bottom-left
  const pt = stageToScreen(a.x, a.y + a.height + 10);
  popover.classList.add("show");
  const r = popover.getBoundingClientRect();
  let x = Math.min(Math.max(12, pt.x), innerWidth - r.width - 12);
  let y = Math.min(Math.max(12, pt.y), innerHeight - r.height - 12);
  popover.style.left = x + "px";
  popover.style.top = y + "px";
}
function clearSelection() {
  selected = null;
  popover.classList.remove("show");
  document.querySelectorAll(".node.selected").forEach((x) => x.classList.remove("selected"));
  untrace();
}

/* ---------- pan & zoom ---------- */
const viewport = document.getElementById("viewport");
const view = { x: 0, y: 0, k: 1 };
function applyView() {
  stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
  document.getElementById("zoom-val").textContent = Math.round(view.k * 100) + "%";
}
function stageToScreen(sx, sy) { return { x: view.x + sx * view.k, y: view.y + sy * view.k }; }

function fitView() {
  if (!LAYOUT) return;
  const pad = 60;
  const topReserve = 130;
  const aw = viewport.clientWidth - pad * 2, ah = viewport.clientHeight - topReserve - pad;
  const k = Math.min(Math.max(Math.min(aw / LAYOUT.width, ah / LAYOUT.height), 0.15), 1.6);
  view.k = k;
  view.x = (viewport.clientWidth - LAYOUT.width * k) / 2;
  view.y = topReserve + (ah - LAYOUT.height * k) / 2;
  applyView();
}
document.getElementById("zoom-fit").addEventListener("click", fitView);
document.getElementById("zoom-in").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1.25));
document.getElementById("zoom-out").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 0.8));
function zoomAt(cx, cy, factor) {
  const k2 = Math.min(Math.max(view.k * factor, 0.1), 2.5);
  view.x = cx - ((cx - view.x) / view.k) * k2;
  view.y = cy - ((cy - view.y) / view.k) * k2;
  view.k = k2;
  applyView();
}
viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const __rect = viewport.getBoundingClientRect(); zoomAt(e.clientX - __rect.left, e.clientY - __rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

let drag = null;
viewport.addEventListener("pointerdown", (e) => {
  drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  viewport.classList.add("dragging");
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  view.x = drag.vx + dx; view.y = drag.vy + dy;
  applyView();
});
addEventListener("pointerup", () => {
  if (drag && !drag.moved) clearSelection();
  drag = null;
  viewport.classList.remove("dragging");
});
addEventListener("resize", () => applyView());

/* ---------- legend ---------- */
const LEGEND = [
  { label: "Triggers", kinds: ["entry", "cron"], color: "#f59e0b", glyph: GLYPHS.entry },
  { label: "Agents", kinds: ["agent"], color: "#f97316", glyph: GLYPHS.agent },
  { label: "Services", kinds: ["service"], color: "#ec4899", glyph: GLYPHS.service },
  { label: "Stores", kinds: ["store"], color: "#10b981", glyph: GLYPHS.store },
  { label: "External", kinds: ["external"], color: "#0ea5e9", glyph: GLYPHS.external },
];
function buildLegend() {
  const el = document.getElementById("legend");
  const present = new Set(DATA.graph.nodes.map((n) => n.kind));
  for (const item of LEGEND) {
    if (!item.kinds.some((k) => present.has(k))) continue;
    const div = document.createElement("div");
    div.className = "legend-item";
    div.innerHTML = `<span style="color:${item.color};display:flex">${item.glyph}</span>${item.label}`;
    div.addEventListener("pointerenter", () => {
      document.querySelectorAll(".legend-item").forEach((x) => x.classList.remove("active"));
      div.classList.add("active");
      nodeEls.forEach((nEl, nid) => {
        const kind = foldRef.byId.get(nid)?.kind;
        nEl.classList.toggle("dim", !item.kinds.includes(kind));
      });
      edgeEls.forEach((ee) => { ee.path.classList.add("dim"); ee.arrow.classList.add("dim"); ee.flow.style.opacity = "0.05"; if (ee.labelEl) ee.labelEl.classList.add("dim"); });
    });
    div.addEventListener("pointerleave", () => {
      div.classList.remove("active");
      if (!selected) untrace(); else trace(selected);
    });
    el.appendChild(div);
  }
}

/* ---------- header & tops ---------- */
function buildHeader() {
  const p = DATA.project;
  document.getElementById("p-name").textContent = p.name;
  document.getElementById("p-tagline").textContent = p.tagline ?? "";
  document.getElementById("p-date").textContent = p.date ?? "";
  document.title = `${p.name} — Codebase Scan`;
  const bi = document.getElementById("brand-icon");
  if (p.iconDomain) {
    bi.innerHTML = `<img src="${faviconURL(p.iconDomain)}" alt="" onerror="this.remove()"/>`;
  } else {
    bi.innerHTML = `<span style="color:#f97316;width:22px;height:22px;display:flex">${GLYPHS.sparkleBig ?? GLYPHS.model}</span>`;
  }
  const stats = document.getElementById("stats");
  const defs = [
    ["agents", "Agents", "#f97316"], ["models", "Models", "#3b82f6"],
    ["tools", "Tools", "#8b5cf6"], ["integrations", "Integrations", "#0ea5e9"],
  ];
  for (const [key, label, color] of defs) {
    if (!DATA.stats[key]) continue;
    const d = document.createElement("div");
    d.className = "stat";
    d.innerHTML = `<b style="color:${color}">${DATA.stats[key]}</b><span>${label}</span>`;
    stats.appendChild(d);
  }
}
function buildTops() {
  const wrap = document.getElementById("tops");
  const rows = [
    ["Top models", DATA.topModels, "model"],
    ["Top tools", DATA.topTools, "tool"],
    ["Integrations", DATA.topIntegrations, "external"],
  ];
  for (const [cap, arr, kind] of rows) {
    if (!arr?.length) continue;
    const row = document.createElement("div");
    row.className = "top-row";
    const capEl = document.createElement("span");
    capEl.className = "cap";
    capEl.textContent = cap;
    row.appendChild(capEl);
    for (const t of arr) {
      const chip = document.createElement("span");
      chip.className = "chip";
      const glyphSpan = document.createElement("span");
      glyphSpan.className = "chip-ic";
      glyphSpan.style.color = KIND_STYLES[kind].hex;
      glyphSpan.innerHTML = GLYPHS[kind];
      if (t.domain) {
        const img = document.createElement("img");
        img.src = faviconURL(t.domain);
        img.alt = "";
        img.loading = "lazy";
        img.onerror = () => img.replaceWith(glyphSpan);
        chip.appendChild(img);
      } else {
        chip.appendChild(glyphSpan);
      }
      chip.appendChild(document.createTextNode(t.label));
      row.appendChild(chip);
    }
    wrap.appendChild(row);
  }
}

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- boot ---------- */
let foldRef = null;
(async function boot() {
  buildHeader();
  buildTops();
  foldRef = foldGraph(DATA.graph);
  foldRef.byId = new Map(foldRef.nodes.map((n) => [n.id, n]));
  buildLegend();
  try {
    // wait for Inter so node text measures true widths
    try {
      await Promise.race([
        Promise.all([
          document.fonts.load('500 14px Inter'),
          document.fonts.load('400 12px Inter'),
          document.fonts.load('600 12px Inter'),
        ]),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    } catch {}
    await render();
  } catch (err) {
    const l = document.getElementById("loading");
    if (l) l.innerHTML = `<div style="max-width:420px;text-align:center;line-height:1.6">⚠️ Could not render the graph.<br/><span style="font-size:12px">${escapeHTML(err.message)}<br/>An internet connection is required for the layout engine (elkjs CDN).</span></div>`;
    console.error(err);
  }
})();

		};
		if (CDN.length) Promise.all(CDN.map(loadScript)).then(run).catch(() => {});
		else run();
		return () => { destroyed = true; };
	});
</script>

{#if activated}
<div class="flowgraph">
<div id="grid-bg"></div>
<div id="glow"></div>

<header>
  <div class="brand">
    <div class="brand-icon" id="brand-icon"></div>
    <div>
      <!-- svelte-ignore a11y_missing_content -->
<h1 id="p-name"></h1>
      <p><span id="p-tagline"></span><span class="date" id="p-date"></span></p>
    </div>
  </div>
  <div class="stats" id="stats"></div>
</header>

<div id="tops"></div>

<div id="viewport">
  <div id="stage">
    <svg id="edges"></svg>
    <div id="nodes"></div>
  </div>
</div>

<div id="legend"></div>
<div id="controls">
  <button id="zoom-out" title="Zoom out">−</button>
  <span class="zoom-val" id="zoom-val">100%</span>
  <button id="zoom-in" title="Zoom in">+</button>
  <button id="zoom-fit" title="Fit to view">⤢</button>
</div>

<div id="popover"></div>
<div id="loading"><div class="pulse"></div>rendering scan…</div>
</div>
{/if}