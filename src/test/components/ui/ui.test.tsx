import { screen } from '@testing-library/react'
import { PageHeader, StatCard, EmptyState, Surface, GridSkeleton } from '@/components/ui'
import { renderWithProviders } from '@/test/test-utils'

describe('shared ui components', () => {
  it('renderiza PageHeader, StatCard, EmptyState e Surface', () => {
    renderWithProviders(
      <Surface>
        <PageHeader title="Dashboard" subtitle="Resumo" />
        <StatCard label="Pedidos" value={12} icon={<span>i</span>} />
        <EmptyState title="Vazio" description="Sem conteúdo" />
      </Surface>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Resumo')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Vazio')).toBeInTheDocument()
    expect(screen.getByText('Sem conteúdo')).toBeInTheDocument()
  })

  it('renderiza GridSkeleton com a quantidade esperada', () => {
    const { container } = renderWithProviders(<GridSkeleton count={3} height={80} />)

    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(3)
  })
})