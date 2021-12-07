// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/components/Router.ts
import { createElement, useCallback, useEffect, useState } from "../../../../../../esm.sh/react@17.0.2.js";
import events from "../../core/events.js";
import { importModule, trimBuiltinModuleExts } from "../../core/module.js";
import { RouterContext } from "../context.js";
import { isLikelyReactComponent } from "../helper.js";
import { shouldLoadData, loadPageData } from "../pagedata.js";
import { createPageProps } from "../pageprops.js";
import { E400MissingComponent, E404Page, ErrorBoundary } from "./ErrorBoundary.js";
async function importPageModules(url, nestedModules, refresh = false) {
  return await Promise.all(nestedModules.map(async (specifier) => {
    const { default: Component } = await importModule(url.basePath, specifier, refresh);
    return {
      specifier,
      Component
    };
  }));
}
function createPageRoute(url, nestedModules) {
  const nest = nestedModules.map(({ specifier, Component }) => {
    const data = window[`pagedata://${url.toString()}#props-${btoa(specifier)}`] || {};
    return {
      specifier,
      Component,
      props: { ...data.value }
    };
  });
  return { ...createPageProps(nest), url };
}
function Router({
  appModule,
  pageRoute,
  routing
}) {
  const [app, setApp] = useState(() => {
    const App = appModule.default;
    if (App) {
      if (isLikelyReactComponent(App)) {
        return { Component: App };
      }
      return { Component: E400MissingComponent, props: { name: "Custom App" } };
    }
    return { Component: null };
  });
  const [route, setRoute] = useState(pageRoute);
  const onpopstate = useCallback(async (e) => {
    const [url, nestedModules] = routing.createRouter();
    if (url.routePath !== "") {
      const components = await importPageModules(url, nestedModules, e.forceRefetch);
      if (await shouldLoadData(url)) {
        await loadPageData(url);
      }
      setRoute(createPageRoute(url, components));
      if (e.resetScroll) {
        window.scrollTo(0, 0);
      }
    } else {
      setRoute({ Page: null, pageProps: null, url });
    }
  }, []);
  useEffect(() => {
    window.addEventListener("popstate", onpopstate);
    events.on("popstate", onpopstate);
    events.emit("routerstate", { ready: true });
    return () => {
      window.removeEventListener("popstate", onpopstate);
      events.off("popstate", onpopstate);
    };
  }, []);
  useEffect(() => {
    const isDev = !("__ALEPH__" in window);
    const { basePath } = routing;
    const onAddModule = async (mod) => {
      const name = trimBuiltinModuleExts(mod.specifier);
      if (name === "/app") {
        const { default: Component } = await importModule(basePath, mod.specifier, true);
        if (isLikelyReactComponent(Component)) {
          setApp({ Component });
        } else {
          setApp({ Component: () => createElement(E400MissingComponent, { name: "Custom App" }) });
        }
      } else {
        const { routePath, specifier, isIndex } = mod;
        if (routePath) {
          routing.update(routePath, specifier, isIndex);
          events.emit("popstate", { type: "popstate", forceRefetch: true });
        }
      }
    };
    const onRemoveModule = (specifier) => {
      const name = trimBuiltinModuleExts(specifier);
      if (name === "/app") {
        setApp({ Component: null });
      } else if (specifier.startsWith("/pages/")) {
        routing.removeRouteByModule(specifier);
        events.emit("popstate", { type: "popstate" });
      }
    };
    const onFetchPageModule = async ({ href }) => {
      const [url, nestedModules] = routing.createRouter({ pathname: href });
      if (url.routePath !== "") {
        nestedModules.map((modUrl) => {
          importModule(basePath, modUrl);
        });
      }
    };
    if (isDev) {
      events.on("add-module", onAddModule);
      events.on("remove-module", onRemoveModule);
      events.on("fetch-page-module", onFetchPageModule);
    }
    return () => {
      if (isDev) {
        events.off("add-module", onAddModule);
        events.off("remove-module", onRemoveModule);
        events.off("fetch-page-module", onFetchPageModule);
      }
    };
  }, []);
  useEffect(() => {
    const win = window;
    const { location, document, scrollX, scrollY, scrollFixer } = win;
    if (location.hash) {
      const anchor = document.getElementById(location.hash.slice(1));
      if (anchor) {
        const { left, top } = anchor.getBoundingClientRect();
        win.scroll({
          top: top + scrollY - (scrollFixer?.offset?.top || 0),
          left: left + scrollX - (scrollFixer?.offset?.left || 0),
          behavior: scrollFixer?.behavior
        });
      }
    }
  }, [route]);
  return createElement(ErrorBoundary, null, createElement(RouterContext.Provider, { value: route.url }, ...[
    route.Page && app.Component && createElement(app.Component, route),
    route.Page && !app.Component && createElement(route.Page, route.pageProps),
    !route.Page && createElement(E404Page)
  ].filter(Boolean)));
}
Router.displayName = "ALEPH";
export {
  createPageRoute,
  Router as default,
  importPageModules
};
