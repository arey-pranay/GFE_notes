# 1 — Quick theory & intuition (the short version)

* **What is a custom hook?** A JavaScript/TypeScript function that uses React built-in hooks (`useState`, `useRef`, `useEffect`, etc.) to encapsulate reusable stateful logic. It returns state, actions, and helpers.
* **Why use them?** Reuse logic across components, separate concerns, test in isolation, make components simpler & more declarative.
* **Naming:** Must start with `use` (enforced by linter & rules-of-hooks). E.g. `useFetch`, `useUndo`, `useWebSocket`.
* **Rules of Hooks:** Call hooks only at top-level, never conditionally or inside loops. Custom hooks follow same rules.
* **Return shape:** either tuple `[value, action]` or object `{ value, set, reset }`. Prefer object when return grows (clearer), tuple for small, stable APIs.

---

# 2 — API design & ergonomics (how to design a great hook)

* **Single responsibility:** One hook, one responsibility.
* **Pure inputs:** Hooks should be predictable from arguments + internal state.
* **Stable API:** Keep argument order consistent (config object is great for optional args).
* **Minimal surface:** Provide essential controls; don't expose internals unless necessary.
* **Controlled vs Uncontrolled:** Design for both—accept `value` + `onChange` for controlled or manage internal state if not provided.
* **Composable:** Break large hooks into smaller composables that call each other.
* **Side-effect management:** Clean up effects on unmount (return function from `useEffect`) and handle cancellation for async.
* **Types:** Provide TypeScript types and generics for flexibility.

---

# 3 — Best practices & tradeoffs

* **Avoid gratuitous re-renders:** Use `useRef` for mutable state that doesn't affect render; `useCallback`, `useMemo` to stabilize functions/values returned.
* **Dependency arrays:** Always declare dependencies correctly. Use eslint-plugin-react-hooks to avoid mistakes.
* **Error handling:** Return `{status, error, data}` or throw in hook to let Suspense handle it (advanced).
* **Testing:** Test hooks with `@testing-library/react-hooks` or `renderHook` from `@testing-library/react`.
* **Performance vs Simplicity:** Premature optimization can complicate API; optimize after profiling.
* **Accessibility:** If hook affects UI interaction, consider ARIA roles, focus management, keyboard nav.

---

# 4 — Simple examples (JS + explanation)

### 4.1 `useToggle` (very small)

```js
// useToggle.js
import { useState, useCallback } from 'react';

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback((value) => {
    setOn(prev => (typeof value === 'boolean' ? value : !prev));
  }, []);
  const onOn = useCallback(() => setOn(true), []);
  const onOff = useCallback(() => setOn(false), []);
  return { on, toggle, onOn, onOff };
}
```

When to use: simple open/close, show/hide. Advantage: tiny. Disadvantage: trivial.

### 4.2 `usePrevious`

```js
import { useRef, useEffect } from 'react';

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
```

Use: compare previous & current props/state.

---

# 5 — Medium complexity hooks (patterns & code)

### 5.1 `useDebounce` (for inputs, search)

```js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

When: typeahead/search. Advantage: reduces work. Disadvantage: latency.

### 5.2 `useLocalStorage` (persisted state)

```js
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initialValue === 'function' ? initialValue() : initialValue);
    } catch (e) {
      console.error(e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [key, state]);

  return [state, setState];
}
```

When: user settings, persisted UI state. Tradeoff: SSR issues — must guard access to `localStorage`.

---

# 6 — Advanced & complex hooks (production-grade)

Below are longer, production-ready hooks with TypeScript (where helpful). These are real-world patterns.

### 6.1 `useAsync` / `useAsyncRetry` — robust async state manager

Use-case: Fetching or performing async tasks with status, cancellation, retry.

```ts
// useAsync.ts
import { useState, useRef, useCallback, useEffect } from 'react';

type AsyncState<T> = {
  loading: boolean;
  error: Error | null;
  value: T | null;
};

