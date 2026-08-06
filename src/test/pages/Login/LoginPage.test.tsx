import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/pages/Login/LoginPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/store'

const navigate = jest.fn()
const mutateAsync = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

jest.mock('@/hooks', () => ({
  useLogin: () => ({ mutateAsync, isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    navigate.mockReset()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: useAuthStore.getState().setAuth,
      logout: useAuthStore.getState().logout,
    })
  })

  it('submete credenciais e autentica o usuário', async () => {
    mutateAsync.mockResolvedValue({
      accessToken: 'token-123',
      user: { id: '1', name: 'Ana', email: 'ana@teste.com', role: 'ADMIN' },
    })

    renderWithProviders(<LoginPage />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('E-mail'), 'ana@teste.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Acessar sistema' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled())
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.name).toBe('Ana')
    expect(navigate).toHaveBeenCalledWith('/')
  })
})