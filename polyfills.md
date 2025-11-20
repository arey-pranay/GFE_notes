# ⭐ **JavaScript Polyfills — Full Notes**

---

# 1 — **What is a polyfill? (Theory)**

A **polyfill** is a piece of JavaScript code that **adds a feature to older browsers** that don't support it natively.

✔ Implemented in JS
✔ Mimics the behavior of a new feature
✔ Loaded before the main app
✔ Helps cross-browser compatibility

Example:
Older browsers don’t support `Array.prototype.includes`.
You create a polyfill so code works everywhere.

---

# 2 — **Why do we need polyfills?**

### ✔ Ensuring compatibility

Older browsers (IE11, older Chrome/Safari/Firefox) lack support for ES6+ features.

### ✔ Smooth progressive enhancement

New features work automatically if supported; fallbacks if not.

### ✔ Better UX

Error-free execution on older / embedded browsers (Smart TVs, POS systems, IoT).

### ✔ Dev productivity

Write modern JS without “if browser supports X then do Y”.

---

# 3 — **Difference between**

| Feature        | Purpose                                            |
| -------------- | -------------------------------------------------- |
| **Polyfill**   | Implements missing features                        |
| **Shim**       | Wraps old features with new API                    |
| **Transpiler** | Converts syntax (Babel)                            |
| **Ponyfill**   | Like polyfill but *does not modify global objects* |

**Polyfill modifies global scope.
Ponyfill does NOT modify global scope.**

---

# 4 — **How to write a polyfill (design rules)**

### 1. **Check first**

Always check if native support exists:

```js
if (!Array.prototype.includes) {
  // polyfill
}
```

### 2. **Match native behavior EXACTLY**

Follow:

* edge cases
* error handling
* same return types
* spec-compliant behavior (MDN/TC39 spec)

### 3. **Non-breaking**

Avoid modifying behavior when browser already supports it.

### 4. **Use correct internal logic**

Often requires following ECMAScript spec steps (like ToObject, ToIntegerOrInfinity).

### 5. **Avoid slow implementations**

E.g., use a `for` loop instead of `reduce` inside polyfills.

---

# 5 — **Simple Polyfills (ES5)**

---

## 5.1 **Polyfill: Array.prototype.forEach**

```js
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) throw new TypeError("Array.prototype.forEach called on null");
    if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

    const arr = Object(this);
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) callback.call(thisArg, arr[i], i, arr);
    }
  };
}
```

---

## 5.2 **Array.prototype.map**

```js
if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    if (this == null) throw new TypeError("called on null");

    const O = Object(this);
    const len = O.length >>> 0;
    const A = new Array(len);

    for (let k = 0; k < len; k++) {
      if (k in O) A[k] = callback.call(thisArg, O[k], k, O);
    }

    return A;
  };
}
```

---

## 5.3 **Array.prototype.filter**

```js
if (!Array.prototype.filter) {
  Array.prototype.filter = function (callback, thisArg) {
    const res = [];
    for (let i = 0; i < this.length; i++) {
      if (i in this && callback.call(thisArg, this[i], i, this)) {
        res.push(this[i]);
      }
    }
    return res;
  };
}
```

---

## 5.4 **Array.prototype.reduce**

```js
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (callback, initialValue) {
    if (this == null) throw new TypeError("Null called on reduce");
    if (typeof callback !== "function") throw new TypeError(callback + " is not a function");

    const O = Object(this);
    const len = O.length >>> 0;

    let i = 0, accumulator;

    if (arguments.length >= 2) {
      accumulator = initialValue;
    } else {
      while (i < len && !(i in O)) i++;
      if (i >= len) throw new TypeError("No initial value");
      accumulator = O[i++];
    }

    while (i < len) {
      if (i in O) accumulator = callback(accumulator, O[i], i, O);
      i++;
    }

    return accumulator;
  };
}
```

---

# 6 — **Medium Complexity Polyfills**

---

## 6.1 **Function.prototype.bind**

One of the most popular interview questions.

```js
if (!Function.prototype.bind) {
  Function.prototype.bind = function (context, ...args) {
    const fn = this;

    return function (...innerArgs) {
      return fn.apply(
        context,
        args.concat(innerArgs)
      );
    };
  };
}
```

---

## 6.2 **Object.assign**

