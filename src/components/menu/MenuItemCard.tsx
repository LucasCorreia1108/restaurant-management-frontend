import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import type { MenuItem } from '@/types'
import { formatCurrency, getCategoryLabel, toNumber } from '@/utils'

interface MenuItemCardProps {
  item: MenuItem
  onAdd?: (item: MenuItem) => void
  onEdit?: (item: MenuItem) => void
  compact?: boolean
}

export function MenuItemCard({ item, onAdd, onEdit, compact }: MenuItemCardProps) {
  const image = item.imageUrl ?? undefined

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        opacity: item.available ? 1 : 0.55,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      {!compact &&
        (image ? (
          <CardMedia
            component="img"
            height="160"
            image={image}
            alt={item.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            <ImageNotSupportedOutlinedIcon />
            <Typography variant="caption">Sem imagem disponível</Typography>
          </Box>
        ))}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: compact ? 1.5 : 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: compact ? '0.95rem' : '1.05rem',
                lineHeight: 1.3,
              }}
              noWrap={compact}
            >
              {item.name}
            </Typography>
            {!compact && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 1.5 }}>
                {item.description ||
                  (item.category ? getCategoryLabel(item.category.type) : 'Item do cardápio')}
              </Typography>
            )}
          </Box>
          {compact && onAdd && item.available && (
            <IconButton
              size="small"
              color="secondary"
              onClick={() => onAdd(item)}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': { bgcolor: 'secondary.dark' },
              }}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 'auto', pt: compact ? 0.5 : 0 }}
          spacing={1}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: compact ? '1rem' : '1.15rem',
              color: 'secondary.main',
            }}
          >
            {formatCurrency(toNumber(item.price))}
          </Typography>
          {!compact && (
            <Stack direction="row" spacing={1}>
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(item)} aria-label="Editar prato">
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              )}
              {onAdd && (
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<AddRoundedIcon />}
                  disabled={!item.available}
                  onClick={() => onAdd(item)}
                >
                  Adicionar
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
