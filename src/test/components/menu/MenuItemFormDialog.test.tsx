import { screen } from '@testing-library/react'
import { MenuItemFormDialog } from '@/components/menu/MenuItemFormDialog'
import { renderWithProviders } from '@/test/test-utils'

const categories = [{ id: 'c1', name: 'Pratos', type: 'MAIN_COURSE' }]
const createMenuItem = { mutateAsync: jest.fn(), isPending: false }
const updateMenuItem = { mutateAsync: jest.fn(), isPending: false }

jest.mock('@/hooks', () => ({
  useCategories: () => ({
    data: categories,
    isLoading: false,
  }),
  useCreateMenuItem: () => createMenuItem,
  useUpdateMenuItem: () => updateMenuItem,
}))

jest.mock('../../../components/menu/ImageDropzone', () => ({
  ImageDropzone: () => <div>Image dropzone mock</div>,
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('MenuItemFormDialog', () => {
  it('não renderiza conteúdo quando fechado', () => {
    renderWithProviders(<MenuItemFormDialog open={false} onClose={jest.fn()} />)

    expect(screen.queryByText('Novo prato')).not.toBeInTheDocument()
  })
})