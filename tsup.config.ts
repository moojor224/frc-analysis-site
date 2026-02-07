import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/app/page.tsx"],
    format: ["esm"],
    dts: false, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: false,
    clean: true,
    outDir: "tsup-out"
});
