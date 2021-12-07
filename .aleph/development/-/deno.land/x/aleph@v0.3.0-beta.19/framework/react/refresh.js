// https://deno.land/x/aleph@v0.3.0-beta.19/framework/react/refresh.ts
import runtime from "../../../../../esm.sh/react-refresh@0.10.0/runtime.js";
import util from "../../shared/util.js";
runtime.injectIntoGlobalHook(window);
Object.assign(window, {
  $RefreshReg$: () => {
  },
  $RefreshSig$: () => (type) => type,
  __REACT_REFRESH_RUNTIME__: runtime,
  __REACT_REFRESH__: util.debounce(runtime.performReactRefresh, 30)
});
