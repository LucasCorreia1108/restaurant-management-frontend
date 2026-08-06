import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RoomServiceRoundedIcon from '@mui/icons-material/RoomServiceRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import { useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import { PageHeader, EmptyState, Surface } from '@/components/ui'
import { TableCard } from '@/components/tables/TableCard'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import {
  useCreateAndSendOrder,
  useDeliverOrder,
  useMenu,
  useOpenTable,
  useOrdersByTable,
  useRequestBill,
  useTables,
} from '@/hooks'
import { useAuthStore, useCartStore } from '@/store'
import {
  calcOrderTotals,
  formatCurrency,
  getCategoryLabel,
  getOrderStatusLabel,
  toNumber,
} from '@/utils'
import {
  CategoryType,
  OrderStatus,
  TableStatus,
  UserRole,
  type CategoryType as CategoryTypeT,
  type MenuItem,
  type Order,
} from '@/types'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import { ApiError } from '@/services/api'
import { brand } from '@/theme'

const steps = ['Selecionar mesa', 'Atender', 'Enviar / finalizar']

function orderStatusColor(status: Order['status']) {
  switch (status) {
    case OrderStatus.READY:
      return brand.success
    case OrderStatus.PREPARING:
    case OrderStatus.SENT_TO_KITCHEN:
      return brand.preparing
    case OrderStatus.DELIVERED:
      return brand.occupied
    default:
      return brand.primary
  }
}

