import { alpha, Box, Button, Chip, Stack, Typography } from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { useSnackbar } from 'notistack'
import { PageHeader, EmptyState, GridSkeleton } from '@/components/ui'
import { useKitchen, useUpdateKitchenStatus } from '@/hooks'
import { formatElapsed, formatTime } from '@/utils'
import { brand } from '@/theme'
import { OrderStatus, type KitchenTicket } from '@/types'
import SoupKitchenRoundedIcon from '@mui/icons-material/SoupKitchenRounded'
import { ApiError } from '@/services/api'

type ColumnId = 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY'

const columns: { id: ColumnId; title: string; color: string }[] = [
  { id: OrderStatus.SENT_TO_KITCHEN, title: 'Recebidos', color: brand.occupied },
  { id: OrderStatus.PREPARING, title: 'Em Preparo', color: brand.preparing },
  { id: OrderStatus.READY, title: 'Prontos', color: brand.success },
]

const DND_TYPE = 'application/x-kitchen-order'

export function KitchenPage() {
  const { data: tickets, isLoading } = useKitchen()
  const updateStatus = useUpdateKitchenStatus()
  const { enqueueSnackbar } = useSnackbar()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null)
  const didDragRef = useRef(false)

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, KitchenTicket[]> = {
      SENT_TO_KITCHEN: [],
      PREPARING: [],
      READY: [],
    }
    tickets?.forEach((t) => {
      if (t.status in map) map[t.status].push(t)
    })
    return map
  }, [tickets])

  const moveTicket = async (ticketId: string, targetStatus: ColumnId) => {
    const ticket = tickets?.find((t) => t.id === ticketId)
    if (!ticket) return
    if (ticket.status === targetStatus) return

    // Só permite avanço sequencial (API não aceita pular PREPARING → READY sem passar por PREPARING)
    const transitions: Record<ColumnId, ColumnId | null> = {
      SENT_TO_KITCHEN: OrderStatus.PREPARING,
      PREPARING: OrderStatus.READY,
      READY: null,
    }
    const expected = transitions[ticket.status]
    if (expected !== targetStatus) {
      enqueueSnackbar(
        targetStatus === OrderStatus.READY && ticket.status === OrderStatus.SENT_TO_KITCHEN
          ? 'Mova primeiro para Em Preparo'
          : 'Movimento inválido para este status',
        { variant: 'warning' },
      )
      return
    }

    try {
      await updateStatus.mutateAsync({ id: ticketId, status: targetStatus })
      enqueueSnackbar(
        targetStatus === OrderStatus.PREPARING ? 'Preparo iniciado' : 'Pedido pronto',
        { variant: 'success' },
      )
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao atualizar status', {
        variant: 'error',
      })
    }
  }

  const allowDrop = (e: DragEvent, columnId: ColumnId) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(columnId)
  }

  const handleDrop = (e: DragEvent, columnId: ColumnId) => {
    e.preventDefault()
    e.stopPropagation()
    const id =
      e.dataTransfer.getData(DND_TYPE) ||
      e.dataTransfer.getData('text/plain') ||
      draggingId
    setDropTarget(null)
    setDraggingId(null)
    if (id) void moveTicket(id, columnId)
  }

  return (
    <Box>
      <PageHeader
        title="Cozinha"
        subtitle="Arraste entre colunas ou use os botões para avançar o status"
      />

      {isLoading ? (
        <GridSkeleton count={3} height={420} />
      ) : !tickets?.length ? (
        <EmptyState
          title="Nenhum pedido na cozinha"
          description="Pedidos enviados pelo salão aparecerão aqui."
          icon={<SoupKitchenRoundedIcon fontSize="large" />}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            alignItems: 'start',
            minHeight: 480,
          }}
        >
          {columns.map((col) => (
            <Box
              key={col.id}
              onDragOver={(e) => allowDrop(e, col.id)}
              onDragEnter={(e) => allowDrop(e, col.id)}
              onDragLeave={() => setDropTarget((current) => (current === col.id ? null : current))}
              onDrop={(e) => handleDrop(e, col.id)}
              sx={{
                p: 1.5,
                borderRadius: 4,
                bgcolor: alpha(col.color, dropTarget === col.id ? 0.14 : 0.06),
                border: '2px dashed',
                borderColor: dropTarget === col.id ? col.color : alpha(col.color, 0.35),
                minHeight: 420,
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5, px: 0.5 }}
              >
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
                  {col.title}
                </Typography>
                <Chip
                  size="small"
                  label={byColumn[col.id].length}
                  sx={{ bgcolor: alpha(col.color, 0.2), color: col.color, fontWeight: 700 }}
                />
              </Stack>

              <Stack spacing={1.5}>
                {byColumn[col.id].map((ticket) => (
                  <Box
                    key={ticket.id}
                    draggable={!updateStatus.isPending}
                    onDragStart={(e) => {
                      didDragRef.current = true
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData(DND_TYPE, ticket.id)
                      e.dataTransfer.setData('text/plain', ticket.id)
                      setDraggingId(ticket.id)
                    }}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDropTarget(null)
                      // evita click fantasma após drag
                      window.setTimeout(() => {
                        didDragRef.current = false
                      }, 50)
                    }}
                    onDragOver={(e) => allowDrop(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: draggingId === ticket.id ? col.color : 'divider',
                      cursor: updateStatus.isPending ? 'wait' : 'grab',
                      opacity: draggingId === ticket.id ? 0.55 : 1,
                      pointerEvents: draggingId && draggingId !== ticket.id ? 'none' : 'auto',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                      '&:active': { cursor: 'grabbing' },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <DragIndicatorRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography fontWeight={700} fontSize="1.05rem">
                          Mesa {ticket.tableNumber}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                        <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" fontWeight={600}>
                          {formatTime(ticket.createdAt)} · {formatElapsed(ticket.createdAt)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                      {ticket.items.map((item) => (
                        <Box key={item.id}>
                          <Typography fontWeight={600} fontSize={14}>
                            {item.quantity}× {item.name}
                          </Typography>
                          {item.notes && (
                            <Typography variant="caption" color="secondary.main" fontWeight={600}>
                              Obs: {item.notes}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      Garçom: {ticket.waiterName}
                    </Typography>

                    {ticket.status === OrderStatus.SENT_TO_KITCHEN && (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<PlayArrowRoundedIcon />}
                        disabled={updateStatus.isPending}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (didDragRef.current) return
                          void moveTicket(ticket.id, OrderStatus.PREPARING)
                        }}
                      >
                        Iniciar preparo
                      </Button>
                    )}

                    {ticket.status === OrderStatus.PREPARING && (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckRoundedIcon />}
                        disabled={updateStatus.isPending}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (didDragRef.current) return
                          void moveTicket(ticket.id, OrderStatus.READY)
                        }}
                      >
                        Marcar pronto
                      </Button>
                    )}

                    {ticket.status === OrderStatus.READY && (
                      <Chip
                        size="small"
                        label="Aguardando entrega"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
