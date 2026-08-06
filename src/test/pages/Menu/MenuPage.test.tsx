import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuPage } from '@/pages/Menu/MenuPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore, useCartStore } from '@/store'

const navigate = jest.fn()
const enqueueSnackbar = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

jest.mock('@/hooks', () => ({
  useMenu: () => ({
    data: [
      {
        id: 'm1',
        name: 'Risoto',
        description: 'Cremoso',
        price: '32.5',
        preparationTime: 18,
        available: true,
        categoryId: 'c1',
        category: { id: 'c1', name: 'Pratos', type: 'MAIN_COURSE' },
      },
    ],
    isLoading: false,
  }),
}))

jest.mock('@/components/menu/MenuItemFormDialog', () => ({
  MenuItemFormDialog: () => null,
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar }),
}))

describe('MenuPage', () => {
  beforeEach(() => {
    navigate.mockReset()
    enqueueSnackbar.mockReset()
    useAuthStore.setState({
      user: { id: '1', name: 'João', email: 'joao@teste.com', role: 'WAITER' },
      accessToken: 'token',
      isAuthenticated: true,
    })
    useCartStore.setState({ tableId: null, tableNumber: null, items: [] })
  })

  it('mostra o item e redireciona para o garçom ao adicionar sem mesa', async () => {
    renderWithProviders(<MenuPage />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(navigate).toHaveBeenCalledWith('/garcom')
    expect(enqueueSnackbar).toHaveBeenCalled()
  })
})