```js
if (typeof Object.assign !== "function") {
  Object.assign = function (target, ...sources) {
    if (target == null) throw new TypeError("Cannot convert undefined or null");

    const to = Object(target);

    for (const src of sources) {
      if (src != null) {
        for (const key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) {
            to[key] = src[key];
          }
        }
      }
    }
    return to;
  };
}
```

---

## 6.3 **String.prototype.startsWith**

```js
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (search, pos) {
    pos = pos || 0;
    return this.slice(pos, pos + search.length) === search;
  };
}
```

---

# 7 — **Complex Polyfills (ES6+)**

---

## 7.1 **Promise Polyfill (high-level implementation)**

A full Promise polyfill is large, but here's a simplified version (spec-correct microtask queue omitted for brevity):

```js
(function (global) {
  if (global.Promise) return; // Already exists

  function Promise(executor) {
    if (typeof executor !== "function") throw new TypeError("executor must be function");

    this.state = "pending";
    this.value = undefined;
    this.handlers = [];

    const resolve = value => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = value;
      this.handlers.forEach(h => h.onFulfilled(value));
    };

    const reject = err => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = err;
      this.handlers.forEach(h => h.onRejected(err));
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      const handler = {
        onFulfilled: value => {
          if (typeof onFulfilled === "function") {
            try { resolve(onFulfilled(value)); }
            catch (e) { reject(e); }
          } else {
            resolve(value);
          }
        },
        onRejected: err => {
          if (typeof onRejected === "function") {
            try { resolve(onRejected(err)); }
            catch (e) { reject(e); }
          } else {
            reject(err);
          }
        }
      };

      if (this.state === "pending") {
        this.handlers.push(handler);
      } else if (this.state === "fulfilled") {
        handler.onFulfilled(this.value);
      } else {
        handler.onRejected(this.value);
      }
    });
  };

  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };

  global.Promise = Promise;
})(typeof window !== "undefined" ? window : global);
```

This covers:

* states
* executor
* resolve
* reject
* then
* catch
* async chain resolution

---

# 8 — **Polyfilling ES6+ Methods**

---

## 8.1 Object.entries

```js
if (!Object.entries) {
  Object.entries = function (obj) {
    const result = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) result.push([key, obj[key]]);
    }
    return result;
  };
}
```

---

## 8.2 Object.values

```js
if (!Object.values) {
  Object.values = function (obj) {
    const res = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) res.push(obj[key]);
    }
    return res;
  };
}
```

---

# 9 — **Event-related Polyfills**

---

## 9.1 CustomEvent (IE polyfill)

```js
(function () {
  if (typeof window.CustomEvent === "function") return;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();
```

---

## 9.2 Element.closest

```js
if (!Element.prototype.closest) {
  Element.prototype.closest = function (selector) {
    let el = this;
    while (el) {
      if (el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  };
}
```

---

# 10 — **Async/await polyfill**

JS cannot polyfill async/await in runtime.
Requires a **transpiler + Promise polyfill**.

Babel transforms:

```js
async function f() {}
```

to generator + regenerator runtime.

---

# 11 — **Performance Considerations**

### ✔ Prefer native methods

If polyfill exists, don’t overwrite it.

### ✔ Avoid heavy recursion

Slow on mobile browsers.

### ✔ Avoid generating garbage

Polyfills might run many times; minimize allocations inside loops.

### ✔ Use `for` loops for speed

Faster than `.forEach` in polyfills.

---

# 12 — **Debugging Polyfills**

### 1. Check if browser even needs it

`console.log("supports includes:", "includes" in Array.prototype)`

### 2. Wrap your polyfill in warnings

```js
if (window.Promise) console.warn("NOT using polyfill. Native Promise exists.");
```

### 3. Use try/catch inside polyfill

To match spec behavior.

---

# 13 — **Real-world usage**

### Libraries/polyfills used in production:

* `core-js`
* `babel-polyfill`
* `polyfill.io`
* `es-shims`
* `object-assign`
* `promise-polyfill`

### Real products need polyfills because:

* Smart TVs (WebOS, Tizen)
* Metro trains, IoT devices
* Old Safari on iPhones
* IE11 enterprise use

---

# 14 — **Polyfill Patterns**

### ✔ Lazy polyfill (only load when needed)

Use feature detection:

```js
if (!window.fetch) {
  await import("./fetch.polyfill.js");
}
```

### ✔ Ponyfill pattern

Return function instead of modifying global scope.

```js
export const map = (array, fn) => { ... };
```

### ✔ Shimming pattern

Modify or wrap older features.

---

