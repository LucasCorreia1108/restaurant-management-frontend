import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { renderWithProviders } from '@/test/test-utils'

describe('AuthLayout', () => {
  it('renderiza o conteúdo do outlet', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<div>Login content</div>} />
        </Route>
      </Routes>,
      { route: '/login' },
    )

    expect(screen.getByText('Login content')).toBeInTheDocument()
    expect(screen.getByText('GourmetOS')).toBeInTheDocument()
  })
})