import markdoc from "@astrojs/markdoc";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import { config } from "./src/.config";

// https://astro.build/config
export default defineConfig({
	site: config.website,
	prefetch: true,
	markdown: {
		shikiConfig: {
			theme: "solarized-light",
			langs: [],
			wrap: true,
		},
	},
	integrations: [
		UnoCSS({
			injectReset: true,
		}),
		robotsTxt(),
		sitemap(),
		mdx(),
		markdoc(),
	],
});
