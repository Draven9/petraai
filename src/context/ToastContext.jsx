import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error("useToast must be used within a ToastProvider")
    return context
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addToast = useCallback(({ title, description, type = 'info', duration = 3000 }) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { id, title, description, type, duration }])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
        return id
    }, [removeToast])

    const toast = {
        success: (title, description) => addToast({ title, description, type: 'success' }),
        error: (title, description) => addToast({ title, description, type: 'error' }),
        info: (title, description) => addToast({ title, description, type: 'info' }),
        warning: (title, description) => addToast({ title, description, type: 'warning' }),
        loading: (title, description) => addToast({ title, description, type: 'info', duration: 0 }),
        dismiss: (id) => removeToast(id)
    }

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border border-opacity-10 dark:border-opacity-10 transform transition-all duration-300 animate-in slide-in-from-right-full",
                            t.type === 'success' && "bg-green-50 border-green-200 text-green-900",
                            t.type === 'error' && "bg-red-50 border-red-200 text-red-900",
                            t.type === 'warning' && "bg-amber-50 border-amber-200 text-amber-900",
                            t.type === 'info' && "bg-blue-50 border-blue-200 text-blue-900",
                        )}
                    >
                        {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                        {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                        {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
                        {t.type === 'info' && (t.duration === 0 ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" /> : <Info className="w-5 h-5 text-blue-600 shrink-0" />)}

                        <div className="flex-1">
                            {t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}
                            {t.description && <p className="text-sm opacity-90 mt-0.5">{t.description}</p>}
                        </div>

                        <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
