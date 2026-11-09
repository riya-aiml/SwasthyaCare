import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx' // Full app - will use in later sprints
// import App from './App.Sprint1.jsx' // Sprint 1 - Simple health check
import App from './App.Sprint2.jsx' // Sprint 2 - Authentication & Profiles
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
