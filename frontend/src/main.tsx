// import { StrictMode } from 'react'
import { DarkModeProvider } from './context/DarkModeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <DarkModeProvider>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </DarkModeProvider>
)
