// https://cdn.esm.sh/v53/scheduler@0.20.2/deno/tracing.development.js
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
var require_scheduler_tracing_development = __commonJS({
  "esm-build-93e261b50d76bac2caab63ce8fa24736c23907c3/node_modules/scheduler/cjs/scheduler-tracing.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var DEFAULT_THREAD_ID = 0;
        var interactionIDCounter = 0;
        var threadIDCounter = 0;
        exports.__interactionsRef = null;
        exports.__subscriberRef = null;
        {
          exports.__interactionsRef = {
            current: new Set()
          };
          exports.__subscriberRef = {
            current: null
          };
        }
        function unstable_clear2(callback) {
          var prevInteractions = exports.__interactionsRef.current;
          exports.__interactionsRef.current = new Set();
          try {
            return callback();
          } finally {
            exports.__interactionsRef.current = prevInteractions;
          }
        }
        function unstable_getCurrent2() {
          {
            return exports.__interactionsRef.current;
          }
        }
        function unstable_getThreadID2() {
          return ++threadIDCounter;
        }
        function unstable_trace2(name, timestamp, callback) {
          var threadID = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : DEFAULT_THREAD_ID;
          var interaction = {
            __count: 1,
            id: interactionIDCounter++,
            name,
            timestamp
          };
          var prevInteractions = exports.__interactionsRef.current;
          var interactions = new Set(prevInteractions);
          interactions.add(interaction);
          exports.__interactionsRef.current = interactions;
          var subscriber = exports.__subscriberRef.current;
          var returnValue;
          try {
            if (subscriber !== null) {
              subscriber.onInteractionTraced(interaction);
            }
          } finally {
            try {
              if (subscriber !== null) {
                subscriber.onWorkStarted(interactions, threadID);
              }
            } finally {
              try {
                returnValue = callback();
              } finally {
                exports.__interactionsRef.current = prevInteractions;
                try {
                  if (subscriber !== null) {
                    subscriber.onWorkStopped(interactions, threadID);
                  }
                } finally {
                  interaction.__count--;
                  if (subscriber !== null && interaction.__count === 0) {
                    subscriber.onInteractionScheduledWorkCompleted(interaction);
                  }
                }
              }
            }
          }
          return returnValue;
        }
        function unstable_wrap2(callback) {
          var threadID = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : DEFAULT_THREAD_ID;
          var wrappedInteractions = exports.__interactionsRef.current;
          var subscriber = exports.__subscriberRef.current;
          if (subscriber !== null) {
            subscriber.onWorkScheduled(wrappedInteractions, threadID);
          }
          wrappedInteractions.forEach(function(interaction) {
            interaction.__count++;
          });
          var hasRun = false;
          function wrapped() {
            var prevInteractions = exports.__interactionsRef.current;
            exports.__interactionsRef.current = wrappedInteractions;
            subscriber = exports.__subscriberRef.current;
            try {
              var returnValue;
              try {
                if (subscriber !== null) {
                  subscriber.onWorkStarted(wrappedInteractions, threadID);
                }
              } finally {
                try {
                  returnValue = callback.apply(void 0, arguments);
                } finally {
                  exports.__interactionsRef.current = prevInteractions;
                  if (subscriber !== null) {
                    subscriber.onWorkStopped(wrappedInteractions, threadID);
                  }
                }
              }
              return returnValue;
            } finally {
              if (!hasRun) {
                hasRun = true;
                wrappedInteractions.forEach(function(interaction) {
                  interaction.__count--;
                  if (subscriber !== null && interaction.__count === 0) {
                    subscriber.onInteractionScheduledWorkCompleted(interaction);
                  }
                });
              }
            }
          }
          wrapped.cancel = function cancel() {
            subscriber = exports.__subscriberRef.current;
            try {
              if (subscriber !== null) {
                subscriber.onWorkCanceled(wrappedInteractions, threadID);
              }
            } finally {
              wrappedInteractions.forEach(function(interaction) {
                interaction.__count--;
                if (subscriber && interaction.__count === 0) {
                  subscriber.onInteractionScheduledWorkCompleted(interaction);
                }
              });
            }
          };
          return wrapped;
        }
        var subscribers = null;
        {
          subscribers = new Set();
        }
        function unstable_subscribe2(subscriber) {
          {
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
              exports.__subscriberRef.current = {
                onInteractionScheduledWorkCompleted,
                onInteractionTraced,
                onWorkCanceled,
                onWorkScheduled,
                onWorkStarted,
                onWorkStopped
              };
            }
          }
        }
        function unstable_unsubscribe2(subscriber) {
          {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
              exports.__subscriberRef.current = null;
            }
          }
        }
        function onInteractionTraced(interaction) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onInteractionTraced(interaction);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        function onInteractionScheduledWorkCompleted(interaction) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onInteractionScheduledWorkCompleted(interaction);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        function onWorkScheduled(interactions, threadID) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onWorkScheduled(interactions, threadID);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        function onWorkStarted(interactions, threadID) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onWorkStarted(interactions, threadID);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        function onWorkStopped(interactions, threadID) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onWorkStopped(interactions, threadID);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        function onWorkCanceled(interactions, threadID) {
          var didCatchError = false;
          var caughtError = null;
          subscribers.forEach(function(subscriber) {
            try {
              subscriber.onWorkCanceled(interactions, threadID);
            } catch (error) {
              if (!didCatchError) {
                didCatchError = true;
                caughtError = error;
              }
            }
          });
          if (didCatchError) {
            throw caughtError;
          }
        }
        exports.unstable_clear = unstable_clear2;
        exports.unstable_getCurrent = unstable_getCurrent2;
        exports.unstable_getThreadID = unstable_getThreadID2;
        exports.unstable_subscribe = unstable_subscribe2;
        exports.unstable_trace = unstable_trace2;
        exports.unstable_unsubscribe = unstable_unsubscribe2;
        exports.unstable_wrap = unstable_wrap2;
      })();
    }
  }
});
var require_tracing = __commonJS({
  "esm-build-93e261b50d76bac2caab63ce8fa24736c23907c3/node_modules/scheduler/tracing.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_scheduler_tracing_development();
    }
  }
});
var __star = __toModule(require_tracing());
var import_tracing = __toModule(require_tracing());
var { __interactionsRef, __subscriberRef, unstable_clear, unstable_getCurrent, unstable_getThreadID, unstable_subscribe, unstable_trace, unstable_unsubscribe, unstable_wrap } = __star;
var export_default = import_tracing.default;
export {
  __interactionsRef,
  __subscriberRef,
  export_default as default,
  unstable_clear,
  unstable_getCurrent,
  unstable_getThreadID,
  unstable_subscribe,
  unstable_trace,
  unstable_unsubscribe,
  unstable_wrap
};
/** @license React v0.20.2
 * scheduler-tracing.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
