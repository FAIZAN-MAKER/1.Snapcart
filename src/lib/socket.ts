import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  if (!url) {
    console.error("Socket URL not defined");
    return null;
  }

  if (!socket) {
    socket = io(url, {
      transports: ["websocket"],
    });
  }

  return socket;
};