// https://deno.land/x/aleph@v0.3.0-beta.19/framework/core/redirect.ts
import util from "../../shared/util.js";
import events from "./events.js";
var routerState = {
  ready: false,
  hasPreRedirect: false
};
events.once("routerstate", (state) => {
  if (routerState.hasPreRedirect) {
    events.emit("popstate", { type: "popstate", resetScroll: true });
  }
  Object.assign(routerState, state);
});
async function redirect(url, replace) {
  const { location, history } = window;
  if (!util.isFilledString(url)) {
    return;
  }
  if (util.isLikelyHttpURL(url) || url.startsWith("file://") || url.startsWith("mailto:")) {
    location.href = url;
    return;
  }
  url = util.cleanPath(url);
  if (replace) {
    history.replaceState(null, "", url);
  } else {
    history.pushState(null, "", url);
  }
  if (routerState.ready) {
    events.emit("popstate", { type: "popstate", resetScroll: true });
  } else if (!routerState.hasPreRedirect) {
    routerState.hasPreRedirect = true;
  }
}
export {
  redirect
};
