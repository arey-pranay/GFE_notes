A Function object's length property indicates how many arguments the function expects, i.e., the number of formal parameters:

Only parameters before the first one with a default value are counted.
A destructuring pattern counts as a single parameter.
The rest parameter is excluded.

--- 

 the number of arguments the function is called with (which is determined by arguments.length)

 --- 

 if you use for..in loop in an array, you will get the indices, so use it only for objects. use the for..of loop in arrays. parseInt('4') and Number('4') is used to get integer values.

--- 
You can create a non-blocking sleep function to avoid the messy setTimeout syntax
`export default async function sleep(duration) {
  return new Promise((resolve)=>setTimeout(resolve, duration))
}`

Use it as:
```
async function greeting() {
  console.log('Hello!');
  await sleep(2000);
  console.log('Bye.');
}

setInterval(() => {
  console.log('Tick');
}, 500);

greeting();
```
// t = 0: Hello! t = 500: Tick t = 1000: Tick t = 1500: Tick t = 2000: Tick t = 2000: Bye. t = 2500: Tick

You can also make the synchronous version, using while loop, but it will block the main thread, and will print Hello, then at t=2000 it will print Bye then it will go to the setInterval to print Tick every half a second.

---

This is how you add methods to all the datatypes or write polyfills to update prototype method(s): 
```
Array.prototype.square = function () {
  return this.map((el)=>el*el);
};
```

---
This is how you make a cancel-able interval
```
export default function setCancellableInterval(callback, delay, ...args) {
  const id = setInterval(callback,delay,...args);
  return function cancel(){
    clearInterval(id);
  }
}
```
and use it as:
```
let i = 0;
// t = 0:
const cancel = setCancellableInterval(() => {
  i++;
}, 10);
// t = 10: i is 1
// t = 20: i is 2
cancel(); // Called at t = 25
// t = 30: i is still 2
```

We can do a similar thing for cancellable setTimeout() also by using a clearTimeout().

---

This is how you write a function to chunk an array into smaller arrays of given any size 
` for(let i=0;i<array.length;i+=size) ans.push((array.slice(i, i+size)))  `

This is how you get difference of 2 arrays. Remove the `values` array elements from the `array` array elements:
` const ans = array.filter((el) => return !values.includes(el)) `
This is somehow handles cases of sparse array by not removing empty elements 
difference([1, , 3], [1]); // => [3]


---
 The values false, null, 0, '', undefined, and NaN are falsey (you should know this by heart!)
 This is how you remove all falsey values from an array. `   const ans = array.filter((el)=> return !!el); `

--- 
 Bonus: This is how you run an empty loop -   `while(start>=0 && predicate(array[start],start--,array)) {};`
 
---

A proper way to handle negative indexing for arrays. (for start and end)
```
  // Correct handling of negative start and end indices
  if (start < 0) start = Math.max(sz + start, 0);
  if (end < 0) end = Math.max(sz + end, 0);

  // Ensure start and end are within bounds
  start = Math.max(start, 0);
  end = Math.min(end, sz);
```

---

Change a 2D array of pairs into an object with key-value pairs like this
`  for(let pair of pairs)  ans[pair[0]] =pair[1]; ` or by `   for(let [k,v] of pairs)  ans[k] =v; `
There is another way to get the key from object (the dot notation, .) but that will not work in this because otherwise it will look for ans.pair and then get 0th element from that "pair" key, but it doesn't exist.

---

# 📘 `call()`, `apply()`, and `bind()` in JavaScript

These three methods are used to **control the value of `this`** inside a function and **invoke functions with a specific context**.

## 🔹 `call()`

**Syntax:**

```js
func.call(thisArg, arg1, arg2, ...)
```

**Description:**

* Calls a function **immediately** with a given `this` value.
* Passes arguments **individually** (comma-separated).

**Example:**

```js
function greet(greeting) {
  console.log(`${greeting}, my name is ${this.name}`);
}

const person = { name: 'Alice' };

greet.call(person, 'Hello'); // Hello, my name is Alice
```

## 🔹 `apply()`

**Syntax:**

```js
func.apply(thisArg, [argsArray])
```

**Description:**

* Similar to `call()`, but arguments are passed as an **array**.
* Also invokes the function **immediately**.

**Example:**

```js
function sum(a, b) {
  return a + b;
}

console.log(sum.apply(null, [5, 10])); // 15
```


## 🔹 `bind()`

**Syntax:**

```js
const boundFunc = func.bind(thisArg, arg1, arg2, ...)
```

**Description:**

* **Does not call** the function immediately.
* Returns a **new function** with `this` bound to the specified value.
* Useful for callbacks and event handlers.

**Example:**

```js
const person = { name: 'Bob' };

function introduce() {
  console.log(`Hi, I'm ${this.name}`);
}

const boundIntro = introduce.bind(person);
boundIntro(); // Hi, I'm Bob
```



## 🧩 Key Differences

| Method      | Invokes Function Immediately? | Pass Arguments As | Returns New Function? |
| ----------- | ----------------------------- | ----------------- | --------------------- |
| **call()**  | ✅ Yes                         | Individual args   | ❌ No                  |
| **apply()** | ✅ Yes                         | Array             | ❌ No                  |
| **bind()**  | ❌ No                          | Individual args   | ✅ Yes                 |

## 💡 Common Use Cases

* Borrowing methods from other objects.
* Setting `this` in event handlers or callbacks.
* Partial application (pre-setting some arguments using `bind()`).

---


