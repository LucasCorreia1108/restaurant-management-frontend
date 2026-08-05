import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useUiStore } from '@/store'
import { disconnectSocket } from '@/sockets'

interface HeaderProps {
  onMenuClick: () => void
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  WAITER: 'Garçom',
  KITCHEN: 'Cozinha',
  CASHIER: 'Caixa',
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const mode = useUiStore((s) => s.mode)
  const toggleMode = useUiStore((s) => s.toggleMode)
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' }, mr: 0.5 }}
          aria-label="Abrir menu"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: 14, sm: 15 },
              color: 'text.secondary',
            }}
            noWrap
          >
            Operação em tempo real
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: { xs: 15, sm: 16 },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Typography>
        </Box>

        <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <IconButton onClick={toggleMode} aria-label="Alternar tema">
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notificações">
          <IconButton aria-label="Notificações">
            <NotificationsNoneRoundedIcon />
          </IconButton>
        </Tooltip>

        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            cursor: 'pointer',
            ml: 0.5,
            pl: 1.5,
            borderLeft: '1px solid',
            borderColor: 'divider',
            py: 0.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'secondary.main',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {user?.name?.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {user ? roleLabels[user.role] : ''}
            </Typography>
          </Box>
        </Stack>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>{user?.email}</MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null)
              handleLogout()
            }}
          >
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
