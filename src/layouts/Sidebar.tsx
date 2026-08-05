import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import TableRestaurantRoundedIcon from '@mui/icons-material/TableRestaurantRounded'
import RoomServiceRoundedIcon from '@mui/icons-material/RoomServiceRounded'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import { NavLink, useLocation } from 'react-router-dom'
import { brand } from '@/theme'
import { useUiStore } from '@/store'

export const DRAWER_WIDTH = 260
export const DRAWER_WIDTH_COLLAPSED = 84

const navItems = [
  { to: '/', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { to: '/mesas', label: 'Mesas', icon: <TableRestaurantRoundedIcon /> },
  { to: '/garcom', label: 'Garçom', icon: <RoomServiceRoundedIcon /> },
  { to: '/cardapio', label: 'Cardápio', icon: <RestaurantMenuRoundedIcon /> },
  { to: '/cozinha', label: 'Cozinha', icon: <SoupKitchenRoundedIcon /> },
  { to: '/caixa', label: 'Caixa', icon: <PointOfSaleRoundedIcon /> },
  { to: '/relatorios', label: 'Relatórios', icon: <InsightsRoundedIcon /> },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const location = useLocation()
  const width = collapsed && isMdUp ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, gap: 1.5, minHeight: 72 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(135deg, ${brand.accent}, ${brand.secondary})`,
            flexShrink: 0,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: '#111827',
            fontSize: 14,
          }}
        >
          G
        </Box>
        {(!collapsed || !isMdUp) && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '-0.02em',
                color: '#F9FAFB',
                lineHeight: 1.2,
              }}
            >
              GourmetOS
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'rgba(249,250,251,0.55)' }}>
              Restaurant POS
            </Typography>
          </Box>
        )}
        {isMdUp && (
          <IconButton size="small" onClick={toggleSidebar} sx={{ color: 'rgba(249,250,251,0.7)' }}>
            <ChevronLeftRoundedIcon
              sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
            />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const active =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)

          const button = (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={onMobileClose}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                minHeight: 48,
                justifyContent: collapsed && isMdUp ? 'center' : 'flex-start',
                px: collapsed && isMdUp ? 1.5 : 2,
                color: active ? '#111827' : 'rgba(249,250,251,0.72)',
                bgcolor: active ? brand.accent : 'transparent',
                '&:hover': {
                  bgcolor: active ? brand.accent : 'rgba(255,255,255,0.06)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && isMdUp ? 0 : 40,
                  color: 'inherit',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(!collapsed || !isMdUp) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                />
              )}
            </ListItemButton>
          )

          return collapsed && isMdUp ? (
            <Tooltip key={item.to} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          )
        })}
      </List>

      {(!collapsed || !isMdUp) && (
        <Box sx={{ p: 2.5, color: 'rgba(249,250,251,0.4)', fontSize: 11 }}>
          v1.0 · NestJS ready
        </Box>
      )}
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  )
}
