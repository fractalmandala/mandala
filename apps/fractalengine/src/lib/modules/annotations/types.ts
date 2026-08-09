import type { AgentationAnnotationSnapshot } from 'fractal-agentation';

export interface SharedAnnotation {
	id: string;
	author: string;
	snapshot: AgentationAnnotationSnapshot;
	createdAt: string;
	updatedAt: string;
}

export type SharedAnnotationInput = Omit<SharedAnnotation, 'createdAt' | 'updatedAt'>;
