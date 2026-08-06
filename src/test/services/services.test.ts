import { api } from '@/services/api'
import {
  dashboardService,
  kitchenService,
  menuService,
  ordersService,
  paymentsService,
  reportsService,
  tablesService,
} from '@/services'
import { useAuthStore } from '@/store'
import { OrderStatus, PaymentMethod, TableStatus, UserRole } from '@/types'

jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
  })

  it('monta as chamadas de cardapio e pagamento', async () => {
    mockedApi.get.mockResolvedValue([])
    mockedApi.patch.mockResolvedValue({} as never)
    mockedApi.post.mockResolvedValue({} as never)

    await menuService.list()
    await menuService.list(false)
    await menuService.updateImage('item-1', '/image.png')
    await paymentsService.payTable('table-1', PaymentMethod.PIX, 42.5)

    expect(mockedApi.get).toHaveBeenNthCalledWith(1, '/menu?availableOnly=true')
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, '/menu')
    expect(mockedApi.patch).toHaveBeenCalledWith('/menu/item-1/image', {
      imageUrl: '/image.png',
    })
    expect(mockedApi.post).toHaveBeenCalledWith('/payments/table', {
      tableId: 'table-1',
      paymentMethod: PaymentMethod.PIX,
      amount: 42.5,
    })
  })

  it('cria o pedido antes de envia-lo para a cozinha', async () => {
    const created = { id: 'order-1' }
    const sent = { id: 'order-1', status: OrderStatus.SENT_TO_KITCHEN }
    mockedApi.post.mockResolvedValueOnce(created as never).mockResolvedValueOnce(sent as never)

    await expect(
      ordersService.createAndSend({
        tableId: 'table-1',
        items: [{ menuItemId: 'item-1', quantity: 2 }],
        notes: 'Prioridade',
      }),
    ).resolves.toBe(sent)

    expect(mockedApi.post).toHaveBeenNthCalledWith(1, '/orders', {
      tableId: 'table-1',
      items: [{ menuItemId: 'item-1', quantity: 2 }],
    })
    expect(mockedApi.post).toHaveBeenNthCalledWith(
      2,
      '/orders/order-1/send-to-kitchen',
      { notes: 'Prioridade' },
    )
  })

  it('seleciona um garcom ao admin abrir uma mesa', async () => {
    useAuthStore.setState({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@teste.com', role: UserRole.ADMIN },
      accessToken: 'token',
      isAuthenticated: true,
    })
    mockedApi.get.mockResolvedValue([{ id: 'waiter-1', name: 'Bia', email: 'bia@teste.com' }])
    mockedApi.post.mockResolvedValue({ id: 'table-1' } as never)

    await tablesService.open('table-1')

    expect(mockedApi.get).toHaveBeenCalledWith('/waiters')
    expect(mockedApi.post).toHaveBeenCalledWith('/tables/table-1/open', {
      waiterId: 'waiter-1',
    })
  })

  it('impede o admin de abrir mesa quando nao ha garcom', async () => {
    useAuthStore.setState({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@teste.com', role: UserRole.ADMIN },
      accessToken: 'token',
      isAuthenticated: true,
    })
    mockedApi.get.mockResolvedValue([])

    await expect(tablesService.open('table-1')).rejects.toThrow(/garçom antes de abrir/i)
    expect(mockedApi.post).not.toHaveBeenCalled()
  })

  it('converte pedidos da fila em tickets de cozinha', async () => {
    mockedApi.get.mockResolvedValue([
      {
        id: 'order-1',
        tableId: 'table-1',
        table: { number: 8 },
        waiter: { name: 'Carlos' },
        status: OrderStatus.PREPARING,
        createdAt: '2026-08-06T12:00:00Z',
        total: '35.50',
        items: [{ id: 'oi-1', quantity: 2, notes: 'Sem sal', menuItem: { name: 'Sopa' } }],
      },
    ])

    await expect(kitchenService.list()).resolves.toEqual([
      expect.objectContaining({
        id: 'order-1',
        tableNumber: 8,
        waiterName: 'Carlos',
        total: 35.5,
        items: [{ id: 'oi-1', name: 'Sopa', quantity: 2, notes: 'Sem sal' }],
      }),
    ])
  })

  it('calcula os indicadores do dashboard usando fallback de ocupacao', async () => {
    mockedApi.get
      .mockResolvedValueOnce([
        { id: '1', status: TableStatus.FREE },
        { id: '2', status: TableStatus.OCCUPIED },
        { id: '3', status: TableStatus.CLOSED },
      ])
      .mockResolvedValueOnce([
        { id: 'o1', status: OrderStatus.PREPARING },
        { id: 'o2', status: OrderStatus.READY },
      ])
      .mockRejectedValueOnce(new Error('indisponivel'))
      .mockResolvedValueOnce({ totalRevenue: '120', totalPayments: 3 })

    await expect(dashboardService.getStats()).resolves.toEqual({
      freeTables: 1,
      occupiedTables: 1,
      preparingOrders: 1,
      readyOrders: 1,
      dailyRevenue: 120,
      averageTicket: 40,
      guestsToday: 1,
    })
  })

  it('agrega relatorios por dia e preenche dias sem venda', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        totalRevenue: '30',
        totalPayments: 1,
        payments: [{ paidAt: '2026-08-01T15:00:00Z', amount: '30' }],
      })
      .mockResolvedValueOnce([{ menuItem: { name: 'Sopa', price: '15' }, quantitySold: 2 }])
      .mockResolvedValueOnce([{ waiter: { name: 'Ana' }, ordersCount: 1, totalSales: '30' }])
      .mockResolvedValueOnce([{ status: OrderStatus.PREPARING, count: 1 }])

    const report = await reportsService.get({ from: '2026-08-01', to: '2026-08-02' })

    expect(report).toMatchObject({
      totalRevenue: 30,
      topProducts: [{ name: 'Sopa', quantity: 2, revenue: 30 }],
      waiterPerformance: [
        { name: 'Ana', orders: 1, revenue: 30, avgServiceMinutes: 40 },
      ],
    })
    expect(report.salesByDay).toHaveLength(2)
    expect(report.salesByDay.reduce((sum, day) => sum + day.revenue, 0)).toBe(30)
  })

  it('agrupa pagamentos noturnos no dia de Sao Paulo, nao no dia UTC seguinte', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        totalRevenue: '30',
        totalPayments: 1,
        payments: [{ paidAt: '2026-08-07T01:30:00.000Z', amount: '30' }],
      })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const report = await reportsService.get({ from: '2026-08-06', to: '2026-08-07' })

    expect(report.salesByDay).toEqual([
      { date: '06/08', revenue: 30, orders: 1 },
      { date: '07/08', revenue: 0, orders: 0 },
    ])
  })
})
