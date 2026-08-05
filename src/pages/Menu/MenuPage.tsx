import { Box, Button, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import { PageHeader, GridSkeleton, EmptyState } from '@/components/ui'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuItemFormDialog } from '@/components/menu/MenuItemFormDialog'
import { useMenu } from '@/hooks'
import { useAuthStore, useCartStore } from '@/store'
import {
  CategoryType,
  UserRole,
  type CategoryType as CategoryTypeT,
  type MenuItem,
} from '@/types'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useNavigate } from 'react-router-dom'
import { getCategoryLabel, toNumber } from '@/utils'

export function MenuPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === UserRole.ADMIN
  const { data: menu, isLoading } = useMenu(!isAdmin)
  const [category, setCategory] = useState<CategoryTypeT | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const addItem = useCartStore((s) => s.addItem)
  const tableId = useCartStore((s) => s.tableId)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const grouped = useMemo(() => {
    if (!menu) return []
    const cats = Object.values(CategoryType) as CategoryTypeT[]
    return cats
      .filter((c) => category === 'all' || category === c)
      .map((c) => ({
        key: c,
        label: getCategoryLabel(c),
        items: menu.filter((m) => m.category?.type === c),
      }))
      .filter((g) => g.items.length > 0)
  }, [menu, category])

  const handleAdd = (item: MenuItem) => {
    if (!tableId) {
      enqueueSnackbar('Selecione uma mesa na tela do Garçom primeiro', { variant: 'warning' })
      navigate('/garcom')
      return
    }
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: toNumber(item.price),
    })
    enqueueSnackbar(`${item.name} adicionado ao pedido`, { variant: 'success' })
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setFormOpen(true)
  }

  return (
    <Box>
      <PageHeader
        title="Cardápio"
        subtitle="Itens sincronizados com /menu da API"
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {isAdmin && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                Novo prato
              </Button>
            )}
            <Button variant="outlined" color="secondary" onClick={() => navigate('/garcom')}>
              Ir para pedido
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
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

      {isLoading ? (
        <GridSkeleton count={6} height={200} />
      ) : grouped.length === 0 ? (
        <EmptyState
          title="Nenhum item no cardápio"
          description={
            isAdmin
              ? 'Cadastre o primeiro prato com foto para começar.'
              : 'Cadastre pratos e bebidas na API.'
          }
          icon={<RestaurantMenuRoundedIcon fontSize="large" />}
          action={
            isAdmin ? (
              <Button variant="contained" color="secondary" onClick={openCreate}>
                Cadastrar prato
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Stack spacing={4}>
          {grouped.map((group) => (
            <Box key={group.key}>
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 2,
                  letterSpacing: '-0.02em',
                }}
              >
                {group.label}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    xl: 'repeat(4, 1fr)',
                  },
                }}
              >
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={isAdmin ? undefined : handleAdd}
                    onEdit={isAdmin ? openEdit : undefined}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {isAdmin && (
        <MenuItemFormDialog
          open={formOpen}
          item={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}
    </Box>
  )
}
