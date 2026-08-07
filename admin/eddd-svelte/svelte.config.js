import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: preprocess(), // or vitePreprocess()
    kit: {
        adapter: adapter(),
        alias: {
            "@": path.resolve("./src/components"),
        },
    },
};

export default config;