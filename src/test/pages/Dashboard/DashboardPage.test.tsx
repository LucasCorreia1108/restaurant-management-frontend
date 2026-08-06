import { screen } from '@testing-library/react'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { renderWithProviders } from '@/test/test-utils'

const navigate = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

jest.mock('@/hooks', () => ({
  useDashboard: () => ({
    data: {
      freeTables: 2,
      occupiedTables: 4,
      preparingOrders: 1,
      readyOrders: 3,
      dailyRevenue: 250.5,
      averageTicket: 60,
      guestsToday: 10,
    },
    isLoading: false,
  }),
  useTables: () => ({
    data: [
      { id: '1', number: 1, capacity: 4, status: 'OCCUPIED' },
      { id: '2', number: 2, capacity: 4, status: 'FREE' },
    ],
    isLoading: false,
  }),
  useKitchen: () => ({
    data: [
      {
        id: 'k1',
        tableNumber: 1,
        status: 'READY',
        createdAt: '2026-08-05T12:00:00.000Z',
        items: [{ id: 'i1', name: 'Risoto', quantity: 1 }],
      },
    ],
    isLoading: false,
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    navigate.mockReset()
  })

  it('mostra os cards e resumos principais', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Mesas Livres')).toBeInTheDocument()
    expect(screen.getByText('Mesa 1')).toBeInTheDocument()
    expect(screen.getByText('Pronto')).toBeInTheDocument()
  })
})