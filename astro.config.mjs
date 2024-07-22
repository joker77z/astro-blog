import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import rehypePrettyCode from "rehype-pretty-code";

const prettyCodeOptions = {
  theme: "night-owl",
};

// https://astro.build/config
export default defineConfig({
  integrations: [

    react({
      experimentalReactChildren: true,
      include: ['**/react/*'],
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});
