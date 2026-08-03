// src/lib/notes/index.ts
import type { Component } from 'svelte';

type MdModule = {
  default: Component;
  metadata?: Record<string, unknown>;
};

const modules = import.meta.glob<MdModule>('./*.md');

export async function getNote(slug: string) {
  const path = `./${slug}.md`;
  const loader = modules[path];

  if (!loader) {
    throw new Error(`Note not found: ${slug}`);
  }

  const mod = await loader();

  return {
    component: mod.default,
    metadata: mod.metadata ?? {}
  };
}