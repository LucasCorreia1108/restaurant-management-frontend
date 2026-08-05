import { alpha, Box, Chip, Stack, Typography } from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import type { Table } from '@/types'
import { formatElapsed, getTableStatusColor, getTableStatusLabel } from '@/utils'

interface TableCardProps {
  table: Table
  selected?: boolean
  onClick?: () => void
}

export function TableCard({ table, selected, onClick }: TableCardProps) {
  const color = getTableStatusColor(table.status)
  const isFree = table.status === 'FREE' || table.status === 'CLOSED'
  const waiterName = table.currentWaiter?.name

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        p: 2,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: selected ? color : 'transparent',
        boxShadow: selected ? `0 0 0 4px ${alpha(color, 0.15)}` : 1,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        minHeight: 140,
        outline: 'none',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: 4,
            }
          : undefined,
        '&:focus-visible': {
          boxShadow: `0 0 0 4px ${alpha(color, 0.25)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at top right, ${alpha(color, 0.14)}, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ position: 'relative' }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: '1.75rem',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {table.number}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {table.capacity} lugares
          </Typography>
        </Box>
        <Chip
          size="small"
          label={getTableStatusLabel(table.status)}
          sx={{
            bgcolor: alpha(color, 0.15),
            color,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Stack spacing={0.75} sx={{ mt: 2.5, position: 'relative' }}>
        {!isFree && waiterName && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PersonOutlineRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {waiterName}
            </Typography>
          </Stack>
        )}
        {!isFree && table.openedAt && (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatElapsed(table.openedAt)}
            </Typography>
          </Stack>
        )}
        {isFree && (
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Disponível para atendimento
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
