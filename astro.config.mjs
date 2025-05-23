import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";


// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), vue()],
  vite: {
    ssr: {
      noExternal: ["open-props"]
    }
  }
});