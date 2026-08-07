export type DisplayMode = 'flex' | 'grid' | 'block' | 'inline-flex';
export type FlexDirection = 'column' | 'row';
export type AlignItems = 'stretch' | 'flex-start' | 'center' | 'flex-end';
export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
export type WidthMode = 'auto' | '100%' | '100vw' | 'fill' | 'custom' | 'minmax';
export type HeightMode = 'auto' | '100%' | '100vh' | 'fill' | 'custom' | 'minmax';
export type SurfaceToken = 'surface' | 'panel' | 'raised' | 'subtle' | 'none' | 'custom';
export type RadiusToken = 'radius0' | 'radius2' | 'radius4' | 'radius8' | 'radius12' | 'radius16' | 'radiusfull';
export type ButtonVariant = 'default' | 'primary' | 'quiet' | 'icon';
export type PrimitiveType = 'box' | 'row' | 'grid' | 'surface' | 'button';

export interface BuilderNode {
  id: string;
  name: string;
  display: DisplayMode;
  direction: FlexDirection;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  width: WidthMode;
  widthVal?: string;
  minWVal?: string;
  maxWVal?: string;
  height: HeightMode;
  heightVal?: string;
  minHVal?: string;
  maxHVal?: string;
  marginBot: number;
  primitive: PrimitiveType;
  buttonVariant?: ButtonVariant;
  padding: number;
  gap: number;
  gridCols?: number;
  colSpan?: number;
  rowSpan?: number;
  radius: RadiusToken;
  surface: SurfaceToken;
  customBg?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: string;
  textAlign?: string;
  borderWidth?: string;
  shadow?: string;
  smDirection?: string;
  children: BuilderNode[];
  content?: string | null;
}

export interface SavedComponent {
  name: string;
  node: BuilderNode;
}

export interface SaveComponentPayload {
  targetPath: string; // e.g. "sites/fractalmandala/src/lib/components"
  componentName: string; // e.g. "HeroBanner"
  node: BuilderNode;
}
