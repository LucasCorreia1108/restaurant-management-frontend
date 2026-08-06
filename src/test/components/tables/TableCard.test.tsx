import { fireEvent, screen } from '@testing-library/react'
import { TableCard } from '@/components/tables/TableCard'
import { renderWithProviders } from '@/test/test-utils'

jest.mock('@/utils', () => {
  const actual = jest.requireActual('@/utils')

  return {
    ...actual,
    formatElapsed: jest.fn(() => 'há 5 min'),
  }
})

describe('TableCard', () => {
  it('renderiza dados da mesa e responde a clique e teclado', () => {
    const onClick = jest.fn()

    renderWithProviders(
      <TableCard
        table={{
          id: '1',
          number: 12,
          capacity: 4,
          status: 'OCCUPIED',
          currentWaiter: { id: 'w1', name: 'João' },
          openedAt: '2026-08-05T12:00:00.000Z',
        }}
        selected
        onClick={onClick}
      />,
    )

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('4 lugares')).toBeInTheDocument()
    expect(screen.getByText('Ocupada')).toBeInTheDocument()
    expect(screen.getByText('João')).toBeInTheDocument()
    expect(screen.getByText('há 5 min')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })
})