import { fireEvent, screen } from '@testing-library/react'
import { ImageDropzone } from '@/components/menu/ImageDropzone'
import { renderWithProviders } from '@/test/test-utils'

jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}))

jest.mock('@/hooks', () => ({
  useUploadMenuItemImage: () => ({ mutateAsync: jest.fn(), isPending: false }),
}))

jest.mock('@/services/api', () => ({
  ApiError: class ApiError extends Error {},
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

describe('ImageDropzone', () => {
  it('mostra preview e limpa a imagem', () => {
    const onChange = jest.fn()

    renderWithProviders(<ImageDropzone value="https://img.test/item.jpg" onChange={onChange} />)

    expect(screen.getByAltText('Preview do prato')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))

    expect(onChange).toHaveBeenCalledWith(null)
  })
})