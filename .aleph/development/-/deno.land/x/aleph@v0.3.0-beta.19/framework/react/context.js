// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/context.ts
import { createContext } from "../../../../../esm.sh/react@17.0.2.js";
import { createBlankRouterURL } from "../core/routing.js";
import { createNamedContext } from "./helper.js";
var RouterContext = createNamedContext(createBlankRouterURL(), "RouterContext");
var FallbackContext = createNamedContext({ to: null }, "FallbackContext");
var SSRContext = createContext({
  request: new Request("http://localhost/"),
  dataCache: {},
  headElements: new Map(),
  inlineStyles: new Map(),
  scripts: new Map()
});
export {
  FallbackContext,
  RouterContext,
  SSRContext
};
