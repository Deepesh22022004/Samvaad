"use client";

import React, { createContext, useEffect, FC } from "react";
import { toast } from "react-hot-toast";
import IncomingCallToast from "@/components/IncomingCallToast";
import { useSocket } from "@/context/SocketProvider";

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastContext = createContext<{
  showToast: (type: string, data: any) => void;
} | null>(null);

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const socket = useSocket();

  const showToast = (type: string, data: any) => {
    if (type === "incomingCall") {
      toast.custom(
        (t: any) => (
          <IncomingCallToast
            t={t}
            calleeName={data.name}
            calleeImg={data.image}
            onAccept={() => {
              toast.dismiss(t.id);
              data.onAccept(); // Execute accept callback
            }}
            onReject={() => {
              toast.dismiss(t.id);
              data.onReject(); // Execute reject callback
            }}
          />
        ),
        { duration: 10000 }
      );
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
