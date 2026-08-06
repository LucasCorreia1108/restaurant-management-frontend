import { fireEvent, screen } from '@testing-library/react'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { renderWithProviders } from '@/test/test-utils'

describe('ConfirmDialog - comportamentos', () => {
  it('usa rotulos personalizados e dispara ambas as acoes', () => {
    const onConfirm = jest.fn()
    const onClose = jest.fn()
    renderWithProviders(
      <ConfirmDialog
        open
        title="Excluir prato"
        description="Esta acao nao pode ser desfeita"
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        danger
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('bloqueia as acoes durante o carregamento', () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Processando"
        description="Aguarde"
        loading
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  })
})
