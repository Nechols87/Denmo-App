// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/bootstrap.ts
import { createElement } from "../../../../../esm.sh/react@17.0.2.js";
import { hydrate, render } from "../../../../../esm.sh/react-dom@17.0.2.js";
import { importModule } from "../core/module.js";
import { redirect } from "../core/redirect.js";
import { Routing } from "../core/routing.js";
import Router, { createPageRoute, importPageModules } from "./components/Router.js";
import { loadSSRDataFromTag, setStaticDataRoutes } from "./pagedata.js";
async function bootstrap(options) {
  const { basePath, i18n, appModule: appModuleSpcifier, routes, dataRoutes, rewrites, renderMode } = options;
  const { document } = window;
  const appModule = appModuleSpcifier ? await importModule(basePath, appModuleSpcifier) : {};
  const routing = new Routing({ basePath, i18n, rewrites, routes, redirect });
  const [url, nestedModules] = routing.createRouter();
  const components = await importPageModules(url, nestedModules);
  if (renderMode === "ssr") {
    loadSSRDataFromTag(url);
  }
  const pageRoute = createPageRoute(url, components);
  const routerEl = createElement(Router, { appModule, pageRoute, routing });
  const mountPoint = document.getElementById("__aleph");
  if (renderMode === "ssr") {
    if (dataRoutes) {
      setStaticDataRoutes(dataRoutes);
    }
    hydrate(routerEl, mountPoint);
  } else {
    render(routerEl, mountPoint);
  }
  await Promise.resolve();
  Array.from(document.head.children).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (el.hasAttribute("ssr") && tag !== "style" && !(tag === "link" && el.getAttribute("rel") === "stylesheet")) {
      document.head.removeChild(el);
    }
  });
}
export {
  bootstrap as default
};
