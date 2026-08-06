import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from '@/theme'

interface RenderOptions {
  route?: string
}

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const theme = createAppTheme('light')

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[options.route ?? '/']}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </MemoryRouter>
    ),
  })
}