export function WaiterPage() {
  const { data: tables } = useTables()
  const { data: menu } = useMenu()
  const createOrder = useCreateAndSendOrder()
  const openTable = useOpenTable()
  const deliverOrder = useDeliverOrder()
  const requestBill = useRequestBill()
  const user = useAuthStore((s) => s.user)
  const { enqueueSnackbar } = useSnackbar()
  const [category, setCategory] = useState<CategoryTypeT | 'all'>('all')
  const [orderNotes, setOrderNotes] = useState('')

  const {
    tableId,
    tableNumber,
    items,
    selectTable,
    addItem,
    updateQuantity,
    updateNotes,
    removeItem,
    clear,
  } = useCartStore()

  const { data: tableOrders } = useOrdersByTable(tableId)

  const openOrders = useMemo(
    () => (tableOrders ?? []).filter((o) => o.status !== OrderStatus.CLOSED),
    [tableOrders],
  )

  const readyOrders = openOrders.filter((o) => o.status === OrderStatus.READY)
  const canRequestBill =
    openOrders.length > 0 &&
    openOrders.every((o) => o.status === OrderStatus.DELIVERED)

  const step = !tableId ? 0 : items.length === 0 && openOrders.length === 0 ? 1 : 2
  const totals = calcOrderTotals(items)

  const availableTables = useMemo(
    () =>
      tables?.filter((t) =>
        [
          TableStatus.FREE,
          TableStatus.CLOSED,
          TableStatus.OCCUPIED,
          TableStatus.WAITING_ORDER,
          TableStatus.IN_PREPARATION,
        ].includes(t.status as typeof TableStatus.FREE),
      ) ?? [],
    [tables],
  )

  const filteredMenu = useMemo(() => {
    if (!menu) return []
    if (category === 'all') return menu.filter((m) => m.available)
    return menu.filter((m) => m.available && m.category?.type === category)
  }, [menu, category])

  const handleSelectTable = async (table: (typeof availableTables)[number]) => {
    try {
      if (table.status === TableStatus.FREE || table.status === TableStatus.CLOSED) {
        if (
          user?.role !== UserRole.WAITER &&
          user?.role !== UserRole.ADMIN &&
          user?.role !== UserRole.MANAGER
        ) {
          enqueueSnackbar('Apenas garçom/admin pode abrir mesa', { variant: 'warning' })
          return
        }
        await openTable.mutateAsync({ id: table.id })
      }
      selectTable(table.id, table.number)
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Não foi possível selecionar a mesa', {
        variant: 'error',
      })
    }
  }

  const handleAdd = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: toNumber(item.price),
    })
    enqueueSnackbar(`${item.name} adicionado`, { variant: 'info' })
  }

  const handleSend = async () => {
    if (!tableId || !user || items.length === 0) return
    try {
      await createOrder.mutateAsync({
        tableId,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          notes: i.notes,
        })),
        notes: orderNotes || undefined,
      })
      enqueueSnackbar(`Pedido enviado à cozinha — Mesa ${tableNumber}`, { variant: 'success' })
      selectTable(tableId, tableNumber!)
      useCartStore.setState({ items: [] })
      setOrderNotes('')
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao enviar pedido', {
        variant: 'error',
      })
    }
  }

  const handleDeliver = async (orderId: string) => {
    try {
      await deliverOrder.mutateAsync(orderId)
      enqueueSnackbar('Pedido entregue na mesa', { variant: 'success' })
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao entregar pedido', {
        variant: 'error',
      })
    }
  }

  const handleRequestBill = async () => {
    if (!tableId) return
    try {
      await requestBill.mutateAsync(tableId)
      enqueueSnackbar(`Conta solicitada — Mesa ${tableNumber}`, { variant: 'success' })
      clear()
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Não foi possível solicitar a conta', {
        variant: 'error',
      })
    }
  }

  return (
    <Box>
      <PageHeader
        title="Tela do Garçom"
        subtitle="Abrir mesa → enviar à cozinha → entregar prontos → solicitar conta"
      />

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 0.9fr' },
          alignItems: 'start',
        }}
      >
        <Box>
          {!tableId ? (
            <Surface>
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                Selecione a mesa
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                }}
              >
                {availableTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onClick={() => void handleSelectTable(table)}
                  />
                ))}
              </Box>
            </Surface>
          ) : (
            <Surface>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    Cardápio — Mesa {tableNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adicione itens ou acompanhe pedidos abertos ao lado
                  </Typography>
                </Box>
                <Button color="inherit" onClick={clear}>
                  Trocar mesa
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  variant={category === 'all' ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => setCategory('all')}
                >
                  Todos
                </Button>
                {(Object.values(CategoryType) as CategoryTypeT[]).map((key) => (
                  <Button
                    key={key}
                    size="small"
                    variant={category === key ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => setCategory(key)}
                  >
                    {getCategoryLabel(key)}
                  </Button>
                ))}
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                }}
              >
                {filteredMenu.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAdd={handleAdd} compact />
                ))}
              </Box>
            </Surface>
          )}
        </Box>

        <Stack spacing={2.5} sx={{ position: { lg: 'sticky' }, top: 88 }}>
          {tableId && (
            <Surface>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                  Pedidos da mesa
                </Typography>
                {readyOrders.length > 0 && (
                  <Chip
                    size="small"
                    color="success"
                    label={`${readyOrders.length} pronto(s)`}
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              {openOrders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum pedido aberto nesta mesa.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {openOrders.map((order) => (
                    <Box
                      key={order.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: order.status === OrderStatus.READY ? `${brand.success}12` : 'action.hover',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography fontWeight={700} fontSize={14}>
                          {formatCurrency(order.total)}
                        </Typography>
                        <Chip
                          size="small"
                          label={getOrderStatusLabel(order.status)}
                          sx={{
                            fontWeight: 700,
                            bgcolor: `${orderStatusColor(order.status)}22`,
                            color: orderStatusColor(order.status),
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                        {order.items
                          .map((i) => `${i.quantity}× ${i.menuItem?.name ?? 'Item'}`)
                          .join(' · ')}
                      </Typography>

                      {order.status === OrderStatus.READY && (
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<RoomServiceRoundedIcon />}
                          disabled={deliverOrder.isPending}
                          onClick={() => void handleDeliver(order.id)}
                        >
                          Entregar na mesa
                        </Button>
                      )}

                      {(order.status === OrderStatus.SENT_TO_KITCHEN ||
                        order.status === OrderStatus.PREPARING) && (
                        <Typography variant="caption" color="warning.main" fontWeight={600}>
                          Aguardando cozinha…
                        </Typography>
                      )}
                    </Box>
                  ))}

                  {canRequestBill && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<ReceiptLongRoundedIcon />}
                      disabled={requestBill.isPending}
                      onClick={() => void handleRequestBill()}
                    >
                      Solicitar conta
                    </Button>
                  )}
                  {!canRequestBill && openOrders.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {readyOrders.length > 0
                        ? 'Entregue os pedidos prontos para liberar a solicitação de conta.'
                        : openOrders.some(
                              (o) =>
                                o.status === OrderStatus.SENT_TO_KITCHEN ||
                                o.status === OrderStatus.PREPARING,
                            )
                          ? 'Aguarde a cozinha finalizar o preparo.'
                          : 'Entregue todos os pedidos antes de solicitar a conta.'}
                    </Typography>
                  )}
                </Stack>
              )}
            </Surface>
          )}

          <Surface>
            <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
              Novo pedido
            </Typography>

            {items.length === 0 ? (
              <EmptyState
                title="Carrinho vazio"
                description="Selecione uma mesa e adicione itens do cardápio."
                icon={<RestaurantMenuRoundedIcon />}
              />
            ) : (
              <Stack spacing={2}>
                {items.map((item) => (
                  <Box key={item.menuItemId}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                        <Typography fontWeight={600}>{item.name}</Typography>
                        <Typography variant="body2" color="secondary.main" fontWeight={700}>
                          {formatCurrency(item.price * item.quantity)}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        >
                          <RemoveRoundedIcon fontSize="small" />
                        </IconButton>
                        <Typography fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(item.menuItemId)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Observações do item"
                      value={item.notes ?? ''}
                      onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))}

                <Divider />

                <TextField
                  label="Observações do pedido"
                  multiline
                  minRows={2}
                  fullWidth
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700} color="secondary.main" fontSize="1.2rem">
                    {formatCurrency(totals.subtotal)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SendRoundedIcon />}
                  onClick={() => void handleSend()}
                  disabled={createOrder.isPending || openTable.isPending}
                >
                  Enviar para cozinha
                </Button>
              </Stack>
            )}
          </Surface>
        </Stack>
      </Box>
    </Box>
  )
}
