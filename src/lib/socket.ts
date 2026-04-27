import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
    if (!process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
        throw new Error("Socket URL not defined")
    }

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL)
    }

    return socket
}