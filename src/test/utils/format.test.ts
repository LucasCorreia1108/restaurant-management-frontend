import {
  calcOrderTotals,
  formatCurrency,
  getCategoryLabel,
  getOrderStatusLabel,
  getTableStatusLabel,
  isTableActive,
  orderToKitchenColumn,
  parseMoney,
  toNumber,
} from '@/utils'
import { CategoryType, OrderStatus, TableStatus } from '@/types'

describe('format utils', () => {
  it('normaliza valores monetários', () => {
    expect(parseMoney('12.50')).toBe(12.5)
    expect(toNumber(undefined)).toBe(0)
    expect(parseMoney('abc')).toBe(0)
  })

  it('formata moeda e totais', () => {
    expect(formatCurrency(10)).toContain('10,00')
    expect(
      calcOrderTotals([
        { price: 10, quantity: 2 },
        { price: 5, quantity: 1 },
      ]),
    ).toEqual({ subtotal: 25, serviceFee: 2.5, total: 27.5 })
  })

  it('traduz status e categorias', () => {
    expect(getOrderStatusLabel(OrderStatus.PREPARING)).toBe('Em preparo')
    expect(getTableStatusLabel(TableStatus.WAITING_PAYMENT)).toBe('Pagamento')
    expect(getCategoryLabel(CategoryType.DRINK)).toBe('Bebidas')
    expect(orderToKitchenColumn(OrderStatus.READY)).toBe('ready')
    expect(isTableActive(TableStatus.FREE)).toBe(false)
    expect(isTableActive(TableStatus.OCCUPIED)).toBe(true)
  })
})