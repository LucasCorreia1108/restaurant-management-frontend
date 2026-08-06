import { fireEvent, screen } from '@testing-library/react'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { renderWithProviders } from '@/test/test-utils'

describe('ConfirmDialog', () => {
  it('exibe conteúdo e dispara ações', () => {
    const onConfirm = jest.fn()
    const onClose = jest.fn()

    renderWithProviders(
      <ConfirmDialog
        open
        title="Excluir item"
        description="Essa ação não pode ser desfeita"
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    )

    expect(screen.getByText('Excluir item')).toBeInTheDocument()
    expect(screen.getByText('Essa ação não pode ser desfeita')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})