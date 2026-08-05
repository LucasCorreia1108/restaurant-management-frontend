import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import PixIcon from '@mui/icons-material/Pix'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import { useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import { PageHeader, EmptyState, Surface, GridSkeleton } from '@/components/ui'
import { TableCard } from '@/components/tables/TableCard'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { usePayTable, useTableBill, useTables } from '@/hooks'
import { PaymentMethod, TableStatus, type PaymentMethod as PaymentMethodType, type Table } from '@/types'
import { formatCurrency, toNumber } from '@/utils'
import { ApiError } from '@/services/api'

const methods: { id: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
  { id: PaymentMethod.PIX, label: 'PIX', icon: <PixIcon /> },
  { id: PaymentMethod.CASH, label: 'Dinheiro', icon: <PaymentsRoundedIcon /> },
  { id: PaymentMethod.DEBIT_CARD, label: 'Débito', icon: <AccountBalanceWalletRoundedIcon /> },
  { id: PaymentMethod.CREDIT_CARD, label: 'Crédito', icon: <CreditCardRoundedIcon /> },
]

export function CashierPage() {
  const { data: tables, isLoading } = useTables()
  const payTable = usePayTable()
  const { enqueueSnackbar } = useSnackbar()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [method, setMethod] = useState<PaymentMethodType | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: bill, isLoading: billLoading } = useTableBill(selectedTable?.id ?? null)

  const payableTables = useMemo(
    () =>
      tables?.filter((t) =>
        [
          TableStatus.WAITING_PAYMENT,
          TableStatus.OCCUPIED,
          TableStatus.WAITING_ORDER,
          TableStatus.IN_PREPARATION,
        ].includes(t.status as typeof TableStatus.OCCUPIED),
      ) ?? [],
    [tables],
  )

  const handleConfirmPay = async () => {
    if (!selectedTable || !method) return
    try {
      await payTable.mutateAsync({
        tableId: selectedTable.id,
        paymentMethod: method,
        amount: bill ? toNumber(bill.total) : undefined,
      })
      enqueueSnackbar(
        `Mesa ${selectedTable.number} fechada via ${methods.find((m) => m.id === method)?.label}`,
        { variant: 'success' },
      )
      setSelectedTable(null)
      setMethod(null)
      setConfirmOpen(false)
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha no pagamento', {
        variant: 'error',
      })
    }
  }

  const lineItems =
    bill?.orders.flatMap((order) =>
      order.items.map((item) => ({
        id: item.id,
        label: `${item.quantity}× ${item.menuItem?.name ?? 'Item'}`,
        amount: toNumber(item.unitPrice) * item.quantity,
      })),
    ) ?? []

  return (
    <Box>
      <PageHeader
        title="Caixa"
        subtitle="Mesas com pedidos prontos para pagamento"
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.1fr' },
          alignItems: 'start',
        }}
      >
        <Box>
          {isLoading ? (
            <GridSkeleton count={4} height={140} />
          ) : payableTables.length === 0 ? (
            <EmptyState
              title="Nenhuma conta aberta"
              description="Mesas ocupadas ou em pagamento aparecerão aqui."
              icon={<PointOfSaleRoundedIcon fontSize="large" />}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
              }}
            >
              {payableTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  selected={selectedTable?.id === table.id}
                  onClick={() => {
                    setSelectedTable(table)
                    setMethod(null)
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Surface>
          {!selectedTable ? (
            <EmptyState
              title="Selecione uma mesa"
              description="Visualize itens e finalize o pagamento."
              icon={<PointOfSaleRoundedIcon />}
            />
          ) : billLoading || !bill ? (
            <GridSkeleton count={1} height={280} />
          ) : (
            <Box>
              <Typography
                sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1.25rem' }}
              >
                Mesa {bill.table.number}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                Garçom: {bill.waiter?.name ?? '—'}
              </Typography>

              <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                {lineItems.map((item) => (
                  <Stack key={item.id} direction="row" justifyContent="space-between">
                    <Typography>{item.label}</Typography>
                    <Typography fontWeight={600}>{formatCurrency(item.amount)}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography fontWeight={700} fontSize="1.1rem">
                  Total
                </Typography>
                <Typography fontWeight={700} fontSize="1.35rem" color="secondary.main">
                  {formatCurrency(bill.total)}
                </Typography>
              </Stack>

              <Typography fontWeight={600} sx={{ mb: 1.5 }}>
                Forma de pagamento
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {methods.map((m) => (
                  <Button
                    key={m.id}
                    variant={method === m.id ? 'contained' : 'outlined'}
                    color="secondary"
                    startIcon={m.icon}
                    onClick={() => setMethod(m.id)}
                    sx={{ py: 1.5 }}
                  >
                    {m.label}
                  </Button>
                ))}
              </Box>

              <Button
                fullWidth
                size="large"
                variant="contained"
                sx={{ mt: 2.5 }}
                disabled={!method || payTable.isPending}
                onClick={() => setConfirmOpen(true)}
              >
                Confirmar fechamento
              </Button>
            </Box>
          )}
        </Surface>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar pagamento"
        description={
          bill && method && selectedTable
            ? `Fechar Mesa ${selectedTable.number} no valor de ${formatCurrency(bill.total)} via ${methods.find((m) => m.id === method)?.label}?`
            : ''
        }
        confirmLabel="Finalizar"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleConfirmPay()}
        loading={payTable.isPending}
      />
    </Box>
  )
}
