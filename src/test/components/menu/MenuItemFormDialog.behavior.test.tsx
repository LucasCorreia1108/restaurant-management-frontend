import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItemFormDialog } from '@/components/menu/MenuItemFormDialog'
import { renderWithProviders } from '@/test/test-utils'
import { ApiError } from '@/services/api'
import { CategoryType } from '@/types'

const createMenuItem = { mutateAsync: jest.fn(), isPending: false }
const updateMenuItem = { mutateAsync: jest.fn(), isPending: false }
const enqueueSnackbar = jest.fn()
let categoriesLoading = false

const categories = [
  { id: 'cat-1', name: 'Pratos', type: CategoryType.MAIN_COURSE },
  { id: 'cat-2', name: 'Bebidas', type: CategoryType.DRINK },
]

jest.mock('@/hooks', () => ({
  useCategories: () => ({ data: categories, isLoading: categoriesLoading }),
  useCreateMenuItem: () => createMenuItem,
  useUpdateMenuItem: () => updateMenuItem,
}))

jest.mock('@/components/menu/ImageDropzone', () => ({
  ImageDropzone: ({ value, onChange, disabled }: any) => (
    <div>
      <span>Imagem atual: {value ?? 'nenhuma'}</span>
      <button type="button" onClick={() => onChange('/nova-imagem.png')} disabled={disabled}>
        Definir imagem
      </button>
    </div>
  ),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {
    status: number
    details: string | string[]

    constructor(message: string, status: number) {
      super(message)
      this.status = status
      this.details = message
    }
  },
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar }),
}))

describe('MenuItemFormDialog - comportamentos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createMenuItem.isPending = false
    updateMenuItem.isPending = false
    categoriesLoading = false
  })

  it('cadastra um prato normalizando os valores do formulario', async () => {
    createMenuItem.mutateAsync.mockResolvedValue({ id: 'item-1' })
    const onClose = jest.fn()
    renderWithProviders(<MenuItemFormDialog open onClose={onClose} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), '  Risoto  ')
    await user.type(screen.getByLabelText(/Descri/), '  Cremoso  ')
    await user.type(screen.getByLabelText(/Pre.o/), '32.50')
    await user.click(screen.getByRole('button', { name: 'Definir imagem' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(createMenuItem.mutateAsync).toHaveBeenCalledWith({
        name: 'Risoto',
        description: 'Cremoso',
        price: 32.5,
        preparationTime: 15,
        categoryId: 'cat-1',
        available: true,
        imageUrl: '/nova-imagem.png',
      }),
    )
    expect(enqueueSnackbar).toHaveBeenCalledWith('Prato cadastrado', { variant: 'success' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('preenche e atualiza um prato existente', async () => {
    updateMenuItem.mutateAsync.mockResolvedValue({ id: 'item-1' })
    const onClose = jest.fn()
    renderWithProviders(
      <MenuItemFormDialog
        open
        onClose={onClose}
        item={{
          id: 'item-1',
          name: 'Suco',
          description: null,
          price: '8.5',
          preparationTime: 5,
          available: false,
          imageUrl: '/suco.png',
          categoryId: 'cat-2',
        }}
      />,
    )

    expect(screen.getByDisplayValue('Suco')).toBeInTheDocument()
    expect(screen.getByDisplayValue('8.5')).toBeInTheDocument()
    expect(screen.getByText('Imagem atual: /suco.png')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(updateMenuItem.mutateAsync).toHaveBeenCalledWith({
        id: 'item-1',
        payload: {
          name: 'Suco',
          description: undefined,
          price: 8.5,
          preparationTime: 5,
          categoryId: 'cat-2',
          available: false,
          imageUrl: '/suco.png',
        },
      }),
    )
    expect(enqueueSnackbar).toHaveBeenCalledWith('Prato atualizado', { variant: 'success' })
    expect(onClose).toHaveBeenCalled()
  })

  it('exibe validacoes e nao chama o servico com dados invalidos', async () => {
    renderWithProviders(<MenuItemFormDialog open onClose={jest.fn()} />)
    const user = userEvent.setup()

    const preparation = screen.getByLabelText(/Preparo/)
    await user.clear(preparation)
    await user.type(preparation, '0')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe o nome')).toBeInTheDocument()
    expect(screen.getByText(/Informe o pre/)).toBeInTheDocument()
    expect(screen.getByText(/M.nimo 1 minuto/)).toBeInTheDocument()
    expect(createMenuItem.mutateAsync).not.toHaveBeenCalled()
  })

  it('mostra o erro da API e mantem o dialogo aberto', async () => {
    createMenuItem.mutateAsync.mockRejectedValue(new ApiError('Nome duplicado', 409))
    const onClose = jest.fn()
    renderWithProviders(<MenuItemFormDialog open onClose={onClose} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nome'), 'Risoto')
    await user.type(screen.getByLabelText(/Pre.o/), '20')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(enqueueSnackbar).toHaveBeenCalledWith('Nome duplicado', { variant: 'error' }),
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('desabilita as acoes e a imagem enquanto salva', () => {
    createMenuItem.isPending = true
    renderWithProviders(<MenuItemFormDialog open onClose={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Salvando/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Definir imagem' })).toBeDisabled()
  })
})
