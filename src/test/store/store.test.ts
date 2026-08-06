import { useAuthStore, useCartStore, useUiStore } from '@/store'
import { UserRole } from '@/types'

describe('stores', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().logout()
    useUiStore.setState({ sidebarCollapsed: false, mode: 'light' })
    useCartStore.getState().clear()
  })

  it('autentica e encerra a sessao', () => {
    const user = {
      id: 'user-1',
      name: 'Ana',
      email: 'ana@teste.com',
      role: UserRole.ADMIN,
    }

    useAuthStore.getState().setAuth(user, 'access-token')

    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'access-token',
      isAuthenticated: true,
    })

    useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  })

  it('alterna e define as preferencias da interface', () => {
    useUiStore.getState().toggleSidebar()
    useUiStore.getState().toggleMode()

    expect(useUiStore.getState()).toMatchObject({
      sidebarCollapsed: true,
      mode: 'dark',
    })

    useUiStore.getState().setSidebarCollapsed(false)
    useUiStore.getState().setMode('light')

    expect(useUiStore.getState()).toMatchObject({
      sidebarCollapsed: false,
      mode: 'light',
    })
  })

  it('gerencia o ciclo completo do carrinho', () => {
    const cart = useCartStore.getState()
    cart.selectTable('table-1', 12)
    cart.addItem({ menuItemId: 'item-1', name: 'Risoto', price: 30 })
    cart.addItem({ menuItemId: 'item-1', name: 'Risoto', price: 30, quantity: 2 })
    cart.addItem({ menuItemId: 'item-2', name: 'Suco', price: 8, quantity: 2 })

    expect(useCartStore.getState()).toMatchObject({
      tableId: 'table-1',
      tableNumber: 12,
      items: [
        { menuItemId: 'item-1', quantity: 3 },
        { menuItemId: 'item-2', quantity: 2 },
      ],
    })

    useCartStore.getState().updateNotes('item-1', 'Sem cebola')
    useCartStore.getState().updateQuantity('item-2', 4)
    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ menuItemId: 'item-1', notes: 'Sem cebola' }),
      expect.objectContaining({ menuItemId: 'item-2', quantity: 4 }),
    ])

    useCartStore.getState().updateQuantity('item-1', 0)
    useCartStore.getState().removeItem('item-2')
    expect(useCartStore.getState().items).toEqual([])

    useCartStore.getState().clear()
    expect(useCartStore.getState()).toMatchObject({
      tableId: null,
      tableNumber: null,
      items: [],
    })
  })
})
