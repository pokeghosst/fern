import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import packageJson from "./package.json" with { type: "json" };
import path from "node:path";
import fs from "node:fs";

export default defineConfig(({ mode }) => {
  const useLzma = mode === "lzma";
  let outDir = "";

  return {
    plugins: [
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace("%PACKAGE_VERSION%", packageJson.version);
        },
      },
      viteSingleFile(),
      {
        name: "rename-html",
        apply: "build",
        enforce: "post",
        configResolved(config) {
          outDir = path.resolve(config.root, config.build.outDir);
        },
        closeBundle() {
          const from = path.join(outDir, "index.html");
          const to = path.join(
            outDir,
            `index-${useLzma ? "lzma" : "native"}-${packageJson.version}.html`,
          );
          if (fs.existsSync(from)) fs.renameSync(from, to);
        },
      },
    ],
    build: {
      emptyOutDir: false,
    },
    test: {
      includeSource: ["src/**/*.{js,ts}"],
      environment: "happy-dom",
    },
    define: {
      "import.meta.vitest": "undefined",
      __USE_LZMA__: useLzma,
    },
  };
});
