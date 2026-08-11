import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { createAcrollsMdsvexOptions } from "@acrolls/mdsvex";
import { normalizeFileLinkDestinations } from "./scripts/normalize-file-links.mjs";

// Notion exports contain file links whose destinations include literal spaces. CommonMark
// treats those destinations as plain text, so normalize them before mdsvex parses the source.
const normalizeFileLinks = {
  markup: ({ content, filename }) => {
    if (!filename?.endsWith(".md") && !filename?.endsWith(".svx")) return;

    return {
      code: normalizeFileLinkDestinations(content),
    };
  },
};

const acrolls = createAcrollsMdsvexOptions({
  // no default layout — you wrap with Publication in the page/layout
  extensions: [".md", ".svx"],
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  extensions: [".svelte", ".md", ".svx"],
  preprocess: [vitePreprocess(), normalizeFileLinks, mdsvex(acrolls)],
  kit: {
    adapter: adapter({
      runtime: "nodejs24.x",
    }),
  },
};

export default config;
