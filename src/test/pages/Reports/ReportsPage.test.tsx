import { screen } from '@testing-library/react'
import { ReportsPage } from '@/pages/Reports/ReportsPage'
import { renderWithProviders } from '@/test/test-utils'

jest.mock('@/hooks', () => ({
  useReports: () => ({
    data: {
      salesByDay: [],
      topProducts: [],
      avgPrepMinutes: 0,
      waiterPerformance: [],
      totalRevenue: 0,
    },
    isLoading: false,
    isFetching: false,
  }),
}))

describe('ReportsPage', () => {
  it('renderiza o período e o estado vazio sem dados', () => {
    renderWithProviders(<ReportsPage />)

    expect(screen.getByText('Relatórios')).toBeInTheDocument()
    expect(screen.getByText('Sem dados no período')).toBeInTheDocument()
  })
})