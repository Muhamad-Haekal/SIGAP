import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './components/anatomy/iso.css'
import './index.css'
import './components/figures/figures.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
