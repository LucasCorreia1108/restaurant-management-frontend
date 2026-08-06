import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Header } from '@/layouts/Header'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore, useUiStore } from '@/store'

const navigate = jest.fn()
const disconnectSocket = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

jest.mock('@/sockets', () => ({
  disconnectSocket: () => disconnectSocket(),
}))

describe('Header', () => {
  beforeEach(() => {
    navigate.mockReset()
    disconnectSocket.mockReset()
    useAuthStore.setState({
      user: { id: '1', name: 'Ana Silva', email: 'ana@teste.com', role: 'WAITER' },
      accessToken: 'token',
      isAuthenticated: true,
    })
    useUiStore.setState({
      sidebarCollapsed: false,
      mode: 'light',
      toggleSidebar: jest.fn(),
      setSidebarCollapsed: jest.fn(),
      toggleMode: jest.fn(),
      setMode: jest.fn(),
    })
  })

  it('abre o menu do usuário e faz logout', async () => {
    renderWithProviders(<Header onMenuClick={jest.fn()} />)

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Ana Silva'))
    fireEvent.click(await screen.findByText('Sair'))

    await waitFor(() => expect(disconnectSocket).toHaveBeenCalledTimes(1))
    expect(navigate).toHaveBeenCalledWith('/login')
  })
})