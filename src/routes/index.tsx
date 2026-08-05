import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout, AuthLayout } from '@/layouts'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/Login/LoginPage'
import { ForgotPasswordPage } from '@/pages/Login/ForgotPasswordPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { TablesPage } from '@/pages/Tables/TablesPage'
import { WaiterPage } from '@/pages/Waiter/WaiterPage'
import { MenuPage } from '@/pages/Menu/MenuPage'
import { KitchenPage } from '@/pages/Kitchen/KitchenPage'
import { CashierPage } from '@/pages/Cashier/CashierPage'
import { ReportsPage } from '@/pages/Reports/ReportsPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="mesas" element={<TablesPage />} />
            <Route path="garcom" element={<WaiterPage />} />
            <Route path="cardapio" element={<MenuPage />} />
            <Route path="cozinha" element={<KitchenPage />} />
            <Route path="caixa" element={<CashierPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
