import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx' // Full app
// import App from './App.Sprint1.jsx' // Sprint 1 - Simple health check
// import App from './App.Sprint2.jsx' // Sprint 2 - Authentication & Profiles
// import App from './App.Sprint3.jsx' // Sprint 3 - Doctor Discovery & Availability
// import App from './App.Sprint4.jsx' // Sprint 4 - Appointment Booking & Double-Booking Protection
import App from './App.Sprint5.jsx' // Sprint 5 - Post-Discharge Follow-up System
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
