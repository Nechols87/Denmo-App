// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/helper.ts
import { createContext } from "../../../../../esm.sh/react@17.0.2.js";
var symbolFor = typeof Symbol === "function" && typeof Symbol.for === "function";
var REACT_FORWARD_REF_TYPE = symbolFor ? Symbol.for("react.forward_ref") : 60112;
var REACT_MEMO_TYPE = symbolFor ? Symbol.for("react.memo") : 60115;
var inDeno = typeof Deno !== "undefined" && typeof Deno.version?.deno === "string";
function isLikelyReactComponent(type) {
  switch (typeof type) {
    case "function":
      return true;
    case "object":
      if (type != null) {
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
          case REACT_MEMO_TYPE:
            return true;
          default:
            return false;
        }
      }
      return false;
    default:
      return false;
  }
}
function createNamedContext(defaultValue, name) {
  const ctx = createContext(defaultValue);
  ctx.displayName = name;
  return ctx;
}
export {
  createNamedContext,
  inDeno,
  isLikelyReactComponent
};