export function useAsync<T>(asyncFn: () => Promise<T> | null, deps: any[] = [], immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({ loading: false, error: null, value: null });
  const mounted = useRef(true);
  const controller = useRef<{ cancel?: () => void } | null>(null);

  useEffect(() => {
    return () => { mounted.current = false; if (controller.current?.cancel) controller.current.cancel(); };
  }, []);

  const execute = useCallback(async () => {
    const promise = asyncFn();
    if (!promise) return;
    setState({ loading: true, error: null, value: null });

    // Optional cancellation pattern: allow asyncFn to return object with cancel method or a promise that can be cancelled
    controller.current = {};
    try {
      const result = await promise;
      if (!mounted.current) return;
      setState({ loading: false, error: null, value: result });
      return result;
    } catch (err) {
      if (!mounted.current) return;
      setState({ loading: false, error: err as Error, value: null });
      throw err;
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (immediate) { execute(); } }, [execute, immediate]);

  const retry = useCallback(() => execute(), [execute]);

  return { ...state, execute, retry };
}
```

Notes: This is flexible — you can pass `asyncFn` that reads current values via closure. Add cancellation if the underlying API supports AbortController.

### 6.2 `useWebSocket` — resilient websocket manager with reconnect

```ts
// useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';

export function useWebSocket(url: string, options = {}) {
  const socketRef = useRef<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number>(3); // 0-OPEN .. 3-CLOSED
  const [messages, setMessages] = useState<any[]>([]);
  const reconnectRef = useRef({ attempts: 0, shouldReconnect: true });

  const connect = useCallback(() => {
    socketRef.current = new WebSocket(url);
    setReadyState(socketRef.current.readyState);

    socketRef.current.onopen = () => {
      reconnectRef.current.attempts = 0;
      setReadyState(1);
    };
    socketRef.current.onmessage = (e) => {
      try { setMessages(prev => [...prev, JSON.parse(e.data)]); }
      catch { setMessages(prev => [...prev, e.data]); }
    };
    socketRef.current.onclose = () => {
      setReadyState(3);
      if (reconnectRef.current.shouldReconnect) {
        const timeout = Math.min(10000, 1000 * 2 ** reconnectRef.current.attempts);
        reconnectRef.current.attempts++;
        setTimeout(connect, timeout);
      }
    };
    socketRef.current.onerror = () => setReadyState(2);
  }, [url]);

  useEffect(() => {
    reconnectRef.current.shouldReconnect = true;
    connect();
    return () => {
      reconnectRef.current.shouldReconnect = false;
      socketRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { readyState, messages, send, rawSocket: socketRef.current };
}
```

Notes: Uses exponential backoff. Add heartbeat ping/pong for detection, and authentication token refresh flows for production.

### 6.3 `useInfiniteScroll` + Intersection Observer

```ts
// useInfiniteScroll.js
import { useRef, useCallback, useEffect } from 'react';

export function useInfiniteScroll({ loading, hasMore, onLoadMore, root = null, rootMargin = '0px', threshold = 1.0 }) {
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, { root, rootMargin, threshold });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, onLoadMore, root, rootMargin, threshold]);

  useEffect(() => {
    return () => observer.current && observer.current.disconnect();
  }, []);

  return lastElementRef;
}
```

Usage: Attach returned `ref` to the last item in list. When it intersects, call `onLoadMore`.

### 6.4 `useUndoRedo` — history manager

```ts
// useUndoRedo.js
import { useState, useCallback } from 'react';

export function useUndoRedo(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);

  const set = useCallback((value) => {
    setPast(prev => [...prev, present]);
    setPresent(typeof value === 'function' ? value(present) : value);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    setPast(prevPast => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setFuture(f => [present, ...f]);
      setPresent(previous);
      return prevPast.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setPast(p => [...p, present]);
      setPresent(next);
      return prevFuture.slice(1);
    });
  }, [present]);

  const reset = useCallback((v) => { setPast([]); setFuture([]); setPresent(v); }, []);

  return { present, set, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}
