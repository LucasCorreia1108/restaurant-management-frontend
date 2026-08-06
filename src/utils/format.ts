import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { brand } from '@/theme'
import {
  CategoryType,
  OrderStatus,
  TableStatus,
  type CategoryType as CategoryTypeT,
  type Order,
  type TableStatus as TableStatusType,
} from '@/types'

const RESTAURANT_TIME_ZONE = 'America/Sao_Paulo'

export function parseMoney(value: string | number | undefined | null): number {
  if (value == null) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/** Alias usado em services/páginas */
export const toNumber = parseMoney

export function getOrderStatusLabel(status: Order['status']): string {
  switch (status) {
    case OrderStatus.CREATED:
      return 'Criado'
    case OrderStatus.SENT_TO_KITCHEN:
      return 'Na cozinha'
    case OrderStatus.PREPARING:
      return 'Em preparo'
    case OrderStatus.READY:
      return 'Pronto'
    case OrderStatus.DELIVERED:
      return 'Entregue'
    case OrderStatus.CLOSED:
      return 'Fechado'
    default:
      return status
  }
}

export function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseMoney(value))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: RESTAURANT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export function formatElapsed(date: string | Date): string {
  return formatDistanceToNowStrict(new Date(date), { locale: ptBR, addSuffix: false })
}

export function formatDateTime(date: string | Date): string {
  const value = new Date(date)
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: RESTAURANT_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value)
  return `${formattedDate} às ${formatTime(value)}`
}

export function getTableStatusColor(status: TableStatusType): string {
  switch (status) {
    case TableStatus.FREE:
    case TableStatus.CLOSED:
      return brand.free
    case TableStatus.OCCUPIED:
    case TableStatus.WAITING_ORDER:
      return brand.occupied
    case TableStatus.IN_PREPARATION:
      return brand.preparing
    case TableStatus.WAITING_PAYMENT:
      return brand.payment
    default:
      return brand.primary
  }
}

export function getTableStatusLabel(status: TableStatusType): string {
  switch (status) {
    case TableStatus.FREE:
      return 'Livre'
    case TableStatus.OCCUPIED:
      return 'Ocupada'
    case TableStatus.WAITING_ORDER:
      return 'Aguardando pedido'
    case TableStatus.IN_PREPARATION:
      return 'Em preparo'
    case TableStatus.WAITING_PAYMENT:
      return 'Pagamento'
    case TableStatus.CLOSED:
      return 'Fechada'
    default:
      return status
  }
}

export function getCategoryLabel(type: CategoryTypeT): string {
  switch (type) {
    case CategoryType.STARTER:
      return 'Entradas'
    case CategoryType.MAIN_COURSE:
      return 'Pratos Principais'
    case CategoryType.DESSERT:
      return 'Sobremesas'
    case CategoryType.DRINK:
      return 'Bebidas'
    default:
      return type
  }
}

export function orderToKitchenColumn(
  status: Order['status'],
): 'received' | 'preparing' | 'ready' | null {
  switch (status) {
    case OrderStatus.SENT_TO_KITCHEN:
      return 'received'
    case OrderStatus.PREPARING:
      return 'preparing'
    case OrderStatus.READY:
      return 'ready'
    default:
      return null
  }
}

export function calcOrderTotals(
  items: { price: number; quantity: number }[],
  feeRate = 0.1,
) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceFee = subtotal * feeRate
  return { subtotal, serviceFee, total: subtotal + serviceFee }
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function isTableActive(status: TableStatusType): boolean {
  return (
    status === TableStatus.OCCUPIED ||
    status === TableStatus.WAITING_ORDER ||
    status === TableStatus.IN_PREPARATION ||
    status === TableStatus.WAITING_PAYMENT
  )
}
