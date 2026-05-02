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

const toastVariants: Record<
  ToastType,
  {
    icon: typeof CheckCircle2
    classes: string
  }
> = {
  success: {
    icon: CheckCircle2,
    classes:
      'border-brandGreen-100 bg-brandGreen-50 text-brandGreen-700',
  },
  info: {
    icon: Info,
    classes: 'border-infoBlue-200 bg-infoBlue-50 text-infoBlue-700',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-ochre-100 bg-ochre-50 text-ochre-700',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-errorRed-200 bg-errorRed-50 text-errorRed-700',
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
    }, 4000)
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

      <div className="pointer-events-none fixed top-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-xs flex-col gap-2">
        {toasts.map((toast) => {
          const variant = toastVariants[toast.type]
          const Icon = variant.icon

          return (
            <div
              key={toast.id}
              className={`reveal-item pointer-events-auto rounded-lg border px-3 py-2 text-sm font-medium ${variant.classes}`}
              role="status"
              aria-live="polite"
            >
              <p className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {toast.message}
              </p>
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
