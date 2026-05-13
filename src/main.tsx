import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@shared/context/ThemeContext.tsx'
import { AuthSessionProvider } from '@features/auth/context/AuthSessionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthSessionProvider>
          <App />
        </AuthSessionProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
