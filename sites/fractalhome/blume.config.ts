import { defineConfig } from "blume";
import { z } from "zod";
import wikiLinks from "./wiki-links.mjs";

export default defineConfig({
 title: "FractalHome",
 description: "The FractalHome documentation site, powered by Blume.",
 integrations: [wikiLinks()],
 frontmatter: {
  extend: {
   "knowledge-bank": z.array(z.string()).optional(),
   tags: z.array(z.string()).optional(),
   sources: z.array(z.string()).optional(),
   related: z.array(z.string()).optional(),
   timestamp: z.coerce.string().optional(),
   source: z.string().optional(),
   created: z.coerce.string().optional(),
   updated: z.coerce.string().optional(),
   project: z.string().optional(),
   boss: z.string().optional(),
  },
 },
 navigation: {
  sidebar: {
   display: "group", // "flat" | "group" | "page"
  },
 },
  theme: {
   fonts: {
    display: { name: "Google Sans Flex" },
    body: { name: "Google Sans Flex" },
    mono: "ibm-plex-mono",
   },
  },
});
