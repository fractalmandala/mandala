export type AiSidebarTab = 'home' | 'code';
export type AiWorkTab = 'files' | 'terminal' | 'browser';

export interface AiSessionMeta {
	id: string;            // kernel session id (ADR-011)
	title: string;         // display title (kernel-provided or user-renamed)
	kind: AiSidebarTab;    // which sidebar tab lists it
	pinned: boolean;
	lastOpenedAt: number;  // ms epoch, drives Recents ordering
}