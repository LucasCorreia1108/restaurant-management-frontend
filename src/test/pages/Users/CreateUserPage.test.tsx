import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateUserPage } from '@/pages/Users/CreateUserPage'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/store'
import { UserRole } from '@/types'

const mutateAsync = jest.fn()
const enqueueSnackbar = jest.fn()

jest.mock('@/hooks', () => ({
  useCreateUser: () => ({ mutateAsync, isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar }),
}))

describe('CreateUserPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cria um novo acesso com o perfil selecionado', async () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Admin', email: 'admin@teste.com', role: UserRole.ADMIN },
      accessToken: 'token',
      isAuthenticated: true,
    })
    mutateAsync.mockResolvedValue({ id: 'user-2' })
    renderWithProviders(<CreateUserPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.type(screen.getByLabelText('E-mail'), 'joao@teste.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.type(screen.getByLabelText('Confirmar senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Criar acesso' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@teste.com',
        password: '123456',
        role: UserRole.WAITER,
      }),
    )
    expect(enqueueSnackbar).toHaveBeenCalledWith('Novo acesso criado com sucesso', {
      variant: 'success',
    })
  })

  it('limita os perfis que podem ser criados pelo gerente', async () => {
    useAuthStore.setState({
      user: { id: '2', name: 'Gerente', email: 'gerente@teste.com', role: UserRole.MANAGER },
      accessToken: 'token',
      isAuthenticated: true,
    })
    renderWithProviders(<CreateUserPage />)
    const user = userEvent.setup()

    expect(screen.getByText(/Gerentes podem criar acessos/)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Perfil'))

    expect(screen.getByRole('option', { name: 'Garçom' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cozinha' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Caixa' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Administrador' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Gerente' })).not.toBeInTheDocument()
  })

  it('valida senhas diferentes antes de enviar', async () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Admin', email: 'admin@teste.com', role: UserRole.ADMIN },
      accessToken: 'token',
      isAuthenticated: true,
    })
    renderWithProviders(<CreateUserPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'João')
    await user.type(screen.getByLabelText('E-mail'), 'joao@teste.com')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.type(screen.getByLabelText('Confirmar senha'), '654321')
    await user.click(screen.getByRole('button', { name: 'Criar acesso' }))

    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
