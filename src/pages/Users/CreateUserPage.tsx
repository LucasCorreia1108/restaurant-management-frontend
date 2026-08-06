import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { PageHeader, Surface } from '@/components/ui'
import { useCreateUser } from '@/hooks'
import { useAuthStore } from '@/store'
import { ApiError } from '@/services/api'
import { UserRole, type CreateUserPayload, type UserRole as UserRoleType } from '@/types'

interface FormValues extends CreateUserPayload {
  confirmPassword: string
}

const roleLabels: Record<UserRoleType, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.WAITER]: 'Garçom',
  [UserRole.KITCHEN]: 'Cozinha',
  [UserRole.CASHIER]: 'Caixa',
}

export function CreateUserPage() {
  const currentRole = useAuthStore((state) => state.user?.role)
  const createUser = useCreateUser()
  const { enqueueSnackbar } = useSnackbar()
  const allowedRoles: UserRoleType[] =
    currentRole === UserRole.ADMIN
      ? Object.values(UserRole)
      : [UserRole.WAITER, UserRole.KITCHEN, UserRole.CASHIER]

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.WAITER,
    },
  })

  const password = watch('password')
  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...payload }) => {
    try {
      await createUser.mutateAsync(payload)
      enqueueSnackbar('Novo acesso criado com sucesso', { variant: 'success' })
      reset()
    } catch (error) {
      enqueueSnackbar(
        error instanceof ApiError ? error.message : 'Não foi possível criar o acesso',
        { variant: 'error' },
      )
    }
  })

  return (
    <Box>
      <PageHeader
        title="Novo acesso"
        subtitle="Cadastre um novo login e defina as permissões do usuário"
      />

      <Surface sx={{ maxWidth: 720 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <PersonAddAltRoundedIcon color="secondary" />
          <Box>
            <Typography fontWeight={700}>Dados de acesso</Typography>
            <Typography variant="body2" color="text.secondary">
              O usuário poderá entrar no sistema assim que o cadastro for concluído.
            </Typography>
          </Box>
        </Stack>

        {currentRole === UserRole.MANAGER && (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Gerentes podem criar acessos para garçom, cozinha e caixa.
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            <TextField
              label="Nome"
              fullWidth
              autoComplete="name"
              {...register('name', { required: 'Informe o nome' })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoComplete="email"
              {...register('email', {
                required: 'Informe o e-mail',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'E-mail inválido',
                },
              })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="new-user-role-label">Perfil</InputLabel>
                  <Select {...field} labelId="new-user-role-label" label="Perfil">
                    {allowedRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {roleLabels[role]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Senha"
                type="password"
                fullWidth
                autoComplete="new-password"
                {...register('password', {
                  required: 'Informe a senha',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
              <TextField
                label="Confirmar senha"
                type="password"
                fullWidth
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Confirme a senha',
                  validate: (value) => value === password || 'As senhas não coincidem',
                })}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
              />
            </Stack>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={createUser.isPending}
              sx={{ alignSelf: 'flex-start', minWidth: 180, whiteSpace: 'nowrap' }}
            >
              {createUser.isPending ? 'Criando acesso…' : 'Criar acesso'}
            </Button>
          </Stack>
        </Box>
      </Surface>
    </Box>
  )
}
