"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface SocketConnectorProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function SocketConnector({ user }: SocketConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = async () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      try {
        const response = await fetch("/api/socket/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            socketId: socket.id,
          }),
        });

        const data = await response.json();
        console.log("Socket connection updated:", data);
      } catch (error) {
        console.error("Error updating socket connection:", error);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected:", socket.id);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user._id]);

  return null;
}