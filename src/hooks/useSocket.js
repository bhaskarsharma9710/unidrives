import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);

  const getSocket = () => {
    if (!socketRef.current) {
      const token = localStorage.getItem("ecovan_token");
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
      });
    }
    return socketRef.current;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return { getSocket, disconnect };
}
