import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TablesPage } from '@/pages/Tables/TablesPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/store'

const openTable = jest.fn()
const requestBill = jest.fn()

jest.mock('@/hooks', () => ({
  useTables: () => ({
    data: [
      { id: '1', number: 1, capacity: 4, status: 'FREE' },
      {
        id: '2',
        number: 2,
        capacity: 4,
        status: 'OCCUPIED',
        currentWaiter: { id: 'w1', name: 'João' },
      },
    ],
    isLoading: false,
  }),
  useOpenTable: () => ({ mutateAsync: openTable, isPending: false }),
  useRequestBill: () => ({ mutateAsync: requestBill, isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('TablesPage', () => {
  beforeEach(() => {
    openTable.mockReset()
    requestBill.mockReset()
    useAuthStore.setState({
      user: { id: '1', name: 'João', email: 'joao@teste.com', role: 'WAITER' },
      accessToken: 'token',
      isAuthenticated: true,
    })
  })

  it('abre o diálogo e executa ação para mesa livre', async () => {
    renderWithProviders(<TablesPage />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Disponível para atendimento'))
    await user.click(await screen.findByRole('button', { name: 'Abrir mesa' }))

    expect(openTable).toHaveBeenCalledWith({ id: '1' })
  })
})