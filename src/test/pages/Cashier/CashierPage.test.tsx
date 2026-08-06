import { screen } from '@testing-library/react'
import { CashierPage } from '@/pages/Cashier/CashierPage'
import { renderWithProviders } from '@/test/test-utils'

jest.mock('@/hooks', () => ({
  useTables: () => ({ data: [], isLoading: false }),
  usePayTable: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useTableBill: () => ({ data: null, isLoading: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('CashierPage', () => {
  it('renderiza o estado vazio do caixa', () => {
    renderWithProviders(<CashierPage />)

    expect(screen.getByText('Caixa')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma conta aberta')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma mesa')).toBeInTheDocument()
  })
})