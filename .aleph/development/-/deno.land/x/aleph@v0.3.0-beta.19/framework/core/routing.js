// https://deno.land/x/aleph@v0.3.0-beta.19/framework/core/routing.ts
import util from "../../shared/util.js";
var ghostRoute = { path: "", module: "" };
var Routing = class {
  constructor({
    basePath = "/",
    i18n = { defaultLocale: "en", locales: [] },
    routes = [],
    rewrites,
    redirect
  } = {}) {
    this._basePath = basePath;
    this._defaultLocale = i18n.defaultLocale || "en";
    this._locales = i18n.locales;
    this._rewrites = rewrites;
    this._routes = routes;
    this._redirect = redirect;
  }
  get basePath() {
    return this._basePath;
  }
  get paths() {
    const paths = [];
    this._lookup((path) => {
      paths.push(path.map((r) => r.path).join(""));
    }, true);
    return paths;
  }
  get routes() {
    return JSON.parse(JSON.stringify(this._routes));
  }
  update(path, moduleUrl, isIndex) {
    const newRoute = {
      path: path === "/" ? path : util.trimSuffix(path, "/") + (isIndex ? "/" : ""),
      module: moduleUrl
    };
    const dirtyRoutes = new Set();
    let exists = false;
    let targetRoutes = this._routes;
    this._lookup((routePath) => {
      const path2 = routePath.map((r) => r.path).join("");
      const route = routePath[routePath.length - 1];
      const parentRoute = routePath[routePath.length - 2];
      if (route.module === newRoute.module) {
        route.module = newRoute.module;
        exists = true;
        return false;
      }
      if (!newRoute.path.endsWith("/") && path2.startsWith(newRoute.path + "/")) {
        const routes = parentRoute ? parentRoute.children : this._routes;
        const index = routes.indexOf(route);
        if (index >= 0) {
          routes.splice(index, 1, ghostRoute);
          dirtyRoutes.add(routes);
        }
        (newRoute.children || (newRoute.children = [])).push({ ...route, path: util.trimPrefix(path2, newRoute.path) });
      } else if (!path2.endsWith("/") && newRoute.path.startsWith(path2 + "/")) {
        newRoute.path = util.trimPrefix(newRoute.path, path2);
        targetRoutes = route.children || (route.children = []);
      }
    });
    if (exists) {
      return;
    }
    dirtyRoutes.forEach((routes) => {
      let index;
      while (~(index = routes.indexOf(ghostRoute))) {
        routes.splice(index, 1);
      }
    });
    dirtyRoutes.clear();
    targetRoutes.push(newRoute);
  }
  removeRouteByModule(specifier) {
    this._lookup((path) => {
      const route = path[path.length - 1];
      if (route.module === specifier) {
        const parentRoute = path[path.length - 2];
        const routes = parentRoute ? parentRoute.children : this._routes;
        const index = routes.indexOf(route);
        if (index >= 0) {
          routes.splice(index, 1, ...(route.children || []).map((r) => ({ ...r, path: route.path + r.path })));
        }
        return false;
      }
    });
  }
  createRouter(location) {
    let [url, nestedModules] = this._createRouter(location);
    if (url.routePath === "" && location === void 0) {
      const [{ routePath }, nested] = this._createRouter({ pathname: "/404" });
      console.log(routePath);
      Object.assign(url, { routePath });
      nestedModules = nested;
    }
    return [url, nestedModules];
  }
  _createRouter(location) {
    const loc = location || window.location || { pathname: "/" };
    const url = resolveURL("http://localhost" + loc.pathname + (loc.search || ""), this._basePath, this._rewrites);
    let locale = null;
    let pathname = decodeURI(url.pathname);
    let routePath = "";
    let params = {};
    let nestedModules = [];
    if (pathname !== "/" && this._locales.length > 0) {
      const a = pathname.split("/");
      const a1 = a[1];
      if (a1 !== locale && this._locales.includes(a1)) {
        locale = a1;
        pathname = "/" + a.slice(2).join("/");
      }
    }
    pathname = pathname !== "/" ? util.trimSuffix(pathname, "/") : "/";
    this._lookup((route) => {
      const path = route.map((r) => r.path).join("");
      const [p, ok] = matchPath(path, pathname);
      if (ok) {
        nestedModules = route.map((r) => r.module);
        const c = route[route.length - 1].children?.find((c2) => c2.path === "/");
        if (c) {
          nestedModules.push(c.module);
        }
        routePath = path;
        params = p;
        return false;
      }
    }, true);
    url.searchParams.sort();
    return [
      {
        basePath: this._basePath,
        locale: locale || this._defaultLocale,
        defaultLocale: this._defaultLocale,
        locales: this._locales,
        pathname,
        routePath,
        params,
        query: url.searchParams,
        toString() {
          const qs = this.query.toString();
          return [this.pathname, qs].filter(Boolean).join("?");
        },
        push: (url2) => this._redirect && this._redirect(url2),
        replace: (url2) => this._redirect && this._redirect(url2, true)
      },
      nestedModules
    ];
  }
  lookup(callback) {
    this._lookup(callback);
  }
  _lookup(callback, skipNestedIndex = false, __tracing = [], __routes = this._routes) {
    for (const route of __routes) {
      if (skipNestedIndex && __tracing.length > 0 && route.path === "/") {
        continue;
      }
      if (callback([...__tracing, route]) === false) {
        return false;
      }
    }
    for (const route of __routes) {
      if (route.path !== "/" && route.children?.length) {
        if (this._lookup(callback, skipNestedIndex, [...__tracing, route], route.children) === false) {
          return false;
        }
      }
    }
  }
};
function matchPath(routePath, locPath) {
  const params = {};
  const routeSegments = util.splitPath(routePath);
  const locSegments = util.splitPath(locPath);
  const depth = Math.max(routeSegments.length, locSegments.length);
  for (let i = 0; i < depth; i++) {
    const routeSeg = routeSegments[i];
    const locSeg = locSegments[i];
    if (locSeg === void 0 || routeSeg === void 0) {
      return [{}, false];
    }
    if (routeSeg.startsWith("[...") && routeSeg.endsWith("]") && routeSeg.length > 5 && i === routeSegments.length - 1) {
      params[routeSeg.slice(4, -1)] = locSegments.slice(i).map(decodeURIComponent).join("/");
      break;
    }
    if (routeSeg.startsWith("[") && routeSeg.endsWith("]") && routeSeg.length > 2) {
      params[routeSeg.slice(1, -1)] = decodeURIComponent(locSeg);
    } else if (routeSeg.startsWith("$") && routeSeg.length > 1) {
      params[routeSeg.slice(1)] = decodeURIComponent(locSeg);
    } else if (routeSeg !== locSeg) {
      return [{}, false];
    }
  }
  return [params, true];
}
function createBlankRouterURL(basePath = "/", locale = "en") {
  return {
    basePath,
    locale,
    defaultLocale: locale,
    locales: [],
    routePath: "",
    pathname: "/",
    params: {},
    query: new URLSearchParams(),
    push: () => void 0,
    replace: () => void 0
  };
}
function resolveURL(reqUrl, basePath, rewrites) {
  const url = new URL(reqUrl);
  if (basePath !== "/") {
    url.pathname = util.trimPrefix(decodeURI(url.pathname), basePath);
  }
  for (const path in rewrites) {
    const to = rewrites[path];
    const [params, ok] = matchPath(path, decodeURI(url.pathname));
    if (ok) {
      url.pathname = util.cleanPath(to.replace(/:(.+)(\/|&|$)/g, (s, k, e) => {
        if (k in params) {
          return params[k] + e;
        }
        return s;
      }));
      break;
    }
  }
  return url;
}
export {
  Routing,
  createBlankRouterURL,
  resolveURL
};
