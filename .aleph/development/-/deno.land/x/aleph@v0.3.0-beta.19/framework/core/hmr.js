// https://deno.land/x/aleph@v0.3.0-beta.19/framework/core/hmr.ts
import events from "./events.js";
var Module = class {
  constructor(specifier) {
    this._isAccepted = false;
    this._isLocked = false;
    this._acceptCallbacks = [];
    this._specifier = specifier;
  }
  get specifier() {
    return this._specifier;
  }
  accept(callback) {
    if (this._isLocked) {
      return;
    }
    if (!this._isAccepted) {
      sendMessage({ specifier: this._specifier, type: "hotAccept" });
      this._isAccepted = true;
    }
    if (callback) {
      this._acceptCallbacks.push(callback);
    }
  }
  lock() {
    this._isLocked = true;
  }
  async applyUpdate(url) {
    try {
      const module = await import(url + "?t=" + Date.now());
      this._acceptCallbacks.forEach((cb) => cb(module));
    } catch (e) {
      location.reload();
    }
  }
};
var modules = new Map();
var state = {
  socket: null,
  messageQueue: []
};
function sendMessage(msg) {
  const json = JSON.stringify(msg);
  if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
    state.messageQueue.push(json);
  } else {
    state.socket.send(json);
  }
}
function connect(basePath) {
  const { location: location2 } = window;
  const { protocol, host } = location2;
  const wsUrl = (protocol === "https:" ? "wss" : "ws") + "://" + host + basePath.replace(/\/+$/, "") + "/_hmr";
  const ws = new WebSocket(wsUrl);
  const contact = (callback) => {
    setTimeout(() => {
      const ws2 = new WebSocket(wsUrl);
      ws2.addEventListener("open", callback);
      ws2.addEventListener("close", () => {
        contact(callback);
      });
    }, 500);
  };
  ws.addEventListener("open", () => {
    state.socket = ws;
    state.messageQueue.splice(0, state.messageQueue.length).forEach((msg) => ws.send(msg));
    console.log("[HMR] listening for file changes...");
  });
  ws.addEventListener("close", () => {
    if (state.socket !== null) {
      state.socket = null;
      console.log("[HMR] closed.");
      setTimeout(() => {
        connect(basePath);
      }, 300);
    } else {
      contact(() => location2.reload());
    }
  });
  ws.addEventListener("message", ({ data }) => {
    if (data) {
      try {
        const {
          type,
          specifier,
          updateUrl,
          routePath,
          isIndex,
          refreshPage
        } = JSON.parse(data);
        if (refreshPage === true) {
          location2.reload();
          return;
        }
        switch (type) {
          case "add":
            events.emit("add-module", {
              specifier,
              routePath,
              isIndex
            });
            break;
          case "update":
            const mod = modules.get(specifier);
            if (mod) {
              mod.applyUpdate(updateUrl);
            }
            break;
          case "remove":
            if (modules.has(specifier)) {
              modules.delete(specifier);
              events.emit("remove-module", specifier);
            }
            break;
        }
        console.log(`[HMR] ${type} module '${specifier}'`);
      } catch (err) {
        console.warn(err);
      }
    }
  });
}
Object.assign(window, {
  $createHotContext: (specifier) => {
    if (modules.has(specifier)) {
      const mod2 = modules.get(specifier);
      mod2.lock();
      return mod2;
    }
    const mod = new Module(specifier);
    modules.set(specifier, mod);
    return mod;
  }
});
export {
  connect
};
