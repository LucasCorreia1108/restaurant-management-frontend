import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TablesPage } from '@/pages/Tables/TablesPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore, useCartStore } from '@/store'
import { OrderStatus, TableStatus, UserRole, type Table } from '@/types'

const navigate = jest.fn()
const requestBill = jest.fn()
let tables: Table[] = []

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

jest.mock('@/hooks', () => ({
  useTables: () => ({ data: tables, isLoading: false }),
  useOpenTable: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useRequestBill: () => ({ mutateAsync: requestBill, isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

const occupiedTable = (orders: Table['orders'] = []): Table => ({
  id: 'table-2',
  number: 2,
  capacity: 4,
  status: TableStatus.OCCUPIED,
  currentWaiter: { id: 'waiter-1', name: 'Garcom da mesa' },
  orders,
})

describe('TablesPage - regra de consumo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 'waiter-1',
        name: 'Ana',
        email: 'ana@teste.com',
        role: UserRole.WAITER,
      },
      accessToken: 'token',
      isAuthenticated: true,
    })
    useCartStore.getState().clear()
  })

  it('oferece somente realizar pedido quando a mesa ainda nao consumiu', async () => {
    tables = [occupiedTable()]
    renderWithProviders(<TablesPage />)
    const user = userEvent.setup()

    await user.click(screen.getByText('Garcom da mesa'))

    expect(screen.getByRole('button', { name: 'Realizar pedido' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Solicitar conta' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Realizar pedido' }))
    expect(useCartStore.getState()).toMatchObject({ tableId: 'table-2', tableNumber: 2 })
    expect(navigate).toHaveBeenCalledWith('/garcom')
  })

  it('oferece adicionar pedido e solicitar conta depois do consumo entregue', async () => {
    tables = [
      occupiedTable([
        {
          id: 'order-1',
          tableId: 'table-2',
          waiterId: 'waiter-1',
          status: OrderStatus.DELIVERED,
          total: 30,
          createdAt: '2026-08-06T12:00:00Z',
          updatedAt: '2026-08-06T12:30:00Z',
          items: [
            {
              id: 'order-item-1',
              menuItemId: 'item-1',
              quantity: 1,
              unitPrice: 30,
            },
          ],
        },
      ]),
    ]
    renderWithProviders(<TablesPage />)
    const user = userEvent.setup()

    await user.click(screen.getByText('Garcom da mesa'))

    expect(screen.getByRole('button', { name: 'Adicionar pedido' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Solicitar conta' }))
    expect(requestBill).toHaveBeenCalledWith('table-2')
  })

  it('permite adicionar pedido mas segura a conta enquanto ha pedido pendente', async () => {
    tables = [
      occupiedTable([
        {
          id: 'order-1',
          tableId: 'table-2',
          waiterId: 'waiter-1',
          status: OrderStatus.PREPARING,
          total: 30,
          createdAt: '2026-08-06T12:00:00Z',
          updatedAt: '2026-08-06T12:10:00Z',
          items: [
            {
              id: 'order-item-1',
              menuItemId: 'item-1',
              quantity: 1,
              unitPrice: 30,
            },
          ],
        },
      ]),
    ]
    renderWithProviders(<TablesPage />)
    const user = userEvent.setup()

    await user.click(screen.getByText('Garcom da mesa'))

    expect(screen.getByRole('button', { name: 'Adicionar pedido' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Solicitar conta' })).not.toBeInTheDocument()
  })
})
