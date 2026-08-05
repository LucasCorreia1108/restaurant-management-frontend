import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

export const SocketEvents = {
  ORDER_CREATED: 'order.created',
  ORDER_SENT: 'order.sent',
  ORDER_PREPARING: 'order.preparing',
  ORDER_READY: 'order.ready',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CLOSED: 'order.closed',
  PAYMENT_COMPLETED: 'payment.completed',
  TABLE_UPDATED: 'table.updated',
} as const

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/realtime`, {
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return socket
}

export function connectSocket(token?: string) {
  const s = getSocket()
  if (token) {
    s.auth = { token }
  }
  if (!s.connected) s.connect()
}

export function disconnectSocket() {
  socket?.disconnect()
}

export function onSocketEvent<T>(event: string, handler: (payload: T) => void) {
  const s = getSocket()
  s.on(event, handler)
  return () => {
    s.off(event, handler)
  }
}
