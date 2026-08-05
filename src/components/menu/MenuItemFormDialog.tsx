import { useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem as MuiMenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { ImageDropzone } from './ImageDropzone'
import {
  useCategories,
  useCreateMenuItem,
  useUpdateMenuItem,
} from '@/hooks'
import { ApiError } from '@/services/api'
import type { MenuItem } from '@/types'
import { getCategoryLabel } from '@/utils'

interface MenuItemFormProps {
  open: boolean
  item?: MenuItem | null
  onClose: () => void
}

interface FormValues {
  name: string
  description: string
  price: string
  preparationTime: string
  categoryId: string
  available: boolean
  imageUrl: string | null
}

export function MenuItemFormDialog({ open, item, onClose }: MenuItemFormProps) {
  const isEdit = Boolean(item)
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()
  const { enqueueSnackbar } = useSnackbar()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      preparationTime: '15',
      categoryId: '',
      available: true,
      imageUrl: null,
    },
  })

  const imageUrl = watch('imageUrl')

  useEffect(() => {
    if (!open) return
    if (item) {
      reset({
        name: item.name,
        description: item.description ?? '',
        price: String(item.price),
        preparationTime: String(item.preparationTime),
        categoryId: item.categoryId,
        available: item.available,
        imageUrl: item.imageUrl ?? null,
      })
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        preparationTime: '15',
        categoryId: categories?.[0]?.id ?? '',
        available: true,
        imageUrl: null,
      })
    }
  }, [open, item, categories, reset])

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      price: Number(values.price),
      preparationTime: Number(values.preparationTime),
      categoryId: values.categoryId,
      available: values.available,
      imageUrl: values.imageUrl,
    }

    try {
      if (isEdit && item) {
        await updateItem.mutateAsync({ id: item.id, payload })
        enqueueSnackbar('Prato atualizado', { variant: 'success' })
      } else {
        await createItem.mutateAsync({
          ...payload,
          imageUrl: payload.imageUrl ?? undefined,
        })
        enqueueSnackbar('Prato cadastrado', { variant: 'success' })
      }
      onClose()
    } catch (err) {
      enqueueSnackbar(err instanceof ApiError ? err.message : 'Falha ao salvar prato', {
        variant: 'error',
      })
    }
  })

  const saving = isSubmitting || createItem.isPending || updateItem.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700 }}>
        {isEdit ? 'Editar prato' : 'Novo prato'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <ImageDropzone
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url, { shouldDirty: true })}
            disabled={saving}
          />

          <TextField
            label="Nome"
            fullWidth
            {...register('name', { required: 'Informe o nome' })}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />

          <TextField
            label="Descrição"
            fullWidth
            multiline
            minRows={2}
            {...register('description')}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Preço (R$)"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              {...register('price', {
                required: 'Informe o preço',
                validate: (v) => Number(v) >= 0 || 'Preço inválido',
              })}
              error={Boolean(errors.price)}
              helperText={errors.price?.message}
            />
            <TextField
              label="Preparo (min)"
              fullWidth
              type="number"
              inputProps={{ min: 1, step: 1 }}
              {...register('preparationTime', {
                required: 'Informe o tempo',
                validate: (v) => Number(v) >= 1 || 'Mínimo 1 minuto',
              })}
              error={Boolean(errors.preparationTime)}
              helperText={errors.preparationTime?.message}
            />
          </Stack>

          <Controller
            name="categoryId"
            control={control}
            rules={{ required: 'Selecione a categoria' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.categoryId)}>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  {...field}
                  labelId="category-label"
                  label="Categoria"
                  disabled={loadingCategories}
                >
                  {(categories ?? []).map((category) => (
                    <MuiMenuItem key={category.id} value={category.id}>
                      {category.name} ({getCategoryLabel(category.type)})
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="available"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                    color="secondary"
                  />
                }
                label="Disponível no cardápio"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" color="secondary" onClick={onSubmit} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
