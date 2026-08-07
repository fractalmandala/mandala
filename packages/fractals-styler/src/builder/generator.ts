import type { BuilderNode } from './types.js';

export function generateSass(node: BuilderNode, depth = 0): string {
  const indent = '\t'.repeat(depth);
  if (node.primitive === 'button') {
    const clsMap: Record<string, string> = {
      default: '.button',
      primary: '.button-primary',
      quiet: '.button-quiet',
      icon: '.icon-button'
    };
    return `${indent}${clsMap[node.buttonVariant || 'default'] || '.button'}\n`;
  }
  let out = `${indent}.${node.name.toLowerCase()}\n`;
  out += `${indent}\tdisplay: ${node.display}\n`;
  if (node.display === 'flex' || node.display === 'inline-flex') {
    out += `${indent}\tflex-direction: ${node.direction}\n`;
  }
  if (node.alignItems && node.alignItems !== 'stretch') {
    out += `${indent}\talign-items: ${node.alignItems}\n`;
  }
  if (node.justifyContent && node.justifyContent !== 'flex-start') {
    out += `${indent}\tjustify-content: ${node.justifyContent}\n`;
  }
  if (node.display === 'grid') {
    out += `${indent}\tgrid-template-columns: repeat(${node.gridCols}, minmax(0, 1fr))\n`;
  }

  if (node.colSpan && node.colSpan > 1) out += `${indent}\tgrid-column: span ${node.colSpan}\n`;
  if (node.rowSpan && node.rowSpan > 1) out += `${indent}\tgrid-row: span ${node.rowSpan}\n`;

  if (node.width === '100%') out += `${indent}\twidth: 100%\n`;
  else if (node.width === '100vw') out += `${indent}\twidth: 100vw\n`;
  else if (node.width === 'fill') out += `${indent}\tflex-grow: 1\n`;
  else if (node.width === 'custom' && node.widthVal) {
    const val = node.widthVal.includes('px') || node.widthVal.includes('rem') ? node.widthVal : `${node.widthVal}px`;
    out += `${indent}\twidth: ${val}\n`;
  } else if (node.width === 'minmax') {
    if (node.minWVal) {
      const minV = node.minWVal.includes('px') || node.minWVal.includes('rem') ? node.minWVal : `${node.minWVal}px`;
      out += `${indent}\tmin-width: ${minV}\n`;
    }
    if (node.maxWVal) {
      const maxV = node.maxWVal.includes('px') || node.maxWVal.includes('rem') ? node.maxWVal : `${node.maxWVal}px`;
      out += `${indent}\tmax-width: ${maxV}\n`;
    }
  }

  if (node.height === '100%') out += `${indent}\theight: 100%\n`;
  else if (node.height === '100vh') out += `${indent}\theight: 100vh\n`;
  else if (node.height === 'fill') out += `${indent}\tflex-grow: 1\n`;
  else if (node.height === 'custom' && node.heightVal) {
    const val = node.heightVal.includes('px') || node.heightVal.includes('rem') ? node.heightVal : `${node.heightVal}px`;
    out += `${indent}\theight: ${val}\n`;
  } else if (node.height === 'minmax') {
    if (node.minHVal) {
      const minV = node.minHVal.includes('px') || node.minHVal.includes('rem') ? node.minHVal : `${node.minHVal}px`;
      out += `${indent}\tmin-height: ${minV}\n`;
    }
    if (node.maxHVal) {
      const maxV = node.maxHVal.includes('px') || node.maxHVal.includes('rem') ? node.maxHVal : `${node.maxHVal}px`;
      out += `${indent}\tmax-height: ${maxV}\n`;
    }
  }

  if (node.padding > 0) out += `${indent}\tpadding: ${node.padding}px\n`;
  if (node.gap > 0) out += `${indent}\tgap: ${node.gap}px\n`;
  if (node.marginBot > 0) out += `${indent}\tmargin-bottom: ${node.marginBot}px\n`;
  if (node.surface === 'custom') out += `${indent}\tbackground-color: ${node.customBg}\n`;
  else if (node.surface !== 'none') out += `${indent}\tbackground-color: var(--bg-${node.surface})\n`;

  if (node.borderWidth && node.borderWidth !== '0') out += `${indent}\tborder-width: ${node.borderWidth}\n`;
  if (node.borderColor) out += `${indent}\tborder-color: ${node.borderColor}\n`;
  if (node.textColor) out += `${indent}\tcolor: ${node.textColor}\n`;
  if (node.textAlign && node.textAlign !== 'left') out += `${indent}\ttext-align: ${node.textAlign}\n`;

  for (const child of node.children) {
    out += '\n' + generateSass(child, depth + 1);
  }
  return out;
}

export function generateHtml(node: BuilderNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  if (node.primitive === 'button') {
    const clsMap: Record<string, string> = {
      default: 'button',
      primary: 'button-primary',
      quiet: 'button-quiet',
      icon: 'icon-button'
    };
    const cls = clsMap[node.buttonVariant || 'default'] || 'button';
    return `${indent}<button class="${cls}">${node.content || 'Button'}</button>\n`;
  }

  const classes: string[] = [];
  if (node.display === 'flex') {
    classes.push(node.direction === 'row' ? 'row' : 'box');
  } else if (node.display === 'grid') {
    classes.push('grid', `grid-cols-${node.gridCols}`);
  } else {
    classes.push(node.display);
  }

  if (node.colSpan && node.colSpan > 1) classes.push(`col-span-${node.colSpan}`);
  if (node.rowSpan && node.rowSpan > 1) classes.push(`row-span-${node.rowSpan}`);

  if (node.smDirection && node.smDirection !== 'default') classes.push(`sm:${node.smDirection}`);
  if (node.width === '100%') classes.push('w100');
  else if (node.width === '100vw') classes.push('w100vw');
  else if (node.width === 'fill') classes.push('grow');

  if (node.height === '100%') classes.push('h100');
  else if (node.height === '100vh') classes.push('h100vh');
  else if (node.height === 'fill') classes.push('grow');

  if (node.padding > 0) classes.push(`pad${node.padding}`);
  if (node.gap > 0) classes.push(`gap${node.gap}`);
  if (node.marginBot > 0) classes.push(`marginbot${node.marginBot}`);
  if (node.radius && node.radius !== 'radius0') classes.push(node.radius);
  if (node.surface !== 'none' && node.surface !== 'custom') classes.push(node.surface);
  if (node.fontSize) classes.push(node.fontSize);
  if (node.shadow && node.shadow !== 'none') classes.push(node.shadow);

  let out = `${indent}<div class="${classes.join(' ')}"${node.surface === 'custom' ? ` style="background:${node.customBg}"` : ''}>\n`;
  if (node.content) {
    out += `${indent}  <span>${node.content}</span>\n`;
  }
  for (const child of node.children) {
    out += generateHtml(child, depth + 1);
  }
  out += `${indent}</div>\n`;
  return out;
}

export function generateSvelteComponent(targetNode: BuilderNode): { svelteCode: string; sassCode: string } {
  const compName = targetNode.name || 'LayoutComponent';
  const htmlCode = generateHtml(targetNode, 0).trim();
  const sassCode = generateSass(targetNode, 0).trim();

  const svelteCode = `<script lang="ts">
  // Svelte 5 Runes Component generated by fractals-styler
  let { title = '${compName}' } = $props();
</script>

<!-- Markup -->
${htmlCode}
`;

  return { svelteCode, sassCode };
}
