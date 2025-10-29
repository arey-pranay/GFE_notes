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

