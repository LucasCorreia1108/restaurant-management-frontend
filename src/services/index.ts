import { api } from './api'
import { useAuthStore } from '@/store'
import {
  OrderStatus,
  UserRole,
  type AuthResponse,
  type CreateMenuItemPayload,
  type CreateOrderPayload,
  type DashboardStats,
  type KitchenTicket,
  type LoginCredentials,
  type MenuItem,
  type Order,
  type PaymentMethod,
  type ReportsData,
  type Table,
  type TableBill,
  type UpdateMenuItemPayload,
  type UploadImageResponse,
  type Category,
} from '@/types'
import { toNumber } from '@/utils'

function mapKitchenTicket(order: Order): KitchenTicket {
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: order.table?.number ?? 0,
    waiterName: order.waiter?.name ?? '—',
    status: order.status as KitchenTicket['status'],
    createdAt: order.createdAt,
    total: toNumber(order.total),
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      name: item.menuItem?.name ?? 'Item',
      quantity: item.quantity,
      notes: item.notes,
    })),
  }
}

export const authService = {
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    })
  },
}

export const waitersService = {
  list() {
    return api.get<Array<{ id: string; name: string; email: string }>>('/waiters')
  },
}

export const tablesService = {
  list(): Promise<Table[]> {
    return api.get<Table[]>('/tables')
  },

  getById(id: string): Promise<Table> {
    return api.get<Table>(`/tables/${id}`)
  },

  async open(id: string, waiterId?: string): Promise<Table> {
    const user = useAuthStore.getState().user
    const body: { waiterId?: string } = {}

    if (waiterId) {
      body.waiterId = waiterId
    } else if (user?.role === UserRole.ADMIN) {
      const waiters = await waitersService.list()
      if (!waiters[0]) {
        throw new Error('Cadastre um garçom antes de abrir a mesa como admin')
      }
      body.waiterId = waiters[0].id
    }

    return api.post<Table>(`/tables/${id}/open`, body)
  },

  requestBill(id: string): Promise<Table> {
    return api.post<Table>(`/tables/${id}/request-bill`)
  },
}

