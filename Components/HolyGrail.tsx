export default function App() {
  return (
    <>
      <header>Header</header>
      <div class = "column-container">
        <nav>Navigation</nav>
        <main>Main</main>
        <aside>Sidebar</aside>
      </div>
      <footer>Footer</footer>
    </>
  );
}

body {
  font-family: sans-serif;
  font-size: 12px;
  font-weight: bold;
  margin: 0;
}

* {
  box-sizing: border-box;
}

header,
nav,
main,
aside,
footer {
  padding: 12px;
  text-align: center;
}

header {
  background-color: tomato;
  height: 15vh;
}

nav {
  background-color: coral;
  width: 25%;
}

main {
  background-color: moccasin;
  width: 50%;

}

aside {
  background-color: sandybrown;
  width: 25%;
}

footer {
  background-color: slategray;
  height: 20vh;
}

.column-container {

  display: flex;
  width: 100vw;
  height: 65vh;
}
