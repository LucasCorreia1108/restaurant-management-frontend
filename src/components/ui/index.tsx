import { Box, Skeleton, Stack, type BoxProps } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Box
          component="h1"
          sx={{
            m: 0,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Box>
        {subtitle && (
          <Box component="p" sx={{ m: 0, mt: 0.5, color: 'text.secondary', fontSize: '0.95rem' }}>
            {subtitle}
          </Box>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Stack>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accent?: string
  loading?: boolean
}

export function StatCard({ label, value, icon, accent = '#C56A3D', loading }: StatCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accent,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Box sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500, mb: 1 }}>{label}</Box>
          {loading ? (
            <Skeleton width={80} height={36} />
          ) : (
            <Box
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {value}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{ py: 8, px: 3, textAlign: 'center' }}
    >
      {icon && (
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            mb: 1,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{title}</Box>
      {description && (
        <Box sx={{ color: 'text.secondary', maxWidth: 360, fontSize: '0.95rem' }}>{description}</Box>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  )
}

export function Surface({ children, sx, ...props }: BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export function GridSkeleton({ count = 4, height = 120 }: { count?: number; height?: number }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: `repeat(${Math.min(count, 4)}, 1fr)`,
        },
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={height} sx={{ borderRadius: 4 }} />
      ))}
    </Box>
  )
}
