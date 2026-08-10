import type { Constraints, DesignNode, PageDocument } from "$lib/domain";

/**
 * Apply constraints to a child node when its parent frame is resized.
 * Called after the parent frame changes dimensions.
 *
 * Returns the new x, y, width, height for the child node.
 */
export function resolveConstraints(
  child: DesignNode,
  parentFrame: { width: number; height: number },
  constraints: Constraints,
  oldParentSize: { width: number; height: number },
  oldChildBounds: { x: number; y: number; width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  const dw = parentFrame.width - oldParentSize.width;
  const dh = parentFrame.height - oldParentSize.height;

  let x = oldChildBounds.x;
  let y = oldChildBounds.y;
  let w = oldChildBounds.width;
  let h = oldChildBounds.height;

  const rightEdge = oldParentSize.width - (oldChildBounds.x + oldChildBounds.width);
  const bottomEdge = oldParentSize.height - (oldChildBounds.y + oldChildBounds.height);

  // Horizontal constraint
  switch (constraints.horizontal) {
    case "min":
      // Pin to left — no change
      break;
    case "max":
      // Pin to right
      x = parentFrame.width - rightEdge - w;
      break;
    case "center":
      // Center horizontally
      x = oldChildBounds.x + dw / 2;
      break;
    case "stretch":
      // Stretch horizontally
      x = oldChildBounds.x;
      w = Math.max(1, oldChildBounds.width + dw);
      break;
    case "scale":
      // Scale proportionally
      if (oldParentSize.width > 0) {
        const scale = parentFrame.width / oldParentSize.width;
        x = oldChildBounds.x * scale;
        w = Math.max(1, oldChildBounds.width * scale);
      }
      break;
  }

  // Vertical constraint
  switch (constraints.vertical) {
    case "min":
      break;
    case "max":
      y = parentFrame.height - bottomEdge - h;
      break;
    case "center":
      y = oldChildBounds.y + dh / 2;
      break;
    case "stretch":
      y = oldChildBounds.y;
      h = Math.max(1, oldChildBounds.height + dh);
      break;
    case "scale":
      if (oldParentSize.height > 0) {
        const scale = parentFrame.height / oldParentSize.height;
        y = oldChildBounds.y * scale;
        h = Math.max(1, oldChildBounds.height * scale);
      }
      break;
  }

  return { x, y, width: w, height: h };
}

/**
 * Apply constraints to all children of a parent frame when the frame is resized.
 * Called during a resize gesture.
 */
export function applyConstraintsToChildren(
  parentFrame: DesignNode & { childIds: string[] },
  document: PageDocument,
  oldParentSize: { width: number; height: number },
): void {
  if (parentFrame.type !== "frame" && parentFrame.type !== "group") return;

  for (const childId of parentFrame.childIds) {
    const child = document.nodes[childId];
    if (!child?.constraints) continue;

    const oldChildBounds = {
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
    };

    const resolved = resolveConstraints(
      child,
      { width: parentFrame.width, height: parentFrame.height },
      child.constraints,
      oldParentSize,
      oldChildBounds,
    );

    child.x = resolved.x;
    child.y = resolved.y;
    child.width = resolved.width;
    child.height = resolved.height;
  }
}