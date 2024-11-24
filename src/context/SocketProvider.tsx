"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { DefaultEventsMap } from "socket.io";
import { io, Socket } from "socket.io-client";

type SocketType = Socket<DefaultEventsMap, DefaultEventsMap> | null;

const SocketContext = createContext<SocketType>(null);

const socket = io("http://localhost:3000");

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
