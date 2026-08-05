import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authService,
  categoriesService,
  dashboardService,
  kitchenService,
  menuService,
  ordersService,
  paymentsService,
  reportsService,
  tablesService,
  uploadsService,
} from '@/services'
import type {
  CreateMenuItemPayload,
  CreateOrderPayload,
  LoginCredentials,
  PaymentMethod,
  UpdateMenuItemPayload,
} from '@/types'

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  tables: ['tables'] as const,
  table: (id: string) => ['tables', id] as const,
  menu: ['menu'] as const,
  categories: ['categories'] as const,
  orders: ['orders'] as const,
  kitchen: ['kitchen'] as const,
  reports: ['reports'] as const,
  bill: (tableId: string) => ['payments', 'bill', tableId] as const,
  ordersByTable: (tableId: string) => ['orders', 'table', tableId] as const,
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30_000,
  })
}

export function useTables() {
  return useQuery({
    queryKey: queryKeys.tables,
    queryFn: () => tablesService.list(),
    refetchInterval: 15_000,
  })
}

export function useOpenTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, waiterId }: { id: string; waiterId?: string }) =>
      tablesService.open(id, waiterId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useRequestBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tablesService.requestBill(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useMenu(availableOnly = true) {
  return useQuery({
    queryKey: [...queryKeys.menu, { availableOnly }] as const,
    queryFn: () => (availableOnly ? menuService.list(true) : menuService.listAll()),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesService.list(),
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMenuItemPayload) => menuService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu })
    },
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMenuItemPayload }) =>
      menuService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu })
    },
  })
}

export function useUpdateMenuItemImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) =>
      menuService.updateImage(id, imageUrl),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu })
    },
  })
}

export function useUploadMenuItemImage() {
  return useMutation({
    mutationFn: (file: File) => uploadsService.uploadMenuItemImage(file),
  })
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => ordersService.list(),
  })
}

export function useOrdersByTable(tableId: string | null) {
  return useQuery({
    queryKey: queryKeys.ordersByTable(tableId ?? ''),
    queryFn: () => ordersService.getByTable(tableId!),
    enabled: Boolean(tableId),
  })
}

export function useCreateAndSendOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload & { notes?: string }) =>
      ordersService.createAndSend(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders })
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.kitchen })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeliverOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => ordersService.deliver(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders })
      void qc.invalidateQueries({ queryKey: ['orders', 'table'] })
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.kitchen })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useTableBill(tableId: string | null) {
  return useQuery({
    queryKey: queryKeys.bill(tableId ?? ''),
    queryFn: () => paymentsService.getTableBill(tableId!),
    enabled: Boolean(tableId),
  })
}

export function usePayTable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      tableId,
      paymentMethod,
      amount,
    }: {
      tableId: string
      paymentMethod: PaymentMethod
      amount?: number
    }) => paymentsService.payTable(tableId, paymentMethod, amount),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders })
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useKitchen() {
  return useQuery({
    queryKey: queryKeys.kitchen,
    queryFn: () => kitchenService.list(),
    refetchInterval: 10_000,
  })
}

export function useUpdateKitchenStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY'
    }) => {
      if (status === 'PREPARING') return kitchenService.startPreparing(id)
      if (status === 'READY') return kitchenService.markReady(id)
      return Promise.reject(new Error('Status inválido para cozinha'))
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.kitchen })
      const previous = qc.getQueryData(queryKeys.kitchen)
      qc.setQueryData(queryKeys.kitchen, (current: unknown) => {
        if (!Array.isArray(current)) return current
        return current.map((ticket: { id: string; status: string }) =>
          ticket.id === id ? { ...ticket, status } : ticket,
        )
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(queryKeys.kitchen, context.previous)
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.kitchen })
      void qc.invalidateQueries({ queryKey: queryKeys.tables })
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      void qc.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })
}

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: () => reportsService.get(),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  })
}
