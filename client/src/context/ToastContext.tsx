import React, { createContext, useContext, useState, useCallback } from "react";
import ToastNotification from "../components/Admin/ToastNotification";

interface Toast {
  type: "success" | "error";
  title: string;
  message: string;
}

interface ToastContextType {
  showToast: (toast: Toast) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </ToastContext.Provider>
  );
};
