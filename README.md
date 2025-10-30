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
 
