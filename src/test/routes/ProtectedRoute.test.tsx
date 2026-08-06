import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/store'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  })

  it('redireciona usuário não autenticado para login', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/privado" element={<div>Área privada</div>} />
        </Route>
        <Route path="/login" element={<div>Tela de login</div>} />
      </Routes>,
      { route: '/privado' },
    )

    expect(screen.getByText('Tela de login')).toBeInTheDocument()
  })

  it('permite acesso quando autenticado', () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Ana', email: 'ana@teste.com', role: 'ADMIN' },
      accessToken: 'token',
      isAuthenticated: true,
    })

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/privado" element={<div>Área privada</div>} />
        </Route>
      </Routes>,
      { route: '/privado' },
    )

    expect(screen.getByText('Área privada')).toBeInTheDocument()
  })

  it('redireciona usuários autenticados fora da área guest', () => {
    useAuthStore.setState({
      user: { id: '1', name: 'Ana', email: 'ana@teste.com', role: 'ADMIN' },
      accessToken: 'token',
      isAuthenticated: true,
    })

    renderWithProviders(
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<div>Tela de login</div>} />
        </Route>
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>,
      { route: '/login' },
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})