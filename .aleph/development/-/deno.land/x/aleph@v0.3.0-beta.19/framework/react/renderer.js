// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/renderer.ts
import { createElement } from "../../../../../esm.sh/react@17.0.2.js";
import { renderToString } from "../../../../../esm.sh/react-dom@17.0.2/server.js";
import util from "../../shared/util.js";
import events from "../core/events.js";
import { RouterContext, SSRContext } from "./context.js";
import { E400MissingComponent, E404Page } from "./components/ErrorBoundary.js";
import { AsyncUseDenoError } from "./hooks.js";
import { isLikelyReactComponent } from "./helper.js";
import { createPageProps } from "./pageprops.js";
async function render(request, url, App, nestedPageComponents, styles) {
  const global = window;
  const ret = {
    head: [],
    body: "",
    scripts: [],
    data: null
  };
  const rendererStore = {
    request,
    dataCache: {},
    headElements: new Map(),
    inlineStyles: new Map(),
    scripts: new Map()
  };
  const dataUrl = "pagedata://" + url.toString();
  const dataKey = "rendering-" + dataUrl;
  const asyncCalls = [];
  const data = {};
  const pageProps = createPageProps(nestedPageComponents);
  const defer = async () => {
    Reflect.deleteProperty(global, dataKey);
    events.removeAllListeners("useDeno-" + dataUrl);
  };
  nestedPageComponents.forEach(({ specifier, props }) => {
    if (util.isPlainObject(props)) {
      const { $revalidate } = props;
      let expires = 0;
      if (util.isNumber($revalidate)) {
        expires = Date.now() + Math.round($revalidate * 1e3);
      } else if ($revalidate === true) {
        expires = Date.now() - 1e3;
      } else if (util.isPlainObject($revalidate) && util.isNumber($revalidate.date)) {
        expires = $revalidate.date;
      }
      data[`props-${btoa(specifier)}`] = {
        value: props,
        expires
      };
    }
  });
  events.on("useDeno-" + dataUrl, ({ id, value, expires }) => {
    if (value instanceof Promise) {
      asyncCalls.push([id, expires, value]);
    } else {
      data[id] = { value, expires };
    }
  });
  let el;
  if (App) {
    if (isLikelyReactComponent(App)) {
      if (pageProps.Page === null) {
        el = createElement(E404Page);
      } else {
        el = createElement(App, pageProps);
      }
    } else {
      el = createElement(E400MissingComponent, { name: "Custom App" });
    }
  } else {
    if (pageProps.Page === null) {
      el = createElement(E404Page);
    } else {
      el = createElement(pageProps.Page, pageProps.pageProps);
    }
  }
  while (true) {
    if (asyncCalls.length > 0) {
      const calls = asyncCalls.splice(0, asyncCalls.length);
      const datas = await Promise.all(calls.map((a) => a[2]));
      calls.forEach(([id, expires], i) => {
        const value = datas[i];
        rendererStore.dataCache[id] = value;
        data[id] = { value, expires };
      });
    }
    Object.values(rendererStore).forEach((v) => v instanceof Map && v.clear());
    try {
      ret.body = renderToString(createElement(SSRContext.Provider, { value: rendererStore }, createElement(RouterContext.Provider, { value: url }, el)));
      if (Object.keys(data).length > 0) {
        ret.data = data;
      }
      break;
    } catch (error) {
      if (error instanceof AsyncUseDenoError) {
        continue;
      }
      defer();
      throw error;
    }
  }
  rendererStore.headElements.forEach(({ type, props }) => {
    const { children, ...rest } = props;
    if (type === "title") {
      if (util.isFilledString(children)) {
        ret.head.push(`<title ssr>${children}</title>`);
      } else if (util.isFilledArray(children)) {
        ret.head.push(`<title ssr>${children.join("")}</title>`);
      }
    } else {
      const attrs = Object.entries(rest).map(([key, value]) => ` ${key}=${JSON.stringify(value)}`).join("");
      if (type === "script") {
        ret.head.push(`<${type}${attrs}>${Array.isArray(children) ? children.join("") : children || ""}</${type}>`);
      } else if (util.isFilledString(children)) {
        ret.head.push(`<${type}${attrs} ssr>${children}</${type}>`);
      } else if (util.isFilledArray(children)) {
        ret.head.push(`<${type}${attrs} ssr>${children.join("")}</${type}>`);
      } else {
        ret.head.push(`<${type}${attrs} ssr />`);
      }
    }
  });
  rendererStore.scripts.forEach(({ props }) => {
    const { children, dangerouslySetInnerHTML, ...attrs } = props;
    if (dangerouslySetInnerHTML && util.isFilledString(dangerouslySetInnerHTML.__html)) {
      ret.scripts.push({ ...attrs, innerText: dangerouslySetInnerHTML.__html });
    }
    if (util.isFilledString(children)) {
      ret.scripts.push({ ...attrs, innerText: children });
    } else if (util.isFilledArray(children)) {
      ret.scripts.push({ ...attrs, innerText: children.join("") });
    } else {
      ret.scripts.push(props);
    }
  });
  Object.entries(styles).forEach(([url2, { css, href }]) => {
    if (css) {
      ret.head.push(`<style type="text/css" data-module-id=${JSON.stringify(url2)} ssr>${css}</style>`);
    } else if (href) {
      ret.head.push(`<link rel="stylesheet" href=${JSON.stringify(href)} data-module-id=${JSON.stringify(url2)} ssr />`);
    }
  });
  for (const [url2, css] of rendererStore.inlineStyles.entries()) {
    ret.head.push(`<style type="text/css" data-module-id=${JSON.stringify(url2)} ssr>${css}</style>`);
  }
  defer();
  return ret;
}
export {
  render
};
