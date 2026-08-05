import { Box } from '@mui/material'
import TableRestaurantRoundedIcon from '@mui/icons-material/TableRestaurantRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, Surface, GridSkeleton } from '@/components/ui'
import { useDashboard, useKitchen, useTables } from '@/hooks'
import { formatCurrency, formatElapsed, formatTime } from '@/utils'
import { brand } from '@/theme'
import { TableCard } from '@/components/tables/TableCard'

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard()
  const { data: tables } = useTables()
  const { data: kitchen } = useKitchen()
  const navigate = useNavigate()

  const activeTables =
    tables?.filter((t) => t.status !== 'FREE' && t.status !== 'CLOSED').slice(0, 4) ?? []
  const recentTickets = kitchen?.slice(0, 4) ?? []

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da operação do salão e da cozinha"
      />

      {isLoading || !stats ? (
        <GridSkeleton count={5} height={110} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            mb: 3,
          }}
        >
          <StatCard
            label="Mesas Livres"
            value={stats.freeTables}
            icon={<TableRestaurantRoundedIcon />}
            accent={brand.free}
          />
          <StatCard
            label="Mesas Ocupadas"
            value={stats.occupiedTables}
            icon={<GroupsRoundedIcon />}
            accent={brand.occupied}
          />
          <StatCard
            label="Em Preparo"
            value={stats.preparingOrders}
            icon={<SoupKitchenRoundedIcon />}
            accent={brand.preparing}
          />
          <StatCard
            label="Pedidos Prontos"
            value={stats.readyOrders}
            icon={<CheckCircleRoundedIcon />}
            accent={brand.accent}
          />
          <StatCard
            label="Faturamento do Dia"
            value={formatCurrency(stats.dailyRevenue)}
            icon={<PaymentsRoundedIcon />}
            accent={brand.secondary}
          />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
        }}
      >
        <Surface>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Box sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>
                Salão agora
              </Box>
              <Box sx={{ color: 'text.secondary', fontSize: 13, mt: 0.25 }}>
                Mesas ativas no momento
              </Box>
            </Box>
            <Box
              component="button"
              onClick={() => navigate('/mesas')}
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                color: 'secondary.main',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Ver planta
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            {activeTables.map((table) => (
              <TableCard key={table.id} table={table} onClick={() => navigate('/mesas')} />
            ))}
          </Box>
        </Surface>

        <Surface>
          <Box sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
            Cozinha em tempo real
          </Box>
          <Box sx={{ color: 'text.secondary', fontSize: 13, mb: 2.5 }}>
            Últimos tickets do KDS
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentTickets.map((ticket) => (
              <Box
                key={ticket.id}
                onClick={() => navigate('/cozinha')}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  transition: '0.15s',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Box sx={{ fontWeight: 700 }}>Mesa {ticket.tableNumber}</Box>
                  <Box
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color:
                        ticket.status === 'READY'
                          ? brand.success
                          : ticket.status === 'PREPARING'
                            ? brand.preparing
                            : brand.occupied,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ticket.status === 'READY'
                      ? 'Pronto'
                      : ticket.status === 'PREPARING'
                        ? 'Preparo'
                        : 'Recebido'}
                  </Box>
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {ticket.items.map((i) => `${i.quantity}x ${i.name}`).join(' · ')}
                </Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.75 }}>
                  {formatTime(ticket.createdAt)} · {formatElapsed(ticket.createdAt)}
                </Box>
              </Box>
            ))}
          </Box>
        </Surface>
      </Box>
    </Box>
  )
}
