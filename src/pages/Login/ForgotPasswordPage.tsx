import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'

interface FormValues {
  email: string
}

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = handleSubmit(() => {

  })

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 700,
          fontSize: '1.75rem',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        Recuperar senha
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>
        Solicite a redefinição com o administrador do sistema
      </Typography>

      <Alert severity="info" sx={{ borderRadius: 3, mb: 3 }}>
        A restaurant-management-api ainda não possui endpoint de recuperação. Contate o admin ou
        use as credenciais do seed.
      </Alert>

      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={2.25}>
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', { required: 'Informe o e-mail' })}
          />
          <Button type="submit" variant="contained" size="large" disabled>
            Em breve
          </Button>
        </Stack>
      </Box>

      <Button component={RouterLink} to="/login" sx={{ mt: 2 }} color="inherit">
        Voltar ao login
      </Button>
    </Box>
  )
}
