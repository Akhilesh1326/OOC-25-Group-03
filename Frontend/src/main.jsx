import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import About from './about/About.jsx'

const router = createBrowserRouter([
    {path: "/", element: <App/>},
    {path: "/dashboard", element: <Dashboard/>},
    {path: "/about", element: <About/>}
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
 <RouterProvider router={router} />
  </StrictMode>,
)