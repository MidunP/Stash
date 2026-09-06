"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-[3px] border shadow-xl text-xs font-mono-num animate-in slide-in-from-bottom-2 duration-200 ${toast.type === "success"
                                ? "bg-[#172519] border-[#294d2d] text-[#4ade80]"
                                : toast.type === "error"
                                    ? "bg-[#291617] border-[#4d2325] text-[#f87171]"
                                    : "bg-[#171716] border-[#383834] text-[#edebe6]"
                            }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                            {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                            {toast.type === "info" && <Info className="w-4 h-4 shrink-0 text-[#9c9a92]" />}
                            <span className="truncate">{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            className="text-[#696861] hover:text-[#edebe6] p-0.5"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
