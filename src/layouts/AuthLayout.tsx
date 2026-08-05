import { Box, Stack, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { brand } from '@/theme'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#F9FAFB',
          background: `
            linear-gradient(160deg, rgba(17,24,39,0.92), rgba(17,24,39,0.75)),
            url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              background: `linear-gradient(135deg, ${brand.accent}, ${brand.secondary})`,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              color: brand.primary,
            }}
          >
            G
          </Box>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            GourmetOS
          </Typography>
        </Stack>

        <Box sx={{ maxWidth: 420 }}>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: '2.75rem',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Operação elegante.
            <Box component="span" sx={{ color: brand.accent, display: 'block' }}>
              Serviço impecável.
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(249,250,251,0.72)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Gestão de mesas, cozinha e caixa em uma experiência premium pensada para mesas e
            salões modernos.
          </Typography>
        </Box>

        <Typography sx={{ color: 'rgba(249,250,251,0.45)', fontSize: 13 }}>
          Feito por <strong>Lucas Correia</strong> - 2026
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