```

---

# 7 — Specialized hooks (UX, performance, integration)

### 7.1 `useVirtualList` (windowing / big lists)

Implementing virtual lists well is complex — usually use `react-window` or `react-virtual`. But here's a basic idea: measure item height, compute visible indices, render slice with top padding.

(Recommendation: use battle-tested libs; reimplement cautiously.)

### 7.2 `useGesture` (pointer + touch handling)

For drag & drop, gestures, combine mouse/touch events, track pointer id, velocities, and smoothing. For complex gestures prefer libraries like `@use-gesture` + `react-spring`.

### 7.3 `useMediaQuery`

```js
import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
  }, [query]);

  return matches;
}
```

---

# 8 — Testing hooks

* Use `@testing-library/react` + `@testing-library/react-hooks` or `renderHook` from `@testing-library/react`.
* Test async hooks with `act()` and fake timers if using delays/debounce.
* Test effects clean up: mount/unmount and confirm no state updates afterward.
* Example with `renderHook`:

```js
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

test('useToggle toggles', () => {
  const { result } = renderHook(() => useToggle(false));
  expect(result.current.on).toBe(false);
  act(() => { result.current.toggle(); });
  expect(result.current.on).toBe(true);
});
```

---

# 9 — TypeScript: tips & example

* Use generics: `useAsync<T>`, `useLocalStorage<T>`.
* Provide typed callbacks: `onChange?: (v: T) => void`.
* Avoid `any` — give narrow types whenever possible.

Example `useLocalStorage` TS:

```ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = typeof window === 'undefined' ? null : localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof initial === 'function' ? (initial as Function)() : initial);
    } catch {
      return typeof initial === 'function' ? (initial as Function)() : initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }, [key, state]);

  return [state, setState] as const;
}
```

---

# 10 — Debugging hooks

* Use `React DevTools` Profiler to inspect renders (why a hook caused re-render).
* Use `console.trace()` inside hooks to see who called them.
* Ensure dependencies correct to avoid stale closures.
* When a hook returns functions, wrap in `useCallback` to avoid re-creation across renders.

---

# 11 — Patterns for complex real-world systems

### 11.1 Controlled/uncontrolled design

```ts
function useControlled<T>(controlledValue: T|undefined, defaultValue: T, name: string) {
  const { current: isControlled } = useRef(controlledValue !== undefined);
  const [valueState, setValueState] = useState(defaultValue);
  const value = isControlled ? (controlledValue as T) : valueState;
  return [value, setValueState, isControlled] as const;
}
```

Use in components that accept either `value+onChange` or manage their own state.

### 11.2 Composing hooks

Break big hooks into small composable ones. E.g. `useForm` can use `useField`, `useValidation`, `useFormState`.

### 11.3 Context + hook

When multiple components need the same hook logic for global state, wrap with a context provider and expose a `useXContext()` hook.

---

# 12 — Accessibility & focus management

If a hook manages focus or keyboard interactions:

* Use `tabindex` only when necessary.
* Provide `ref` forwarding to control DOM element focus.
* Expose methods like `focus()` from the hook.

Example: `useFocus`:

```js
import { useRef, useCallback } from 'react';
export function useFocus() {
  const ref = useRef(null);
  const focus = useCallback(() => ref.current?.focus(), []);
  return { ref, focus };
}
```

---

# 13 — Packaging, versioning, and distribution

If you plan to publish:

* Bundle with Rollup or Vite library mode for ESM/CJS/UMD targets.
* Include TypeScript declaration files.
* Semantic versioning: patch/feature/breaking.
* Tree-shakeable APIs: export hooks individually.
* Document API with examples & CodeSandbox links.
* Provide peerDependencies (React), avoid bundling React.

---

# 14 — When **not** to make a hook

* Very small single-use logic in one component.
* If logic is purely UI markup — put in component.
* When global state/context is a better fit (but you can combine both).

---

# 15 — Several ready-to-use complex hook snippets (copy/paste)

#### A. `useFetch` with AbortController, caching, and stale-while-revalidate

```js
// useFetch.js
import { useState, useEffect, useRef } from 'react';

const cache = new Map();

