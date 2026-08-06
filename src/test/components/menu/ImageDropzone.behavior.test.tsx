import { act, screen } from '@testing-library/react'
import { ImageDropzone } from '@/components/menu/ImageDropzone'
import { renderWithProviders } from '@/test/test-utils'
import { ApiError } from '@/services/api'

const mutateAsync = jest.fn()
const enqueueSnackbar = jest.fn()
let dropzoneOptions: any
let uploadPending = false
let dragActive = false

jest.mock('react-dropzone', () => ({
  useDropzone: (options: unknown) => {
    dropzoneOptions = options
    return {
      getRootProps: () => ({ 'data-testid': 'dropzone' }),
      getInputProps: () => ({ 'data-testid': 'file-input' }),
      isDragActive: dragActive,
    }
  },
}))

jest.mock('@/hooks', () => ({
  useUploadMenuItemImage: () => ({ mutateAsync, isPending: uploadPending }),
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

describe('ImageDropzone - comportamentos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    uploadPending = false
    dragActive = false
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn(() => 'blob:preview'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    })
  })

  it('envia uma imagem, atualiza o preview e informa sucesso', async () => {
    const onChange = jest.fn()
    mutateAsync.mockResolvedValue({ url: 'https://img.test/final.png' })
    renderWithProviders(<ImageDropzone onChange={onChange} />)
    const file = new File(['image'], 'prato.png', { type: 'image/png' })

    await act(async () => dropzoneOptions.onDrop([file]))

    expect(mutateAsync).toHaveBeenCalledWith(file)
    expect(onChange).toHaveBeenCalledWith('https://img.test/final.png')
    expect(screen.getByAltText('Preview do prato')).toHaveAttribute(
      'src',
      'https://img.test/final.png',
    )
    expect(enqueueSnackbar).toHaveBeenCalledWith('Imagem enviada com sucesso', {
      variant: 'success',
    })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })

  it('limpa o preview e exibe a mensagem retornada pela API quando o upload falha', async () => {
    const onChange = jest.fn()
    mutateAsync.mockRejectedValue(new ApiError('Imagem invalida', 422))
    renderWithProviders(<ImageDropzone onChange={onChange} />)

    await act(async () => dropzoneOptions.onDrop([new File(['x'], 'erro.png')]))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByAltText('Preview do prato')).not.toBeInTheDocument()
    expect(enqueueSnackbar).toHaveBeenCalledWith('Imagem invalida', { variant: 'error' })
  })

  it('trata rejeicoes por tamanho e por formato', () => {
    renderWithProviders(<ImageDropzone onChange={jest.fn()} />)

    act(() => dropzoneOptions.onDropRejected([{ errors: [{ code: 'file-too-large' }] }]))
    expect(enqueueSnackbar).toHaveBeenCalledWith('Arquivo maior que 5MB', { variant: 'error' })

    act(() => dropzoneOptions.onDropRejected([{ errors: [{ code: 'file-invalid-type' }] }]))
    expect(enqueueSnackbar).toHaveBeenCalledWith('Use jpg, jpeg, png ou webp', {
      variant: 'error',
    })
  })

  it('mostra os estados de arraste e envio', () => {
    dragActive = true
    uploadPending = true
    renderWithProviders(<ImageDropzone onChange={jest.fn()} />)

    expect(screen.getByText('Solte a imagem aqui')).toBeInTheDocument()
    expect(screen.getByText(/Enviando imagem/)).toBeInTheDocument()
    expect(dropzoneOptions.disabled).toBe(true)
  })
})
