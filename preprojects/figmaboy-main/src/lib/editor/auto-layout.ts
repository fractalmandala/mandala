import type { ContainerNode, DesignNode, PageDocument } from "$lib/domain";

export interface LayoutChild {
  node: DesignNode;
  index: number;
}

export interface LayoutResult {
  /** The computed children with their new positions */
  children: { id: string; x: number; y: number; width: number; height: number }[];
  /** The container's new dimensions (if hug sizing) */
  containerWidth?: number;
  containerHeight?: number;
}

/**
 * Compute auto-layout positions for a container's children.
 * Does NOT mutate the document — returns computed positions.
 */
export function computeAutoLayout(
  container: ContainerNode,
  document: PageDocument,
): LayoutResult {
  const { layoutMode, primaryAxisSizing, counterAxisSizing, paddingTop, paddingRight, paddingBottom, paddingLeft, itemSpacing, primaryAxisAlignItems, counterAxisAlignItems } = container;

  // Collect children that are not absolutely positioned
  const children: LayoutChild[] = [];
  for (let i = 0; i < container.childIds.length; i++) {
    const node = document.nodes[container.childIds[i]];
    if (node && node.layoutPositioning !== "absolute") {
      children.push({ node, index: i });
    }
  }

  const result: LayoutResult = { children: [] };

  if (children.length === 0) return result;

  const isHorizontal = layoutMode === "horizontal";

  // Available space inside the container (after padding)
  const contentW = container.width - paddingLeft - paddingRight;
  const contentH = container.height - paddingTop - paddingBottom;

  if (isHorizontal) {
    const primaryContent = contentW;
    let fixedTotal = 0;
    let fillCount = 0;

    for (const child of children) {
      const grow = child.node.layoutGrow ?? 0;
      if (grow > 0) {
        fillCount++;
      } else {
        fixedTotal += child.node.width;
      }
    }

    const totalGap = itemSpacing * Math.max(0, children.length - 1);
    const fillSize = fillCount > 0
      ? Math.max(0, (primaryContent - fixedTotal - totalGap) / fillCount)
      : 0;

    // Determine gap between items and cursor offset
    const isSpaceBetween = primaryAxisAlignItems === "space-between" && fillCount === 0;
    const gap = isSpaceBetween && children.length > 1
      ? (primaryContent - fixedTotal) / (children.length - 1)
      : itemSpacing;

    let cursor = paddingLeft;
    const used = fixedTotal + totalGap + fillSize * fillCount;

    if (!isSpaceBetween) {
      if (primaryAxisAlignItems === "center") {
        cursor += (primaryContent - used) / 2;
      } else if (primaryAxisAlignItems === "max") {
        cursor += primaryContent - used;
      }
    }

    for (const child of children) {
      const grow = child.node.layoutGrow ?? 0;
      const w = grow > 0 ? fillSize : child.node.width;

      // Counter axis alignment
      let y = paddingTop;
      const h = child.node.height;
      if (counterAxisAlignItems === "center") {
        y = paddingTop + (contentH - h) / 2;
      } else if (counterAxisAlignItems === "max") {
        y = paddingTop + contentH - h;
      } else if (counterAxisAlignItems === "stretch") {
        result.children.push({
          id: child.node.id,
          x: cursor,
          y: paddingTop,
          width: w,
          height: contentH,
        });
        cursor += w + gap;
        continue;
      }

      const alignSelf = child.node.layoutAlignSelf;
      if (alignSelf === "center") y = paddingTop + (contentH - h) / 2;
      else if (alignSelf === "max") y = paddingTop + contentH - h;
      else if (alignSelf === "stretch") {
        result.children.push({
          id: child.node.id,
          x: cursor,
          y: paddingTop,
          width: w,
          height: contentH,
        });
        cursor += w + gap;
        continue;
      }

      result.children.push({
        id: child.node.id,
        x: cursor,
        y,
        width: w,
        height: h,
      });

      cursor += w + gap;
    }

    // Hug sizing: resize container to fit content
    if (primaryAxisSizing === "hug") {
      const used = paddingLeft + fixedTotal + (Math.max(0, children.length - 1) * gap) + fillSize * fillCount + paddingRight;
      result.containerWidth = Math.max(1, used);
    }
    if (counterAxisSizing === "hug") {
      const maxChildH = Math.max(0, ...children.map((c) => c.node.height));
      result.containerHeight = Math.max(1, paddingTop + maxChildH + paddingBottom);
    }
  } else {
    // Vertical layout
    const primaryContent = contentH;
    let fixedTotal = 0;
    let fillCount = 0;

    for (const child of children) {
      const grow = child.node.layoutGrow ?? 0;
      if (grow > 0) {
        fillCount++;
      } else {
        fixedTotal += child.node.height;
      }
    }

    const totalGap = itemSpacing * Math.max(0, children.length - 1);
    const fillSize = fillCount > 0
      ? Math.max(0, (primaryContent - fixedTotal - totalGap) / fillCount)
      : 0;

    // Determine gap between items and cursor offset
    const isSpaceBetween = primaryAxisAlignItems === "space-between" && fillCount === 0;
    const gap = isSpaceBetween && children.length > 1
      ? (primaryContent - fixedTotal) / (children.length - 1)
      : itemSpacing;

    let cursor = paddingTop;
    const used = fixedTotal + totalGap + fillSize * fillCount;

    if (!isSpaceBetween) {
      if (primaryAxisAlignItems === "center") {
        cursor += (primaryContent - used) / 2;
      } else if (primaryAxisAlignItems === "max") {
        cursor += primaryContent - used;
      }
    }

    for (const child of children) {
      const grow = child.node.layoutGrow ?? 0;
      const h = grow > 0 ? fillSize : child.node.height;

      // Counter axis alignment
      let x = paddingLeft;
      const w = child.node.width;
      if (counterAxisAlignItems === "center") {
        x = paddingLeft + (contentW - w) / 2;
      } else if (counterAxisAlignItems === "max") {
        x = paddingLeft + contentW - w;
      } else if (counterAxisAlignItems === "stretch") {
        result.children.push({
          id: child.node.id,
          x: paddingLeft,
          y: cursor,
          width: contentW,
          height: h,
        });
        cursor += h + gap;
        continue;
      }

      const alignSelf = child.node.layoutAlignSelf;
      if (alignSelf === "center") x = paddingLeft + (contentW - w) / 2;
      else if (alignSelf === "max") x = paddingLeft + contentW - w;
      else if (alignSelf === "stretch") {
        result.children.push({
          id: child.node.id,
          x: paddingLeft,
          y: cursor,
          width: contentW,
          height: h,
        });
        cursor += h + gap;
        continue;
      }

      result.children.push({
        id: child.node.id,
        x,
        y: cursor,
        width: w,
        height: h,
      });

      cursor += h + gap;
    }

    if (primaryAxisSizing === "hug") {
      const used = paddingTop + fixedTotal + (Math.max(0, children.length - 1) * gap) + fillSize * fillCount + paddingBottom;
      result.containerHeight = Math.max(1, used);
    }
    if (counterAxisSizing === "hug") {
      const maxChildW = Math.max(0, ...children.map((c) => c.node.width));
      result.containerWidth = Math.max(1, paddingLeft + maxChildW + paddingRight);
    }
  }

  return result;
}

/**
 * Apply computed auto-layout positions to the document (mutates in place).
 * Used within an EditorSession.mutate() callback.
 */
export function applyAutoLayout(
  container: ContainerNode,
  document: PageDocument,
): void {
  const result = computeAutoLayout(container, document);

  for (const child of result.children) {
    const node = document.nodes[child.id];
    if (node) {
      node.x = child.x;
      node.y = child.y;
      node.width = child.width;
      node.height = child.height;
    }
  }

  if (result.containerWidth !== undefined) {
    container.width = result.containerWidth;
  }
  if (result.containerHeight !== undefined) {
    container.height = result.containerHeight;
  }
}