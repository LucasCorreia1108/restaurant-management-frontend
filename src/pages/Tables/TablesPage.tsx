import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { PageHeader, EmptyState, GridSkeleton, Surface } from '@/components/ui'
import { TableCard } from '@/components/tables/TableCard'
import { useOpenTable, useRequestBill, useTables } from '@/hooks'
import { OrderStatus, TableStatus, UserRole, type Table, type TableStatus as TableStatusType } from '@/types'
import { getTableStatusColor, getTableStatusLabel } from '@/utils'
import TableRestaurantRoundedIcon from '@mui/icons-material/TableRestaurantRounded'
import { useAuthStore, useCartStore } from '@/store'
import { ApiError } from '@/services/api'

const filters: Array<TableStatusType | 'all'> = [
  'all',
  TableStatus.FREE,
  TableStatus.OCCUPIED,
  TableStatus.WAITING_ORDER,
  TableStatus.IN_PREPARATION,
  TableStatus.WAITING_PAYMENT,
]

export function TablesPage() {
  const navigate = useNavigate()
  const { data: tables, isLoading } = useTables()
  const openTable = useOpenTable()
  const requestBill = useRequestBill()
  const user = useAuthStore((s) => s.user)
  const selectTable = useCartStore((s) => s.selectTable)
  const { enqueueSnackbar } = useSnackbar()
  const [filter, setFilter] = useState<TableStatusType | 'all'>('all')
  const [selected, setSelected] = useState<Table | null>(null)

  const filtered = useMemo(() => {
    if (!tables) return []
    if (filter === 'all') return tables
    return tables.filter((t) => t.status === filter)
  }, [tables, filter])

  const canManage =
    user?.role === UserRole.WAITER ||
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.MANAGER
  const canOpen =
    Boolean(selected) &&
    canManage &&
    (selected?.status === TableStatus.FREE || selected?.status === TableStatus.CLOSED)
  const activeOrders = selected?.orders ?? []
  const hasConsumedItems = activeOrders.some((order) => (order.items?.length ?? 0) > 0)
  const allConsumedOrdersDelivered =
    hasConsumedItems && activeOrders.every((order) => order.status === OrderStatus.DELIVERED)
  const canAddOrder =
    Boolean(selected) &&
    canManage &&
    selected?.status !== TableStatus.FREE &&
    selected?.status !== TableStatus.CLOSED &&
    selected?.status !== TableStatus.WAITING_PAYMENT
  const canRequestBill = canAddOrder && allConsumedOrdersDelivered

  const handleOrder = () => {
    if (!selected) return
    selectTable(selected.id, selected.number)
    navigate('/garcom')
  }

  const handleOpen = async () => {
    if (!selected) return
    try {
      await openTable.mutateAsync({ id: selected.id })
      enqueueSnackbar(`Mesa ${selected.number} aberta`, { variant: 'success' })
      setSelected(null)
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao abrir mesa', {
        variant: 'error',
      })
    }
  }

  const handleBill = async () => {
    if (!selected) return
    try {
      await requestBill.mutateAsync(selected.id)
      enqueueSnackbar(`Conta solicitada — Mesa ${selected.number}`, { variant: 'success' })
      setSelected(null)
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao solicitar conta', {
        variant: 'error',
      })
    }
  }

  return (
    <Box>
      <PageHeader
        title="Gestão de Mesas"
        subtitle="Status das mesas e ações disponíveis"
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(
              [
                TableStatus.FREE,
                TableStatus.OCCUPIED,
                TableStatus.IN_PREPARATION,
                TableStatus.WAITING_PAYMENT,
              ] as const
            ).map((status) => (
              <Chip
                key={status}
                size="small"
                label={getTableStatusLabel(status)}
                sx={{
                  bgcolor: `${getTableStatusColor(status)}22`,
                  color: getTableStatusColor(status),
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
        }
      />

      <Surface sx={{ mb: 2.5 }}>
        <ToggleButtonGroup
          exclusive
          value={filter}
          onChange={(_, value: TableStatusType | 'all' | null) => value && setFilter(value)}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          {filters.map((f) => (
            <ToggleButton key={f} value={f} sx={{ textTransform: 'none', px: 2 }}>
              {f === 'all' ? 'Todas' : getTableStatusLabel(f)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Surface>

      {isLoading ? (
        <GridSkeleton count={8} height={150} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma mesa encontrada"
          description="Ajuste o filtro ou cadastre mesas na API."
          icon={<TableRestaurantRoundedIcon fontSize="large" />}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
          }}
        >
          {filtered.map((table) => (
            <TableCard key={table.id} table={table} onClick={() => setSelected(table)} />
          ))}
        </Box>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
          {selected ? `Mesa ${selected.number}` : ''}
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Status: {selected ? getTableStatusLabel(selected.status) : ''}
          </Typography>
          {selected?.currentWaiter && (
            <Typography sx={{ mt: 1 }}>Garçom: {selected.currentWaiter.name}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSelected(null)} color="inherit">
            Fechar
          </Button>
          {canAddOrder && (
            <Button
              variant={hasConsumedItems ? 'outlined' : 'contained'}
              color="secondary"
              onClick={handleOrder}
              sx={{ minWidth: 150, whiteSpace: 'nowrap' }}
            >
              {hasConsumedItems ? 'Adicionar pedido' : 'Realizar pedido'}
            </Button>
          )}
          {canRequestBill && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => void handleBill()}
              disabled={requestBill.isPending}
              sx={{ minWidth: 150 }}
            >
              Solicitar conta
            </Button>
          )}
          {canOpen && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => void handleOpen()}
              disabled={openTable.isPending}
            >
              Abrir mesa
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
