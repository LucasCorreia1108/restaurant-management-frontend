/**
 * Módulos de domínio — camada para regras de negócio e adapters.
 * Os services em `/services` consomem estes helpers quando necessário.
 */

export const SERVICE_FEE_RATE = 0.1

export const TABLE_STATUS_FLOW = {
  free: ['occupied'],
  occupied: ['preparing', 'payment', 'free'],
  preparing: ['occupied', 'payment'],
  payment: ['free'],
} as const
