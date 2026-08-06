import {
  queryKeys,
  useCategories,
  useCreateAndSendOrder,
  useCreateMenuItem,
  useDashboard,
  useDeliverOrder,
  useKitchen,
  useLogin,
  useMenu,
  useOpenTable,
  useOrders,
  useOrdersByTable,
  usePayTable,
  useReports,
  useRequestBill,
  useTableBill,
  useTables,
  useUpdateKitchenStatus,
  useUpdateMenuItem,
  useUpdateMenuItemImage,
  useUploadMenuItemImage,
} from '@/hooks/useApi'
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
import { PaymentMethod } from '@/types'

const useQuery = jest.fn((options) => options)
const useMutation = jest.fn((options) => options)
const queryClient = {
  invalidateQueries: jest.fn().mockResolvedValue(undefined),
  cancelQueries: jest.fn().mockResolvedValue(undefined),
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
}

jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => useQuery(options),
  useMutation: (options: unknown) => useMutation(options),
  useQueryClient: () => queryClient,
}))

jest.mock('@/services', () => ({
  authService: { login: jest.fn() },
  categoriesService: { list: jest.fn() },
  dashboardService: { getStats: jest.fn() },
  kitchenService: { list: jest.fn(), startPreparing: jest.fn(), markReady: jest.fn() },
  menuService: {
    list: jest.fn(),
    listAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateImage: jest.fn(),
  },
  ordersService: {
    list: jest.fn(),
    getByTable: jest.fn(),
    createAndSend: jest.fn(),
    deliver: jest.fn(),
  },
  paymentsService: { getTableBill: jest.fn(), payTable: jest.fn() },
  reportsService: { get: jest.fn() },
  tablesService: { list: jest.fn(), open: jest.fn(), requestBill: jest.fn() },
  uploadsService: { uploadMenuItemImage: jest.fn() },
}))

type QueryConfig = {
  queryKey: readonly unknown[]
  queryFn: () => unknown
  enabled?: boolean
  refetchInterval?: number
}

type MutationConfig = {
  mutationFn: (payload: any) => Promise<unknown>
  onSuccess?: () => void
  onMutate?: (payload: any) => Promise<unknown>
  onError?: (error: unknown, variables: unknown, context?: any) => void
  onSettled?: () => void
}

const lastQuery = () => useQuery.mock.calls.at(-1)?.[0] as QueryConfig
const lastMutation = () => useMutation.mock.calls.at(-1)?.[0] as MutationConfig