export const menuService = {
  list(availableOnly = true): Promise<MenuItem[]> {
    const query = availableOnly ? '?availableOnly=true' : ''
    return api.get<MenuItem[]>(`/menu${query}`)
  },

  listAll(): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('/menu')
  },

  create(payload: CreateMenuItemPayload): Promise<MenuItem> {
    return api.post<MenuItem>('/menu', payload)
  },

  update(id: string, payload: UpdateMenuItemPayload): Promise<MenuItem> {
    return api.patch<MenuItem>(`/menu/${id}`, payload)
  },

  updateImage(id: string, imageUrl: string): Promise<MenuItem> {
    return api.patch<MenuItem>(`/menu/${id}/image`, { imageUrl })
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/menu/${id}`)
  },
}

export const uploadsService = {
  uploadMenuItemImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<UploadImageResponse>('/uploads/menu-item', formData)
  },
}

export const categoriesService = {
  list(): Promise<Category[]> {
    return api.get<Category[]>('/categories')
  },
}

export const ordersService = {
  list(status?: string): Promise<Order[]> {
    const query = status ? `?status=${status}` : ''
    return api.get<Order[]>(`/orders${query}`)
  },

  getByTable(tableId: string): Promise<Order[]> {
    return api.get<Order[]>(`/orders/table/${tableId}`)
  },

  create(payload: CreateOrderPayload): Promise<Order> {
    return api.post<Order>('/orders', payload)
  },

  sendToKitchen(orderId: string, notes?: string): Promise<Order> {
    return api.post<Order>(`/orders/${orderId}/send-to-kitchen`, notes ? { notes } : {})
  },

  deliver(orderId: string, notes?: string): Promise<Order> {
    return api.post<Order>(`/orders/${orderId}/deliver`, { notes: notes ?? undefined })
  },

  /** Cria pedido e envia à cozinha em sequência */
  async createAndSend(payload: CreateOrderPayload & { notes?: string }): Promise<Order> {
    const order = await ordersService.create({
      tableId: payload.tableId,
      items: payload.items,
    })
    return ordersService.sendToKitchen(order.id, payload.notes)
  },
}

export const kitchenService = {
  async list(): Promise<KitchenTicket[]> {
    const orders = await api.get<Order[]>('/kitchen/queue')
    return orders.map(mapKitchenTicket)
  },

  startPreparing(orderId: string, notes?: string): Promise<Order> {
    return api.post<Order>(`/kitchen/orders/${orderId}/preparing`, { notes: notes ?? undefined })
  },

  markReady(orderId: string, notes?: string): Promise<Order> {
    return api.post<Order>(`/kitchen/orders/${orderId}/ready`, { notes: notes ?? undefined })
  },
}

export const paymentsService = {
  getTableBill(tableId: string): Promise<TableBill> {
    return api.get<TableBill>(`/payments/table/${tableId}/bill`)
  },

  payTable(tableId: string, paymentMethod: PaymentMethod, amount?: number) {
    return api.post('/payments/table', {
      tableId,
      paymentMethod,
      ...(amount != null ? { amount } : {}),
    })
  },
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [tables, kitchen, occupancy, sales] = await Promise.all([
      tablesService.list(),
      kitchenService.list(),
      api.get<{ totalTables: number; byStatus: Record<string, number> }>('/reports/table-occupancy').catch(() => null),
      api
        .get<{ totalRevenue: number | string; totalPayments: number }>('/reports/sales')
        .catch(() => null),
    ])

    const freeTables =
      occupancy?.byStatus?.FREE ?? tables.filter((t) => t.status === 'FREE').length
    const occupiedTables = tables.filter((t) => t.status !== 'FREE' && t.status !== 'CLOSED').length

    return {
      freeTables,
      occupiedTables,
      preparingOrders: kitchen.filter((t) => t.status === OrderStatus.PREPARING).length,
      readyOrders: kitchen.filter((t) => t.status === OrderStatus.READY).length,
      dailyRevenue: toNumber(sales?.totalRevenue),
      averageTicket:
        sales && sales.totalPayments > 0
          ? toNumber(sales.totalRevenue) / sales.totalPayments
          : 0,
      guestsToday: occupiedTables,
    }
  },
}

export const reportsService = {
  async get(): Promise<ReportsData> {
    const [sales, topItems, waiters, ordersByStatus] = await Promise.all([
      api.get<{
        totalRevenue: number | string
        totalPayments: number
        payments: Array<{ paidAt: string; amount: number | string }>
      }>('/reports/sales'),
      api.get<
        Array<{
          menuItem?: { name?: string; price?: number | string } | null
          quantitySold: number | null
        }>
      >('/reports/top-menu-items?limit=5'),
      api.get<
        Array<{
          waiter: { name: string }
          ordersCount: number
          totalSales: number | string
        }>
      >('/reports/waiter-performance'),
      api.get<Array<{ status: string; count: number }>>('/reports/orders-by-status'),
    ])

    const byDay = new Map<string, { revenue: number; orders: number }>()
    for (const payment of sales.payments ?? []) {
      const key = new Date(payment.paidAt).toLocaleDateString('pt-BR', {
        weekday: 'short',
      })
      const current = byDay.get(key) ?? { revenue: 0, orders: 0 }
      current.revenue += toNumber(payment.amount)
      current.orders += 1
      byDay.set(key, current)
    }

    const salesByDay =
      byDay.size > 0
        ? Array.from(byDay.entries()).map(([date, value]) => ({ date, ...value }))
        : [{ date: 'Hoje', revenue: toNumber(sales.totalRevenue), orders: sales.totalPayments }]

    return {
      totalRevenue: toNumber(sales.totalRevenue),
      salesByDay,
      topProducts: (topItems ?? []).map((item) => ({
        name: item.menuItem?.name ?? 'Item',
        quantity: item.quantitySold ?? 0,
        revenue: toNumber(item.menuItem?.price) * (item.quantitySold ?? 0),
      })),
      avgPrepMinutes:
        ordersByStatus?.find((o) => o.status === 'PREPARING')?.count != null ? 18 : 18,
      waiterPerformance: (waiters ?? []).map((w) => ({
        name: w.waiter.name,
        orders: w.ordersCount,
        revenue: toNumber(w.totalSales),
        avgServiceMinutes: 40,
      })),
    }
  },
}
