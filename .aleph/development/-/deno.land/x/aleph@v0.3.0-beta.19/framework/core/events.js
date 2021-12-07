// https://deno.land/x/aleph@v0.3.0-beta.19/framework/core/events.ts
function createIterResult(value, done) {
  return { value, done };
}
var defaultMaxListeners = 10;
var _EventEmitter = class {
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(value) {
    defaultMaxListeners = value;
  }
  constructor() {
    this._events = new Map();
  }
  _addListener(eventName, listener, prepend) {
    this.emit("newListener", eventName, listener);
    if (this._events.has(eventName)) {
      const listeners = this._events.get(eventName);
      if (prepend) {
        listeners.unshift(listener);
      } else {
        listeners.push(listener);
      }
    } else {
      this._events.set(eventName, [listener]);
    }
    const max = this.getMaxListeners();
    if (max > 0 && this.listenerCount(eventName) > max) {
      const warning = new Error(`Possible EventEmitter memory leak detected.
         ${this.listenerCount(eventName)} ${eventName.toString()} listeners.
         Use emitter.setMaxListeners() to increase limit`);
      warning.name = "MaxListenersExceededWarning";
      console.warn(warning);
    }
    return this;
  }
  addListener(eventName, listener) {
    return this._addListener(eventName, listener, false);
  }
  emit(eventName, ...args) {
    if (this._events.has(eventName)) {
      if (eventName === "error" && this._events.get(_EventEmitter.errorMonitor)) {
        this.emit(_EventEmitter.errorMonitor, ...args);
      }
      const listeners = this._events.get(eventName).slice();
      for (const listener of listeners) {
        try {
          listener.apply(this, args);
        } catch (err) {
          this.emit("error", err);
        }
      }
      return true;
    } else if (eventName === "error") {
      if (this._events.get(_EventEmitter.errorMonitor)) {
        this.emit(_EventEmitter.errorMonitor, ...args);
      }
      const errMsg = args.length > 0 ? args[0] : Error("Unhandled error.");
      throw errMsg;
    }
    return false;
  }
  eventNames() {
    return Array.from(this._events.keys());
  }
  getMaxListeners() {
    return this.maxListeners || _EventEmitter.defaultMaxListeners;
  }
  listenerCount(eventName) {
    if (this._events.has(eventName)) {
      return this._events.get(eventName).length;
    } else {
      return 0;
    }
  }
  _listeners(target, eventName, unwrap) {
    if (!target._events.has(eventName)) {
      return [];
    }
    const eventListeners = target._events.get(eventName);
    return unwrap ? this.unwrapListeners(eventListeners) : eventListeners.slice(0);
  }
  unwrapListeners(arr) {
    const unwrappedListeners = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      unwrappedListeners[i] = arr[i]["listener"] || arr[i];
    }
    return unwrappedListeners;
  }
  listeners(eventName) {
    return this._listeners(this, eventName, true);
  }
  rawListeners(eventName) {
    return this._listeners(this, eventName, false);
  }
  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }
  on(eventName, listener) {
    return this._addListener(eventName, listener, false);
  }
  once(eventName, listener) {
    const wrapped = this.onceWrap(eventName, listener);
    this.on(eventName, wrapped);
    return this;
  }
  onceWrap(eventName, listener) {
    const wrapper = function(...args) {
      this.context.removeListener(this.eventName, this.rawListener);
      this.listener.apply(this.context, args);
    };
    const wrapperContext = {
      eventName,
      listener,
      rawListener: wrapper,
      context: this
    };
    const wrapped = wrapper.bind(wrapperContext);
    wrapperContext.rawListener = wrapped;
    wrapped.listener = listener;
    return wrapped;
  }
  prependListener(eventName, listener) {
    return this._addListener(eventName, listener, true);
  }
  prependOnceListener(eventName, listener) {
    const wrapped = this.onceWrap(eventName, listener);
    this.prependListener(eventName, wrapped);
    return this;
  }
  removeAllListeners(eventName) {
    if (this._events === void 0) {
      return this;
    }
    if (eventName) {
      if (this._events.has(eventName)) {
        const listeners = this._events.get(eventName).slice();
        this._events.delete(eventName);
        for (const listener of listeners) {
          this.emit("removeListener", eventName, listener);
        }
      }
    } else {
      const eventList = this.eventNames();
      eventList.map((value) => {
        this.removeAllListeners(value);
      });
    }
    return this;
  }
  removeListener(eventName, listener) {
    if (this._events.has(eventName)) {
      const arr = this._events.get(eventName);
      let listenerIndex = -1;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == listener || arr[i] && arr[i]["listener"] == listener) {
          listenerIndex = i;
          break;
        }
      }
      if (listenerIndex >= 0) {
        arr.splice(listenerIndex, 1);
        this.emit("removeListener", eventName, listener);
        if (arr.length === 0) {
          this._events.delete(eventName);
        }
      }
    }
    return this;
  }
  setMaxListeners(n) {
    if (n !== Infinity) {
      if (n === 0) {
        n = Infinity;
      } else {
        if (!Number.isInteger(n)) {
          throw new Error("The max number of listeners must be an integer");
        }
        if (n < 0) {
          throw new Error("The max number of listeners must be >= 0");
        }
      }
    }
    this.maxListeners = n;
    return this;
  }
  static once(emitter, name) {
    return new Promise((resolve, reject) => {
      if (emitter instanceof EventTarget) {
        emitter.addEventListener(name, (...args) => {
          resolve(args);
        }, { once: true, passive: false, capture: false });
        return;
      } else if (emitter instanceof _EventEmitter) {
        const eventListener = (...args) => {
          if (errorListener !== void 0) {
            emitter.removeListener("error", errorListener);
          }
          resolve(args);
        };
        let errorListener;
        if (name !== "error") {
          errorListener = (err) => {
            emitter.removeListener(name, eventListener);
            reject(err);
          };
          emitter.once("error", errorListener);
        }
        emitter.once(name, eventListener);
        return;
      }
    });
  }
  static on(emitter, event) {
    const unconsumedEventValues = [];
    const unconsumedPromises = [];
    let error = null;
    let finished = false;
    const iterator = {
      next() {
        const value = unconsumedEventValues.shift();
        if (value) {
          return Promise.resolve(createIterResult(value, false));
        }
        if (error) {
          const p = Promise.reject(error);
          error = null;
          return p;
        }
        if (finished) {
          return Promise.resolve(createIterResult(void 0, true));
        }
        return new Promise(function(resolve, reject) {
          unconsumedPromises.push({ resolve, reject });
        });
      },
      return() {
        emitter.removeListener(event, eventHandler);
        emitter.removeListener("error", errorHandler);
        finished = true;
        for (const promise of unconsumedPromises) {
          promise.resolve(createIterResult(void 0, true));
        }
        return Promise.resolve(createIterResult(void 0, true));
      },
      throw(err) {
        error = err;
        emitter.removeListener(event, eventHandler);
        emitter.removeListener("error", errorHandler);
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
    emitter.on(event, eventHandler);
    emitter.on("error", errorHandler);
    return iterator;
    function eventHandler(...args) {
      const promise = unconsumedPromises.shift();
      if (promise) {
        promise.resolve(createIterResult(args, false));
      } else {
        unconsumedEventValues.push(args);
      }
    }
    function errorHandler(err) {
      finished = true;
      const toError = unconsumedPromises.shift();
      if (toError) {
        toError.reject(err);
      } else {
        error = err;
      }
      iterator.return();
    }
  }
};
var EventEmitter = _EventEmitter;
EventEmitter.captureRejectionSymbol = Symbol.for("nodejs.rejection");
EventEmitter.errorMonitor = Symbol("events.errorMonitor");
var once = EventEmitter.once;
var on = EventEmitter.on;
var captureRejectionSymbol = EventEmitter.captureRejectionSymbol;
var errorMonitor = EventEmitter.errorMonitor;
var events = new EventEmitter();
events.setMaxListeners(1 << 10);
var events_default = events;
export {
  EventEmitter,
  captureRejectionSymbol,
  events_default as default,
  defaultMaxListeners,
  errorMonitor,
  on,
  once
};
