import { fireEvent, screen } from '@testing-library/react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { renderWithProviders } from '@/test/test-utils'
import { CategoryType } from '@/types'

const baseItem = {
  id: 'item-1',
  name: 'Risoto',
  price: 32.5,
  preparationTime: 18,
  available: true,
  categoryId: 'cat-1',
}

describe('MenuItemCard - variacoes', () => {
  it('mostra imagem e usa a categoria como descricao alternativa', () => {
    renderWithProviders(
      <MenuItemCard
        item={{
          ...baseItem,
          imageUrl: '/risoto.png',
          category: { id: 'cat-1', name: 'Pratos', type: CategoryType.MAIN_COURSE },
        }}
      />,
    )

    expect(screen.getByRole('img', { name: 'Risoto' })).toHaveAttribute('src', '/risoto.png')
    expect(screen.getByText('Pratos Principais')).toBeInTheDocument()
  })

  it('mostra o fallback visual quando nao existe imagem ou categoria', () => {
    renderWithProviders(<MenuItemCard item={baseItem} />)

    expect(screen.getByText(/Sem imagem/)).toBeInTheDocument()
    expect(screen.getByText(/Item do card/)).toBeInTheDocument()
  })

  it('usa a acao compacta apenas para itens disponiveis', () => {
    const onAdd = jest.fn()
    const { rerender } = renderWithProviders(
      <MenuItemCard item={baseItem} compact onAdd={onAdd} />,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledWith(baseItem)

    rerender(<MenuItemCard item={{ ...baseItem, available: false }} compact onAdd={onAdd} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('desabilita a adicao de um item indisponivel no modo completo', () => {
    renderWithProviders(
      <MenuItemCard item={{ ...baseItem, available: false }} onAdd={jest.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled()
  })
})
