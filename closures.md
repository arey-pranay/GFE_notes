🔒 Closures in JavaScript — Full Notes

## 🎯 What is a Closure?

A closure is formed when:

A function remembers variables from its outer scope,

Even after the outer function has returned.


> A closure = function + remembered environment.



This means the inner function can access and modify variables defined outside it.


---

## 💡 Why Closures Matter

Closures let you:

Keep state private

Create function factories

Implement counters, memoization, caching

Build once, throttle, debounce

Build custom hooks (React’s entire hook system is closures)



---

## 🏁 Starting Example:

“How do I access the number of times a function was called?”

function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
counter(); // 3

The variable count is:

Outside the returned function,

Still accessible due to closure.



---

## 🔁 Your Example: cycle<T>(...values)

export default function cycle<T>(...values: Array<T>): () => T {
  let index = 0;

  return () => {
    const currentValue = values[index];
    index = (index + 1) % values.length;
    return currentValue;
  };
}

✔ What this closure does:

index and values are private state.

Each time you call the returned function:

You get the next value.

It remembers the position (index) across calls.


No external variable leaks.


Example usage:

const colorCycle = cycle("red", "green", "blue");

console.log(colorCycle()); // red
console.log(colorCycle()); // green
console.log(colorCycle()); // blue
console.log(colorCycle()); // red (cycle restarts)


---

## 🛠 Practical Uses of Closures (Important Section)


---

### 1️⃣ Stateful Functions Without Classes

You can store, modify, and return state without OOP.

function uidGenerator() {
  let id = 0;
  return () => ++id;
}

const uid = uidGenerator();
uid(); // 1
uid(); // 2


---

### 2️⃣ Memoization (Caching Results)

function memoize(fn) {
  const cache = {};

  return (n) => {
    if (cache[n]) return cache[n];

    const result = fn(n);
    cache[n] = result;
    return result;
  };
}


---

### 3️⃣ Module Pattern / Private Variables

function createBankAccount() {
  let balance = 0;

  return {
    deposit(amount) { balance += amount; },
    withdraw(amount) { balance -= amount; },
    getBalance() { return balance; }
  };
}

balance is private — nobody can modify it except via returned methods.


---

### 4️⃣ Event Listener with Persistent State

function createClickTracker() {
  let clicks = 0;

  return function () {
    clicks++;
    console.log("Clicked", clicks, "times");
  };
}

button.addEventListener("click", createClickTracker());


---

### 5️⃣ React Hooks Are Closures

React’s Hook execution model is fundamentally closure-based.

Example custom hook using closure:

function useCounter(initial = 0) {
  let count = initial;

  return {
    inc: () => ++count,
    dec: () => --count,
    value: () => count,
  };
}


---

## 🎮 More Real-World Closure Patterns


---

### ▶ Once Function — Run Only Once

function once(fn) {
  let executed = false;

  return function (...args) {
    if (!executed) {
      executed = true;
      return fn(...args);
    }
  };
}


---

### ⏳ Debounce

function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


---

### 🔥 Throttle

function throttle(fn, delay) {
  let last = 0;

  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}


---

## 🧠 Why Closures Work — Deep Intuition

A common misconception:

> “When a function finishes, its variables are gone.”



Wrong.

The JavaScript engine keeps the outer function’s variables alive as long as the inner function referencing them is still alive.

This "variable environment" is stored in the Lexical Environment.

Closures prevent garbage collection of those variables.


---

## ⚠ Common Pitfalls

❌ Closure in loops (incorrect)

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints 3, 3, 3

✔ Fix with let (block-scoped)

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0,1,2


---

## 🧩 How Closures Help in Abstraction

Closures help write clean APIs:

function createAPI(baseURL) {
  return {
    get: (path) => fetch(baseURL + path),
    post: (path, data) => fetch(baseURL + path, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  };
}

const api = createAPI("/api/");
api.get("users");

Here, baseURL is remembered.
