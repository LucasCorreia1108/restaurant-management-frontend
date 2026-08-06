import { formatDateTime, formatTime } from '@/utils'

describe('formatacao de data no fuso do restaurante', () => {
  it('mantem no dia local uma data UTC proxima da meia-noite', () => {
    const instant = '2026-08-07T01:30:00.000Z'

    expect(formatTime(instant)).toBe('22:30')
    expect(formatDateTime(instant)).toBe('06/08/2026 às 22:30')
  })

  it('avanca o dia somente depois da meia-noite em Sao Paulo', () => {
    const instant = '2026-08-07T03:30:00.000Z'

    expect(formatTime(instant)).toBe('00:30')
    expect(formatDateTime(instant)).toBe('07/08/2026 às 00:30')
  })
})
