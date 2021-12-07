// https://deno.land/x/aleph@v0.3.0-beta.19/shared/util.ts
var util_default = {
  isNumber(a) {
    return typeof a === "number" && !isNaN(a);
  },
  isString(a) {
    return typeof a === "string";
  },
  isFilledString(a) {
    return typeof a === "string" && a.length > 0;
  },
  isArray(a) {
    return Array.isArray(a);
  },
  isFilledArray(a) {
    return Array.isArray(a) && a.length > 0;
  },
  isPlainObject(a) {
    return typeof a === "object" && a !== null && Object.getPrototypeOf(a) === Object.prototype;
  },
  isFunction(a) {
    return typeof a === "function";
  },
  isLikelyHttpURL(s) {
    const p = s.slice(0, 8).toLowerCase();
    return p === "https://" || p.slice(0, 7) === "http://";
  },
  trimPrefix(s, prefix) {
    if (prefix !== "" && s.startsWith(prefix)) {
      return s.slice(prefix.length);
    }
    return s;
  },
  trimSuffix(s, suffix) {
    if (suffix !== "" && s.endsWith(suffix)) {
      return s.slice(0, -suffix.length);
    }
    return s;
  },
  splitBy(s, searchString, fromLast = false) {
    const i = fromLast ? s.lastIndexOf(searchString) : s.indexOf(searchString);
    if (i >= 0) {
      return [s.slice(0, i), s.slice(i + 1)];
    }
    return [s, ""];
  },
  btoaUrl(s) {
    return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  },
  atobUrl(b64) {
    const b = b64.length % 4;
    if (b === 3) {
      b64 += "=";
    } else if (b === 2) {
      b64 += "==";
    } else if (b === 1) {
      throw new TypeError("Illegal base64 Url String");
    }
    b64 = b64.replace(/\-/g, "+").replace(/_/g, "/");
    return atob(b64);
  },
  formatBytes(bytes) {
    const fix = (n) => {
      if (n >= 10) {
        return Math.ceil(n);
      } else {
        return (Math.round(10 * n) / 10).toFixed(1).replace(/\.0$/, "");
      }
    };
    if (bytes < 1024) {
      return bytes.toString() + "B";
    }
    if (bytes < 1024 ** 2) {
      return fix(bytes / 1024) + "KB";
    }
    if (bytes < 1024 ** 3) {
      return fix(bytes / 1024 ** 2) + "MB";
    }
    if (bytes < 1024 ** 4) {
      return fix(bytes / 1024 ** 3) + "GB";
    }
    if (bytes < 1024 ** 5) {
      return fix(bytes / 1024 ** 4) + "TB";
    }
    return fix(bytes / 1024 ** 5) + "PB";
  },
  splitPath(path) {
    return path.split(/[\/\\]+/g).map((p) => p.trim()).filter((p) => p !== "" && p !== ".").reduce((slice, p) => {
      if (p === "..") {
        slice.pop();
      } else {
        slice.push(p);
      }
      return slice;
    }, []);
  },
  cleanPath(path) {
    return "/" + this.splitPath(path).join("/");
  },
  debounce(callback, delay) {
    let timer = null;
    return (...args) => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        callback(...args);
      }, delay);
    };
  },
  debounceById(id, callback, delay) {
    const self = this;
    const timers = self.__debounce_timers || (self.__debounce_timers = new Map());
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
    }
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      callback();
    }, delay));
  },
  async isUrlOk(url) {
    const res = await fetch(url).catch((e) => e);
    await res.body?.cancel();
    return res.status === 200;
  }
};
export {
  util_default as default
};
