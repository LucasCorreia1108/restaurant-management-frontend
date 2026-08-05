import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { connectSocket, disconnectSocket, onSocketEvent, SocketEvents } from '@/sockets'
import { useAuthStore } from '@/store'
import { queryKeys } from './useApi'

export function useRealtime() {
  const token = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const qc = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
      return
    }

    connectSocket(token ?? undefined)

    const invalidateOps = () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders })
      void qc.invalidateQueries({ queryKey: queryKeys.kitchen })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
    }

    const unsubs = [
      onSocketEvent(SocketEvents.ORDER_CREATED, invalidateOps),
      onSocketEvent(SocketEvents.ORDER_SENT, invalidateOps),
      onSocketEvent(SocketEvents.ORDER_PREPARING, invalidateOps),
      onSocketEvent(SocketEvents.ORDER_READY, invalidateOps),
      onSocketEvent(SocketEvents.ORDER_DELIVERED, invalidateOps),
      onSocketEvent(SocketEvents.ORDER_CLOSED, invalidateOps),
      onSocketEvent(SocketEvents.PAYMENT_COMPLETED, invalidateOps),
      onSocketEvent(SocketEvents.TABLE_UPDATED, () => {
        void qc.invalidateQueries({ queryKey: queryKeys.tables })
        void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      }),
    ]

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [isAuthenticated, token, qc])
}
