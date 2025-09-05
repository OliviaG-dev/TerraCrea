import React, { createContext, useContext, useState, ReactNode } from "react";
import { DiscreteToast } from "../components/DiscreteToast";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substring(7);

  const showToast = (
    message: string,
    type: Toast["type"] = "info",
    duration: number = 3000
  ) => {
    const id = generateId();
    const newToast: Toast = { id, message, type, duration };

    // Limiter à un seul toast à la fois pour éviter l'encombrement
    setToasts([newToast]);
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    showToast(message, "success", duration);
  };

  const showError = (message: string, duration: number = 4000) => {
    showToast(message, "error", duration);
  };

  const showWarning = (message: string, duration: number = 3500) => {
    showToast(message, "warning", duration);
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showToast(message, "info", duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Rendu des toasts */}
      {toasts.map((toast) => (
        <DiscreteToast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onHide={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
