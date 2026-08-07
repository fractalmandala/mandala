import type { BuilderNode, PrimitiveType } from './types.js';

let idCounter = 1;

export function resetIdCounter(val = 1) {
  idCounter = val;
}

export function createNode(type: PrimitiveType | string, options: Partial<BuilderNode> = {}): BuilderNode {
  const primitive = (options.primitive || (type === 'button' ? 'button' : 'box')) as PrimitiveType;
  const isGridType = type === 'grid';
  
  // Auto populate items inside grid if grid created with no explicit children
  const defaultChildren = options.children || (isGridType ? [
    createNode('box', { name: 'GridItem_1', surface: 'panel', content: 'Grid Item 1' }),
    createNode('box', { name: 'GridItem_2', surface: 'panel', content: 'Grid Item 2' }),
    createNode('box', { name: 'GridItem_3', surface: 'panel', content: 'Grid Item 3' })
  ] : []);

  return {
    id: 'node_' + (idCounter++),
    name: options.name || type,
    display: options.display || (isGridType ? 'grid' : 'flex'),
    direction: options.direction || (type === 'row' ? 'row' : 'column'),
    alignItems: options.alignItems || 'stretch',
    justifyContent: options.justifyContent || 'flex-start',
    width: options.width || 'auto',
    widthVal: options.widthVal || '',
    minWVal: options.minWVal || '',
    maxWVal: options.maxWVal || '',
    height: options.height || 'auto',
    heightVal: options.heightVal || '',
    minHVal: options.minHVal || '',
    maxHVal: options.maxHVal || '',
    marginBot: options.marginBot !== undefined ? options.marginBot : 0,
    primitive,
    buttonVariant: options.buttonVariant || 'default',
    padding: options.padding !== undefined ? options.padding : 0,
    paddingTop: options.paddingTop || 0,
    paddingRight: options.paddingRight || 0,
    paddingBottom: options.paddingBottom || 0,
    paddingLeft: options.paddingLeft || 0,
    isPerSidePadding: options.isPerSidePadding || false,
    gap: options.gap !== undefined ? options.gap : 0,
    gridCols: options.gridCols || 3,
    colSpan: options.colSpan || 1,
    rowSpan: options.rowSpan || 1,
    radius: options.radius || 'radius0',
    radiusTL: options.radiusTL || 0,
    radiusTR: options.radiusTR || 0,
    radiusBR: options.radiusBR || 0,
    radiusBL: options.radiusBL || 0,
    isPerCornerRadius: options.isPerCornerRadius || false,
    surface: options.surface || 'surface',
    customBg: options.customBg || '#0f172a',
    backgroundColor: options.backgroundColor || '#0f172a',
    borderColor: options.borderColor || '#334155',
    borderWidth: options.borderWidth || '0',
    borderTopWidth: options.borderTopWidth || '0',
    borderRightWidth: options.borderRightWidth || '0',
    borderBottomWidth: options.borderBottomWidth || '0',
    borderLeftWidth: options.borderLeftWidth || '0',
    isPerSideBorder: options.isPerSideBorder || false,
    textColor: options.textColor || '#cbd5e1',
    fontSize: options.fontSize || 'font14',
    textAlign: options.textAlign || 'left',
    shadow: options.shadow || 'none',
    smDirection: options.smDirection || 'default',
    children: defaultChildren,
    content: options.content || null
  };
}

export function findNode(node: BuilderNode, id: string): BuilderNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function findParent(node: BuilderNode, id: string): { parent: BuilderNode; index: number } | null {
  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i].id === id) return { parent: node, index: i };
    const res = findParent(node.children[i], id);
    if (res) return res;
  }
  return null;
}

export function getNodePath(node: BuilderNode, id: string, path: BuilderNode[] = []): BuilderNode[] | null {
  const currentPath = [...path, node];
  if (node.id === id) return currentPath;
  for (const child of node.children) {
    const res = getNodePath(child, id, currentPath);
    if (res) return res;
  }
  return null;
}

export function getLayoutTemplate(key: string): BuilderNode {
  switch (key) {
    case 'pancake':
      return createNode('box', {
        name: 'PancakeStack',
        height: '100vh',
        children: [
          createNode('box', { name: 'Header', height: 'custom', heightVal: '60', surface: 'panel', content: 'Header' }),
          createNode('box', { name: 'MainContent', height: 'fill', surface: 'surface', content: 'Main Content Area' }),
          createNode('box', { name: 'Footer', height: 'custom', heightVal: '50', surface: 'panel', content: 'Footer' })
        ]
      });

    case 'sidebar':
      return createNode('row', {
        name: 'SidebarLayout',
        direction: 'row',
        height: '100vh',
        children: [
          createNode('box', { name: 'Sidebar', width: 'custom', widthVal: '240', surface: 'panel', content: 'Sidebar Nav' }),
          createNode('box', { name: 'MainContent', width: 'fill', surface: 'surface', content: 'Main Content' })
        ]
      });

    case 'html5':
      return createNode('box', {
        name: 'HTML5Layout',
        height: '100vh',
        children: [
          createNode('box', { name: 'Header', height: 'custom', heightVal: '60', surface: 'panel', content: 'Header' }),
          createNode('row', {
            name: 'BodyRow',
            direction: 'row',
            height: 'fill',
            children: [
              createNode('box', { name: 'Sidebar', width: 'custom', widthVal: '220', surface: 'panel', content: 'Sidebar' }),
              createNode('box', { name: 'Article', width: 'fill', surface: 'surface', content: 'Main Article' })
            ]
          }),
          createNode('box', { name: 'Footer', height: 'custom', heightVal: '50', surface: 'panel', content: 'Footer' })
        ]
      });

    case 'col12':
      return createNode('grid', {
        name: 'Grid12Col',
        display: 'grid',
        gridCols: 12,
        gap: 4,
        children: Array.from({ length: 12 }, (_, i) =>
          createNode('box', { name: `Col_${i + 1}`, surface: 'panel', content: `${i + 1}` })
        )
      });

    case 'collage':
      return createNode('grid', {
        name: 'CollageGrid',
        display: 'grid',
        gridCols: 4,
        gap: 8,
        children: [
          createNode('box', { name: 'HeroTile', height: 'custom', heightVal: '160', colSpan: 2, rowSpan: 2, surface: 'panel', content: 'Hero Tile' }),
          createNode('box', { name: 'Tile1', surface: 'panel', content: 'Tile 1' }),
          createNode('box', { name: 'Tile2', surface: 'panel', content: 'Tile 2' }),
          createNode('box', { name: 'Tile3', surface: 'panel', content: 'Tile 3' }),
          createNode('box', { name: 'Tile4', surface: 'panel', content: 'Tile 4' })
        ]
      });

    case 'grid3x3':
      return createNode('grid', {
        name: 'Grid3x3',
        display: 'grid',
        gridCols: 3,
        gap: 8,
        children: Array.from({ length: 9 }, (_, i) =>
          createNode('box', { name: `Cell_${i + 1}`, height: 'custom', heightVal: '80', surface: 'panel', content: `Cell ${i + 1}` })
        )
      });

    default:
      return getLayoutTemplate('pancake');
  }
}
