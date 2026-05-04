import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'
import { system } from './theme'
import { AuthProvider } from './context/AuthContext'
import { SyncProvider } from './context/SyncContext'
import { ToastProvider } from './context/ToastContext'
import { I18nProvider } from './context/I18nContext'
import { registerServiceWorker } from './lib/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <I18nProvider>
          <AuthProvider>
            <SyncProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </SyncProvider>
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
