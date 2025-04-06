import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import About from './about/About.jsx'
import Analysis from './analysis/Analysis.jsx'

const router = createBrowserRouter([
    {path: "/", element: <App/>},
    {path: "/dashboard", element: <Dashboard/>},
    {path: "/about", element: <About/>},
    {path: "/analysis", element: <Analysis/>}
])

createRoot(document.getElementById('root')).render(
 <RouterProvider router={router} />
)