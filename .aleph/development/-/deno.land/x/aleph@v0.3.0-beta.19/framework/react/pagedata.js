// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/pagedata.ts
import util from "../../shared/util.js";
var global = window;
var lazyDataRoutes = new Map();
var staticDataRoutes = null;
function setStaticDataRoutes(routes) {
  staticDataRoutes = new Set(routes);
}
async function shouldLoadData(url) {
  const href = url.toString();
  const pagedataUrl = `pagedata://${href}`;
  if (pagedataUrl in global) {
    const { expires, keys } = global[pagedataUrl];
    if (expires === 0 || Date.now() < expires) {
      return false;
    }
    delete global[pagedataUrl];
    keys.forEach((key) => {
      delete global[`${pagedataUrl}#${key}`];
    });
  }
  if (staticDataRoutes) {
    return staticDataRoutes.has(url.routePath);
  }
  if (lazyDataRoutes.has(url.routePath)) {
    return lazyDataRoutes.get(url.routePath);
  }
  return true;
}
async function loadPageData(url) {
  const href = url.toString();
  const basePath = util.trimSuffix(url.basePath, "/");
  const dataUrl = `${basePath}/_aleph/data/${util.btoaUrl(href)}.json`;
  try {
    const resp = await fetch(dataUrl);
    if (resp.status === 200) {
      const data = await resp.json();
      if (data === null) {
        if (!staticDataRoutes) {
          lazyDataRoutes.set(url.routePath, false);
        }
      } else if (util.isPlainObject(data)) {
        storeData(href, data);
        if (!staticDataRoutes) {
          lazyDataRoutes.set(url.routePath, true);
        }
      }
    }
  } catch (err) {
    console.error("loadPageData:", err);
  }
}
function loadSSRDataFromTag(url) {
  const href = url.toString();
  const ssrDataEl = global.document.getElementById("ssr-data");
  if (ssrDataEl) {
    try {
      const ssrData = JSON.parse(ssrDataEl.innerText);
      if (util.isPlainObject(ssrData)) {
        storeData(href, ssrData);
        return;
      }
    } catch (e) {
      console.warn("ssr-data: invalid JSON");
    }
  }
}
function storeData(href, data) {
  let expires = 0;
  for (const key in data) {
    const { expires: _expires } = data[key];
    if (expires === 0 || _expires > 0 && _expires < expires) {
      expires = _expires;
    }
    global[`pagedata://${href}#${key}`] = data[key];
  }
  global[`pagedata://${href}`] = { expires, keys: Object.keys(data) };
}
export {
  loadPageData,
  loadSSRDataFromTag,
  setStaticDataRoutes,
  shouldLoadData
};
