'use client'

import { useToast } from '@/hooks/useToast'
import { X } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-md p-4 rounded-lg shadow-lg
            border flex items-start justify-between gap-3
            animate-in slide-in-from-top-full
            ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-100'
                : toast.type === 'error'
                ? 'bg-red-900/90 border-red-700 text-red-100'
                : toast.type === 'warning'
                ? 'bg-yellow-900/90 border-yellow-700 text-yellow-100'
                : 'bg-card border-border'
            }
          `}
        >
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}