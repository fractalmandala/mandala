/**
 * Module-flow scan contract (v1) — the JSON shape produced by the
 * "module flow scan" agent prompt and rendered by AppHealthScan.svelte.
 */

export type NodeKind =
	| 'layout'
	| 'component'
	| 'state'
	| 'command'
	| 'ipc'
	| 'function'
	| 'shared'
	| 'external';

export type GroupId = 'layout' | 'components' | 'state' | 'commands' | 'ipc' | 'shared' | 'external';

export type EdgeKind =
	| 'renders'
	| 'imports'
	| 'reads'
	| 'writes'
	| 'calls'
	| 'commands'
	| 'dispatches'
	| 'listens'
	| 'ipc'
	| 'navigates';

export type Severity = 'info' | 'warn' | 'alert';

export interface ScanNode {
	id: string;
	label: string;
	kind: NodeKind;
	group: GroupId;
	path?: string;
	loc?: number;
	summary?: string;
	tags?: string[];
}

export interface ScanEdge {
	from: string;
	to: string;
	kind: EdgeKind;
	label?: string;
}

export interface ScanFlow {
	id: string;
	name: string;
	trigger: string;
	steps: string[];
	summary?: string;
}

export interface ScanNote {
	title: string;
	body: string;
	severity: Severity;
	path?: string;
}

export interface ScanGroup {
	id: GroupId;
	label: string;
}

export interface ModuleFlowScan {
	version: number;
	scan: 'module-flow';
	project: { name: string; slug: string; date: string };
	module: {
		id: string;
		name: string;
		entryLayout: string;
		root: string;
		summary?: string;
		externalModules?: string[];
	};
	stats: {
		nodes: number;
		edges: number;
		components: number;
		stateFiles: number;
		commands: number;
		ipcCalls: number;
		flows: number;
	};
	groups: ScanGroup[];
	nodes: ScanNode[];
	edges: ScanEdge[];
	flows: ScanFlow[];
	notes: ScanNote[];
}
