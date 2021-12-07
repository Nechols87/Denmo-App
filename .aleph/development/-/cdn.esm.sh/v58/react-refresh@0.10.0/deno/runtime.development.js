// https://cdn.esm.sh/v58/react-refresh@0.10.0/deno/runtime.development.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};
var require_react_refresh_runtime_development = __commonJS({
  "esm-build-c31875f88b9c1cc5e93b414c9ae46a380a481c98-a1aba1af/node_modules/react-refresh/cjs/react-refresh-runtime.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var REACT_ELEMENT_TYPE = 60103;
        var REACT_PORTAL_TYPE = 60106;
        var REACT_FRAGMENT_TYPE = 60107;
        var REACT_STRICT_MODE_TYPE = 60108;
        var REACT_PROFILER_TYPE = 60114;
        var REACT_PROVIDER_TYPE = 60109;
        var REACT_CONTEXT_TYPE = 60110;
        var REACT_FORWARD_REF_TYPE = 60112;
        var REACT_SUSPENSE_TYPE = 60113;
        var REACT_SUSPENSE_LIST_TYPE = 60120;
        var REACT_MEMO_TYPE = 60115;
        var REACT_LAZY_TYPE = 60116;
        var REACT_SCOPE_TYPE = 60119;
        var REACT_OPAQUE_ID_TYPE = 60128;
        var REACT_DEBUG_TRACING_MODE_TYPE = 60129;
        var REACT_OFFSCREEN_TYPE = 60130;
        var REACT_LEGACY_HIDDEN_TYPE = 60131;
        var REACT_CACHE_TYPE = 60132;
        if (typeof Symbol === "function" && Symbol.for) {
          var symbolFor = Symbol.for;
          REACT_ELEMENT_TYPE = symbolFor("react.element");
          REACT_PORTAL_TYPE = symbolFor("react.portal");
          REACT_FRAGMENT_TYPE = symbolFor("react.fragment");
          REACT_STRICT_MODE_TYPE = symbolFor("react.strict_mode");
          REACT_PROFILER_TYPE = symbolFor("react.profiler");
          REACT_PROVIDER_TYPE = symbolFor("react.provider");
          REACT_CONTEXT_TYPE = symbolFor("react.context");
          REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
          REACT_SUSPENSE_TYPE = symbolFor("react.suspense");
          REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
          REACT_MEMO_TYPE = symbolFor("react.memo");
          REACT_LAZY_TYPE = symbolFor("react.lazy");
          REACT_SCOPE_TYPE = symbolFor("react.scope");
          REACT_OPAQUE_ID_TYPE = symbolFor("react.opaque.id");
          REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
          REACT_OFFSCREEN_TYPE = symbolFor("react.offscreen");
          REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
          REACT_CACHE_TYPE = symbolFor("react.cache");
        }
        var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
        var allFamiliesByID = new Map();
        var allFamiliesByType = new PossiblyWeakMap();
        var allSignaturesByType = new PossiblyWeakMap();
        var updatedFamiliesByType = new PossiblyWeakMap();
        var pendingUpdates = [];
        var helpersByRendererID = new Map();
        var helpersByRoot = new Map();
        var mountedRoots = new Set();
        var failedRoots = new Set();
        var rootElements = typeof WeakMap === "function" ? new WeakMap() : null;
        var isPerformingRefresh = false;
        function computeFullKey(signature) {
          if (signature.fullKey !== null) {
            return signature.fullKey;
          }
          var fullKey = signature.ownKey;
          var hooks;
          try {
            hooks = signature.getCustomHooks();
          } catch (err) {
            signature.forceReset = true;
            signature.fullKey = fullKey;
            return fullKey;
          }
          for (var i = 0; i < hooks.length; i++) {
            var hook = hooks[i];
            if (typeof hook !== "function") {
              signature.forceReset = true;
              signature.fullKey = fullKey;
              return fullKey;
            }
            var nestedHookSignature = allSignaturesByType.get(hook);
            if (nestedHookSignature === void 0) {
              continue;
            }
            var nestedHookKey = computeFullKey(nestedHookSignature);
            if (nestedHookSignature.forceReset) {
              signature.forceReset = true;
            }
            fullKey += "\n---\n" + nestedHookKey;
          }
          signature.fullKey = fullKey;
          return fullKey;
        }
        function haveEqualSignatures(prevType, nextType) {
          var prevSignature = allSignaturesByType.get(prevType);
          var nextSignature = allSignaturesByType.get(nextType);
          if (prevSignature === void 0 && nextSignature === void 0) {
            return true;
          }
          if (prevSignature === void 0 || nextSignature === void 0) {
            return false;
          }
          if (computeFullKey(prevSignature) !== computeFullKey(nextSignature)) {
            return false;
          }
          if (nextSignature.forceReset) {
            return false;
          }
          return true;
        }
        function isReactClass(type) {
          return type.prototype && type.prototype.isReactComponent;
        }
        function canPreserveStateBetween(prevType, nextType) {
          if (isReactClass(prevType) || isReactClass(nextType)) {
            return false;
          }
          if (haveEqualSignatures(prevType, nextType)) {
            return true;
          }
          return false;
        }
        function resolveFamily(type) {
          return updatedFamiliesByType.get(type);
        }
        function cloneMap(map) {
          var clone = new Map();
          map.forEach(function(value, key) {
            clone.set(key, value);
          });
          return clone;
        }
        function cloneSet(set) {
          var clone = new Set();
          set.forEach(function(value) {
            clone.add(value);
          });
          return clone;
        }
        function getProperty(object, property) {
          try {
            return object[property];
          } catch (err) {
            return void 0;
          }
        }
        function performReactRefresh2() {
          if (pendingUpdates.length === 0) {
            return null;
          }
          if (isPerformingRefresh) {
            return null;
          }
          isPerformingRefresh = true;
          try {
            var staleFamilies = new Set();
            var updatedFamilies = new Set();
            var updates = pendingUpdates;
            pendingUpdates = [];
            updates.forEach(function(_ref) {
              var family = _ref[0], nextType = _ref[1];
              var prevType = family.current;
              updatedFamiliesByType.set(prevType, family);
              updatedFamiliesByType.set(nextType, family);
              family.current = nextType;
              if (canPreserveStateBetween(prevType, nextType)) {
                updatedFamilies.add(family);
              } else {
                staleFamilies.add(family);
              }
            });
            var update = {
              updatedFamilies,
              staleFamilies
            };
            helpersByRendererID.forEach(function(helpers) {
              helpers.setRefreshHandler(resolveFamily);
            });
            var didError = false;
            var firstError = null;
            var failedRootsSnapshot = cloneSet(failedRoots);
            var mountedRootsSnapshot = cloneSet(mountedRoots);
            var helpersByRootSnapshot = cloneMap(helpersByRoot);
            failedRootsSnapshot.forEach(function(root) {
              var helpers = helpersByRootSnapshot.get(root);
              if (helpers === void 0) {
                throw new Error("Could not find helpers for a root. This is a bug in React Refresh.");
              }
              if (!failedRoots.has(root)) {
              }
              if (rootElements === null) {
                return;
              }
              if (!rootElements.has(root)) {
                return;
              }
              var element = rootElements.get(root);
              try {
                helpers.scheduleRoot(root, element);
              } catch (err) {
                if (!didError) {
                  didError = true;
                  firstError = err;
                }
              }
            });
            mountedRootsSnapshot.forEach(function(root) {
              var helpers = helpersByRootSnapshot.get(root);
              if (helpers === void 0) {
                throw new Error("Could not find helpers for a root. This is a bug in React Refresh.");
              }
              if (!mountedRoots.has(root)) {
              }
              try {
                helpers.scheduleRefresh(root, update);
              } catch (err) {
                if (!didError) {
                  didError = true;
                  firstError = err;
                }
              }
            });
            if (didError) {
              throw firstError;
            }
            return update;
          } finally {
            isPerformingRefresh = false;
          }
        }
        function register2(type, id) {
          {
            if (type === null) {
              return;
            }
            if (typeof type !== "function" && typeof type !== "object") {
              return;
            }
            if (allFamiliesByType.has(type)) {
              return;
            }
            var family = allFamiliesByID.get(id);
            if (family === void 0) {
              family = {
                current: type
              };
              allFamiliesByID.set(id, family);
            } else {
              pendingUpdates.push([family, type]);
            }
            allFamiliesByType.set(type, family);
            if (typeof type === "object" && type !== null) {
              switch (getProperty(type, "$$typeof")) {
                case REACT_FORWARD_REF_TYPE:
                  register2(type.render, id + "$render");
                  break;
                case REACT_MEMO_TYPE:
                  register2(type.type, id + "$type");
                  break;
              }
            }
          }
        }
        function setSignature2(type, key) {
          var forceReset = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
          var getCustomHooks = arguments.length > 3 ? arguments[3] : void 0;
          {
            if (!allSignaturesByType.has(type)) {
              allSignaturesByType.set(type, {
                forceReset,
                ownKey: key,
                fullKey: null,
                getCustomHooks: getCustomHooks || function() {
                  return [];
                }
              });
            }
            if (typeof type === "object" && type !== null) {
              switch (getProperty(type, "$$typeof")) {
                case REACT_FORWARD_REF_TYPE:
                  setSignature2(type.render, key, forceReset, getCustomHooks);
                  break;
                case REACT_MEMO_TYPE:
                  setSignature2(type.type, key, forceReset, getCustomHooks);
                  break;
              }
            }
          }
        }
        function collectCustomHooksForSignature2(type) {
          {
            var signature = allSignaturesByType.get(type);
            if (signature !== void 0) {
              computeFullKey(signature);
            }
          }
        }
        function getFamilyByID2(id) {
          {
            return allFamiliesByID.get(id);
          }
        }
        function getFamilyByType2(type) {
          {
            return allFamiliesByType.get(type);
          }
        }
        function findAffectedHostInstances2(families) {
          {
            var affectedInstances = new Set();
            mountedRoots.forEach(function(root) {
              var helpers = helpersByRoot.get(root);
              if (helpers === void 0) {
                throw new Error("Could not find helpers for a root. This is a bug in React Refresh.");
              }
              var instancesForRoot = helpers.findHostInstancesForRefresh(root, families);
              instancesForRoot.forEach(function(inst) {
                affectedInstances.add(inst);
              });
            });
            return affectedInstances;
          }
        }
        function injectIntoGlobalHook2(globalObject) {
          {
            var hook = globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook === void 0) {
              var nextID = 0;
              globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
                renderers: new Map(),
                supportsFiber: true,
                inject: function(injected) {
                  return nextID++;
                },
                onScheduleFiberRoot: function(id, root, children) {
                },
                onCommitFiberRoot: function(id, root, maybePriorityLevel, didError) {
                },
                onCommitFiberUnmount: function() {
                }
              };
            }
            if (hook.isDisabled) {
              console["warn"]("Something has shimmed the React DevTools global hook (__REACT_DEVTOOLS_GLOBAL_HOOK__). Fast Refresh is not compatible with this shim and will be disabled.");
              return;
            }
            var oldInject = hook.inject;
            hook.inject = function(injected) {
              var id = oldInject.apply(this, arguments);
              if (typeof injected.scheduleRefresh === "function" && typeof injected.setRefreshHandler === "function") {
                helpersByRendererID.set(id, injected);
              }
              return id;
            };
            hook.renderers.forEach(function(injected, id) {
              if (typeof injected.scheduleRefresh === "function" && typeof injected.setRefreshHandler === "function") {
                helpersByRendererID.set(id, injected);
              }
            });
            var oldOnCommitFiberRoot = hook.onCommitFiberRoot;
            var oldOnScheduleFiberRoot = hook.onScheduleFiberRoot || function() {
            };
            hook.onScheduleFiberRoot = function(id, root, children) {
              if (!isPerformingRefresh) {
                failedRoots.delete(root);
                if (rootElements !== null) {
                  rootElements.set(root, children);
                }
              }
              return oldOnScheduleFiberRoot.apply(this, arguments);
            };
            hook.onCommitFiberRoot = function(id, root, maybePriorityLevel, didError) {
              var helpers = helpersByRendererID.get(id);
              if (helpers !== void 0) {
                helpersByRoot.set(root, helpers);
                var current = root.current;
                var alternate = current.alternate;
                if (alternate !== null) {
                  var wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null;
                  var isMounted = current.memoizedState != null && current.memoizedState.element != null;
                  if (!wasMounted && isMounted) {
                    mountedRoots.add(root);
                    failedRoots.delete(root);
                  } else if (wasMounted && isMounted)
                    ;
                  else if (wasMounted && !isMounted) {
                    mountedRoots.delete(root);
                    if (didError) {
                      failedRoots.add(root);
                    } else {
                      helpersByRoot.delete(root);
                    }
                  } else if (!wasMounted && !isMounted) {
                    if (didError) {
                      failedRoots.add(root);
                    }
                  }
                } else {
                  mountedRoots.add(root);
                }
              }
              return oldOnCommitFiberRoot.apply(this, arguments);
            };
          }
        }
        function hasUnrecoverableErrors2() {
          return false;
        }
        function _getMountedRootCount2() {
          {
            return mountedRoots.size;
          }
        }
        function createSignatureFunctionForTransform2() {
          {
            var savedType;
            var hasCustomHooks;
            var didCollectHooks = false;
            return function(type, key, forceReset, getCustomHooks) {
              if (typeof key === "string") {
                if (!savedType) {
                  savedType = type;
                  hasCustomHooks = typeof getCustomHooks === "function";
                }
                if (type != null && (typeof type === "function" || typeof type === "object")) {
                  setSignature2(type, key, forceReset, getCustomHooks);
                }
                return type;
              } else {
                if (!didCollectHooks && hasCustomHooks) {
                  didCollectHooks = true;
                  collectCustomHooksForSignature2(savedType);
                }
              }
            };
          }
        }
        function isLikelyComponentType2(type) {
          {
            switch (typeof type) {
              case "function": {
                if (type.prototype != null) {
                  if (type.prototype.isReactComponent) {
                    return true;
                  }
                  var ownNames = Object.getOwnPropertyNames(type.prototype);
                  if (ownNames.length > 1 || ownNames[0] !== "constructor") {
                    return false;
                  }
                  if (type.prototype.__proto__ !== Object.prototype) {
                    return false;
                  }
                }
                var name = type.name || type.displayName;
                return typeof name === "string" && /^[A-Z]/.test(name);
              }
              case "object": {
                if (type != null) {
                  switch (getProperty(type, "$$typeof")) {
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_MEMO_TYPE:
                      return true;
                    default:
                      return false;
                  }
                }
                return false;
              }
              default: {
                return false;
              }
            }
          }
        }
        exports._getMountedRootCount = _getMountedRootCount2;
        exports.collectCustomHooksForSignature = collectCustomHooksForSignature2;
        exports.createSignatureFunctionForTransform = createSignatureFunctionForTransform2;
        exports.findAffectedHostInstances = findAffectedHostInstances2;
        exports.getFamilyByID = getFamilyByID2;
        exports.getFamilyByType = getFamilyByType2;
        exports.hasUnrecoverableErrors = hasUnrecoverableErrors2;
        exports.injectIntoGlobalHook = injectIntoGlobalHook2;
        exports.isLikelyComponentType = isLikelyComponentType2;
        exports.performReactRefresh = performReactRefresh2;
        exports.register = register2;
        exports.setSignature = setSignature2;
      })();
    }
  }
});
var require_runtime = __commonJS({
  "esm-build-c31875f88b9c1cc5e93b414c9ae46a380a481c98-a1aba1af/node_modules/react-refresh/runtime.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_refresh_runtime_development();
    }
  }
});
var __star = __toModule(require_runtime());
var import_runtime = __toModule(require_runtime());
var { _getMountedRootCount, collectCustomHooksForSignature, createSignatureFunctionForTransform, findAffectedHostInstances, getFamilyByID, getFamilyByType, hasUnrecoverableErrors, injectIntoGlobalHook, isLikelyComponentType, performReactRefresh, register, setSignature } = __star;
var export_default = import_runtime.default;
export {
  _getMountedRootCount,
  collectCustomHooksForSignature,
  createSignatureFunctionForTransform,
  export_default as default,
  findAffectedHostInstances,
  getFamilyByID,
  getFamilyByType,
  hasUnrecoverableErrors,
  injectIntoGlobalHook,
  isLikelyComponentType,
  performReactRefresh,
  register,
  setSignature
};
/** @license React vundefined
 * react-refresh-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
