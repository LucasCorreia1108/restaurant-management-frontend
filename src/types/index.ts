export const TableStatus = {
  FREE: 'FREE',
  OCCUPIED: 'OCCUPIED',
  WAITING_ORDER: 'WAITING_ORDER',
  IN_PREPARATION: 'IN_PREPARATION',
  WAITING_PAYMENT: 'WAITING_PAYMENT',
  CLOSED: 'CLOSED',
} as const

export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus]

export const OrderStatus = {
  CREATED: 'CREATED',
  SENT_TO_KITCHEN: 'SENT_TO_KITCHEN',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CLOSED: 'CLOSED',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const PaymentMethod = {
  PIX: 'PIX',
  CASH: 'CASH',
  DEBIT_CARD: 'DEBIT_CARD',
  CREDIT_CARD: 'CREDIT_CARD',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const CategoryType = {
  STARTER: 'STARTER',
  MAIN_COURSE: 'MAIN_COURSE',
  DRINK: 'DRINK',
  DESSERT: 'DESSERT',
} as const

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType]

export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
  CASHIER: 'CASHIER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface TableWaiter {
  id: string
  name: string
  email?: string
  role?: UserRole
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  currentWaiterId?: string | null
  currentWaiter?: TableWaiter | null
  openedAt?: string | null
  createdAt?: string
  updatedAt?: string
  orders?: Order[]
}

export interface Category {
  id: string
  name: string
  type: CategoryType
}

export interface MenuItem {
  id: string
  name: string
  description?: string | null
  price: number | string
  preparationTime: number
  available: boolean
  imageUrl?: string | null
  categoryId: string
  category?: Category
}

export interface CreateMenuItemPayload {
  name: string
  description?: string
  price: number
  preparationTime: number
  available?: boolean
  imageUrl?: string
  categoryId: string
}

export interface UpdateMenuItemPayload {
  name?: string
  description?: string
  price?: number
  preparationTime?: number
  available?: boolean
  imageUrl?: string | null
  categoryId?: string
}

export interface UploadImageResponse {
  url: string
  publicId: string
}

export interface OrderItem {
  id: string
  orderId?: string
  menuItemId: string
  quantity: number
  notes?: string | null
  unitPrice: number | string
  menuItem?: MenuItem
}

export interface Order {
  id: string
  tableId: string
  waiterId: string
  status: OrderStatus
  total: number | string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  table?: Pick<Table, 'id' | 'number' | 'status' | 'capacity'>
  waiter?: TableWaiter
  payments?: Payment[]
}

export interface KitchenTicket {
  id: string
  tableId: string
  tableNumber: number
  waiterName: string
  status: Extract<OrderStatus, 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY'>
  createdAt: string
  total: number
  notes?: string
  items: Array<{
    id: string
    name: string
    quantity: number
    notes?: string | null
  }>
}

export interface Payment {
  id: string
  orderId: string
  amount: number | string
  paymentMethod: PaymentMethod
  paidAt: string
}

export interface TableBill {
  table: Table
  waiter: TableWaiter | null
  orders: Order[]
  total: number | string
}

export interface DashboardStats {
  freeTables: number
  occupiedTables: number
  preparingOrders: number
  readyOrders: number
  dailyRevenue: number
  averageTicket: number
  guestsToday: number
}

export interface SalesByDay {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

export interface WaiterPerformance {
  name: string
  orders: number
  revenue: number
  avgServiceMinutes: number
}

export interface ReportsData {
  salesByDay: SalesByDay[]
  topProducts: TopProduct[]
  avgPrepMinutes: number
  waiterPerformance: WaiterPerformance[]
  totalRevenue: number
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface CreateOrderPayload {
  tableId: string
  items: Array<{
    menuItemId: string
    quantity: number
    notes?: string
  }>
}
