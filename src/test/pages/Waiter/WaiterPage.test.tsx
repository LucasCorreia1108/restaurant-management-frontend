import { screen } from '@testing-library/react'
import { WaiterPage } from '@/pages/Waiter/WaiterPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore, useCartStore } from '@/store'

jest.mock('@/hooks', () => ({
  useTables: () => ({ data: [], isLoading: false }),
  useMenu: () => ({ data: [], isLoading: false }),
  useCreateAndSendOrder: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useOpenTable: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDeliverOrder: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useRequestBill: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useOrdersByTable: () => ({ data: [] }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('WaiterPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: '1', name: 'João', email: 'joao@teste.com', role: 'WAITER' },
      accessToken: 'token',
      isAuthenticated: true,
    })
    useCartStore.setState({ tableId: null, tableNumber: null, items: [] })
  })

  it('renderiza o fluxo inicial do garçom', () => {
    renderWithProviders(<WaiterPage />)

    expect(screen.getByText('Tela do Garçom')).toBeInTheDocument()
    expect(screen.getByText('Selecione a mesa')).toBeInTheDocument()
  })
})