export function useFetch(url, options = {}, { cacheTime = 5 * 60 * 1000 } = {}) {
  const [data, setData] = useState(() => {
    const cached = cache.get(url);
    if (cached && (Date.now() - cached.time) < cacheTime) return cached.data;
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const controllerRef = useRef();

  useEffect(() => {
    let canceled = false;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    fetch(url, { ...options, signal: controller.signal })
      .then(res => res.json())
      .then(json => {
        if (canceled) return;
        cache.set(url, { data: json, time: Date.now() });
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        if (canceled) return;
        if (err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => { canceled = true; controller.abort(); };
  }, [url]);

  return { data, loading, error, refetch: () => { /* naive refetch: invalidate */ cache.delete(url); /* force effect by toggling key */ } };
}
```

#### B. `useForm` (simple controlled form with validation)

```js
// useForm.js
import { useState, useCallback } from 'react';

export function useForm({ initialValues = {}, validate = (values) => ({}) , onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((name, val) => {
    setValues(v => ({ ...v, [name]: val }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    const validation = validate(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    try {
      setSubmitting(true);
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  return { values, errors, submitting, handleChange, handleSubmit, setValues, setErrors };
}
```

---

# 16 — Performance checklist

* Memoize stable return values with `useMemo` & `useCallback`.
* Return stable references where consumers rely on reference equality.
* Avoid large objects recreated each render.
* Use refs for mutable data that doesn't affect UI.
* Consider `useSyncExternalStore` when exposing external stores.

---

# 17 — Concurrency, Suspense, and Server Components (advanced)

* To integrate with Suspense, throw a promise in the hook until data resolves. Use carefully — needs Suspense boundaries.
* On SSR, guard browser-only APIs (window, localStorage, matchMedia).
* For React Server Components, hooks behave differently — server components cannot use client-only hooks. Keep separation: server hooks (data fetching) vs client hooks (event, local state).

---

# 18 — Linting & developer ergonomics

* Enable `eslint-plugin-react-hooks`.
* Enforce rule `react-hooks/exhaustive-deps`.
* Add unit tests and storybook stories for complex hooks.

---

# 19 — Example folder structure for a hook library

```
/src/hooks/
  useToggle/index.ts
  useLocalStorage/index.ts
  useFetch/index.ts
  useWebSocket/index.ts
  index.ts  // re-exports
/tests/
docs/
README.md
CHANGELOG.md
rollup.config.js
```

---

# 20 — Quick reference: when to choose which hook

* Debounce user input → `useDebounce`
* Persist settings → `useLocalStorage`
* Complex async fetch with retry → `useAsync`
* Real-time updates → `useWebSocket`
* Infinite list → `useInfiniteScroll` + server cursors
* Form management → `useForm` (or use Formik / React Hook Form for heavy forms)
* Undo/Redo → `useUndoRedo`
* Virtualization → `react-window` (prefer over custom unless special needs)

---

# 21 — Final advanced examples (copy/paste-ready)

(One-liners to illustrate composition)

**Composable example:** `useSearch` that composes `useDebounce` + `useFetch`

```js
// useSearch.js
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import { useFetch } from './useFetch';

export function useSearch(query, options = {}) {
  const debouncedQuery = useDebounce(query, 300);
  const endpoint = debouncedQuery ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null;
  const { data, loading, error } = useFetch(endpoint, options);
  return { data, loading, error };
}
```

---

# 22 — Cheat-sheet: small list of very useful hooks to implement

* `useToggle`, `usePrevious`, `useDebounce`, `useThrottle`, `useLocalStorage`, `useSessionStorage`, `useEventListener`, `useOnClickOutside`, `useMeasure` (ResizeObserver), `useIntersectionObserver`, `useClipboard`, `useDeviceOrientation`, `useIdle` (user idle detection), `useNetworkStatus`, `usePermission` (navigator.permissions).

---

# 23 — TL;DR / Actionable next steps

1. Start by extracting one piece of logic from a component into a small hook (e.g., `useToggle`).
2. Write tests for it.
3. If it becomes shared, improve API (accept config object), add TypeScript types, document.
4. For more complex cases (websocket, undo, virtual list), prefer small composables and well-tested libraries when possible.
5. Profile before optimizing.

---
