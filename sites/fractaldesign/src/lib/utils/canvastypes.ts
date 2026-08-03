export type CanvasItem = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	label: string
}

export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star';

export type DesignBlock = {
	id: string;
	type: 'text' | 'image' | 'frame' | 'container' | 'card' | ShapeType;
	name: string;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
	props: Record<string, unknown>;
	style: Record<string, string | number>;
	parentId: string | null;
	children: string[];
	locked?: boolean;
	hidden?: boolean;
}