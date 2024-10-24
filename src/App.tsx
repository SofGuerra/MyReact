import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import './App.css'
import { response } from 'express'

function App() {
  const [count, setCount] = useState(0)

return (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </Router>
);
}

export default App;
