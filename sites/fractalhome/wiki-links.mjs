import fs from "node:fs";
import path from "node:path";

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const titleLine = match[1].split("\n").find((line) => line.startsWith("title:"));
  if (!titleLine) return {};
  let value = titleLine.slice("title:".length).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { title: value };
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildMap(docsRoot) {
  const map = new Map();
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, path.join(prefix, entry.name));
      } else if (/\.(md|mdx)$/.test(entry.name)) {
        const frontmatter = parseFrontmatter(fs.readFileSync(full, "utf8"));
        let rel = path.join(prefix, entry.name.replace(/\.(md|mdx)$/, ""));
        if (/^index\./.test(entry.name)) rel = prefix;
        rel = rel
          .replace(/(^|\/)\d+-/g, "$1")
          .replace(/(^|\/)\d{4}-(\d{2}-)/g, "$1$2");
        const route = "/" + rel.replace(/\\/g, "/");
        if (frontmatter.title) {
          map.set(frontmatter.title, route);
          map.set(frontmatter.title.toLowerCase(), route);
        }
        map.set(entry.name.replace(/\.(md|mdx)$/, "").toLowerCase(), route);
      }
    }
  };
  walk(docsRoot, "");
  return map;
}

function convertWikiLinks(source, resolve) {
  let inFence = false;
  const out = [];
  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    out.push(
      line.replace(
        /`[^`]*`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
        (match, page, label) => {
          if (match.startsWith("`")) return match;
          const name = page.trim();
          const route = resolve(name);
          const text = label ? label.trim() : name;
          return `[${text}](${route})`;
        }
      )
    );
  }
  return out.join("\n");
}

export default function wikiLinks({ docsRoot } = {}) {
  const root = docsRoot || path.join(path.dirname(new URL(import.meta.url).pathname), "docs");
  return {
    name: "blume-wiki-links",
    hooks: {
      "astro:config:setup": ({ updateConfig, config }) => {
        const map = buildMap(root);
        const resolve = (name) =>
          map.get(name) ||
          map.get(name.toLowerCase()) ||
          "/llmwiki/concepts/" + slugify(name);

        const wrapRenderer = async (renderer) => {
          const r = await renderer;
          if (!r || typeof r.render !== "function") return r;
          const origRender = r.render.bind(r);
          r.render = async (content, opts) =>
            origRender(convertWikiLinks(content, resolve), opts);
          return r;
        };

        const proc = config.markdown.processor;
        if (!proc) return;

        // Patch the processor object IN-PLACE so any component that captured a
        // reference to this exact object (e.g. Astro's content entry type or
        // Blume's integration, which bind `markdown.processor` during their own
        // earlier `astro:config:setup`) sees the wrapped renderers. Then also
        // push the wrapped processor through `updateConfig` so the final merged
        // config carries it for renderers created later.
        const wrapCreate = (orig) => {
          const wrapped = async (shared) => wrapRenderer(orig(shared));
          return wrapped;
        };
        if (typeof proc.createRenderer === "function") {
          proc.createRenderer = wrapCreate(proc.createRenderer);
        }
        if (typeof proc.createMdxRenderer === "function") {
          proc.createMdxRenderer = wrapCreate(proc.createMdxRenderer);
        }
        const wrapped = { ...proc };
        updateConfig({ markdown: { processor: wrapped } });
      },
    },
  };
}
