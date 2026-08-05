import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useLogin } from '@/hooks'
import { useAuthStore } from '@/store'
import type { LoginCredentials } from '@/types'
import { brand } from '@/theme'
import { ApiError } from '@/services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const login = useLogin()
  const { enqueueSnackbar } = useSnackbar()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setError(null)
    try {
      const res = await login.mutateAsync(data)
      setAuth(res.user, res.accessToken)
      enqueueSnackbar(`Bem-vindo(a), ${res.user.name}`, { variant: 'success' })
      navigate('/')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha no login'
      setError(message)
    }
  })

  return (
    <Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(135deg, ${brand.accent}, ${brand.secondary})`,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: brand.primary,
          }}
        >
          G
        </Box>
        <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
          GourmetOS
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          fontSize: '1.75rem',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        Entrar
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>
        Conectado à restaurant-management-api
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.25}>
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Informe o e-mail',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido',
              },
            })}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Informe a senha',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={<Checkbox {...register('remember')} defaultChecked color="secondary" />}
              label="Lembrar acesso"
            />
            <Link component={RouterLink} to="/recuperar-senha" underline="hover" color="secondary">
              Recuperar senha
            </Link>
          </Stack>

          <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
            {login.isPending ? 'Entrando…' : 'Acessar sistema'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
