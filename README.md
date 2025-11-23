MDN Docs - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/

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

Checking if a value is between 2 numbers  ` return Math.min(start, end) <= value && value < Math.max(start, end); `

---

.includes() is used instead of contains for array in js. and also, .slice(index, numOfElementsToDelete) .pop() and .shift are used to delete elments from a specific index, from end and form start resp.

---

# 📘 `map()`, `filter()`, and `reduce()` in JavaScript

These three higher-order functions are commonly used for **transforming and processing arrays**. They allow you to work with data in a more functional, declarative way.

## 🔹 `map()`

**Syntax:**

```js
const newArray = array.map(callback(currentValue, index, array))
```

**Description:**

* **Transforms** each element in an array according to a given function.
* Returns a **new array** with the transformed values.
* The original array is **not modified**.

**Example:**

```js
const numbers = [1, 2, 3, 4];

const squaredNumbers = numbers.map(num => num * num);

console.log(squaredNumbers); // [1, 4, 9, 16]
```

## 🔹 `filter()`

**Syntax:**

```js
const newArray = array.filter(callback(currentValue, index, array))
```

**Description:**

* Creates a **new array** with all elements that **pass a test** defined by the provided function.
* Returns a **filtered array** based on a condition.
* The original array is **not modified**.

**Example:**

```js
const numbers = [1, 2, 3, 4, 5, 6];

const evenNumbers = numbers.filter(num => num % 2 === 0);

console.log(evenNumbers); // [2, 4, 6]
```

## 🔹 `reduce()`

**Syntax:**

```js
const result = array.reduce(callback(accumulator, currentValue, index, array), initialValue)
```

**Description:**

* **Reduces** an array to a **single value** by applying a function on each element.
* The function receives an **accumulator** (the accumulated result) and the **current element** in each iteration.
* Can be used for **summing values**, **concatenating arrays**, **counting occurrences**, etc.
* The **initialValue** is optional. If not provided, the first element of the array is used as the initial accumulator.

**Example:**

```js
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((acc, num) => acc + num, 0);

console.log(sum); // 15
```

## 🧩 Key Differences

| Method       | Purpose                                          | Returns      | Mutates Original Array? |
| ------------ | ------------------------------------------------ | ------------ | ----------------------- |
| **map()**    | Transforms each element into a new value         | New Array    | ❌ No                    |
| **filter()** | Filters out elements that don't meet a condition | New Array    | ❌ No                    |
| **reduce()** | Reduces the array to a single value              | Single Value | ❌ No                    |

## 💡 Common Use Cases

* **map()**: Applying transformations, such as formatting or calculating a new value based on existing data.
* **filter()**: Extracting a subset of data based on specific conditions, like finding all numbers greater than 5.
* **reduce()**: Summing numbers, combining data from an array, or counting occurrences.

---

traversing objects
` for (const [key, value] of Object.entries(obj)) { ans[key] = fn(value); } `

Selection Sort -> It is O(n^2). Start i from 0th element, j will go from i+1 to n, find the smallest in that range, swap i with the min element and then i++;

---

removing duplicates by the use of set in javcascript
```
  let ans: Array<T[number]>
  let s = new Set(array)
  ans = [...s]
  return ans;
```

--- 


One attempt of accordion-like functionality.

```
 const [isOpen, setIsOpen] = useState([false, false, false]);
  const toggleAccordion = (i)  => {
    setIsOpen((prev) => {
      let arr = [...prev];
      arr[i] = !arr[i];
      return arr;
    });
  }
  const a =4;
  const abc = ()=>{};
  console.log(isOpen);
  return (
    <div>
      <div className="accordion-parent">
        <div onClick={() => toggleAccordion(0)} className="accordion-heading">
          HTML{" "}
          <span
            aria-hidden={true}
            className={`accordion-icon ${isOpen[0] && "accordion-icon--rotated"}`}
          />
        </div>
        <div
          className={`${isOpen[0] ? "accordion-text-open" : "accordion-text-closed"}`}
        >
          The HyperText Markup Language or HTML is the standard markup language
          for documents designed to be displayed in a web browser.
        </div>
      </div>
```
---

negative indexing
  `if(index<0) index = this.length + index;`

 ---

 simple polyfill for Array.prototype.map
 `  for(let i=0; i<this.length;i++) if(this.hasOwnProperty(i))ans[i]=callbackFn.call(thisArg,this[i],i,this);`

 We can even check for sparse arrays using Object.hasOwn(this,i) or return (Object.keys(this)).length == this.length;

 ---

 reduceRight in-built function

 ```
export default function compose(...fns: Array<Function>): Function {
  return function (x: any): Function {
    return fns.reduceRight((result, func) => func(result), x);
  };
}
```
---

### `reduceRight` in `compose` function

In the given `compose` function, `reduceRight` is employed to apply the functions in the array (`fns`) from right to left, creating a **composed function**. Here's how it works:

1. **Purpose**: The `reduceRight` method iterates over the array of functions (`fns`) in reverse order and applies them cumulatively to an initial value (`x`).

2. **How it works**:

   * `fns.reduceRight((result, func) => func(result), x)`
   * `reduceRight` takes a callback and an initial value (`x` in this case).
   * It starts from the **last function** in the array and applies it to the value `x`.
   * Then it passes the result to the next function, moving towards the first function.

3. **Effect**: This allows for **function composition**, where the rightmost function is applied first, followed by the next one to the left, and so on. In other words, it builds a pipeline that applies functions in the reverse order of their appearance in the `fns` array.

### Example:

```ts
const add2 = (x: number) => x + 2;
const multiplyBy3 = (x: number) => x * 3;

const composed = compose(add2, multiplyBy3);
composed(4); // (4 * 3) + 2 = 14
```

In this case:

* `multiplyBy3` is applied first, then `add2`.

---



