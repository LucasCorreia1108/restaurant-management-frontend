import { Box, Typography } from '@mui/material'
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
import { PageHeader, Surface, GridSkeleton, StatCard } from '@/components/ui'
import { useReports } from '@/hooks'
import { formatCurrency } from '@/utils'
import { brand } from '@/theme'

const barColors = [brand.secondary, brand.accent, brand.occupied, brand.preparing, brand.payment]

export function ReportsPage() {
  const { data, isLoading } = useReports()

  return (
    <Box>
      <PageHeader
        title="Relatórios"
        subtitle="Performance comercial e operacional do restaurante"
      />

      {isLoading || !data ? (
        <GridSkeleton count={4} height={280} />
      ) : (
        <>
          <Box sx={{ mb: 3, maxWidth: 320 }}>
            <StatCard
              label="Tempo médio de preparo"
              value={`${data.avgPrepMinutes.toFixed(1)} min`}
              icon={<TimerRoundedIcon />}
              accent={brand.preparing}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            }}
          >
            <Surface>
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                Vendas por dia
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={data.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        const numeric = Number(value)
                        if (name === 'Faturamento') {
                          return [formatCurrency(numeric), name]
                        }
                        return [`${numeric} pedido${numeric === 1 ? '' : 's'}`, name]
                      }}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Faturamento"
                      stroke={brand.secondary}
                      strokeWidth={3}
                      dot={{ r: 4, fill: brand.accent }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      name="Pedidos"
                      stroke={brand.occupied}
                      strokeWidth={2}
                      strokeDasharray="4 4"
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
                <ResponsiveContainer>
                  <BarChart data={data.topProducts} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.08)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value) => Number(value)}
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="quantity" name="Qtd." radius={[0, 8, 8, 0]}>
                      {data.topProducts.map((_, index) => (
                        <Cell key={index} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Surface>

            <Surface sx={{ gridColumn: { lg: '1 / -1' } }}>
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, mb: 2 }}>
                Desempenho dos garçons
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
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
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Faturamento (R$)" fill={brand.secondary} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="orders" name="Pedidos" fill={brand.accent} radius={[8, 8, 0, 0]} />
                    <Bar
                      dataKey="avgServiceMinutes"
                      name="Tempo médio (min)"
                      fill={brand.occupied}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Surface>
          </Box>
        </>
      )}
    </Box>
  )
}
