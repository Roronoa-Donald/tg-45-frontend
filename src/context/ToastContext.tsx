/* eslint-disable react-refresh/only-export-components */
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastType = 'success' | 'info' | 'warning' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

const toastStyles: Record<ToastType, { bg: string; border: string; color: string; icon: typeof CheckCircle2 }> = {
  success: {
    bg: 'rgba(42, 110, 80, 0.12)',
    border: '1px solid rgba(42, 110, 80, 0.4)',
    color: '#1a6b47',
    icon: CheckCircle2,
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    color: '#2563eb',
    icon: Info,
  },
  warning: {
    bg: 'rgba(196, 151, 58, 0.15)',
    border: '1px solid rgba(196, 151, 58, 0.5)',
    color: '#92700c',
    icon: AlertTriangle,
  },
  error: {
    bg: 'rgba(192, 57, 43, 0.12)',
    border: '1px solid rgba(192, 57, 43, 0.4)',
    color: '#a93226',
    icon: AlertCircle,
  },
}

export const ToastProvider = ({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((previousToasts) => [...previousToasts, { id, message, type }])

    window.setTimeout(() => {
      setToasts((previousToasts) =>
        previousToasts.filter((toast) => toast.id !== id),
      )
    }, 4500)
  }, [])

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
          width: 'calc(100% - 32px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const variant = toastStyles[toast.type]
          const Icon = variant.icon

          return (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: variant.bg,
                border: variant.border,
                color: variant.color,
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                animation: 'cc-toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
