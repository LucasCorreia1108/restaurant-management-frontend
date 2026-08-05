import { useAuthStore } from '@/store'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export class ApiError extends Error {
  status: number
  details: string | string[]

  constructor(message: string, status: number, details: string | string[] = message) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (isFormData) {
    delete headers['Content-Type']
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = 'Erro na requisição'
    let details: string | string[] = message
    try {
      const body = (await response.json()) as {
        message?: string | string[]
        error?: string
      }
      details = body.message ?? body.error ?? message
      message = Array.isArray(details) ? details.join(', ') : details
    } catch {
      /* ignore */
    }

    if (response.status === 401) {
      useAuthStore.getState().logout()
    }

    throw new ApiError(message, response.status, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}

export { USE_MOCK, API_URL }
