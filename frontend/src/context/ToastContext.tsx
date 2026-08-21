import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((prev) => {
      // If an identical toast message is already active, don't duplicate it
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      const id = Math.random().toString(36).substring(2, 9);
      const updated = [...prev, { id, message, type }];

      // Auto dismiss after 3.5 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3500);

      // Keep maximum 3 toasts visible
      return updated.slice(-3);
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
              error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
              info: <Info className="h-5 w-5 text-blue-400 shrink-0" />,
            };

            const colors = {
              success: "border-emerald-500/20 bg-emerald-500/5",
              error: "border-rose-500/20 bg-rose-500/5",
              info: "border-blue-500/20 bg-blue-500/5",
            };

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md glass-panel ${colors[t.type]}`}
              >
                {icons[t.type]}
                <div className="flex-1 text-sm font-medium text-slate-100 pr-2 leading-tight">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
