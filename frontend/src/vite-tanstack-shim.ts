import type { Plugin } from "vite";

/** Shim missing dev virtual modules when @tanstack/* versions are mismatched. */
export function tanstackStartVirtualModulesShim(): Plugin {
  const headScriptsId = "tanstack-start-injected-head-scripts:v";
  const resolvedHeadScripts = "\0tanstack-injected-head-scripts";

  return {
    name: "acadvault-tanstack-virtual-modules-shim",
    enforce: "pre",
    resolveId(id) {
      if (id === headScriptsId) return resolvedHeadScripts;
    },
    load(id) {
      if (id === resolvedHeadScripts) {
        return "export const injectedHeadScripts = undefined;";
      }
    },
  };
}
