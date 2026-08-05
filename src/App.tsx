import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import { useMemo, useState } from 'react'
import { AppRouter } from '@/routes'
import { createAppTheme } from '@/theme'
import { useUiStore } from '@/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemedApp() {
  const mode = useUiStore((s) => s.mode)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={4}
        autoHideDuration={2800}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AppRouter />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default function App() {
  const [client] = useState(() => queryClient)

  return (
    <QueryClientProvider client={client}>
      <ThemedApp />
    </QueryClientProvider>
  )
}
