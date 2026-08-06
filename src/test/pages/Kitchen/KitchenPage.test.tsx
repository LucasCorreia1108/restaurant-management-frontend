import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KitchenPage } from '@/pages/Kitchen/KitchenPage'
import { renderWithProviders } from '@/test/test-utils'

const mutateAsync = jest.fn()

jest.mock('@/hooks', () => ({
  useKitchen: () => ({
    data: [
      {
        id: 'k1',
        tableNumber: 7,
        waiterName: 'Maria',
        status: 'SENT_TO_KITCHEN',
        createdAt: '2026-08-05T12:00:00.000Z',
        items: [{ id: 'i1', name: 'Pizza', quantity: 1 }],
      },
    ],
    isLoading: false,
  }),
  useUpdateKitchenStatus: () => ({ mutateAsync, isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('KitchenPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('mostra os tickets e avança o status', async () => {
    renderWithProviders(<KitchenPage />)

    expect(screen.getByText('Mesa 7')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Iniciar preparo' }))

    expect(mutateAsync).toHaveBeenCalledWith({ id: 'k1', status: 'PREPARING' })
  })
})