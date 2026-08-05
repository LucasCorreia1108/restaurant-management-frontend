import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import TimerRoundedIcon from '@mui/icons-material/TimerRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { useMemo, useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { PageHeader, Surface, GridSkeleton, StatCard, EmptyState } from '@/components/ui'
import { useReports } from '@/hooks'
import { formatCurrency } from '@/utils'
import { brand } from '@/theme'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'

const barColors = [brand.secondary, brand.accent, brand.occupied, brand.preparing, brand.payment]

function toApiDate(value: Date): string {
  return format(value, 'yyyy-MM-dd')
}

type Preset = '7d' | '30d' | 'month' | 'custom'

function getPresetRange(preset: Exclude<Preset, 'custom'>): { from: string; to: string } {
  const today = new Date()
  if (preset === '7d') {
    return { from: toApiDate(subDays(today, 6)), to: toApiDate(today) }
  }
  if (preset === '30d') {
    return { from: toApiDate(subDays(today, 29)), to: toApiDate(today) }
  }
  return {
    from: toApiDate(startOfMonth(today)),
    to: toApiDate(endOfMonth(today)),
  }
}

export function ReportsPage() {
  const initial = useMemo(() => getPresetRange('7d'), [])
  const [preset, setPreset] = useState<Preset>('7d')
  const [fromInput, setFromInput] = useState(initial.from)
  const [toInput, setToInput] = useState(initial.to)
  const [applied, setApplied] = useState(initial)

  const { data, isLoading, isFetching } = useReports(applied)

  const applyRange = (from: string, to: string, nextPreset: Preset) => {
    if (from && to && from > to) return
    setFromInput(from)
    setToInput(to)
    setApplied({ from, to })
    setPreset(nextPreset)
  }

  const handlePreset = (next: Exclude<Preset, 'custom'>) => {
    const range = getPresetRange(next)
    applyRange(range.from, range.to, next)
  }

  const handleApplyCustom = () => {
    if (!fromInput || !toInput) return
    applyRange(fromInput, toInput, 'custom')
  }

  const periodLabel =
    applied.from && applied.to
      ? `${applied.from.split('-').reverse().join('/')} — ${applied.to.split('-').reverse().join('/')}`
      : 'Todo o período'

  return (
    <Box>
      <PageHeader
        title="Relatórios"
        subtitle="Performance comercial e operacional do restaurante"
      />

      <Surface sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 1 }}>
              Período
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant={preset === '7d' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => handlePreset('7d')}
            >
              7 dias
            </Button>
            <Button
              size="small"
              variant={preset === '30d' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => handlePreset('30d')}
            >
              30 dias
            </Button>
            <Button
              size="small"
              variant={preset === 'month' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => handlePreset('month')}
            >
              Este mês
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ mt: 2.5 }}
        >
          <TextField
            label="De"
            type="date"
            size="small"
            value={fromInput}
            onChange={(e) => {
              setFromInput(e.target.value)
              setPreset('custom')
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: toInput || undefined }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Até"
            type="date"
            size="small"
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value)
              setPreset('custom')
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: fromInput || undefined }}
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleApplyCustom}
            disabled={!fromInput || !toInput || fromInput > toInput || isFetching}
          >
            Aplicar
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
            Exibindo: {periodLabel}
            {isFetching ? ' · atualizando…' : ''}
          </Typography>
        </Stack>
      </Surface>

      {isLoading || !data ? (
        <GridSkeleton count={4} height={280} />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              mb: 3,
              maxWidth: 680,
            }}
          >
            <StatCard
              label="Faturamento no período"
              value={formatCurrency(data.totalRevenue)}
              icon={<PaymentsRoundedIcon />}
              accent={brand.secondary}
            />
            <StatCard
              label="Tempo médio de preparo"
              value={`${data.avgPrepMinutes.toFixed(1)} min`}
              icon={<TimerRoundedIcon />}
              accent={brand.preparing}
            />
          </Box>

          {data.salesByDay.length === 0 &&
          data.topProducts.length === 0 &&
          data.waiterPerformance.length === 0 ? (
            <EmptyState
              title="Sem dados no período"
              description="Ajuste o filtro de datas ou aguarde novos pagamentos."
              icon={<InsightsRoundedIcon fontSize="large" />}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                opacity: isFetching ? 0.72 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <Surface>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                  Vendas por dia
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.salesByDay} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                        minTickGap={8}
                      />
                      <YAxis
                        yAxisId="revenue"
                        tick={{ fontSize: 11 }}
                        width={56}
                        tickFormatter={(v) =>
                          Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : String(v)
                        }
                      />
                      <YAxis
                        yAxisId="orders"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        width={36}
                        allowDecimals={false}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const numeric = Number(value)
                          if (name === 'Faturamento') {
                            return [formatCurrency(numeric), name]
                          }
                          return [`${numeric} pedido${numeric === 1 ? '' : 's'}`, name]
                        }}
                        contentStyle={{
                          borderRadius: 12,
                          border: 'none',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        name="Faturamento"
                        stroke={brand.secondary}
                        strokeWidth={3}
                        dot={{ r: 3, fill: brand.accent }}
                        connectNulls
                      />
                      <Line
                        yAxisId="orders"
                        type="monotone"
                        dataKey="orders"
                        name="Pedidos"
                        stroke={brand.occupied}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Surface>

              <Surface>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                  Produtos mais vendidos
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  {data.topProducts.length === 0 ? (
                    <EmptyState title="Sem produtos no período" description="Nenhuma venda encontrada." />
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={data.topProducts} layout="vertical" margin={{ left: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => Number(value)}
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar dataKey="quantity" name="Qtd." radius={[0, 8, 8, 0]}>
                          {data.topProducts.map((_, index) => (
                            <Cell key={index} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Surface>

              <Surface sx={{ gridColumn: { lg: '1 / -1' } }}>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                  Desempenho dos garçons
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  {data.waiterPerformance.length === 0 ? (
                    <EmptyState
                      title="Sem desempenho no período"
                      description="Nenhum pedido fechado neste intervalo."
                    />
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={data.waiterPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => {
                            const numeric = Number(value)
                            if (String(name).includes('Faturamento')) {
                              return [formatCurrency(numeric), name]
                            }
                            if (String(name).includes('Tempo')) {
                              return [`${numeric} min`, name]
                            }
                            return [numeric, name]
                          }}
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          name="Faturamento (R$)"
                          fill={brand.secondary}
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar dataKey="orders" name="Pedidos" fill={brand.accent} radius={[8, 8, 0, 0]} />
                        <Bar
                          dataKey="avgServiceMinutes"
                          name="Tempo médio (min)"
                          fill={brand.occupied}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Surface>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
