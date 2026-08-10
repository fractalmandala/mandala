/**
 * Minimal command-stack undo/redo. Commands are small objects with
 * do/undo; Phase 3's AI layer will drive the same stack interface.
 */

export interface Command {
  label: string;
  redo(): void;
  undo(): void;
}

export class UndoStack {
  past = $state<Command[]>([]);
  future = $state<Command[]>([]);

  /** Run a command for the first time and push it. */
  execute(cmd: Command) {
    cmd.redo();
    this.past.push(cmd);
    this.future = [];
  }

  /** Push a command whose effect has already been applied. */
  record(cmd: Command) {
    this.past.push(cmd);
    this.future = [];
  }

  undo(): string | null {
    const c = this.past.pop();
    if (!c) return null;
    c.undo();
    this.future.push(c);
    return c.label;
  }

  redo(): string | null {
    const c = this.future.pop();
    if (!c) return null;
    c.redo();
    this.past.push(c);
    return c.label;
  }

  clear() {
    this.past = [];
    this.future = [];
  }

  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
}

/** Build a snapshot command: stores before/after copies of a value and applies them via `apply`. */
export function snapshotCommand<T>(
  label: string,
  before: T,
  after: T,
  apply: (v: T) => void
): Command {
  return {
    label,
    redo: () => apply(JSON.parse(JSON.stringify(after))),
    undo: () => apply(JSON.parse(JSON.stringify(before)))
  };
}
