import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// 1. Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. Import jQuery and Popper (required for Bootstrap's JS components like the Navbar Toggler)
import $ from 'jquery';
import Popper from 'popper.js'; // Note: Some modern bundlers might not strictly require Popper to be imported this way.
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Use bootstrap.bundle.min for combined JS (includes Popper)

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