describe('useApi hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('configura as chaves derivadas', () => {
    expect(queryKeys.table('10')).toEqual(['tables', '10'])
    expect(queryKeys.bill('10')).toEqual(['payments', 'bill', '10'])
    expect(queryKeys.ordersByTable('10')).toEqual(['orders', 'table', '10'])
    expect(queryKeys.reports('2026-08-01', '2026-08-06')).toEqual([
      'reports',
      { from: '2026-08-01', to: '2026-08-06' },
    ])
  })

  it('configura consultas periodicas de dashboard, mesas e cozinha', () => {
    useDashboard()
    expect(lastQuery()).toMatchObject({ queryKey: queryKeys.dashboard, refetchInterval: 30_000 })
    lastQuery().queryFn()
    expect(dashboardService.getStats).toHaveBeenCalled()

    useTables()
    expect(lastQuery()).toMatchObject({ queryKey: queryKeys.tables, refetchInterval: 15_000 })
    lastQuery().queryFn()
    expect(tablesService.list).toHaveBeenCalled()

    useKitchen()
    expect(lastQuery()).toMatchObject({ queryKey: queryKeys.kitchen, refetchInterval: 10_000 })
    lastQuery().queryFn()
    expect(kitchenService.list).toHaveBeenCalled()
  })

  it('consulta cardapio nas modalidades disponivel e completa', () => {
    useMenu()
    lastQuery().queryFn()
    expect(lastQuery().queryKey).toEqual(['menu', { availableOnly: true }])
    expect(menuService.list).toHaveBeenCalledWith(true)

    useMenu(false)
    lastQuery().queryFn()
    expect(lastQuery().queryKey).toEqual(['menu', { availableOnly: false }])
    expect(menuService.listAll).toHaveBeenCalled()
  })

  it('desabilita consultas que dependem de uma mesa ausente', () => {
    useOrdersByTable(null)
    expect(lastQuery()).toMatchObject({ enabled: false, queryKey: ['orders', 'table', ''] })

    useTableBill(null)
    expect(lastQuery()).toMatchObject({ enabled: false, queryKey: ['payments', 'bill', ''] })
  })

  it('executa as consultas simples com seus parametros', () => {
    useCategories()
    lastQuery().queryFn()
    useOrders()
    lastQuery().queryFn()
    useOrdersByTable('table-1')
    lastQuery().queryFn()
    useTableBill('table-1')
    lastQuery().queryFn()
    useReports({ from: '2026-08-01', to: '2026-08-06' })
    lastQuery().queryFn()

    expect(categoriesService.list).toHaveBeenCalled()
    expect(ordersService.list).toHaveBeenCalled()
    expect(ordersService.getByTable).toHaveBeenCalledWith('table-1')
    expect(paymentsService.getTableBill).toHaveBeenCalledWith('table-1')
    expect(reportsService.get).toHaveBeenCalledWith({ from: '2026-08-01', to: '2026-08-06' })
  })

  it('executa mutacoes de mesa e invalida os paineis relacionados', async () => {
    useOpenTable()
    await lastMutation().mutationFn({ id: 'table-1', waiterId: 'waiter-1' })
    lastMutation().onSuccess?.()
    expect(tablesService.open).toHaveBeenCalledWith('table-1', 'waiter-1')

    useRequestBill()
    await lastMutation().mutationFn('table-1')
    lastMutation().onSuccess?.()
    expect(tablesService.requestBill).toHaveBeenCalledWith('table-1')
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.tables })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard })
  })

  it('executa todas as mutacoes de cardapio e upload', async () => {
    const payload = { name: 'Sopa', price: 20, preparationTime: 10, categoryId: 'cat-1' }
    useCreateMenuItem()
    await lastMutation().mutationFn(payload)
    lastMutation().onSuccess?.()

    useUpdateMenuItem()
    await lastMutation().mutationFn({ id: 'item-1', payload: { name: 'Sopa nova' } })
    lastMutation().onSuccess?.()

    useUpdateMenuItemImage()
    await lastMutation().mutationFn({ id: 'item-1', imageUrl: '/sopa.png' })
    lastMutation().onSuccess?.()

    const file = new File(['image'], 'sopa.png')
    useUploadMenuItemImage()
    await lastMutation().mutationFn(file)

    expect(menuService.create).toHaveBeenCalledWith(payload)
    expect(menuService.update).toHaveBeenCalledWith('item-1', { name: 'Sopa nova' })
    expect(menuService.updateImage).toHaveBeenCalledWith('item-1', '/sopa.png')
    expect(uploadsService.uploadMenuItemImage).toHaveBeenCalledWith(file)
  })

  it('executa pedidos, entrega e pagamento com as invalidacoes esperadas', async () => {
    const order = { tableId: 'table-1', items: [{ menuItemId: 'item-1', quantity: 1 }] }
    useCreateAndSendOrder()
    await lastMutation().mutationFn(order)
    lastMutation().onSuccess?.()
    expect(ordersService.createAndSend).toHaveBeenCalledWith(order)

    useDeliverOrder()
    await lastMutation().mutationFn('order-1')
    lastMutation().onSuccess?.()
    expect(ordersService.deliver).toHaveBeenCalledWith('order-1')

    usePayTable()
    await lastMutation().mutationFn({
      tableId: 'table-1',
      paymentMethod: PaymentMethod.PIX,
      amount: 50,
    })
    lastMutation().onSuccess?.()
    expect(paymentsService.payTable).toHaveBeenCalledWith('table-1', PaymentMethod.PIX, 50)
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['payments'] })
  })

  it('faz update otimista da cozinha e confirma a alteracao', async () => {
    const tickets = [
      { id: 'order-1', status: 'SENT_TO_KITCHEN' },
      { id: 'order-2', status: 'SENT_TO_KITCHEN' },
    ]
    queryClient.getQueryData.mockReturnValue(tickets)
    useUpdateKitchenStatus()
    const mutation = lastMutation()

    await mutation.mutationFn({ id: 'order-1', status: 'PREPARING' })
    expect(kitchenService.startPreparing).toHaveBeenCalledWith('order-1')
    await mutation.mutationFn({ id: 'order-1', status: 'READY' })
    expect(kitchenService.markReady).toHaveBeenCalledWith('order-1')

    await expect(
      mutation.mutationFn({ id: 'order-1', status: 'SENT_TO_KITCHEN' }),
    ).rejects.toThrow(/Status/)

    await expect(mutation.onMutate?.({ id: 'order-1', status: 'PREPARING' })).resolves.toEqual({
      previous: tickets,
    })
    const updater = queryClient.setQueryData.mock.calls[0][1]
    expect(updater(tickets)).toEqual([
      { id: 'order-1', status: 'PREPARING' },
      { id: 'order-2', status: 'SENT_TO_KITCHEN' },
    ])
    expect(updater(null)).toBeNull()

    mutation.onError?.(new Error('falha'), {}, { previous: tickets })
    expect(queryClient.setQueryData).toHaveBeenCalledWith(queryKeys.kitchen, tickets)
    mutation.onSettled?.()
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.kitchen })
  })

  it('executa a autenticacao', async () => {
    const credentials = { email: 'ana@teste.com', password: '123456' }
    useLogin()
    await lastMutation().mutationFn(credentials)
    expect(authService.login).toHaveBeenCalledWith(credentials)
  })
})
