// https://deno.land/x/aleph@v0.3.0-beta.19/framework/core/module.ts
import util from "../../shared/util.js";
var builtinModuleExts = ["tsx", "jsx", "ts", "js", "mjs"];
function importModule(basePath, url, forceRefetch = false) {
  const { __ALEPH__: ALEPH } = window;
  if (ALEPH) {
    return ALEPH.import(url, forceRefetch);
  }
  let src = util.cleanPath(basePath + "/_aleph/" + trimBuiltinModuleExts(url) + ".js");
  if (forceRefetch) {
    src += "?t=" + Date.now();
  }
  return import(src);
}
function toPagePath(url) {
  let pathname = trimBuiltinModuleExts(url);
  if (pathname.startsWith("/pages/")) {
    pathname = util.trimPrefix(pathname, "/pages");
  }
  if (pathname.endsWith("/index")) {
    pathname = util.trimSuffix(pathname, "/index");
  }
  if (pathname === "") {
    pathname = "/";
  }
  return pathname;
}
function trimBuiltinModuleExts(url) {
  for (const ext of builtinModuleExts) {
    if (url.endsWith("." + ext)) {
      return url.slice(0, -(ext.length + 1));
    }
  }
  return url;
}
export {
  builtinModuleExts,
  importModule,
  toPagePath,
  trimBuiltinModuleExts
};
