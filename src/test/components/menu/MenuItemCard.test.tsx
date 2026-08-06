import { fireEvent, screen } from '@testing-library/react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { renderWithProviders } from '@/test/test-utils'

describe('MenuItemCard', () => {
  it('exibe informações e ações do item', () => {
    const onAdd = jest.fn()
    const onEdit = jest.fn()

    renderWithProviders(
      <MenuItemCard
        item={{
          id: 'item-1',
          name: 'Risoto',
          description: 'Cremoso',
          price: '32.5',
          preparationTime: 18,
          available: true,
          categoryId: 'cat-1',
          category: { id: 'cat-1', name: 'Pratos', type: 'MAIN_COURSE' },
        }}
        onAdd={onAdd}
        onEdit={onEdit}
      />,
    )

    expect(screen.getByText('Risoto')).toBeInTheDocument()
    expect(screen.getByText('Cremoso')).toBeInTheDocument()
    expect(screen.getByText(/32,50/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Editar prato' }))
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledTimes(1)
  })
})