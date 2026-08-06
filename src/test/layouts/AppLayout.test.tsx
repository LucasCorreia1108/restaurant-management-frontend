import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { renderWithProviders } from '@/test/test-utils'

jest.mock('@/layouts/Header', () => ({
  Header: () => <div>Header mock</div>,
}))

jest.mock('@/layouts/Sidebar', () => ({
  DRAWER_WIDTH: 280,
  DRAWER_WIDTH_COLLAPSED: 88,
  Sidebar: () => <div>Sidebar mock</div>,
}))

jest.mock('@/hooks', () => ({
  useRealtime: () => undefined,
}))

describe('AppLayout', () => {
  it('renderiza o outlet e os blocos de layout', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>Conteúdo da aplicação</div>} />
        </Route>
      </Routes>,
      { route: '/' },
    )

    expect(screen.getByText('Header mock')).toBeInTheDocument()
    expect(screen.getByText('Sidebar mock')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da aplicação')).toBeInTheDocument()
  })
})