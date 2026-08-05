import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    { name: 'gourmetos-auth' },
  ),
)

interface UiState {
  sidebarCollapsed: boolean
  mode: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
  toggleMode: () => void
  setMode: (mode: 'light' | 'dark') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mode: 'light',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'gourmetos-ui' },
  ),
)

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

interface CartState {
  tableId: string | null
  tableNumber: number | null
  items: CartItem[]
  selectTable: (tableId: string, tableNumber: number) => void
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  updateNotes: (menuItemId: string, notes: string) => void
  removeItem: (menuItemId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  tableId: null,
  tableNumber: null,
  items: [],
  selectTable: (tableId, tableNumber) => set({ tableId, tableNumber, items: [] }),
  addItem: (item) => {
    const existing = get().items.find((i) => i.menuItemId === item.menuItemId)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i,
        ),
      })
      return
    }
    set({
      items: [...get().items, { ...item, quantity: item.quantity ?? 1 }],
    })
  },
  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) })
      return
    }
    set({
      items: get().items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i,
      ),
    })
  },
  updateNotes: (menuItemId, notes) =>
    set({
      items: get().items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, notes } : i,
      ),
    }),
  removeItem: (menuItemId) =>
    set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
  clear: () => set({ tableId: null, tableNumber: null, items: [] }),
}))
