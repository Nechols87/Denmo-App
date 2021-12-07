// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/hooks.ts
import { useContext, useMemo } from "../../../../../esm.sh/react@17.0.2.js";
import util from "../../shared/util.js";
import events from "../core/events.js";
import { RouterContext, SSRContext } from "./context.js";
import { inDeno } from "./helper.js";
var AsyncUseDenoError = class extends Error {
};
function useRouter() {
  return useContext(RouterContext);
}
function useDeno(callback, options) {
  const { key, revalidate } = options || {};
  const uuid = arguments[2];
  const id = useMemo(() => [uuid, key].filter(Boolean).join("-"), [key]);
  const { request, dataCache } = useContext(SSRContext);
  const router = useRouter();
  return useMemo(() => {
    const href = router.toString();
    const dataUrl = `pagedata://${href}`;
    if (inDeno) {
      if (id in dataCache) {
        return dataCache[id];
      }
      let expires = 0;
      if (util.isNumber(revalidate)) {
        expires = Date.now() + Math.round(revalidate * 1e3);
      } else if (revalidate === true) {
        expires = Date.now() - 1e3;
      } else if (util.isPlainObject(revalidate) && util.isNumber(revalidate.date)) {
        expires = revalidate.date;
      }
      const value = callback(request);
      events.emit(`useDeno-${dataUrl}`, { id, value, expires });
      if (value instanceof Promise) {
        throw new AsyncUseDenoError();
      }
      dataCache[id] = value;
      return value;
    }
    const data = window[`${dataUrl}#${id}`];
    return data?.value;
  }, [id, router, dataCache, request]);
}
export {
  AsyncUseDenoError,
  useDeno,
  useRouter
};
