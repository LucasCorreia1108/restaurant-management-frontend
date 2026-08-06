import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { RoleRoute } from '@/routes/ProtectedRoute'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/store'
import { UserRole } from '@/types'

describe('RoleRoute', () => {
  it.each([UserRole.ADMIN, UserRole.MANAGER])('permite acesso ao perfil %s', (role) => {
    useAuthStore.setState({
      user: { id: '1', name: 'Usuário', email: 'user@teste.com', role },
      accessToken: 'token',
      isAuthenticated: true,
    })

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} />}>
          <Route path="/usuarios/novo" element={<div>Novo acesso</div>} />
        </Route>
      </Routes>,
      { route: '/usuarios/novo' },
    )

    expect(screen.getByText('Novo acesso')).toBeInTheDocument()
  })

  it('redireciona perfis sem permissao', () => {
    useAuthStore.setState({
      user: { id: '2', name: 'Garçom', email: 'waiter@teste.com', role: UserRole.WAITER },
      accessToken: 'token',
      isAuthenticated: true,
    })

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} />}>
          <Route path="/usuarios/novo" element={<div>Novo acesso</div>} />
        </Route>
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>,
      { route: '/usuarios/novo' },
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
