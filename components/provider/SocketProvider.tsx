"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/store/userStore";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) return;
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL_SOCKET, { withCredentials: true });
    console.log("url", process.env.NEXT_PUBLIC_API_BASE_URL_SOCKET);
    socket.on("connect", () =>
      socket.emit("identify", { userId: user?._id, role: user?.role })
    );
    socketRef.current = socket;
    return () => {
    socket.disconnect();
    socketRef.current = null;
  };
  }, [user?._id, user?.role]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
