import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.js",
            name: "CJNotice",
            formats: ["es", "umd", "iife"],
            fileName: (format) => `cj-notice.${format}.js`,
        },
        rollupOptions: {
            output: {
                assetFileNames: "cj-notice.[ext]",
                exports: "named",
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
