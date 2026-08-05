import { Box, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Header } from './Header'
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED, Sidebar } from './Sidebar'
import { useUiStore } from '@/store'
import { useRealtime } from '@/hooks'

export function AppLayout() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  useRealtime()

  const drawerWidth = collapsed && isMdUp ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5, md: 3 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
